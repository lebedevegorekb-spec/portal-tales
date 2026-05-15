import os, re

def fix_file(path):
    c = open(path, encoding='utf-8').read()
    original = c
    bt = chr(96)
    
    # Find patterns like {...} without closing backtick - add closing backtick
    # Pattern: ={...dollar-stuff...} where no closing backtick before }
    def fix_unclosed(m):
        inner = m.group(1)
        # count backticks - if odd, add closing one
        if inner.count(bt) % 2 == 1:
            return '={' + inner + bt + '}'
        return m.group(0)
    c = re.sub(r'=\{(' + bt + '[^}]+)\}', fix_unclosed, c)
    
    if c != original:
        open(path, 'w', encoding='utf-8', newline='\n').write(c)
        return True
    return False

files = []
for root, dirs, fs in os.walk('src'):
    dirs[:] = [d for d in dirs if d != 'ui']
    for f in fs:
        if f.endswith('.tsx') or f.endswith('.ts'):
            files.append(os.path.join(root, f))

fixed = []
for path in files:
    try:
        if fix_file(path): fixed.append(path)
    except: pass

print('Fixed:', len(fixed))
for f in fixed: print(f)
