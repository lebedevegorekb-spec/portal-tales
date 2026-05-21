import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MechanicViewProps, QuizRound } from "@/mechanics/types";

export function QuizPlayer({
  round,
  submissions,
  playerId,
  isSaboteur,
  onSubmit,
  runId,
}: MechanicViewProps<QuizRound>) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hiddenOptions, setHiddenOptions] = useState<Record<string, string>>({});
  const [hidePhase, setHidePhase] = useState(isSaboteur);
  const [loading, setLoading] = useState(false);

  const alreadySubmitted = submissions.some(
    (s) => s.player_id === playerId && s.payload?.answers !== undefined
  );

  const handleHide = (questionId: string, optionId: string) => {
    setHiddenOptions((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const confirmHide = async () => {
    setLoading(true);
    for (const [questionId, hideOptionId] of Object.entries(hiddenOptions)) {
      await supabase.functions.invoke("saboteur-quiz-action", {
        body: { run_id: runId, round_id: round.id, question_id: questionId, hide_option_id: hideOptionId },
      });
    }
    setHidePhase(false);
    setLoading(false);
  };

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    await onSubmit({ answers });
    setLoading(false);
  };

  const allAnswered = round.questions.every((q) => answers[q.id]);

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen text-foreground relative z-10 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-2xl font-display mb-2">Ответы отправлены</h2>
          <p className="text-muted-foreground">Ждём остальных...</p>
        </div>
      </div>
    );
  }

  if (isSaboteur && hidePhase) {
    return (
      <div className="min-h-screen text-foreground relative z-10 px-4 py-8 pb-24">
        <div className="max-w-md mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-destructive mb-3">⚠ Только для саботажника</p>
          <h1 className="text-3xl font-display mb-2">{round.title}</h1>
          <p className="text-muted-foreground mb-8">Выбери какой вариант скрыть в каждом вопросе.</p>
          <div className="grid gap-6">
            {round.questions.map((q, i) => (
              <div key={q.id} className="glass-card p-5">
                <p className="text-sm text-muted-foreground mb-2">Вопрос {i + 1}</p>
                <p className="text-base mb-4">{q.text}</p>
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleHide(q.id, opt.id)}
                      className={`p-3 rounded-lg text-sm text-left border transition-all ${
                        hiddenOptions[q.id] === opt.id
                          ? "border-destructive bg-destructive/10"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <span className="text-portal font-display mr-1">{opt.id.toUpperCase()}.</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
          <button
            onClick={confirmHide}
            disabled={loading || Object.keys(hiddenOptions).length < round.questions.length}
            className="w-full h-14 bg-destructive text-destructive-foreground rounded-lg font-display text-lg disabled:opacity-40"
          >
            {loading ? "Сохраняем..." : "Скрыть выбранные →"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground relative z-10 px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Экзамен</p>
        <h1 className="text-3xl font-display mb-6">{round.title}</h1>
        <div className="grid gap-6">
          {round.questions.map((q, i) => {
            const visibleOptions = isSaboteur
              ? q.options
              : q.options.filter((opt) => hiddenOptions[q.id] !== opt.id);
            return (
              <div key={q.id} className="glass-card p-5">
                <p className="text-sm text-muted-foreground mb-2">Вопрос {i + 1}</p>
                <p className="text-base mb-4">{q.text}</p>
                <div className="grid grid-cols-2 gap-2">
                  {visibleOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(q.id, opt.id)}
                      className={`p-3 rounded-lg text-sm text-left border transition-all ${
                        answers[q.id] === opt.id
                          ? "border-portal bg-portal/10"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      <span className="text-portal font-display mr-1">{opt.id.toUpperCase()}.</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || loading}
          className="w-full h-14 bg-portal text-portal-foreground rounded-lg font-display text-lg disabled:opacity-40"
        >
          {loading ? "Отправляем..." : "Отправить ответы"}
        </button>
      </div>
    </div>
  );
}
