f = open('src/pages/admin/ScenarioEdit.tsx', encoding='utf-8')
c = f.read()
f.close()
c = c.replace(
  '<Link to={/admin/test/' + '}>',
  '<Link to={"/admin/test/" + scenarioId}>'
)
open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
