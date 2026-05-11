with open('src/mechanics/types.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Добавить situation_deduction в MechanicType
content = content.replace(
    '  | "vote_saboteur";',
    '  | "vote_saboteur"\n  | "situation_deduction";'
)

# Добавить новые интерфейсы перед VoteSaboteurRound
old = 'export interface VoteSaboteurRound extends RoundBase {'
new = '''export interface SituationOption {
  id: string;
  label: string;
}

export interface SituationDeductionRound extends RoundBase {
  mechanic: "situation_deduction";
  situation_real: string;
  situation_fake: string;
  forbidden_words: string[];
  question_time_seconds: number;
  options: SituationOption[];
  correct_option_id: string;
}

export interface VoteSaboteurRound extends RoundBase {'''

content = content.replace(old, new)

# Добавить в union RoundConfig
content = content.replace(
    '  | VoteSaboteurRound;',
    '  | VoteSaboteurRound\n  | SituationDeductionRound;'
)

with open('src/mechanics/types.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
