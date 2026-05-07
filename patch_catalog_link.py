with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Заголовок карточки делаем кликабельным
old = '                  <h3 className="font-display font-semibold text-lg leading-tight">{s.title}</h3>'
new = '                  <Link to={`/scenarios/${s.id}`} className="hover:text-portal transition-colors">\n                    <h3 className="font-display font-semibold text-lg leading-tight">{s.title}</h3>\n                  </Link>'
content = content.replace(old, new)

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
