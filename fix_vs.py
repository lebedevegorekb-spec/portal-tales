f = open('src/mechanics/VoteSaboteur/HostView.tsx', encoding='utf-8')
c = f.read()
f.close()
c = c.replace(
  '        <button onClick={() => setShowResult(true)}',
  '        <button onClick={() => { setShowResult(true); if (onAdvance) onAdvance(); }}'
)
c = c.replace(
  """        {onAdvance && (
          <button onClick={onAdvance}
            className="bg-portal text-portal-foreground px-10 py-4 rounded-lg font-display text-xl">
            Далее →
          </button>
        )}
      </div>
    );
  }

  return (""",
  """      </div>
    );
  }

  return ("""
)
open('src/mechanics/VoteSaboteur/HostView.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
