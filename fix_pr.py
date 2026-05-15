f = open('src/pages/PersonalResult.tsx', encoding='utf-8')
c = f.read()
f.close()
bt = chr(96)
# Find single-quoted template literals and fix them
import re
# Fix: = 'text ' -> = 	ext 
def fix_single_quoted_templates(m):
    return '= ' + bt + m.group(1) + bt + ';'
c = re.sub(r"= '([^']*\$\{[^']*)';", fix_single_quoted_templates, c)
open('src/pages/PersonalResult.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
