import re
p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'          if (phaseRef.current === "intro") handleIntroFinish();',
'''          if (phaseRef.current === "intro") {
            (async () => {
              if (!runId) return;
              const { data: run } = await supabase.from("runs").select("state_json").eq("id", runId).single();
              if (run?.state_json) {
                const newState = { ...run.state_json, party_game: { ...run.state_json.party_game, phase: "round", ui_phase: "chars_reveal" } };
                await supabase.from("runs").update({ state_json: newState }).eq("id", runId);
              }
              setPhase("chars_reveal");
            })();
          }'''
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
