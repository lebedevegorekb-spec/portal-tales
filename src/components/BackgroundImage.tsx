import { useState, useEffect } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

function getPublicUrl(path?: string) {
  if (!path) return "";
  return `${SUPABASE_URL}/storage/v1/object/public/scenario-media/${path}`;
}

interface BackgroundImageProps {
  imagePath?: string;
  overlay?: boolean;
}

export function BackgroundImage({ imagePath, overlay = true }: BackgroundImageProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const url = getPublicUrl(imagePath);
    if (url === current) return;
    if (!current) { setCurrent(url); return; }
    setNext(url);
    setFading(true);
    const t = setTimeout(() => {
      setCurrent(url);
      setNext("");
      setFading(false);
    }, 800);
    return () => clearTimeout(t);
  }, [imagePath]);

  if (!current && !next) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {current && (
        <div className={`absolute inset-0 bg-cover bg-center transition-opacity duration-800 ${fading ? "opacity-0" : "opacity-100"}`}
          style={{ backgroundImage: `url(${current})` }} />
      )}
      {next && (
        <div className="absolute inset-0 bg-cover bg-center opacity-100"
          style={{ backgroundImage: `url(${next})` }} />
      )}
      {overlay && <div className="absolute inset-0 bg-background/70" />}
    </div>
  );
}
