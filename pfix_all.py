p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()

# Фикс 1: правильное чтение result из response
c=c.replace(
'      const result = await advance(runId, roomId);\n      if (isHost) {\n        const won = result?.team_scored;\n        const isTie = result?.is_tie ?? false;\n        const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];\n        if (result?.is_joke) {\n          const jo = result.joke_option;',
'      const advanceRes = await advance(runId, roomId);\n      const result = advanceRes?.result;\n      if (isHost) {\n        const won = result?.team_scored;\n        const isTie = result?.is_tie ?? false;\n        const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];\n        if (result?.is_joke) {\n          const jo = result.joke_option;'
)

# Фикс 2: isJoke в result_screen
c=c.replace(
'    const isTie = lastResult?.is_tie;\n    const teamWon = lastResult?.team_scored && !isTie;\n    const resultBg = isTie\n      ? (currentRound as any)?.result_tie_image\n      : teamWon\n      ? (currentRound as any)?.result_success_image\n      : (currentRound as any)?.result_fail_image || currentRound?.background_image;\n    const accentColor = isTie ? "#facc15" : teamWon ? "hsl(var(--portal))" : "hsl(var(--destructive))";\n    const glowColor = isTie ? "rgba(250,204,21,0.25)" : teamWon ? "rgba(0,255,128,0.2)" : "rgba(255,60,60,0.2)";\n    const resultLabel = isTie ? "Ничья!" : teamWon ? "Команда побеждает!" : "Саботажник побеждает!";\n    const resultEmoji = isTie ? "⚡" : teamWon ? "✶" : "☠";',
'    const isTie = lastResult?.is_tie;\n    const isJoke = (lastResult as any)?.is_joke;\n    const teamWon = lastResult?.team_scored && !isTie && !isJoke;\n    const resultBg = isJoke\n      ? (currentRound as any)?.result_joke_image || currentRound?.background_image\n      : isTie\n      ? (currentRound as any)?.result_tie_image\n      : teamWon\n      ? (currentRound as any)?.result_success_image\n      : (currentRound as any)?.result_fail_image || currentRound?.background_image;\n    const accentColor = isJoke ? "#f97316" : isTie ? "#facc15" : teamWon ? "hsl(var(--portal))" : "hsl(var(--destructive))";\n    const glowColor = isJoke ? "rgba(249,115,22,0.25)" : isTie ? "rgba(250,204,21,0.25)" : teamWon ? "rgba(0,255,128,0.2)" : "rgba(255,60,60,0.2)";\n    const resultLabel = isJoke ? "Ha-ha! Joke time!" : isTie ? "Ничья!" : teamWon ? "Команда побеждает!" : "Саботажник побеждает!";\n    const resultEmoji = isJoke ? "XD" : isTie ? "⚡" : teamWon ? "✶" : "☠";'
)

open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
