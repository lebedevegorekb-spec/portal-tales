import sys

path = "C:/Users/lebed/portal-tales/src/pages/Index.tsx"
c = open(path, encoding="utf-8").read()

# Fix email
c = c.replace('href="mailto:hi@portal-quest.app"', 'href="mailto:lebedevegor.ekb@mail.ru"')
c = c.replace('<Mail className="h-4 w-4" /> hi@portal-quest.app', '<Mail className="h-4 w-4" /> lebedevegor.ekb@mail.ru')

# Fix socials
c = c.replace(
  '<a\n                href="#"\n                aria-label="Telegram"\n                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-portal/30 text-muted-foreground hover:text-portal hover:border-portal/60 transition-colors"\n              >\n                <Send className="h-4 w-4" />\n              </a>\n              <a\n                href="#"\n                aria-label="Discord"\n                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-portal/30 text-muted-foreground hover:text-portal hover:border-portal/60 transition-colors"\n              >\n                <MessageCircle className="h-4 w-4" />\n              </a>',
  '<a\n                href="https://t.me/portal_quest"\n                target="_blank" rel="noopener noreferrer"\n                aria-label="Telegram"\n                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-portal/30 text-muted-foreground hover:text-portal hover:border-portal/60 transition-colors"\n              >\n                <Send className="h-4 w-4" />\n              </a>\n              <a\n                href="https://www.instagram.com/easy_fitness_bot?utm_source=qr"\n                target="_blank" rel="noopener noreferrer"\n                aria-label="Instagram"\n                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-portal/30 text-muted-foreground hover:text-portal hover:border-portal/60 transition-colors"\n              >\n                <MessageCircle className="h-4 w-4" />\n              </a>'
)

open(path, "w", encoding="utf-8", newline="\n").write(c)
print("index done:", "lebedevegor.ekb@mail.ru" in c, "t.me/portal_quest" in c)
