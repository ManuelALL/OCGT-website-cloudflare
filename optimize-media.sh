#!/usr/bin/env bash
#
# optimize-media.sh — Convert OCGT images and videos to web-optimal formats.
#
# What it does:
#   1. Creates a timestamped backup of every source folder before touching anything.
#   2. Generates AVIF + WebP siblings for every JPG/JPEG/PNG (originals untouched).
#   3. Generates an optimized MP4 (faststart, web-tuned) and a WebM/VP9 sibling
#      for every MP4 (originals renamed to *.original.mp4 so HTML keeps working).
#   4. Skips files that have already been converted (idempotent — safe to re-run).
#   5. Prints a size summary at the end.
#
# Requirements:
#   ffmpeg   — video encoding (H.264, VP9)
#   cwebp    — WebP image encoding
#   avifenc  — AVIF image encoding (from libavif)
#
# Install on macOS:
#   brew install ffmpeg webp libavif
#
# Usage:
#   ./optimize-media.sh              # convert everything
#   ./optimize-media.sh --dry-run    # show what would be converted, no changes
#   ./optimize-media.sh --images     # only images
#   ./optimize-media.sh --videos     # only videos
#
set -euo pipefail

# ─── Config ──────────────────────────────────────────────────────────────────
ROOT="$(cd "$(dirname "$0")" && pwd)"
IMAGE_DIRS=("Images" "marketing" "logos" "icons" "company_logos")
VIDEO_DIRS=("04 Videos")
BACKUP_ROOT="${ROOT}/_media_backups/$(date +%Y%m%d-%H%M%S)"

AVIF_QUALITY=60          # AVIF: 0–100 (higher = better). 60 ≈ visually lossless for photos.
AVIF_SPEED=6             # AVIF: 0–10 (higher = faster, lower quality/size tradeoff).
WEBP_QUALITY=80          # WebP: 0–100 (higher = better). 80 = web sweet spot.
# Hardware H.264 via Apple VideoToolbox. Bitrate-based, not CRF.
# 720p ≈ 2 Mbps, 1080p ≈ 4 Mbps is a good web sweet spot.
MP4_BITRATE_720="2M"
MP4_BITRATE_1080="4M"
VIDEO_MAX_HEIGHT=1080    # Cap output height (keeps aspect). Set "" to disable.

# ─── CLI ─────────────────────────────────────────────────────────────────────
DRY_RUN=0
DO_IMAGES=1
DO_VIDEOS=1
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    --images)  DO_VIDEOS=0 ;;
    --videos)  DO_IMAGES=0 ;;
    -h|--help)
      sed -n '2,30p' "$0"; exit 0 ;;
    *) echo "Unknown arg: $arg" >&2; exit 2 ;;
  esac
done

# ─── Helpers ─────────────────────────────────────────────────────────────────
green() { printf '\033[32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[33m%s\033[0m\n' "$*"; }
red() { printf '\033[31m%s\033[0m\n' "$*" >&2; }
gray() { printf '\033[90m%s\033[0m\n' "$*"; }

require() {
  command -v "$1" >/dev/null 2>&1 || { red "Missing dependency: $1"; exit 1; }
}

human_size() {
  local bytes=$1
  if   [ "$bytes" -ge 1073741824 ]; then awk -v b=$bytes 'BEGIN{printf "%.1f GB", b/1073741824}'
  elif [ "$bytes" -ge 1048576 ];    then awk -v b=$bytes 'BEGIN{printf "%.1f MB", b/1048576}'
  elif [ "$bytes" -ge 1024 ];       then awk -v b=$bytes 'BEGIN{printf "%.1f KB", b/1024}'
  else                                   echo "$bytes B"
  fi
}

file_size() {
  if [ -f "$1" ]; then stat -f%z "$1" 2>/dev/null || stat -c%s "$1"; else echo 0; fi
}

