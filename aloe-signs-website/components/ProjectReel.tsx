'use client';

import { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause } from 'lucide-react';

export default function ProjectReel({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [volume, setVolume] = useState(0.8);
  const [playing, setPlaying] = useState(false);

  // set initial video properties once
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = 0.8;
    v.muted = true;
  }, []);

  function toggleMute() {
    const v = videoRef.current;
    if (!v) return;
    if (v.muted) {
      v.muted = false;
      v.volume = volume;
      setMuted(false);
    } else {
      v.muted = true;
      setMuted(true);
    }
  }

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.ended) {
      v.currentTime = 0;
      v.play().catch(() => {});
      setPlaying(true);
    } else if (v.paused) {
      v.play().catch(() => {});
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = parseFloat(e.target.value);
    setVolume(val);
    const v = videoRef.current;
    if (!v) return;
    v.volume = val;
    if (val > 0) {
      v.muted = false;
      setMuted(false);
    } else {
      v.muted = true;
      setMuted(true);
    }
  }

  const buttonClasses =
    'w-11 h-11 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-white flex items-center justify-center hover:bg-black/80 transition-colors';

  return (
    <div className="relative w-full rounded-[2rem] overflow-hidden bg-black group shadow-2xl">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        autoPlay
        muted
        playsInline
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        className="w-full h-auto max-h-[80vh] object-contain bg-black cursor-pointer"
      />
      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
        {/* volume slider pill */}
        <div className="flex items-center bg-black/60 backdrop-blur-md border border-white/15 rounded-full px-3 py-1.5">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            aria-label="Volume"
            className="w-24 h-1.5 accent-white cursor-pointer"
          />
        </div>

        {/* mute toggle */}
        <button
          onClick={toggleMute}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className={buttonClasses}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>

        {/* play/pause toggle */}
        <button
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
          className={buttonClasses}
        >
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
    </div>
  );
}
