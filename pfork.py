p='src/mechanics/Fork/HostView.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'  useEffect(() => {\n    if (!allVoted || !onAdvance) return;\n    const t = setTimeout(() => onAdvance(), 2000);\n    return () => clearTimeout(t);\n  }, [allVoted]);\n',
'  const allVoted = totalVotes >= playerCount;\n  useEffect(() => {\n    if (!allVoted || !onAdvance) return;\n    const t = setTimeout(() => onAdvance(), 2000);\n    return () => clearTimeout(t);\n  }, [allVoted]);\n'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
