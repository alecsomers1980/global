"""Extract scene-change frames from a YouTube video for visual analysis.

For demo-heavy videos where the transcript alone misses on-screen content
(code, UI, diagrams), this downloads a low-res copy and uses ffmpeg scene
detection to grab one frame each time the scene actually changes — far better
signal than fixed-interval screenshots. Adopted 2026-07-17 (video iYG5tiFfK3E,
learning digest #2).

Usage: python scene-frames.py <video_id_or_url> <out_dir> [scene_threshold] [max_frames]
Prints the written frame paths (one per line) for the caller to Read.
"""
import subprocess
import sys
from pathlib import Path


def main():
    if len(sys.argv) < 3:
        print("usage: scene-frames.py <video_id_or_url> <out_dir> [threshold] [max_frames]", file=sys.stderr)
        sys.exit(2)
    vid = sys.argv[1]
    out = Path(sys.argv[2])
    threshold = sys.argv[3] if len(sys.argv) > 3 else "0.4"
    max_frames = int(sys.argv[4]) if len(sys.argv) > 4 else 40
    url = vid if vid.startswith("http") else f"https://www.youtube.com/watch?v={vid}"
    out.mkdir(parents=True, exist_ok=True)

    # Low-res copy keeps download + decode cheap; scene detection doesn't need HD.
    video_path = out / "_video.mp4"
    if not video_path.exists():
        dl = subprocess.run(
            [sys.executable, "-m", "yt_dlp", "-f", "worst[height>=360]/worst",
             "-o", str(video_path), "--no-playlist", url],
            capture_output=True, text=True,
        )
        if dl.returncode != 0 or not video_path.exists():
            print(dl.stderr[-500:], file=sys.stderr)
            sys.exit(1)

    # ffmpeg scene detection -> one frame per detected cut.
    subprocess.run(
        ["ffmpeg", "-y", "-i", str(video_path),
         "-vf", f"select='gt(scene,{threshold})'", "-vsync", "vfr",
         "-frames:v", str(max_frames), str(out / "frame_%03d.jpg")],
        capture_output=True, text=True,
    )
    frames = sorted(out.glob("frame_*.jpg"))
    if not frames:
        print("No scene-change frames detected (static video or threshold too high).", file=sys.stderr)
        sys.exit(1)
    for f in frames:
        print(f)
    video_path.unlink(missing_ok=True)  # keep only the frames


if __name__ == "__main__":
    main()
