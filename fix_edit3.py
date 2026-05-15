f = open('src/pages/admin/ScenarioEdit.tsx', encoding='utf-8')
c = f.read()
f.close()
idx = c.find('<SiteHeader />')
insert = '\n        <Link to={/admin/test/' + '}><button className="flex items-center gap-2 text-sm border border-portal/40 text-portal px-3 py-1.5 rounded-lg hover:bg-portal/10">Тест раундов</button></Link>'
c = c[:idx + len('<SiteHeader />')] + insert + c[idx + len('<SiteHeader />'):]
open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('step2 done')
