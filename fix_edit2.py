f = open('src/pages/admin/ScenarioEdit.tsx', encoding='utf-8')
c = f.read()
f.close()
old = 'import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";'
new = 'import { Loader2, Save, ChevronDown, ChevronUp, FlaskConical } from "lucide-react";\nimport { Link } from "react-router-dom";'
c = c.replace(old, new)
open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('step1 done')
