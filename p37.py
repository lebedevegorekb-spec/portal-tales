p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
# chars_reveal phase
c=c.replace(
'      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6">\n          <BackgroundImage imagePath={partyConfig?.intro?.background_image} />',
'      <div className="min-h-screen text-foreground flex flex-col items-center justify-center gap-6">\n          <BackgroundImage imagePath={partyConfig?.intro?.background_image} />'
)
# result_replicas phase
c=c.replace(
'      <div className="min-h-screen bg-background text-foreground relative flex flex-col items-center justify-center gap-6">\n          <BackgroundImage imagePath={currentRound?.background_image} />',
'      <div className="min-h-screen text-foreground relative flex flex-col items-center justify-center gap-6">\n          <BackgroundImage imagePath={currentRound?.background_image} />'
)
# result_screen phase
c=c.replace(
'      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-6 p-8">\n          <BackgroundImage imagePath={currentRound?.background_image} />',
'      <div className="min-h-screen text-foreground flex flex-col items-center justify-center gap-6 p-8">\n          <BackgroundImage imagePath={currentRound?.background_image} />'
)
# main playing phase
c=c.replace(
'    <div className="min-h-screen bg-background text-foreground relative">',
'    <div className="min-h-screen text-foreground relative">'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
