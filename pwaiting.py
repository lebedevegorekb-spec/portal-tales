p='src/pages/Waiting.tsx'
c=open(p,encoding='utf-8').read()

# Фикс 1: при начальной загрузке проверять ui_phase
c=c.replace(
'      if ((room?.status === "playing" || room?.status === "started") && room?.run_id) {\n        navigate(`/character?run=${room.run_id}&room=${roomId}`);\n        return;\n      }',
'      if ((room?.status === "playing" || room?.status === "started") && room?.run_id) {\n        const { data: runData2 } = await supabase.from("runs").select("state_json").eq("id", room.run_id).single();\n        const uiPhase2 = runData2?.state_json?.party_game?.ui_phase;\n        if (uiPhase2 === "playing") { navigate(`/scene/${room.run_id}`); return; }\n        if (uiPhase2 === "chars_reveal") { navigate(`/character?run=${room.run_id}&room=${roomId}`); return; }\n        setShowIntroWaiting(true);\n        setCurrentRunId(room.run_id);\n        return;\n      }'
)

# Фикс 2: realtime — добавить chars_reveal
c=c.replace(
'            if (uiPhase === "playing") navigate(`/scene/${r.run_id}`);\n            else navigate(`/character?run=${r.run_id}&room=${roomId}`);',
'            if (uiPhase === "playing") navigate(`/scene/${r.run_id}`);\n            else if (uiPhase === "chars_reveal") navigate(`/character?run=${r.run_id}&room=${roomId}`);\n            else { setShowIntroWaiting(true); setCurrentRunId(r.run_id); }'
)

# Фикс 3: добавить стейты
c=c.replace(
'  const [readying, setReadying] = useState(false);',
'  const [readying, setReadying] = useState(false);\n  const [showIntroWaiting, setShowIntroWaiting] = useState(false);\n  const [currentRunId, setCurrentRunId] = useState<string|null>(null);'
)

# Фикс 4: слушать ui_phase на runs когда showIntroWaiting
c=c.replace(
'      return () => { supabase.removeChannel(ch); };\n  }, [roomId, navigate]);',
'      return () => { supabase.removeChannel(ch); };\n  }, [roomId, navigate]);\n\n  useEffect(() => {\n    if (!currentRunId || !roomId) return;\n    const runCh = supabase.channel(`waiting_run:${currentRunId}`)\n      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "runs", filter: `id=eq.${currentRunId}` },\n        (payload) => {\n          const uiPhase = (payload.new as any)?.state_json?.party_game?.ui_phase;\n          if (uiPhase === "chars_reveal") navigate(`/character?run=${currentRunId}&room=${roomId}`);\n          if (uiPhase === "playing") navigate(`/scene/${currentRunId}`);\n        })\n      .subscribe();\n    return () => { supabase.removeChannel(runCh); };\n  }, [currentRunId, roomId, navigate]);'
)

# Фикс 5: показать заглушку
c=c.replace(
'  if (loading && !players.length) {',
'  if (showIntroWaiting) {\n    return (\n      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">\n        <Loader2 className="w-10 h-10 animate-spin text-portal" />\n        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Смотрим вступление...</p>\n      </div>\n    );\n  }\n\n  if (loading && !players.length) {'
)

open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
