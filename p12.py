p='src/components/ComicFrameView.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'''function ReplicaChain({ queue, onFinished }: { queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}>; onFinished: () => void }) {
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
}''',
'''function ReplicaChain({ queue, onFinished }: { queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}>; onFinished: () => void }) {
  const indexRef = useRef(0);
  const [current, setCurrent] = useState<{speaker:"host"|"morty";text:string;audioPath?:string} | null>(null);
  useEffect(() => {
    indexRef.current = 0;
    const t = setTimeout(() => setCurrent(queue[0] ?? null), 50);
    return () => clearTimeout(t);
  }, []);
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
}'''
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
