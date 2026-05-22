p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# Добавить useEffect после phaseRef useEffect
old_phaseref = '  useEffect(() => { phaseRef.current = phase; }, [phase]);'
new_phaseref = '''  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Запустить реплики когда lastResult появился в gameState
  useEffect(() => {
    if (phase !== "result_replicas" || !pendingReplicaRound || !isHost) return;
    const lastResult = gameState?.round_results?.[gameState.round_results.length - 1];
    if (!lastResult) return;
    const r = pendingReplicaRound;
    const won = lastResult.team_scored;
    const isTie = (lastResult as any).is_tie;
    const isJoke = (lastResult as any).is_joke;
    const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
    if (isJoke) {
      const jo = (lastResult as any).joke_option;
      if (jo?.joke_host_line) queue.push({ speaker: "host", text: jo.joke_host_line, audioPath: jo.joke_host_audio });
      if (jo?.joke_morty_line) queue.push({ speaker: "morty", text: jo.joke_morty_line, audioPath: jo.joke_morty_audio });
    } else if (isTie) {
      if ((r as any).tie_host) queue.push({ speaker: "host", text: (r as any).tie_host, audioPath: (r as any).tie_host_audio });
      if ((r as any).tie_morty) queue.push({ speaker: "morty", text: (r as any).tie_morty, audioPath: (r as any).tie_morty_audio });
    } else if (won) {
      if (r.success_host) queue.push({ speaker: "host", text: r.success_host, audioPath: r.success_host_audio });
      if (r.success_morty) queue.push({ speaker: "morty", text: r.success_morty, audioPath: r.success_morty_audio });
    } else {
      if (r.fail_host) queue.push({ speaker: "host", text: r.fail_host, audioPath: r.fail_host_audio });
      if (r.fail_morty) queue.push({ speaker: "morty", text: r.fail_morty, audioPath: r.fail_morty_audio });
    }
    setReplicaQueue(queue);
    setCurrentReplica(queue.length > 0 ? queue[0] : null);
    setPendingReplicaRound(null);
  }, [gameState?.round_results?.length, phase, pendingReplicaRound, isHost]);'''

c=c.replace(old_phaseref, new_phaseref)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
