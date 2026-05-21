import glob
files = glob.glob('src/mechanics/**/*.tsx', recursive=True)
count = 0
for f in files:
    c = open(f, encoding='utf-8').read()
    if 'min-h-screen text-foreground' in c:
        new = c.replace('min-h-screen text-foreground', 'min-h-screen text-foreground relative z-10')
        open(f, 'w', encoding='utf-8', newline='\n').write(new)
        count += 1
        print('patched:', f)
print('total:', count)
