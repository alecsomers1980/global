#!/usr/bin/env bash
# Pass 1 — build one normalised, colour-graded segment per clip. The last
# N_LONG clips (finished-product shots) are kept longer. Then run finalize_reel.sh.
set -euo pipefail

FFMPEG="C:/Users/info/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
FFPROBE="C:/Users/info/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffprobe.exe"
SRC="c:/Users/info/OneDrive/Documents/Antigravity/aloe-signs-website/public/images/Projects/Genises"
WORK="C:/Users/info/AppData/Local/Temp/claude/c--Users-info-OneDrive-Documents-Antigravity/7a9d8d65-82e9-416a-9446-b485d53e50d6/scratchpad/reel_work"

D=2.0             # seconds kept per normal clip
D_LONG=3.5        # last N_LONG clips run longer to show the finished product
N_LONG=4
D_SECOND_LAST=6.0 # second-to-last clip
D_LAST=10.0       # the very last clip (final reveal) is held longest

# Order: landscape establishing (1), portraits, landscape closers (22,23)
ORDER="1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23"

VF='split[m][b];[b]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,gblur=sigma=18[bb];[m]scale=1920:1080:force_original_aspect_ratio=decrease[mm];[bb][mm]overlay=(W-w)/2:(H-h)/2,fps=30,setsar=1,eq=contrast=1.06:saturation=1.12:gamma=0.97,vignette=PI/5,format=yuv420p'

set -- $ORDER
N=$#
mkdir -p "$WORK"
rm -f "$WORK"/seg_*.mp4

i=0
for n in $ORDER; do
  keep=$D
  if [ "$i" -ge "$((N - N_LONG))" ]; then keep=$D_LONG; fi
  if [ "$i" -eq "$((N - 2))" ]; then keep=$D_SECOND_LAST; fi
  if [ "$i" -eq "$((N - 1))" ]; then keep=$D_LAST; fi
  f="$SRC/$n.mp4"
  dur=$("$FFPROBE" -v error -select_streams v:0 -show_entries stream=duration -of default=nokey=1:noprint_wrappers=1 "$f" | tr -d '\r,\n ')
  start=$(awk "BEGIN{s=($dur-$keep)/2; if(s<0)s=0; printf \"%.2f\", s}")
  seg=$(printf "%s/seg_%02d.mp4" "$WORK" "$i")
  echo ">> seg $i  (clip $n.mp4  keep=${keep}s  start=${start}s)"
  "$FFMPEG" -y -loglevel error -ss "$start" -t "$keep" -i "$f" \
    -filter_complex "[0:v]$VF[v]" -map "[v]" -an \
    -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p "$seg"
  i=$((i+1))
done
echo ">> built $i segments in $WORK — now run finalize_reel.sh"
