p='src/components/ComicFrameView.tsx'
c=open(p,encoding='utf-8').read()
c=c.replace(
'      {isHost && (replicasDone || queue.length === 0) && onNext && (\n        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">\n          <button onClick={onNext} className="bg-portal text-portal-foreground px-12 py-4 rounded-lg font-display text-xl animate-in fade-in duration-500">\n            {frameIndex < totalFrames - 1 ? "Далее →" : "Начать игру →"}\n          </button>\n        </div>\n      )}',
''
)
open(p,'w',encoding='utf-8',newline='\n').write(c)
print('ok')
