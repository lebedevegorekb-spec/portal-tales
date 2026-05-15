import { useEffect, useRef, useState } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function getPublicUrl(path?: string) {
  if (!path) return "";
  return `${SUPABASE_URL}/storage/v1/object/public/scenario-media/${path}`;
}

interface ReplicaPlayerProps {
  speaker: "host" | "morty";
  text: string;
  audioPath?: string;
  onFinished?: () => void;
}

const AVATARS = {
  host: "https://api.dicebear.com/7.x/avataaars/svg?seed=rick&backgroundColor=b6e3f4",
  morty: "https://api.dicebear.com/7.x/avataaars/svg?seed=morty&backgroundColor=ffd5dc",
};

const NAMES = { host: "Рик", morty: "Морти" };

export function ReplicaPlayer({ speaker, text, audioPath, onFinished }: ReplicaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const url = getPublicUrl(audioPath);

    if (url) {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => { setVisible(false); setTimeout(() => onFinished?.(), 400); };
    } else {
      const timeout = setTimeout(() => {
        setVisible(false);
        setTimeout(() => onFinished?.(), 400);
      }, Math.max(2000, text.length * 60));
      return () => clearTimeout(timeout);
    }

    return () => { audioRef.current?.pause(); audioRef.current = null; };
  }, [audioPath, text]);

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-400 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"`}`}
      style={{ maxWidth: "90vw", width: 480 }}>
      <div className="glass-card p-4 flex items-start gap-3 border border-portal/30 shadow-lg">
        <img src={AVATARS[speaker]} alt={NAMES[speaker]}
          className="w-12 h-12 rounded-full border-2 border-portal/40 shrink-0" />
        <div>
          <p className="text-xs uppercase tracking-widest text-portal mb-1">{NAMES[speaker]}</p>
          <p className="text-sm text-foreground leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}
