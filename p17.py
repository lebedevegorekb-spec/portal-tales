p='src/components/ReplicaPlayer.tsx'
c=open(p,encoding='utf-8').read()
old="""  useEffect(() => {
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
  }, [audioPath, text]);"""
new="""  useEffect(() => {
    setVisible(true);
    const url = getPublicUrl(audioPath);
    let t1: ReturnType<typeof setTimeout>;
    let t2: ReturnType<typeof setTimeout>;
    if (url) {
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play().catch(() => {});
      audio.onended = () => { setVisible(false); t1 = setTimeout(() => onFinished?.(), 400); };
      audio.onerror = () => {
        setVisible(false);
        t1 = setTimeout(() => onFinished?.(), 400);
      };
    } else {
      const delay = text.trim().length > 0 ? Math.max(2000, text.length * 60) : 1000;
      t2 = setTimeout(() => {
        setVisible(false);
        t1 = setTimeout(() => onFinished?.(), 400);
      }, delay);
    }
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [audioPath, text]);"""
c=c.replace(old,new)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
