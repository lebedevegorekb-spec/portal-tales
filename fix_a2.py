path = "C:/Users/lebed/portal-tales/src/pages/Final.tsx"
c = open(path, encoding="utf-8").read()
old = '                href="https://t.me/portal_quest"'
new = '              <a\n                href="https://t.me/portal_quest"'
print("found:", old in c)
c = c.replace(old, new)
open(path, "w", encoding="utf-8", newline="\n").write(c)
print("done")
