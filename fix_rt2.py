f = open('src/pages/admin/RoundTest.tsx', encoding='utf-8')
c = f.read()
f.close()
c = c.replace(
  'to={/admin/scenarios/}',
  'to={"/admin/scenarios/" + scenarioId}'
)
c = c.replace(
  'to={/admin/test/}',
  'to={"/admin/test/" + scenarioId}'
)
open('src/pages/admin/RoundTest.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
