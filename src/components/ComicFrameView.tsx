import { useEffect, useRef } from "react";
import { ReplicaPlayer } from "@/components/ReplicaPlayer";
import type { ComicFrame } from "@/mechanics/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
function getUrl(path?: string) {
  if (!path) return "";
  return `${SUPABASE_URL}/storage/v1/object/public/scenario-media/${path}`;
}

interface ComicFrameProps {
  frame: ComicFrame;
  frameIndex: number;
  totalFrames: number;
  onReplicasFinished?: () => void;
  isHost: boolean;
  onNext?: () => void;
  replicasDone: boolean;
  setReplicasDone: (v: boolean) => void;
}

export function ComicFrameView({ frame, frameIndex, totalFrames, isHost, onNext, replicasDone, setReplicasDone }: ComicFrameProps) {
  const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
  if (frame.host_line) queue.push({ speaker: "host", text: frame.host_line, audioPath: frame.host_line_audio });
  if (frame.morty_line) queue.push({ speaker: "morty", text: frame.morty_line, audioPath: frame.morty_line_audio });

  return (
    <div className="min-h-screen bg-[#1a1008] text-foreground flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)"}} />
      <div className="relative z-10 w-full max-w-3xl flex flex-col items-center gap-4">
        <div className="text-xs font-mono text-muted-foreground tracking-widest">{frameIndex + 1} / {totalFrames}</div>
        <div className="w-full border-4 border-white/90 rounded-sm shadow-2xl overflow-hidden" style={{aspectRatio: "16/9", background: "#111"}}>
          {frame.image ? (
            <img src={getUrl(frame.image)} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">No image</div>
          )}
        </div>
        {frame.caption && (
          <div className="w-full bg-white/5 border border-white/10 rounded px-4 py-2 text-center">
            <p className="text-lg font-display text-white">{frame.caption}</p>
          </div>
        )}
        {queue.length > 0 && !replicasDone && (
          <ReplicaChain queue={queue} onFinished={() => setReplicasDone(true)} />
        )}
        {isHost && (replicasDone || queue.length === 0) && onNext && (
          <button onClick={onNext} className="mt-4 bg-portal text-portal-foreground px-12 py-4 rounded-lg font-display text-xl animate-in fade-in duration-500">
            {frameIndex < totalFrames - 1 ? "Далее →" : "Начать игру →"}
          </button>
        )}
        {!isHost && (
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest animate-pulse">Ждём хоста...</p>
        )}
      </div>
    </div>
  );
}

function ReplicaChain({ queue, onFinished }: { queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}>; onFinished: () => void }) {
  const indexRef = useRef(0);
  const [current, setCurrent] = (require("react") as any).useState(queue[0] ?? null);

  const handleFinished = () => {
    indexRef.current += 1;
    if (indexRef.current < queue.length) {
      setCurrent(queue[indexRef.current]);
    } else {
      setCurrent(null);
      onFinished();
    }
  };

  if (!current) return null;
  return <ReplicaPlayer speaker={current.speaker} text={current.text} audioPath={current.audioPath} onFinished={handleFinished} />;
}