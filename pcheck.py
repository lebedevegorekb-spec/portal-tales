import glob
files = glob.glob('src/mechanics/**/HostView.tsx', recursive=True)
count = 0
for f in files:
    c = open(f, encoding='utf-8').read()
    # Оборачиваем основной контент в glass-card
    if 'glass-card' not in c and 'font-display' in c:
        c = c.replace(
            'className="min-h-screen text-foreground relative z-10',
            'className="min-h-screen text-foreground relative z-10'
        )
        print('skip (already ok or no match):', f)
        continue
    print('check:', f)
open('check.txt','w').write('\n'.join(files))
print('files:', len(files))