# ─── Backup ──────────────────────────────────────────────────────────────────
backup_dirs() {
  local dirs=("$@")
  yellow "→ Creating backup at: $BACKUP_ROOT"
  if [ "$DRY_RUN" = 1 ]; then
    gray "  (dry-run: skipped)"; return
  fi
  mkdir -p "$BACKUP_ROOT"
  for d in "${dirs[@]}"; do
    if [ -d "${ROOT}/${d}" ]; then
      cp -R "${ROOT}/${d}" "${BACKUP_ROOT}/"
      gray "  ✓ backed up: $d"
    fi
  done
  green "  Backup complete."
  echo
}

# ─── Image conversion ────────────────────────────────────────────────────────
convert_image() {
  local src="$1"
  local base="${src%.*}"
  local avif="${base}.avif"
  local webp="${base}.webp"
  local orig_size; orig_size=$(file_size "$src")

  if [ ! -f "$avif" ]; then
    if [ "$DRY_RUN" = 1 ]; then
      gray "  [dry] AVIF: $src"
    else
      if avifenc --min 0 --max 63 -q "$AVIF_QUALITY" -s "$AVIF_SPEED" \
           "$src" "$avif" >/dev/null 2>&1; then
        local ns; ns=$(file_size "$avif")
        printf '  ✓ AVIF  %s  %s → %s\n' "$(basename "$src")" "$(human_size "$orig_size")" "$(human_size "$ns")"
      else
        red "  ✗ AVIF failed: $src"
      fi
    fi
  fi

  if [ ! -f "$webp" ]; then
    if [ "$DRY_RUN" = 1 ]; then
      gray "  [dry] WebP: $src"
    else
      if cwebp -quiet -q "$WEBP_QUALITY" -m 6 "$src" -o "$webp" 2>/dev/null; then
        local ns; ns=$(file_size "$webp")
        printf '  ✓ WebP  %s  %s → %s\n' "$(basename "$src")" "$(human_size "$orig_size")" "$(human_size "$ns")"
      else
        red "  ✗ WebP failed: $src"
      fi
    fi
  fi

  return 0
}

run_images() {
  yellow "→ Converting images (AVIF + WebP)…"
  local count=0
  for d in "${IMAGE_DIRS[@]}"; do
    [ -d "${ROOT}/${d}" ] || { gray "  (skip: ${d} not found)"; continue; }
    while IFS= read -r -d '' f; do
      convert_image "$f"
      count=$((count + 1))
    done < <(find "${ROOT}/${d}" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' \) -print0)
  done
  green "  Processed $count source images."
  echo
}

# ─── Video conversion ────────────────────────────────────────────────────────
convert_video() {
  local src="$1"
  local base="${src%.*}"
  local original="${base}.original.mp4"
  local optimized="${base}.mp4"
  local orig_size; orig_size=$(file_size "$src")

  # Skip if already processed
  if [ -f "$original" ]; then
    gray "  (skip already-processed: $(basename "$src"))"
    return
  fi

  if [ "$DRY_RUN" = 1 ]; then
    gray "  [dry] $src → re-encode + faststart (orig kept as $original)"
    return
  fi

  # Detect input height to pick bitrate
  local in_h; in_h=$(ffprobe -v error -select_streams v:0 \
    -show_entries stream=height -of csv=p=0 "$src" 2>/dev/null)
  local bitrate="$MP4_BITRATE_1080"
  if [ -n "$in_h" ] && [ "$in_h" -le 720 ]; then bitrate="$MP4_BITRATE_720"; fi

  # Build scale filter (only if input exceeds cap)
  local scale_filter=()
  if [ -n "$VIDEO_MAX_HEIGHT" ] && [ -n "$in_h" ] && [ "$in_h" -gt "$VIDEO_MAX_HEIGHT" ]; then
    scale_filter=(-vf "scale=-2:${VIDEO_MAX_HEIGHT}")
  fi

  # Move original aside
  mv "$src" "$original"

  # Try hardware H.264 (Apple VideoToolbox — GPU/media engine, very fast)
  local err; err=$(ffmpeg -hide_banner -loglevel error -y -i "$original" \
       ${scale_filter[@]+"${scale_filter[@]}"} \
       -c:v h264_videotoolbox -b:v "$bitrate" -tag:v avc1 -pix_fmt yuv420p \
       -movflags +faststart \
       -c:a aac -b:a 128k \
       "$optimized" 2>&1)
  if [ -z "$err" ] && [ -f "$optimized" ]; then
    local ns; ns=$(file_size "$optimized")
    if [ "$ns" -ge "$orig_size" ]; then
      # Re-encode grew the file. Fall back to instant stream-copy with faststart
      # so we still get the streaming-start benefit without re-encoding.
      rm -f "$optimized"
      if ffmpeg -hide_banner -loglevel error -y -i "$original" \
           -c copy -movflags +faststart \
           "$optimized" 2>/dev/null; then
        local fs; fs=$(file_size "$optimized")
        printf '  ✓ %s (faststart only)  %s → %s\n' "$(basename "$src")" "$(human_size "$orig_size")" "$(human_size "$fs")"
      else
        red "  ✗ Stream-copy faststart failed: $src — restoring original"
        mv "$original" "$src"
        return 1
      fi
    else
      printf '  ✓ %s (re-encoded)  %s → %s\n' "$(basename "$src")" "$(human_size "$orig_size")" "$(human_size "$ns")"
    fi
  else
    red "  ✗ Hardware H.264 failed: $(basename "$src")"
    [ -n "$err" ] && red "    ffmpeg: $err"
    rm -f "$optimized"
    mv "$original" "$src"
    return 1
  fi
}

run_videos() {
  yellow "→ Converting videos (hardware H.264 + faststart)…"
  local count=0 failed=0
  for d in "${VIDEO_DIRS[@]}"; do
    [ -d "${ROOT}/${d}" ] || { gray "  (skip: ${d} not found)"; continue; }
    while IFS= read -r -d '' f; do
      case "$f" in *.original.mp4) continue ;; esac
      # Don't let one bad video kill the run.
      if convert_video "$f"; then
        count=$((count + 1))
      else
        failed=$((failed + 1))
        red "  (continuing past failure)"
      fi
    done < <(find "${ROOT}/${d}" -type f -iname '*.mp4' -print0)
  done
  green "  Processed $count source videos ($failed failed)."
  echo
}

