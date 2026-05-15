f = open('src/pages/admin/RoundTest.tsx', encoding='utf-8')
c = f.read()
f.close()
c = c.replace(
    'className={glass-card p-6 max-w-md w-full text-center border }',
    'className={glass-card p-6 max-w-md w-full text-center border }'
)
