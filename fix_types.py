f = open('src/mechanics/types.ts', encoding='utf-8')
c = f.read()
f.close()
old = 'export interface PartyGameConfig {'
new = '''export interface ComicFrame {
  id: string;
  caption?: string;
  image?: string;
  host_line?: string;
  host_line_audio?: string;
  morty_line?: string;
  morty_line_audio?: string;
}

export interface PartyGameConfig {'''
c = c.replace(old, new)
open('src/mechanics/types.ts', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
