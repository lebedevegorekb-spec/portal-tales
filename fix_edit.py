f = open('src/pages/admin/ScenarioEdit.tsx', encoding='utf-8')
c = f.read()
f.close()
c = c.replace(
    'import { useParams, useNavigate } from "react-router-dom";',
    'import { useParams, useNavigate, Link } from "react-router-dom";'
)
c = c.replace(
    '<div className="mt-8 flex justify-end">',
    '<div className="mt-8 flex justify-between items-center"><Link to={"/admin/scenarios/" + scenarioId + "/test"} className="text-sm px-4 py-2 rounded-lg border border-portal/40 text-portal hover:bg-portal/10 transition-all">Test Rounds</Link>'
)
c = c.replace(
    '</div>\n      </main>',
    '</div>\n      </main>'
)
open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
