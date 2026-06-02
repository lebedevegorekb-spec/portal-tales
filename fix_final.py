path = "C:/Users/lebed/portal-tales/src/pages/Final.tsx"
c = open(path, encoding="utf-8").read()

old = '''          <section className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/catalog">
              <Button size="lg" className="bg-portal hover:bg-portal/90 text-primary-foreground font-display font-bold gap-2">
                <RotateCcw className="h-4 w-4" /> Сыграть ещё
              </Button>
            </Link>
            <Link to="/catalog">
              <Button size="lg" variant="outline" className="border-acid/50 text-acid hover:bg-acid/10 font-display font-bold gap-2">
                <ShoppingCart className="h-4 w-4" /> Купить следующий сценарий
              </Button>
            </Link>
          </section>'''

new = '''          <section className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link to="/catalog">
              <Button size="lg" className="bg-portal hover:bg-portal/90 text-primary-foreground font-display font-bold gap-2">
                <RotateCcw className="h-4 w-4" /> Сыграть ещё
              </Button>
            </Link>
            <Link to="/catalog">
              <Button size="lg" variant="outline" className="border-acid/50 text-acid hover:bg-acid/10 font-display font-bold gap-2">
                <ShoppingCart className="h-4 w-4" /> Купить следующий сценарий
              </Button>
            </Link>
          </section>

          {/* TG subscribe banner */}
          <section className="mt-8 glass-card rounded-xl p-8 text-center border border-portal/30 relative overflow-hidden">
            <div className="absolute inset-0 portal-orb opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <p className="text-xs font-mono uppercase tracking-widest text-portal/70 mb-2">Не пропусти новые сценарии</p>
              <h2 className="text-3xl font-display font-bold mb-3">Подпишись на Telegram</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Новые сценарии, обновления и анонсы — первыми в канале.</p>
              
                href="https://t.me/portal_quest"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-portal hover:bg-portal/90 text-primary-foreground px-8 py-3 rounded-lg font-display text-lg shadow-[var(--shadow-portal)] transition-all hover:scale-105"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 6.473-1.68 7.922c-.127.566-.459.703-.93.438l-2.573-1.895-1.242 1.195c-.137.137-.252.252-.518.252l.186-2.621 4.777-4.313c.207-.184-.045-.287-.322-.103L8.34 14.027l-2.527-.789c-.549-.172-.561-.549.115-.813l9.875-3.807c.458-.166.859.103.711.812l-.584-.957z"/></svg>
                @portal_quest
              </a>
            </div>
          </section>'''

assert old in c, "PATTERN NOT FOUND"
c = c.replace(old, new)
open(path, "w", encoding="utf-8", newline="\n").write(c)
print("final done")
