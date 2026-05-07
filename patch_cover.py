with open('src/pages/admin/ScenarioEdit.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Добавить импорт MediaUpload если ещё не добавлен
if 'MediaUpload' not in content:
    content = content.replace(
        'import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";',
        'import { Loader2, Save, ChevronDown, ChevronUp } from "lucide-react";\nimport { MediaUpload } from "@/components/MediaUpload";'
    )

# Добавить cover_image в тип PreviewJson
content = content.replace(
    '  age_rating?: string;\n};',
    '  age_rating?: string;\n  cover_image?: string;\n};'
)

# Добавить загрузку обложки в таб превью перед закрывающим тегом
old = '''            <div className="flex items-center gap-3">
              <input type="checkbox" id="replayable" checked={preview.replayable ?? false}
                onChange={(e) => setPreview({...preview, replayable: e.target.checked})}
                className="w-4 h-4 accent-portal" />
              <label htmlFor="replayable" className="text-sm text-muted-foreground">Переигрываемый</label>
            </div>
          </div>
        )}'''

new = '''            <div className="flex items-center gap-3">
              <input type="checkbox" id="replayable" checked={preview.replayable ?? false}
                onChange={(e) => setPreview({...preview, replayable: e.target.checked})}
                className="w-4 h-4 accent-portal" />
              <label htmlFor="replayable" className="text-sm text-muted-foreground">Переигрываемый</label>
            </div>
            <div className="grid gap-2">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Обложка сценария</p>
              <p className="text-xs text-muted-foreground">Используется в карточке каталога и на странице превью</p>
              <MediaUpload
                scenarioId={scenarioId!}
                path="cover"
                type="image"
                currentUrl={preview.cover_image}
                onUploaded={(p) => setPreview({...preview, cover_image: p})}
                onRemoved={() => setPreview({...preview, cover_image: ""})}
              />
            </div>
          </div>
        )}'''

content = content.replace(old, new)

with open('src/pages/admin/ScenarioEdit.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done, length:', len(content))
