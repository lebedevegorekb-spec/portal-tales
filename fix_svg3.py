path = "C:/Users/lebed/portal-tales/src/pages/Final.tsx"
c = open(path, encoding="utf-8").read()

old = '<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.93 6.473-1.68 7.922c-.127.566-.459.703-.93.438l-2.573-1.895-1.242 1.195c-.137.137-.252.252-.518.252l.186-2.621 4.777-4.313c.207-.184-.045-.287-.322-.103L8.34 14.027l-2.527-.789c-.549-.172-.561-.549.115-.813l9.875-3.807c.458-.166.859.103.711.812l-.584-.957z"/></svg>'

new = '<Send className="h-5 w-5" />'

if old in c:
    c = c.replace(old, new)
    print("replaced")
else:
    print("NOT FOUND, searching...")
    idx = c.find('<svg className="h-5 w-5"')
    print(repr(c[idx:idx+300]))
open(path, "w", encoding="utf-8", newline="\n").write(c)
