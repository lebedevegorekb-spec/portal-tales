import { useState } from "react";
import type { MechanicViewProps, SituationDeductionRound } from "@/mechanics/types";

interface SituationDeductionPlayerProps extends MechanicViewProps<SituationDeductionRound> {
  gameState?: any;
}

export function SituationDeductionPlayer({
  round, submissions, playerId, isSaboteur, onSubmit
}: SituationDeductionPlayerProps) {
  const [question, setQuestion] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [phase, setPhase] = useState<"read" | "questions" | "vote" | "done">("read");
  const [loading, setLoading] = useState(false);

  const myVote = submissions.find(s =>
    s.player_id === playerId &&
    (s.payload?.type === "final_vote" || s.payload?.type === "final_guess")
  );

  const situation = isSaboteur ? round.situation_fake : round.situation_real;
  const situationLabel = isSaboteur ? "Твоя ситуация (она отличается от остальных)" : "Твоя ситуация";

  if (myVote) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-2xl font-display mb-2">Ответ отправлен</h2>
          <p className="text-muted-foreground">Ждём итогов...</p>
        </div>
      </div>
    );
  }

  if (phase === "read") {
    return (
      <div className="min-h-screen bg-background text-foreground px-4 py-8">
        <div className="max-w-md mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
            {round.title}
          </p>
          <div className={`glass-card p-5 mb-6 border-l-2 ${isSaboteur ? "border-yellow-500" : "border-portal"`}`}>
            <p className={`text-xs uppercase tracking-widest mb-2 ${isSaboteur ? "text-yellow-500" : "text-portal"`}`}>
              {situationLabel}
            </p>
            <p className="text-base leading-relaxed">{situation}</p>
          </div>
          {isSaboteur && (
            <div className="glass-card p-4 mb-6 border border-yellow-500/30 bg-yellow-500/5">
              <p className="text-xs text-yellow-500 mb-1">⚠ Ты саботажник</p>
              <p className="text-xs text-muted-foreground">
                Слушай вопросы внимательно. В конце угадай настоящую ситуацию из 4 вариантов.
                Твоя ситуация — неправильная.
              </p>
            </div>
          )}
          <div className="glass-card p-4 mb-6">
            <p className="text-xs uppercase tracking-widest text-destructive mb-2">Запрещённые слова</p>
            <div className="flex flex-wrap gap-2">
              {round.forbidden_words.map(w => (
                <span key={w} className="text-xs border border-destructive/30 text-destructive px-2 py-1 rounded">{w}</span>
              ))}
            </div>
          </div>
          <button onClick={() => setPhase("questions")}
            className="w-full h-14 bg-portal text-portal-foreground rounded-lg font-display text-lg">
            Понял, готов →
          </button>
        </div>
      </div>
    );
  }

  if (phase === "questions") {
    return (
      <div className="min-h-screen bg-background text-foreground px-4 py-8 pb-24">
        <div className="max-w-md mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Задай вопрос</p>
          <div className={`glass-card p-4 mb-6 border-l-2 ${isSaboteur ? "border-yellow-500" : "border-portal"`}`}>
            <p className="text-xs text-muted-foreground mb-1">Твоя ситуация</p>
            <p className="text-sm">{situation}</p>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Задай вопрос другому игроку — намекай на ситуацию, но не называй запрещённые слова.
          </p>
          <textarea value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="Твой вопрос..." rows={3}
            className="w-full bg-muted border border-border rounded-lg p-4 text-sm resize-none focus:outline-none focus:border-portal mb-4" />
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
          <div className="flex gap-2 max-w-md mx-auto">
            <button onClick={async () => {
              if (!question.trim() || loading) return;
              setLoading(true);
              await onSubmit({ type: "question", question: question.trim() });
              setLoading(false);
              setPhase("vote");
            }} disabled={!question.trim() || loading}
              className="flex-1 h-14 bg-portal text-portal-foreground rounded-lg font-display disabled:opacity-40">
              Отправить вопрос
            </button>
            <button onClick={() => setPhase("vote")}
              className="px-4 h-14 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground">
              Пропустить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-4 py-8 pb-24">
      <div className="max-w-md mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">
          {isSaboteur ? "Угадай настоящую ситуацию" : "Выбери настоящую ситуацию"}
        </p>
        {isSaboteur && (
          <div className="glass-card p-4 mb-4 border border-yellow-500/30 bg-yellow-500/5">
            <p className="text-xs text-yellow-500">Слушал внимательно? Выбери настоящую ситуацию.</p>
          </div>
        )}
        <div className="grid gap-3 mb-6">
          {round.options.map(opt => (
            <button key={opt.id} onClick={() => setSelectedOption(opt.id)}
              className={`glass-card p-4 text-left border-2 transition-all ${
                selectedOption === opt.id ? "border-portal bg-portal/10" : "border-transparent hover:border-border"
              `}`}>
              <span className="text-portal font-display mr-2">{opt.id}.</span>
              <span className="text-sm">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
        <button onClick={async () => {
          if (!selectedOption || loading) return;
          setLoading(true);
          await onSubmit({
            type: isSaboteur ? "final_guess" : "final_vote",
            option_id: selectedOption
          });
          setLoading(false);
        }} disabled={!selectedOption || loading}
          className="w-full h-14 bg-portal text-portal-foreground rounded-lg font-display text-lg max-w-md mx-auto block disabled:opacity-40">
          {loading ? "Отправляем..." : "Подтвердить выбор"}
        </button>
      </div>
    </div>
  );
}
