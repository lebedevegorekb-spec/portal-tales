f = open('src/utils/roundCalc.ts', encoding='utf-8')
c = f.read()
f.close()
import re
c = re.sub(r'id:\s+est-+,', 'id: "test-" + Math.random().toString(36).slice(2),', c)
open('src/utils/roundCalc.ts', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
