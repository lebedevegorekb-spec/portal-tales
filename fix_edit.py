f = open('src/pages/admin/ScenarioEdit.tsx', encoding='utf-8')
c = f.read()
f.close()
c = c.replace(
  'import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";',
  'import { Loader2, Save, ChevronDown, ChevronUp, FlaskConical } from "lucide-react";\nimport { Link } from "react-router-dom";'
)
c = c.replace(
  '<Button variant="outline" size="sm" onClick={() => navigate(/admin/scenarios)}',
  '<Link to={/admin/test/}><Button variant="outline" size="sm" className="gap-2"><FlaskConical className="w-4 h-4" />

@"
f = open('src/pages/admin/ScenarioEdit.tsx', encoding='utf-8')
c = f.read()
f.close()
c = c.replace(
  'import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";',
  'import { Loader2, Save, ChevronDown, ChevronUp, FlaskConical } from "lucide-react";\nimport { Link } from "react-router-dom";'
)
c = c.replace(
  '<Button variant="outline" size="sm" onClick={() => navigate(/admin/scenarios)}',
  '<Link to={/admin/test/}><Button variant="outline" size="sm" className="gap-2"><FlaskConical className="w-4 h-4" />Тест раундов</Button></Link>\n        <Button variant="outline" size="sm" onClick={() => navigate(/admin/scenarios)}'
)
open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
