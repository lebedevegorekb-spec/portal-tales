with open('src/components/RoundRouter.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'import { VoteSaboteurHost, VoteSaboteurPlayer } from "@/mechanics/VoteSaboteur";',
    'import { VoteSaboteurHost, VoteSaboteurPlayer } from "@/mechanics/VoteSaboteur";\nimport { SituationDeductionHost, SituationDeductionPlayer } from "@/mechanics/SituationDeduction";'
)

content = content.replace(
    '  vote_saboteur: VoteSaboteurHost,\n};',
    '  vote_saboteur: VoteSaboteurHost,\n  situation_deduction: SituationDeductionHost,\n};'
)

content = content.replace(
    '  vote_saboteur: VoteSaboteurPlayer,\n};',
    '  vote_saboteur: VoteSaboteurPlayer,\n  situation_deduction: SituationDeductionPlayer,\n};'
)

with open('src/components/RoundRouter.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
