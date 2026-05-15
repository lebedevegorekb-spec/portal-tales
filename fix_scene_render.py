f = open('src/pages/Scene.tsx', encoding='utf-8')
c = f.read()
f.close()

old = '  if (phase === "intro" && isHost && partyConfig?.intro) {'
new = """  if (phase === "comic_intro" && partyConfig?.intro?.comic_frames?.length) {
    const frames = partyConfig.intro.comic_frames!;
    const frame = frames[comicFrameIndex];
    const handleNext = async () => {
      if (comicFrameIndex < frames.length - 1) {
        setComicFlipping(true);
        setComicReplicasDone(false);
        setTimeout(() => { setComicFrameIndex(i => i + 1); setComicFlipping(false); }, 300);
        if (runId) {
          const { data: run } = await supabase.from("runs").select("state_json").eq("id", runId).single();
          if (run?.state_json) {
            const newState = { ...run.state_json, party_game: { ...run.state_json.party_game, comic_frame_index: comicFrameIndex + 1 } };
            await supabase.from("runs").update({ state_json: newState }).eq("id", runId);
          }
        }
      } else {
        if (runId) {
          const { data: run } = await supabase.from("runs").select("state_json").eq("id", runId).single();
          if (run?.state_json) {
            const newState = { ...run.state_json, party_game: { ...run.state_json.party_game, ui_phase: "intro" } };
            await supabase.from("runs").update({ state_json: newState }).eq("id", runId);
          }
        }
        setPhase("intro");
      }
    };
    return (
      <div className={"transition-opacity duration-300 " + (comicFlipping ? "opacity-0" : "opacity-100")}>
        <ComicFrameView
          frame={frame}
          frameIndex={comicFrameIndex}
          totalFrames={frames.length}
          isHost={isHost}
          onNext={isHost ? handleNext : undefined}
          replicasDone={comicReplicasDone}
          setReplicasDone={setComicReplicasDone}
          onReplicasFinished={() => setComicReplicasDone(true)}
        />
      </div>
    );
  }

  if (phase === "intro" && isHost && partyConfig?.intro) {"""
c = c.replace(old, new)
open('src/pages/Scene.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done scene render')
