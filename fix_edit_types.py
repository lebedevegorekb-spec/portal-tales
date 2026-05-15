f = open('src/pages/admin/ScenarioEdit.tsx', encoding='utf-8')
c = f.read()
f.close()

old = 'import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";'
new = 'import { Loader2, Save, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";'
c = c.replace(old, new)

old = "type PartyGame = {\n  intro: { host_line: string; morty_line: string; situation: string };"
new = """type ComicFrame = { id: string; caption?: string; image?: string; host_line?: string; host_line_audio?: string; morty_line?: string; morty_line_audio?: string; };
type PartyGame = {
  intro: { host_line: string; morty_line: string; situation: string; comic_frames?: ComicFrame[] };"""
c = c.replace(old, new)

open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done types')
