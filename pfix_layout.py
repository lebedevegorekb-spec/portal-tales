p = "src/pages/admin/RoundTest.tsx"
c = open(p, encoding="utf-8").read()

old = '''          {/* Основная зона */}
          <div className="flex-1 relative overflow-auto">
            <BackgroundImage imagePath={
              result?.is_tie ? (currentRound as any)?.result_tie_image :
              (result as any)?.is_joke ? (currentRound as any)?.result_joke_image :
              result?.team_scored ? (currentRound as any)?.result_success_image :
              result ? (currentRound as any)?.result_fail_image :
              currentRound.background_image
            } />
            {currentReplica && <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />}

            {/* Экран результата */}
            {(phase === "result_replicas" || phase === "result_screen") && result && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 p-8 z-10">'''

new = '''          {/* Основная зона */}
          <div className="flex-1 relative overflow-auto flex flex-col">
            <BackgroundImage imagePath={
              result?.is_tie ? (currentRound as any)?.result_tie_image :
              (result as any)?.is_joke ? (currentRound as any)?.result_joke_image :
              result?.team_scored ? (currentRound as any)?.result_success_image :
              result ? (currentRound as any)?.result_fail_image :
              currentRound.background_image
            } />
            {currentReplica && <ReplicaPlayer speaker={currentReplica.speaker} text={currentReplica.text} audioPath={currentReplica.audioPath} onFinished={onReplicaFinished} />}

            {/* Экран результата */}
            {(phase === "result_replicas" || phase === "result_screen") && result && (
              <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8 z-10 relative">'''

if old in c:
    c = c.replace(old, new)
    print("layout ok")
else:
    print("NOT FOUND")

open(p, "w", encoding="utf-8", newline="\n").write(c)
