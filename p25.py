p='src/pages/admin/ScenarioEdit.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'          <div className="grid gap-1">\n            <p className="text-xs uppercase tracking-widest text-muted-foreground">Фоновое изображение раунда</p>\n            <MediaUpload scenarioId={round.id} path={"rounds/" + round.id + "/background"} type="image"\n              currentUrl={round.background_image}\n              onUploaded={(p) => updateField("background_image", p)}\n              onRemoved={() => updateField("background_image", "")} />\n          </div>',
'          <div className="grid gap-1">\n            <p className="text-xs uppercase tracking-widest text-muted-foreground">Фоновое изображение раунда</p>\n            <MediaUpload scenarioId={useScenarioId} path={"rounds/" + round.id + "/background"} type="image"\n              currentUrl={round.background_image}\n              onUploaded={(p) => updateField("background_image", p)}\n              onRemoved={() => updateField("background_image", "")} />\n          </div>'
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
