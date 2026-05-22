p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# Добавить стейт для roundSnapshot
c=c.replace(
'  const [charsRevealReplicasDone, setCharsRevealReplicasDone] = useState(false);',
'  const [charsRevealReplicasDone, setCharsRevealReplicasDone] = useState(false);\n  const [pendingReplicaRound, setPendingReplicaRound] = useState<any>(null);'
)

# В handleAdvance — сохранить roundSnapshot и перейти в result_replicas
old_advance = '''    const roundSnapshot = currentRound;
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
          if (roundSnapshot.success_host) queue.push({ speaker: "host", text: roundSnapshot.success_host, audioPath: roundSnapshot.success_host_audio });
          if (roundSnapshot.success_morty) queue.push({ speaker: "morty", text: roundSnapshot.success_morty, audioPath: roundSnapshot.success_morty_audio });
        } else {
          if (roundSnapshot.fail_host) queue.push({ speaker: "host", text: roundSnapshot.fail_host, audioPath: roundSnapshot.fail_host_audio });
          if (roundSnapshot.fail_morty) queue.push({ speaker: "morty", text: roundSnapshot.fail_morty, audioPath: roundSnapshot.fail_morty_audio });
        }
        setReplicaQueue(queue);
        setCurrentReplica(queue.length > 0 ? queue[0] : null);
        setPhase("result_replicas");
      }
    };'''

new_advance = '''    const roundSnapshot = currentRound;
    await advance(runId, roomId);
    if (isHost) {
      setPendingReplicaRound(roundSnapshot);
      setPhase("result_replicas");
    }
  };'''

if old_advance in c:
    c=c.replace(old_advance, new_advance)
    print("advance ok")
else:
    print("advance NOT FOUND")
    idx=c.find('const roundSnapshot = currentRound')
    print(repr(c[idx:idx+200]))

open(p,'w',encoding='utf-8',newline='\n').write(c)
