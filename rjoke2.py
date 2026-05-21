p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    const resultBg = isTie\n      ? (currentRound as any)?.result_tie_image\n      : teamWon\n      ? (currentRound as any)?.result_success_image\n      : (currentRound as any)?.result_fail_image || currentRound?.background_image;',
'    const isJoke = (lastResult as any)?.is_joke;\n    const resultBg = isJoke\n      ? (currentRound as any)?.result_joke_image || currentRound?.background_image\n      : isTie\n      ? (currentRound as any)?.result_tie_image\n      : teamWon\n      ? (currentRound as any)?.result_success_image\n      : (currentRound as any)?.result_fail_image || currentRound?.background_image;'
)
c=c.replace(
'    const accentColor = isTie ? "#facc15" : teamWon ? "hsl(var(--portal))" : "hsl(var(--destructive))";',
'    const accentColor = isJoke ? "#f97316" : isTie ? "#facc15" : teamWon ? "hsl(var(--portal))" : "hsl(var(--destructive))";'
)
c=c.replace(
'    const glowColor = isTie ? "rgba(250,204,21,0.25)" : teamWon ? "rgba(0,255,128,0.2)" : "rgba(255,60,60,0.2)";',
'    const glowColor = isJoke ? "rgba(249,115,22,0.25)" : isTie ? "rgba(250,204,21,0.25)" : teamWon ? "rgba(0,255,128,0.2)" : "rgba(255,60,60,0.2)";'
)
# resultLabel and emoji without surrogate emoji
c=c.replace(
'    const resultLabel = isTie',
'    const resultLabel = isJoke ? "Ha-ha! Joke time!" : isTie'
)
c=c.replace(
'    const resultEmoji = isTie',
'    const resultEmoji = isJoke ? "XD" : isTie'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
