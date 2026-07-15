#!/usr/bin/env bash
# Pass 2 — stitch the segments built by render_reel.sh into the final reel:
# cross-dissolves (offsets derived from each segment's actual length, so the
# longer finished-product clips at the end work), fades, logo bottom-left, music.
set -euo pipefail

FFMPEG="C:/Users/info/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
FFPROBE="C:/Users/info/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffprobe.exe"
WORK="C:/Users/info/AppData/Local/Temp/claude/c--Users-info-OneDrive-Documents-Antigravity/7a9d8d65-82e9-416a-9446-b485d53e50d6/scratchpad/reel_work"
LOGO="c:/Users/info/OneDrive/Documents/Antigravity/aloe-signs-website/public/aloe-logo.png"
SELF_DIR="c:/Users/info/OneDrive/Documents/Antigravity/aloe-signs-website/scripts/reel"
OUT="c:/Users/info/OneDrive/Documents/Antigravity/aloe-signs-website/public/images/Projects/Genises/_reel_v3.mp4"

# Draw from the same rotating pool as render-project.mjs (won't repeat a track
# until MUSIC_HISTORY other renders have used something else).
MUSIC=$(node "$SELF_DIR/pick-music.mjs")
echo ">> music: $(basename "$MUSIC")"

CF=0.4

# Segments in order (seg_00, seg_01, …); glob sorts correctly.
segs=( "$WORK"/seg_*.mp4 )
N=${#segs[@]}

# Actual length of each segment.
declare -a L
for ((k=0;k<N;k++)); do
  L[$k]=$("$FFPROBE" -v error -select_streams v:0 -show_entries stream=duration -of default=nokey=1:noprint_wrappers=1 "${segs[$k]}" | tr -d '\r,\n ')
done

INPUTS=""
for ((k=0;k<N;k++)); do INPUTS="$INPUTS -i ${segs[$k]}"; done
INPUTS="$INPUTS -i $LOGO -i $MUSIC"

# xfade chain: offset(k) = sum(L[0..k-1]) - k*CF
FILTER=""
S=${L[0]}
for ((k=1;k<N;k++)); do
  off=$(awk "BEGIN{printf \"%.3f\", $S - $k*$CF}")
  if [ "$k" -eq 1 ]; then
    FILTER="[0][1]xfade=transition=fade:duration=$CF:offset=$off[x1]"
  else
    FILTER="$FILTER;[x$((k-1))][$k]xfade=transition=fade:duration=$CF:offset=$off[x$k]"
  fi
  S=$(awk "BEGIN{printf \"%.5f\", $S + ${L[$k]}}")
done

TOTAL=$(awk "BEGIN{printf \"%.3f\", $S - ($N-1)*$CF}")
FOUT=$(awk "BEGIN{printf \"%.3f\", $TOTAL-0.6}")
AFOUT=$(awk "BEGIN{printf \"%.3f\", $TOTAL-1.2}")

FILTER="$FILTER;[x$((N-1))]fade=t=in:st=0:d=0.6,fade=t=out:st=$FOUT:d=0.6,format=yuv420p[base]"

# Plain logo bottom-LEFT (clear of the bottom-right player controls). Logo index = N.
FILTER="$FILTER;[$N:v]scale=200:-1[logo];[base][logo]overlay=x=50:y=H-h-50[vout]"

# Music (index N+1), trimmed + faded, no clip audio.
AIDX=$((N+1))
FILTER="$FILTER;[$AIDX:a]atrim=0:$TOTAL,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=1.2,afade=t=out:st=$AFOUT:d=1.2,volume=0.9[aout]"

echo ">> stitching $N segments (~${TOTAL}s) with logo + music…"
eval "\"$FFMPEG\" -y -loglevel error $INPUTS -filter_complex \"$FILTER\" -map \"[vout]\" -map \"[aout]\" -t $TOTAL -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart \"$OUT\""

echo ">> DONE: $OUT"
ls -lh "$OUT"
