import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Send, Trophy, ArrowLeft } from "lucide-react";

type Msg = { id: string; role: string; content: string; created_at: string };
type RunInfo = {
  id: string;
  scenario_id: string;
  status: string;
  step_count: number;
  current_scene_id: string;
};

const MAX_INPUT = 80;
const MAX_STEPS = 50;

const Run = () => {
  const { runId } = useParams<{ runId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [run, setRun] = useState<RunInfo | null>(null);
  const [scenarioTitle, setScenarioTitle] = useState("");
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [checkpointFlash, setCheckpointFlash] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [authLoading, user, navigate]);

  const loadAll = async () => {
    if (!runId || !user) return;
    const { data: r, error } = await supabase
      .from("runs")
      .select("id, scenario_id, status, step_count, current_scene_id")
      .eq("id", runId)
      .maybeSingle();
    if (error || !r) {
      toast.error("Прохождение не найдено");
      navigate("/catalog");
      return;
    }
    setRun(r);
    const { data: s } = await supabase
      .from("scenarios")
      .select("title, final_image_url")
      .eq("id", r.scenario_id)
      .maybeSingle();
    setScenarioTitle(s?.title ?? "");
    if (r.status === "finished" && s?.final_image_url) setFinalImage(s.final_image_url);

    const { data: msgs } = await supabase
      .from("messages")
      .select("id, role, content, created_at")
      .eq("run_id", runId)
      .in("role", ["user", "assistant"])
      .order("created_at", { ascending: true })
      .limit(200);
    setMessages(msgs ?? []);
  };

  useEffect(() => {
    if (user) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, runId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = async () => {
    if (!run || sending) return;
    const text = input.trim().slice(0, MAX_INPUT);
    if (!text) return;
    setSending(true);
    setThinking(true);

    // Optimistic user message
    const tempId = `tmp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: tempId, role: "user", content: text, created_at: new Date().toISOString() },
    ]);
    setInput("");

    const { data, error } = await supabase.functions.invoke("run-step", {
      body: { run_id: run.id, user_text: text },
    });
    setThinking(false);
    setSending(false);

    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Ошибка");
      // revert optimistic
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: data.assistant,
        created_at: new Date().toISOString(),
      },
    ]);
    setRun({
      ...run,
      step_count: data.step_count,
      current_scene_id: data.current_scene_id ?? run.current_scene_id,
      status: data.is_final ? "finished" : run.status,
    });
    if (data.is_checkpoint) {
      setCheckpointFlash(true);
      setTimeout(() => setCheckpointFlash(false), 2200);
    }
    if (data.is_final && data.final_image_url) {
      setFinalImage(data.final_image_url);
    }
  };

  if (authLoading || !user || !run) return null;

  const progress = (run.step_count / MAX_STEPS) * 100;
  const finished = run.status === "finished";

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container py-6 max-w-3xl flex flex-col">
        <div className="flex items-center justify-between mb-3 gap-3">
          <Link to="/catalog" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> К сценариям
          </Link>
          <div className="text-right">
            <div className="text-xs font-mono text-portal">{run.scenario_id}</div>
            <div className="font-display font-semibold">{scenarioTitle}</div>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-3 mb-3">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-mono tabular-nums">Шаг {run.step_count}/{MAX_STEPS}</span>
            {checkpointFlash && (
              <span className="text-portal font-semibold animate-pulse">⭐ Чекпойнт сохранён</span>
            )}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto glass-card rounded-2xl p-4 space-y-3 min-h-[420px]"
        >
          {messages.map((m) => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl rounded-tr-sm bg-portal text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap"
                    : "max-w-[85%] rounded-2xl rounded-tl-sm bg-muted text-foreground px-4 py-2.5 text-sm whitespace-pre-wrap"
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm text-muted-foreground inline-flex gap-1 items-center">
                <span className="h-1.5 w-1.5 rounded-full bg-portal animate-blink" />
                <span className="h-1.5 w-1.5 rounded-full bg-portal animate-blink [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-portal animate-blink [animation-delay:0.4s]" />
              </div>
            </div>
          )}

          {finished && finalImage && (
            <div className="pt-4">
              <div className="rounded-2xl border border-portal/40 bg-portal/5 p-4 text-center">
                <Trophy className="mx-auto h-7 w-7 text-portal mb-2" />
                <div className="font-display font-bold text-xl mb-3">Финал сценария</div>
                <img
                  src={finalImage}
                  alt={`Финал ${scenarioTitle}`}
                  className="w-full rounded-xl border border-border"
                />
                <div className="flex gap-2 mt-4 justify-center">
                  <Link to="/catalog"><Button variant="outline">Другой сценарий</Button></Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {!finished && (
          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Что делаешь? (макс 80 символов)"
                disabled={sending}
                className="pr-14"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-muted-foreground tabular-nums">
                {input.length}/{MAX_INPUT}
              </span>
            </div>
            <Button
              onClick={send}
              disabled={sending || !input.trim()}
              className="bg-portal hover:bg-portal/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Run;
