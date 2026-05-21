import glob, re
files = glob.glob('src/mechanics/**/HostView.tsx', recursive=True)
for f in files:
    c = open(f, encoding='utf-8').read()
    # Добавить backdrop-blur к glass-card если нет
    c = c.replace(
        'className="min-h-screen text-foreground relative z-10 scanlines flex flex-col items-center justify-center p-8"',
        'className="min-h-screen text-foreground relative z-10 flex flex-col items-center justify-center p-8"'
    )
    c = c.replace(
        'className="min-h-screen text-foreground relative z-10 scanlines flex flex-col items-center justify-center px-4 py-8"',
        'className="min-h-screen text-foreground relative z-10 flex flex-col items-center justify-center px-4 py-8"'
    )
    open(f, 'w', encoding='utf-8', newline='\n').write(c)
    print('ok:', f)
