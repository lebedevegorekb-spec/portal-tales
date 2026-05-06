import { useEffect, useRef, useState } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function getPublicUrl(path: string) {
  if (!path) return "";
  return `${SUPABASE_URL}/storage/v1/object/public/scenario-media/${path}`;
}

interface MediaPlayerProps {
  musicPath?: string;
  volume?: number;
}

export function MediaPlayer({ musicPath, volume = 0.4 }: MediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentPath, setCurrentPath] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (!musicPath || musicPath === currentPath) return;
    setCurrentPath(musicPath);

    const url = getPublicUrl(musicPath);
    if (!url) return;

    if (audioRef.current) {
      // crossfade
      const old = audioRef.current;
      const fadeOut = setInterval(() => {
        if (old.volume > 0.05) old.volume = Math.max(0, old.volume - 0.05);
        else { clearInterval(fadeOut); old.pause(); old.src = ""; }
      }, 100);
    }

    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0;
    audio.play().catch(() => {});
    audioRef.current = audio;

    // fade in
    const fadeIn = setInterval(() => {
      if (audio.volume < volume - 0.05) audio.volume = Math.min(volume, audio.volume + 0.05);
      else { audio.volume = volume; clearInterval(fadeIn); }
    }, 100);

    return () => { clearInterval(fadeIn); };
  }, [musicPath]);

  useEffect(() => {
    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, []);

  return null;
}
