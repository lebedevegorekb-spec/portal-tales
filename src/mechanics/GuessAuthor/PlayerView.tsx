import { useState } from "react";
import type { MechanicViewProps, GuessAuthorRound, RoundSubmission } from "@/mechanics/types";

interface Player {
  id: string;
  display_name: string;
}

interface GuessAuthorPlayerProps extends MechanicViewProps<GuessAuthorRound> {
  players?: Player[];
}

export function GuessAuthorPlayer({ round, submissions, playerId, onSubmit, players = [] }: GuessAuthorPlayerProps) {
  const [completion, setCompletion] = useState("");
  const [guesses, setGuesses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const myAnswer = submissions.find(
    (s) => s.player_id === playerId && s.payload?.completion !== undefined
  );
  const myGuess = submissions.find(
    (s) => s.player_id === playerId && s.payload?.guesses !== undefined
  );

  const answerSubmissions = submissions.filter((s) => s.payload?.completion !== undefined);
  const showGuessing = answerSubmissions.length >= (players.length || 1) && !myAnswer;

  const handleSubmitAnswer = async () => {
    if (!completion.trim() || loading) return;
    setLoading(true);
    await onSubmit({ completion: completion.trim() });
    setLoading(false);
  };

  const handleSubmitGuesses = async () => {
    if (loading) return;
    setLoading(true);
    await onSubmit({ guesses });
    setLoading(false);
  };

  if (myGuess) {
    return (
      <div className="min-h-screen text-foreground flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full glass-card p-8 text-center">
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-2xl font-display mb-2">Готово</h2>
          <p className="text-muted-foreground">Ждём итогов...</p>
        </div>
      </div>
    );
  }

  if (myAnswer && !myGuess) {
    return (
      <div className="min-h-screen text-foreground px-4 py-8 pb-24">
        <div className="max-w-md mx-auto">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Угадай автора</p>
          <h1 className="text-3xl font-display mb-6">Кто что написал?</h1>
          <div className="grid gap-4 mb-6">
            {answerSubmissions.map((s, i) => (
              <div key={s.id} className="glass-card p-4">
                <p className="text-sm text-muted-foreground mb-2">Ответ {i + 1}</p>
                <p className="mb-3">«{round.prompt_prefix} {s.payload.completion}»</p>
                <div className="grid gap-2">
                  {players.filter((p) => p.id !== playerId).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setGuesses((prev) => ({ ...prev, [s.id]: p.id }))}
                      className={`p-2 rounded-lg text-sm border transition-all ${
                        guesses[s.id] === p.id
                          ? "border-portal bg-portal/10"
                          : "border-border hover:border-muted-foreground"
                      }`}
                    >
                      {p.display_name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
          <button
            onClick={handleSubmitGuesses}
            disabled={loading}
            className="w-full h-14 bg-portal text-portal-foreground rounded-lg font-display text-lg disabled:opacity-40"
          >
            {loading ? "Отправляем..." : "Отправить догадки"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground px-4 py-8">
      <div className="max-w-md mx-auto">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Угадай автора</p>
        <h1 className="text-3xl font-display mb-3">{round.title}</h1>
        <p className="text-muted-foreground mb-2">{round.prompt_prefix}</p>
        <textarea
          value={completion}
          onChange={(e) => setCompletion(e.target.value)}
          placeholder="...продолжи фразу"
          rows={4}
          className="w-full bg-muted border border-border rounded-lg p-4 text-foreground placeholder:text-muted-foreground resize-none mb-4 focus:outline-none focus:border-portal"
        />
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
          <button
            onClick={handleSubmitAnswer}
            disabled={!completion.trim() || loading}
            className="w-full h-14 bg-portal text-portal-foreground rounded-lg font-display text-lg disabled:opacity-40"
          >
            {loading ? "Отправляем..." : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
}
