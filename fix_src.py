import os, re

def fix_file(path):
    c = open(path, encoding='utf-8').read()
    original = c
    bt = chr(96)
    
    # src={'/...'} -> src={${...}/...}
    def fix_src(m):
        inner = m.group(1)
        return 'src={' + bt + inner + bt + '}'
    c = re.sub(r"src=\{'([^']*\$\{[^']*)'\}", fix_src, c)
    
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
