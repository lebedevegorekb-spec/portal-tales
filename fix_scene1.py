path = "C:/Users/lebed/portal-tales/src/pages/Scene.tsx"
c = open(path, encoding="utf-8").read()

old = '''          {isHost ? (
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
              {"Следующий раунд →"}
            </button>
          ) : ('''

new = '''          {isHost ? (
            <AutoAdvanceButton onAdvance={async () => {
              if (!runId || !roomId) return;
              const { supabase: sb } = await import("@/integrations/supabase/client").then(m => ({ supabase: m.supabase }));
              await sb.functions.invoke("round-result-ack", { body: { run_id: runId, room_id: roomId } });
              setPhase("playing");
            }} />
          ) : ('''

assert old in c, "PATTERN NOT FOUND"
c = c.replace(old, new)
open(path, "w", encoding="utf-8", newline="\n").write(c)
print("done")
