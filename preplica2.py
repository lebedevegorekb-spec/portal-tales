p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# Добавить стейт
c=c.replace(
'  const [charsRevealReplicasDone, setCharsRevealReplicasDone] = useState(false);',
'  const [charsRevealReplicasDone, setCharsRevealReplicasDone] = useState(false);\n  const [pendingReplicaRound, setPendingReplicaRound] = useState<any>(null);'
)

# Заменить handleAdvance
old='''handleAdvance = async () => {
    if (!runId || !roomId || !currentRound) return;
    const advanceRes = await advance(runId, roomId);
    const result = advanceRes?.result;
    if (isHost) {
      const won = result?.team_scored;
      const isTie = result?.is_tie ?? false;
      const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
      if (result?.is_joke) {
        const jo = result.joke_option;
        if (jo?.joke_host_line) queue.push({ speaker: "host", text: jo.joke_host_line, audioPath: jo.joke_host_audio });
        if (jo?.joke_morty_line) queue.push({ speaker: "morty", text: jo.joke_morty_line, audioPath: jo.joke_morty_audio });
      } else if (isTie && (currentRound as any).tie_host) {
        queue.push({ speaker: "host", text: (currentRound as any).tie_host, audioPath: (currentRound as any).tie_host_audio });
        if ((currentRound as any).tie_morty) queue.push({ speaker: "morty", text: (currentRound as any).tie_morty, audioPath: (currentRound as any).tie_morty_audio });
      } else if (won) {
        if (currentRound.success_host) queue.push({ speaker: "host", text: currentRound.success_host, audioPath: currentRound.success_host_audio });
        if (currentRound.success_morty) queue.push({ speaker: "morty", text: currentRound.success_morty, audioPath: currentRound.success_morty_audio });
      } else {
        if (currentRound.fail_host) queue.push({ speaker: "host", text: currentRound.fail_host, audioPath: currentRound.fail_host_audio });
        if (currentRound.fail_morty) queue.push({ speaker: "morty", text: currentRound.fail_morty, audioPath: currentRound.fail_morty_audio });
      }
      setReplicaQueue(queue);
      setCurrentReplica(queue.length > 0 ? queue[0] : null);
      setPhase("result_replicas");
    }
  };'''

new='''handleAdvance = async () => {
    if (!runId || !roomId || !currentRound) return;
    const snap = currentRound;
    await advance(runId, roomId);
    if (isHost) {
      setPendingReplicaRound(snap);
      setPhase("result_replicas");
    }
  };'''

if old in c:
    c=c.replace(old,new)
    print("ok")
else:
    print("NOT FOUND")
    idx=c.find('handleAdvance = async')
    print(repr(c[idx:idx+100]))

open(p,'w',encoding='utf-8',newline='\n').write(c)
