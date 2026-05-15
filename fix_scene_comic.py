f = open('src/pages/Scene.tsx', encoding='utf-8')
c = f.read()
f.close()
old = 'import { BackgroundImage } from "@/components/BackgroundImage";'
new = 'import { BackgroundImage } from "@/components/BackgroundImage";\nimport { ComicFrameView } from "@/components/ComicFrameView";'
c = c.replace(old, new)

old = 'type ScenePhase = "loading" | "intro" | "playing" | "result_replicas" | "result_screen";'
new = 'type ScenePhase = "loading" | "comic_intro" | "intro" | "playing" | "result_replicas" | "result_screen";'
c = c.replace(old, new)

old = '  const [introReplicasShown, setIntroReplicasShown] = useState(false);'
new = '  const [introReplicasShown, setIntroReplicasShown] = useState(false);\n  const [comicFrameIndex, setComicFrameIndex] = useState(0);\n  const [comicReplicasDone, setComicReplicasDone] = useState(false);\n  const [comicFlipping, setComicFlipping] = useState(false);'
c = c.replace(old, new)

old = '    if (isHost && uiPhase === "intro" && partyConfig?.intro?.situation) {\n      setPhase("intro");'
new = '    if (isHost && uiPhase === "comic_intro" && partyConfig?.intro?.comic_frames?.length) {\n      setPhase("comic_intro");\n    } else if (isHost && uiPhase === "intro" && partyConfig?.intro?.situation) {\n      setPhase("intro");'
c = c.replace(old, new)

open('src/pages/Scene.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done scene imports')
