p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

old='''    if (isHost && !charsRevealReplicasDone) {
      const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
      if (intro?.chars_reveal_host_line) queue.push({ speaker: "host", text: intro.chars_reveal_host_line, audioPath: intro.chars_reveal_host_audio });
      if (intro?.chars_reveal_morty_line) queue.push({ speaker: "morty", text: intro.chars_reveal_morty_line, audioPath: intro.chars_reveal_morty_audio });
      if (queue.length > 0) { setCharsRevealQueue(queue); setCharsRevealReplica(queue[0]); }
      setCharsRevealReplicasDone(true);
    }'''

new=''

if old in c:
    c=c.replace(old,new)
    print("removed inline replica launch ok")
else:
    print("NOT FOUND")

# Добавить useEffect для запуска реплик chars_reveal
old_phaseref = '  useEffect(() => { phaseRef.current = phase; }, [phase]);'
new_phaseref = '''  useEffect(() => { phaseRef.current = phase; }, [phase]);

  useEffect(() => {
    if (phase !== "chars_reveal" || !isHost || charsRevealReplicasDone || !partyConfig) return;
    const intro = partyConfig.intro as any;
    const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
    if (intro?.chars_reveal_host_line) queue.push({ speaker: "host", text: intro.chars_reveal_host_line, audioPath: intro.chars_reveal_host_audio });
    if (intro?.chars_reveal_morty_line) queue.push({ speaker: "morty", text: intro.chars_reveal_morty_line, audioPath: intro.chars_reveal_morty_audio });
    if (queue.length > 0) { setCharsRevealQueue(queue); setCharsRevealReplica(queue[0]); }
    setCharsRevealReplicasDone(true);
  }, [phase, isHost, charsRevealReplicasDone, partyConfig]);'''

c=c.replace(old_phaseref, new_phaseref)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
