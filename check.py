content = open('src/pages/admin/RoundTest.tsx', encoding='utf-8').read()
print(repr(content[content.find('glass-card p-6'):content.find('glass-card p-6')+50]))
