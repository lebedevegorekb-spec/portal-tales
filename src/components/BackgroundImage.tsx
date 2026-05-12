import { useEffect, useRef } from "react";

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
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) return;
    const url = getPublicUrl(imagePath);
    if (url) {
      divRef.current.style.backgroundImage = `url(${url})`;
      divRef.current.style.opacity = "1";
    } else {
      divRef.current.style.backgroundImage = "";
      divRef.current.style.opacity = "0";
    }
  }, [imagePath]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div
        ref={divRef}
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
        style={{ opacity: 0 }}
      />
      {overlay && <div className="absolute inset-0 bg-black/30" />}
    </div>
  );
}