# ─── Summary ─────────────────────────────────────────────────────────────────
print_summary() {
  yellow "→ Size summary:"
  for d in "${IMAGE_DIRS[@]}" "${VIDEO_DIRS[@]}"; do
    [ -d "${ROOT}/${d}" ] || continue
    local s; s=$(du -sh "${ROOT}/${d}" 2>/dev/null | cut -f1)
    printf '  %s : %s\n' "$d" "$s"
  done
  if [ -d "$BACKUP_ROOT" ]; then
    local b; b=$(du -sh "$BACKUP_ROOT" 2>/dev/null | cut -f1)
    printf '  backup: %s (%s)\n' "$b" "$BACKUP_ROOT"
  fi
}

# ─── Main ────────────────────────────────────────────────────────────────────
main() {
  [ "$DO_VIDEOS" = 1 ] && require ffmpeg
  if [ "$DO_IMAGES" = 1 ]; then
    require cwebp
    require avifenc
  fi
  cd "$ROOT"

  yellow "OCGT media optimizer"
  gray   "  root:  $ROOT"
  gray   "  mode:  $([ $DRY_RUN = 1 ] && echo dry-run || echo apply)"
  echo

  local backup_targets=()
  [ "$DO_IMAGES" = 1 ] && backup_targets+=("${IMAGE_DIRS[@]}")
  [ "$DO_VIDEOS" = 1 ] && backup_targets+=("${VIDEO_DIRS[@]}")
  backup_dirs "${backup_targets[@]}"

  [ "$DO_IMAGES" = 1 ] && run_images
  [ "$DO_VIDEOS" = 1 ] && run_videos

  print_summary
  echo
  green "Done."
  echo
  cat <<EOF
Next steps:
  1. Review files in:          $BACKUP_ROOT
  2. Test the new .avif / .webp / .webm assets locally.
  3. Once happy, upload to R2 (or commit to git).
  4. To roll back: rm -rf <changed dirs> && cp -R "$BACKUP_ROOT"/* "$ROOT/"
EOF
}

main "$@"
