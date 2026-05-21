import { useRef, useState, useEffect } from "react";
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
  if (frame.host_line || frame.host_line_audio) queue.push({ speaker: "host", text: frame.host_line ?? "", audioPath: frame.host_line_audio });
  if (frame.morty_line || frame.morty_line_audio) queue.push({ speaker: "morty", text: frame.morty_line ?? "", audioPath: frame.morty_line_audio });

  const handleReplicasDone = () => {
    setReplicasDone(true);
    if (isHost && onNext) setTimeout(() => onNext!(), 800);
  };
  useEffect(() => {
    if (queue.length === 0 && isHost && onNext) {
      const t = setTimeout(() => { setReplicasDone(true); onNext!(); }, 3000);
      return () => clearTimeout(t);
    }
  }, [frameIndex]);

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {frame.image ? (
        <img src={getUrl(frame.image)} alt="" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm bg-muted">No image</div>
      )}
      <div className="absolute inset-0 bg-background/20" />
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
        <p className="text-xs font-mono text-white/60 tracking-widest">{frameIndex + 1} / {totalFrames}</p>
      </div>
      {frame.caption && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
          <div className="bg-background/80 backdrop-blur-sm border border-border rounded px-4 py-2 text-center">
            <p className="text-lg font-display text-foreground">{frame.caption}</p>
          </div>
        </div>
      )}
      {queue.length > 0 && !replicasDone && (
        <ReplicaChain key={frameIndex} queue={queue} onFinished={handleReplicasDone} />
      )}
      {isHost && (replicasDone || queue.length === 0) && onNext && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <button onClick={onNext} className="bg-portal text-portal-foreground px-12 py-4 rounded-lg font-display text-xl animate-in fade-in duration-500">
            {frameIndex < totalFrames - 1 ? "Далее →" : "Начать игру →"}
          </button>
        </div>
      )}
      {!isHost && (
        <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted-foreground font-mono text-xs uppercase tracking-widest animate-pulse">Ждём хоста...</p>
      )}
    </div>
  );
}
function ReplicaChain({ queue, onFinished }: { queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}>; onFinished: () => void }) {
  const indexRef = useRef(0);
  const [current, setCurrent] = useState(queue[0] ?? null);
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
