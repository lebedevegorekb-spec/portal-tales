path = "C:/Users/lebed/portal-tales/src/pages/Final.tsx"
c = open(path, encoding="utf-8").read()
old = '''              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Новые сценарии, обновления и анонсы — первыми в канале.</p>
                href="https://t.me/portal_quest"'''
new = '''              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Новые сценарии, обновления и анонсы — первыми в канале.</p>
              
                href="https://t.me/portal_quest"'''
assert old in c, "NOT FOUND"
c = c.replace(old, new)
open(path, "w", encoding="utf-8", newline="\n").write(c)
print("done")
