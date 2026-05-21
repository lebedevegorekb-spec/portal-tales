p='src/pages/admin/ScenarioEdit.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'function RoundEditor({ round, index, onChange }: { round: Round; index: number; onChange: (r: Round) => void }) {',
'function RoundEditor({ round, index, onChange, scenarioId }: { round: Round; index: number; onChange: (r: Round) => void; scenarioId: string }) {'
)
c=c.replace(
'            <MediaUpload scenarioId={useScenarioId} path={"rounds/" + round.id + "/background"} type="image"',
'            <MediaUpload scenarioId={scenarioId} path={"rounds/" + round.id + "/background"} type="image"'
)
c=c.replace(
'              <RoundEditor key={round.id} round={round} index={i} onChange={(r) => updateRound(i, r)} />',
'              <RoundEditor key={round.id} round={round} index={i} onChange={(r) => updateRound(i, r)} scenarioId={scenarioId!} />'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
