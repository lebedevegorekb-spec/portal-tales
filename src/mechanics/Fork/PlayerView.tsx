import type { MechanicViewProps } from "@/mechanics/types";

export function ForkPlayer({ round, onSubmit }: MechanicViewProps<any>) {
  return (
    <div className="glass-card p-6 text-center">
      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">PLAYER — Fork</p>
      <h2 className="text-2xl font-display mb-4">{round.title}</h2>
      <p className="text-muted-foreground mb-6">{round.intro_morty}</p>
      <button
        onClick={() => onSubmit({ stub: true })}
        className="bg-portal text-portal-foreground px-6 py-3 rounded-lg w-full"
      >
        Отправить (заглушка)
      </button>
    </div>
  );
}
