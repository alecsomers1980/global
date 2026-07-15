#!/usr/bin/env bash
set -euo pipefail

FFMPEG="C:/Users/info/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
FFPROBE="C:/Users/info/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffprobe.exe"
SRC="c:/Users/info/OneDrive/Documents/Antigravity/aloe-signs-website/public/images/Projects/Genises"
WORK="C:/Users/info/AppData/Local/Temp/claude/c--Users-info-OneDrive-Documents-Antigravity/7a9d8d65-82e9-416a-9446-b485d53e50d6/scratchpad/reel_work"
OUT="C:/Users/info/AppData/Local/Temp/claude/c--Users-info-OneDrive-Documents-Antigravity/7a9d8d65-82e9-416a-9446-b485d53e50d6/scratchpad/genesis_reel_draft.mp4"

D=2.0      # seconds kept per clip
CF=0.4     # crossfade duration
STEP=$(awk "BEGIN{print $D-$CF}")   # 1.6

mkdir -p "$WORK"
rm -f "$WORK"/seg_*.mp4

# Order: landscape establishing (1), portraits, landscape closers (22,23)
ORDER="1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23"

VF='split[m][b];[b]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,gblur=sigma=18[bb];[m]scale=1920:1080:force_original_aspect_ratio=decrease[mm];[bb][mm]overlay=(W-w)/2:(H-h)/2,fps=30,setsar=1,eq=contrast=1.06:saturation=1.12:gamma=0.97,vignette=PI/5,format=yuv420p'

i=0
for n in $ORDER; do
  f="$SRC/$n.mp4"
  dur=$("$FFPROBE" -v error -select_streams v:0 -show_entries stream=duration -of default=nokey=1:noprint_wrappers=1 "$f" | tr -d '\r,\n ')
  start=$(awk "BEGIN{s=($dur-$D)/2; if(s<0)s=0; printf \"%.2f\", s}")
  seg=$(printf "%s/seg_%02d.mp4" "$WORK" "$i")
  echo ">> seg $i  (clip $n.mp4  start=${start}s)"
  "$FFMPEG" -y -loglevel error -ss "$start" -t "$D" -i "$f" \
    -filter_complex "[0:v]$VF[v]" -map "[v]" -an \
    -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$seg"
  i=$((i+1))
done
N=$i
echo ">> built $N segments"

# Build xfade chain
INPUTS=""
for ((k=0;k<N;k++)); do INPUTS="$INPUTS -i $(printf "%s/seg_%02d.mp4" "$WORK" "$k")"; done

FILTER="[0][1]xfade=transition=fade:duration=$CF:offset=$STEP[x1]"
for ((k=2;k<N;k++)); do
  off=$(awk "BEGIN{printf \"%.2f\", $k*$STEP}")
  prev=$((k-1))
  FILTER="$FILTER;[x$prev][$k]xfade=transition=fade:duration=$CF:offset=$off[x$k]"
done
LAST=$((N-1))
TOTAL=$(awk "BEGIN{printf \"%.2f\", $N*$D-($N-1)*$CF}")
FOUT=$(awk "BEGIN{printf \"%.2f\", $TOTAL-0.6}")
FILTER="$FILTER;[x$LAST]fade=t=in:st=0:d=0.6,fade=t=out:st=$FOUT:d=0.6,format=yuv420p[out]"

echo ">> total length ~${TOTAL}s, rendering final..."
eval "\"$FFMPEG\" -y -loglevel error $INPUTS -filter_complex \"$FILTER\" -map \"[out]\" -an -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p -movflags +faststart \"$OUT\""

echo ">> DONE: $OUT"
"$FFPROBE" -v error -show_entries format=duration,size -of default=noprint_wrappers=1 "$OUT"
ls -lh "$OUT"
