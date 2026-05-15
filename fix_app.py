# App.tsx - добавить роут
f = open('src/App.tsx', encoding='utf-8')
c = f.read()
f.close()
c = c.replace(
  "import AdminScenarioEdit from \"./pages/admin/ScenarioEdit.tsx\";",
  "import AdminScenarioEdit from \"./pages/admin/ScenarioEdit.tsx\";\nimport RoundTest from \"./pages/admin/RoundTest.tsx\";"
)
c = c.replace(
  "<Route path=\"/admin/scenarios/:scenarioId\" element={<AdminScenarioEdit />} />",
  "<Route path=\"/admin/scenarios/:scenarioId\" element={<AdminScenarioEdit />} />\n              <Route path=\"/admin/test/:scenarioId\" element={<RoundTest />} />"
)
open('src/App.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('App.tsx done')
