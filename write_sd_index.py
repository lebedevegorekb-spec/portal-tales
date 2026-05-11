f = open('src/mechanics/SituationDeduction/index.ts', 'w', encoding='utf-8', newline='\n')
f.write('export { SituationDeductionHost } from "./HostView";\nexport { SituationDeductionPlayer } from "./PlayerView";\n')
f.close()
print('done')
