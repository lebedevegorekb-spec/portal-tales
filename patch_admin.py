import re

with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Добавить импорт MediaUpload после последнего импорта
old_import = 'import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";'
new_import = 'import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";\nimport { MediaUpload } from "@/components/MediaUpload";'
content = content.replace(old_import, new_import)

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done, length:', len(content))
