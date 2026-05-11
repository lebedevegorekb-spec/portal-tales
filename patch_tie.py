with open('src/mechanics/types.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'export interface VoteSaboteurRound extends RoundBase {\n  mechanic: "vote_saboteur";\n}',
    '''export interface VoteSaboteurRound extends RoundBase {
  mechanic: "vote_saboteur";
  tie_host?: string;
  tie_morty?: string;
  tie_host_audio?: string;
  tie_morty_audio?: string;
}'''
)

with open('src/mechanics/types.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done types')
