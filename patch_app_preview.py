with open('src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'import AdminScenarios from "./pages/admin/Scenarios.tsx";',
    'import ScenarioPreview from "./pages/ScenarioPreview.tsx";\nimport AdminScenarios from "./pages/admin/Scenarios.tsx";'
)

content = content.replace(
    '<Route path="/admin/scenarios" element={<AdminScenarios />} />',
    '<Route path="/scenarios/:scenarioId" element={<ScenarioPreview />} />\n              <Route path="/admin/scenarios" element={<AdminScenarios />} />'
)

with open('src/App.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
