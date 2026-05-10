with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '  intro: { host_line: string; morty_line: string; situation: string };',
    '  intro: { host_line: string; host_line_audio?: string; morty_line: string; morty_line_audio?: string; situation: string; background_image?: string; background_music?: string; [key: string]: any };'
)

content = content.replace(
    '    team_wins: { host_line: string; morty_line: string };',
    '    team_wins: { host_line: string; morty_line: string; host_line_audio?: string; morty_line_audio?: string; background_image?: string; [key: string]: any };'
)
content = content.replace(
    '    saboteur_wins: { host_line: string; morty_line: string };',
    '    saboteur_wins: { host_line: string; morty_line: string; host_line_audio?: string; morty_line_audio?: string; background_image?: string; [key: string]: any };'
)
content = content.replace(
    '    team_found_but_lost: { host_line: string; morty_line: string };',
    '    team_found_but_lost: { host_line: string; morty_line: string; host_line_audio?: string; morty_line_audio?: string; background_image?: string; [key: string]: any };'
)
content = content.replace(
    '    team_won_but_missed: { host_line: string; morty_line: string };',
    '    team_won_but_missed: { host_line: string; morty_line: string; host_line_audio?: string; morty_line_audio?: string; background_image?: string; [key: string]: any };'
)

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
