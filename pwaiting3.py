p='src/pages/Waiting.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'  }, [roomId, navigate]);\n\n  const handleReady',
'  }, [roomId, navigate]);\n\n  useEffect(() => {\n    if (!currentRunId || !roomId) return;\n    const runCh = supabase.channel(`waiting_run:${currentRunId}`)\n      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "runs", filter: `id=eq.${currentRunId}` },\n        (payload) => {\n          const uiPhase = (payload.new as any)?.state_json?.party_game?.ui_phase;\n          if (uiPhase === "chars_reveal") navigate(`/character?run=${currentRunId}&room=${roomId}`);\n          if (uiPhase === "playing") navigate(`/scene/${currentRunId}`);\n        })\n      .subscribe();\n    return () => { supabase.removeChannel(runCh); };\n  }, [currentRunId, roomId, navigate]);\n\n  const handleReady'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
