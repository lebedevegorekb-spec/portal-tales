with open('src/mechanics/types.ts', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''export interface ForkOption {
  id: string;
  label: string;
  is_correct: boolean;
}'''

new = '''export interface ForkOption {
  id: string;
  label: string;
  is_correct: boolean;
  is_joke?: boolean;
  joke_host_line?: string;
  joke_morty_line?: string;
}'''

if old in content:
    content = content.replace(old, new)
    print('types.ts replaced ok')
else:
    print('NOT FOUND in types.ts')

with open('src/mechanics/types.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
