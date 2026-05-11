with open('supabase/functions/round-advance/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = 'const calculators: Record<string, Function> = {'
new = '''function calcSituationDeduction(submissions: any[], saboteurPlayerId: string, round: any) {
  const saboteurSub = submissions.find(
    (s) => s.player_id === saboteurPlayerId && s.payload?.type === "final_guess"
  );
  const saboteurGuess = saboteurSub?.payload?.option_id;
  const saboteurWon = saboteurGuess === round.correct_option_id;
  return {
    team_scored: !saboteurWon,
    saboteur_scored: saboteurWon,
    team_points: saboteurWon ? 0 : round.points.team_success,
    saboteur_points: saboteurWon ? round.points.saboteur_success : 0,
  };
}

const calculators: Record<string, Function> = {'''

content = content.replace(old, new)

content = content.replace(
    '  vote_saboteur: calcVoteSaboteur,\n};',
    '  vote_saboteur: calcVoteSaboteur,\n  situation_deduction: calcSituationDeduction,\n};'
)

with open('supabase/functions/round-advance/index.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
