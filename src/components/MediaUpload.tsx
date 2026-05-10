import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, X, Music, Image } from "lucide-react";

interface MediaUploadProps {
  scenarioId: string;
  path: string;
  type: "audio" | "image";
  currentUrl?: string;
  onUploaded: (path: string) => void;
  onRemoved: () => void;
}

export function MediaUpload({ scenarioId, path, type, currentUrl, onUploaded, onRemoved }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | undefined>(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);
  const ext = type === "audio" ? "mp3" : "jpg";
  const storagePath = `${scenarioId}/${path}.${ext}`;
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  const publicUrl = `${baseUrl}/storage/v1/object/public/scenario-media/${storagePath}`;
  const accept = type === "audio" ? "audio/mp3,audio/mpeg,audio/wav" : "image/jpeg,image/png,image/webp";
  const Icon = type === "audio" ? Music : Image;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const { error: uploadError } = await supabase.storage
        .from("scenario-media")
        .upload(storagePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      setLocalUrl(storagePath);
      onUploaded(storagePath);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async () => {
    await supabase.storage.from("scenario-media").remove([storagePath]);
    setLocalUrl(undefined);
    onRemoved();
  };

  return (
    <div className="flex items-center gap-2">
      <input ref={inputRef} type="file" accept={accept} onChange={handleUpload} className="hidden" />
      {localUrl ? (
        <div className="flex items-center gap-2 flex-1">
          <Icon className="w-4 h-4 text-portal shrink-0" />
          {type === "audio" ? (
            <audio controls src={publicUrl} className="h-8 flex-1" />
          ) : (
            <img src={publicUrl} alt="" className="h-8 w-14 object-cover rounded border border-border" />
          )}
          <button onClick={handleRemove} className="text-muted-foreground hover:text-destructive transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-portal border border-dashed border-border hover:border-portal px-3 py-1.5 rounded-lg transition-all disabled:opacity-50">
          {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
          {type === "audio" ? "Аудио" : "Фото"}
        </button>
      )}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}
