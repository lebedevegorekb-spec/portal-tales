f = open('src/mechanics/Fork/HostView.tsx', encoding='utf-8')
c = f.read()
f.close()
# найдём блок showResult и заменим на пустой возврат
old = '  if (showResult && jokeOpt) {'
new = '  if (showResult) { return null; }\n  if (false && jokeOpt) {'
c = c.replace(old, new)
f = open('src/mechanics/Fork/HostView.tsx', 'w', encoding='utf-8', newline='\n')
f.write(c)
f.close()
print('done')
