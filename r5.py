p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# Найдем начало блока
start_marker = '  if (phase === "result_screen" || phase === "result_replicas") {'
start = c.find(start_marker)

# Найдем конец блока — следующий блок после него
end_marker = '\n  if (!partyConfig || !gameState || !currentRound)'
end = c.find(end_marker, start)

if start > 0 and end > 0:
    old_block = c[start:end]
    new_block = '''  if (phase === "result_screen" || phase === "result_replicas") {
    const lastResult = gameState?.round_results?.[gameState.round_results.length - 1];
    const isTie = lastResult?.is_tie;
    const teamWon = lastResult?.team_scored && !isTie;
    const resultBg = isTie
      ? (currentRound as any)?.result_tie_image
      : teamWon
      ? (currentRound as any)?.result_success_image
      : (currentRound as any)?.result_fail_image || currentRound?.background_image;
    const accentColor = isTie ? "#facc15" : teamWon ? "hsl(var(--portal))" : "hsl(var(--destructive))";
    const glowColor = isTie ? "rgba(250,204,21,0.25)" : teamWon ? "rgba(0,255,128,0.2)" : "rgba(255,60,60,0.2)";
    const resultLabel = isTie ? "Ничья!" : teamWon ? "Команда побеждает!" : "Саботажник побеждает!";
    const resultEmoji = isTie ? "\u26a1" : teamWon ? "\u2736" : "\u2620";
    return (
      <div className="min-h-screen text-foreground relative overflow-hidden flex flex-col items-center justify-center">
        {isHost && <BackgroundImage imagePath={resultBg} />}
        <div className="absolute inset-0 z-0" style={{background: `radial-gradient(ellipse at 50% 40%, ${glowColor} 0%, transparent 70%)`}} />
        <div className="absolute inset-0 z-0 scanlines opacity-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full z-0 blur-3xl opacity-30 animate-pulse"
          style={{background: `radial-gradient(circle, ${accentColor} 0%, transparent 70%)`}} />
        <div className="relative z-10 flex flex-col items-center gap-6 px-4 w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
          <div className="w-full rounded-2xl p-8 text-center backdrop-blur-md"
            style={{background: "rgba(9,13,21,0.75)", border: `1px solid ${accentColor}40`, boxShadow: `0 0 40px ${glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)`}}>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">
              {"\u0418\u0442\u043e\u0433 \u0440\u0430\u0443\u043d\u0434\u0430"} {gameState?.current_round_index ?? 1}
            </p>
            <div className="text-6xl mb-4 animate-in zoom-in duration-300">{resultEmoji}</div>
            <h2 className="text-4xl font-display mb-6" style={{color: accentColor, textShadow: `0 0 20px ${accentColor}`}}>
              {resultLabel}
            </h2>
            {lastResult && (
              <div className="flex justify-center gap-6 mb-6">
                {(lastResult.team_points ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-portal font-mono">+{lastResult.team_points}</span>
                    <span className="text-muted-foreground uppercase tracking-widest text-xs">{"\u043a\u043e\u043c\u0430\u043d\u0434\u0435"}</span>
                  </div>
                )}
                {(lastResult.saboteur_points ?? 0) > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-destructive font-mono">+{lastResult.saboteur_points}</span>
                    <span className="text-muted-foreground uppercase tracking-widest text-xs">{"\u0445\u0430\u043e\u0441\u0443"}</span>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-center gap-12 pt-4 border-t border-white/10">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{"\u041a\u043e\u043c\u0430\u043d\u0434\u0430"}</p>
                <p className="text-5xl font-display text-portal">{gameState?.scores.team ?? 0}</p>
              </div>
              <div className="w-px bg-white/10" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{"\u0425\u0430\u043e\u0441"}</p>
                <p className="text-5xl font-display text-destructive">{gameState?.scores.saboteur ?? 0}</p>
              </div>
            </div>
          </div>
          {isHost ? (
            <button
              onClick={async () => {
                if (!runId || !roomId) return;
                const { supabase: sb } = await import("@/integrations/supabase/client").then(m => ({ supabase: m.supabase }));
                await sb.functions.invoke("round-result-ack", { body: { run_id: runId, room_id: roomId } });
                setPhase("playing");
              }}
              className="w-full h-14 bg-portal text-portal-foreground rounded-xl font-display text-xl hover:bg-portal/90 transition-all hover:scale-105 active:scale-95"
              style={{boxShadow: "0 0 20px hsl(var(--portal)/0.4)"}}
            >
              {"\u0421\u043b\u0435\u0434\u0443\u044e\u0449\u0438\u0439 \u0440\u0430\u0443\u043d\u0434 \u2192"}
            </button>
          ) : (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin text-portal" />
              <p className="font-mono text-sm uppercase tracking-widest">{"\u0416\u0434\u0451\u043c \u0445\u043e\u0441\u0442\u0430..."}</p>
            </div>
          )}
        </div>
        {currentReplica && (
          <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />
        )}
      </div>
    );
  }'''
    c = c[:start] + new_block + c[end:]
    open(p,'w',encoding='utf-8',newline='\n').write(c)
    print("ok")
else:
    print("NOT FOUND", start, end)
