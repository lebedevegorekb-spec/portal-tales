path = "C:/Users/lebed/portal-tales/src/pages/Scene.tsx"
c = open(path, encoding="utf-8").read()

old = 'const Scene = () => {'

new = '''function AutoAdvanceButton({ onAdvance }: { onAdvance: () => Promise<void> }) {
  const [seconds, setSeconds] = useState(5);
  useEffect(() => {
    if (seconds <= 0) { onAdvance(); return; }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);
  return (
    <button
      onClick={onAdvance}
      className="w-full h-14 bg-portal text-portal-foreground rounded-xl font-display text-xl hover:bg-portal/90 transition-all hover:scale-105 active:scale-95 relative overflow-hidden"
      style={{boxShadow: "0 0 20px hsl(var(--portal)/0.4)"}}
    >
      <div className="absolute inset-0 bg-black/20 transition-all duration-1000" style={{width: `${(seconds/5)*100}%`, right: 0, left: "auto"}} />
      <span className="relative">Следующий раунд → ({seconds})</span>
    </button>
  );
}

const Scene = () => {'''

assert old in c, "PATTERN NOT FOUND"
c = c.replace(old, new, 1)
open(path, "w", encoding="utf-8", newline="\n").write(c)
print("done")
