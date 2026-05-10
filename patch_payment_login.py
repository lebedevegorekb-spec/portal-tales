with open('src/pages/Payment.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '{!user && <p className="text-xs text-destructive">Войди в аккаунт чтобы купить</p>}',
    '{!user && <a href="/login" className="text-xs text-portal hover:underline">Войди в аккаунт чтобы купить →</a>}'
)

with open('src/pages/Payment.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
