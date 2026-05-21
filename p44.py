p='src/pages/Scene.tsx'
c=open(p,encoding='utf-8').read()
# Заменяем оставшиеся два (не трогаем уже пофикшенный)
count = 0
while '        <BackgroundImage imagePath={currentRound?.background_image} />' in c and count < 2:
    c = c.replace(
        '        <BackgroundImage imagePath={currentRound?.background_image} />',
        '        {isHost && <BackgroundImage imagePath={currentRound?.background_image} />}',
        1
    )
    count += 1
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok, replaced:', count)
