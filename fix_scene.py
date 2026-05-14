f = open('src/pages/Scene.tsx', encoding='utf-8')
c = f.read()
f.close()
old = '      if (isTie && (currentRound as any).tie_host) {'
new = '''      if (result?.is_joke) {
        const jo = result.joke_option;
        if (jo?.joke_host_line) queue.push({ speaker: "host", text: jo.joke_host_line, audioPath: jo.joke_host_audio });
        if (jo?.joke_morty_line) queue.push({ speaker: "morty", text: jo.joke_morty_line, audioPath: jo.joke_morty_audio });
      } else if (isTie && (currentRound as any).tie_host) {'''
c = c.replace(old, new)
f = open('src/pages/Scene.tsx', 'w', encoding='utf-8', newline='\n')
f.write(c)
f.close()
print('done')
