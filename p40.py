import os, glob
files = glob.glob('src/mechanics/**/*.tsx', recursive=True) + glob.glob('src/mechanics/**/*.ts', recursive=True)
count = 0
for f in files:
    c = open(f, encoding='utf-8').read()
    if 'bg-background' in c:
        new = c.replace('min-h-screen bg-background', 'min-h-screen')
        open(f, 'w', encoding='utf-8', newline='\n').write(new)
        count += 1
        print('patched:', f)
print('total:', count)
