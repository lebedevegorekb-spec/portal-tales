import os, re

files = []
for root, dirs, fs in os.walk('src'):
    dirs[:] = [d for d in dirs if d != 'ui']
    for f in fs:
        if f.endswith('.tsx') or f.endswith('.ts'):
            files.append(os.path.join(root, f))

for path in files:
    try:
        c = open(path, encoding='utf-8').read()
        # find unterminated backtick template
        bt = chr(96)
        count = c.count(bt)
        if count % 2 != 0:
            print('ODD BACKTICKS:', path, count)
    except: pass
