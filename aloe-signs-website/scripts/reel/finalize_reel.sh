#!/usr/bin/env bash
set -euo pipefail

FFMPEG="C:/Users/info/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1.2-full_build/bin/ffmpeg.exe"
WORK="C:/Users/info/AppData/Local/Temp/claude/c--Users-info-OneDrive-Documents-Antigravity/7a9d8d65-82e9-416a-9446-b485d53e50d6/scratchpad/reel_work"
SCR="C:/Users/info/AppData/Local/Temp/claude/c--Users-info-OneDrive-Documents-Antigravity/7a9d8d65-82e9-416a-9446-b485d53e50d6/scratchpad"
LOGO="c:/Users/info/OneDrive/Documents/Antigravity/aloe-signs-website/public/aloe-logo.png"
MUSIC="$SCR/music.mp3"
OUT="c:/Users/info/OneDrive/Documents/Antigravity/aloe-signs-website/public/images/Projects/Genises/_reel_v2_logo_music.mp4"

N=23; D=2.0; CF=0.4; STEP=1.6
TOTAL=$(awk "BEGIN{printf \"%.2f\", $N*$D-($N-1)*$CF}")   # 37.20
FOUT=$(awk "BEGIN{printf \"%.2f\", $TOTAL-0.6}")          # 36.60
AFOUT=$(awk "BEGIN{printf \"%.2f\", $TOTAL-1.2}")         # 36.00

# Inputs: 23 segments, then logo (idx 23), then music (idx 24)
INPUTS=""
for ((k=0;k<N;k++)); do INPUTS="$INPUTS -i $(printf "%s/seg_%02d.mp4" "$WORK" "$k")"; done
INPUTS="$INPUTS -i $LOGO -i $MUSIC"

# xfade chain
FILTER="[0][1]xfade=transition=fade:duration=$CF:offset=$STEP[x1]"
for ((k=2;k<N;k++)); do
  off=$(awk "BEGIN{printf \"%.2f\", $k*$STEP}")
  prev=$((k-1))
  FILTER="$FILTER;[x$prev][$k]xfade=transition=fade:duration=$CF:offset=$off[x$k]"
done
LAST=$((N-1))
FILTER="$FILTER;[x$LAST]fade=t=in:st=0:d=0.6,fade=t=out:st=$FOUT:d=0.6,format=yuv420p[base]"

# Plain logo bottom-LEFT (clear of the bottom-right player controls). Logo index = N.
FILTER="$FILTER;[$N:v]scale=200:-1[logo]"
FILTER="$FILTER;[base][logo]overlay=x=50:y=H-h-50[vout]"

# Music (input index = N+1 = 24), trimmed + faded
AIDX=$((N+1))
FILTER="$FILTER;[$AIDX:a]atrim=0:$TOTAL,asetpts=PTS-STARTPTS,afade=t=in:st=0:d=1.2,afade=t=out:st=$AFOUT:d=1.2,volume=0.9[aout]"

echo ">> rendering final reel with logo + music (~${TOTAL}s)..."
eval "\"$FFMPEG\" -y -loglevel error $INPUTS -filter_complex \"$FILTER\" -map \"[vout]\" -map \"[aout]\" -t $TOTAL -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart \"$OUT\""

echo ">> DONE: $OUT"
ls -lh "$OUT"