p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'    if (uiPhase === "playing" && (phase === "chars_reveal" || phase === "result_screen")) {\n      setPhase("playing");\n    }',
'    console.log("ui_phase effect", {uiPhase, phase});\n    if (uiPhase === "playing" && (phase === "chars_reveal" || phase === "result_screen")) {\n      setPhase("playing");\n    }'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
