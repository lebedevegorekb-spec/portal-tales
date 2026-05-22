p='src/pages/Waiting.tsx'
c=open(p,encoding='utf-8').read()

# Убрать дублирующиеся стейты
c=c.replace(
'  const [showIntroWaiting, setShowIntroWaiting] = useState(false);\n  const [currentRunId, setCurrentRunId] = useState<string|null>(null);\n  const [showIntroWaiting, setShowIntroWaiting] = useState(false);\n  const [currentRunId, setCurrentRunId] = useState<string|null>(null);',
'  const [showIntroWaiting, setShowIntroWaiting] = useState(false);\n  const [currentRunId, setCurrentRunId] = useState<string|null>(null);'
)

# Убрать дублирующийся showIntroWaiting блок в JSX
old_dup = '  if (showIntroWaiting) {\n    return (\n      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">\n        <Loader2 className="w-10 h-10 animate-spin text-portal" />\n        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Смотрим вступление...</p>\n      </div>\n    );\n  }\n\n  if (showIntroWaiting) {\n    return (\n      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">\n        <Loader2 className="w-10 h-10 animate-spin text-portal" />\n        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Смотрим вступление...</p>\n      </div>\n    );\n  }'
new_dup = '  if (showIntroWaiting) {\n    return (\n      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">\n        <Loader2 className="w-10 h-10 animate-spin text-portal" />\n        <p className="text-muted-foreground font-mono text-sm uppercase tracking-widest">Смотрим вступление...</p>\n      </div>\n    );\n  }'
c=c.replace(old_dup, new_dup)

open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
