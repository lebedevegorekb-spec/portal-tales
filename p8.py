p='src/components/ComicFrameView.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'  const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];\n  if (frame.host_line) queue.push({ speaker: "host", text: frame.host_line, audioPath: frame.host_line_audio });\n  if (frame.morty_line) queue.push({ speaker: "morty", text: frame.morty_line, audioPath: frame.morty_line_audio });',
'  const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];\n  if (frame.host_line || frame.host_line_audio) queue.push({ speaker: "host", text: frame.host_line ?? "", audioPath: frame.host_line_audio });\n  if (frame.morty_line || frame.morty_line_audio) queue.push({ speaker: "morty", text: frame.morty_line ?? "", audioPath: frame.morty_line_audio });'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
