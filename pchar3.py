p='src/pages/Character.tsx'
c=open(p,encoding='utf-8').read()
lines = c.split('\n')
new_lines = [l for l in lines if 'setReplicaText' not in l and 'setReplicaAudio' not in l and 'replicaAudio' not in l and 'character_reveal_host_line' not in l]
open(p,'w',encoding='utf-8',newline='\n').write('\n'.join(new_lines))
print('ok')
