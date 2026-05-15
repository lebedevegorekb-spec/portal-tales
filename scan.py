import os, re
files = []
for root, dirs, fs in os.walk('src'):
    dirs[:] = [d for d in dirs if d != 'ui']
    for f in fs:
        if f.endswith('.tsx') or f.endswith('.ts'):
            files.append(os.path.join(root, f))

errors = []
for path in files:
    c = open(path, encoding='utf-8').read()
    if re.search(r'return \$\{', c) or re.search(r'className=\{[^"\']', c):
        errors.append(path)

print('Broken files:')
for e in errors: print(e)
print('Total:', len(errors))
