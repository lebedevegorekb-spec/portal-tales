p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'      <BackgroundImage imagePath={currentRound?.background_image} />\n      <MediaPlayer musicPath={currentRound?.background_music} />',
'      {isHost && <BackgroundImage imagePath={currentRound?.background_image} />}\n      <MediaPlayer musicPath={currentRound?.background_music} />'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
