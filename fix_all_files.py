import os, re

def fix_file(path):
    c = open(path, encoding='utf-8').read()
    original = c
    bt = chr(96)
    d = chr(36)
    
    # Fix: return /path/ -> return ${VAR}/path/
    def fix_return_template(m):
        inner = m.group(1)
        return 'return ' + bt + inner + bt + ';'
    c = re.sub(r'return (\$\{[^\n;]+);', fix_return_template, c)
    
    # Fix: className={expr without backtick/quote
    # Pattern: className={...} missing closing backtick
    # Find template literals missing closing backtick
    def fix_classname(m):
        inner = m.group(1)
        if inner.count(bt) % 2 == 1:
            return 'className={' + inner + bt + '}'
        return m.group(0)
    c = re.sub(r'className=\{(' + bt + '[^}]+)\}', fix_classname, c)
    
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
    if fix_file(path):
        fixed.append(path)

print('Fixed:', len(fixed))
for f in fixed: print(f)
