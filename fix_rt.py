f = open('src/pages/admin/RoundTest.tsx', encoding='utf-8')
c = f.read()
f.close()
c = c.replace(
  '{ answer: \u0428\u0443\u0442\u043a\u0430 \u043e\u0442  }',
  '{ answer: "joke-" + p.id }'
)
c = c.replace(
  '{ completion: \u043e\u0442\u0432\u0435\u0442 \u043e\u0442  }',
  '{ completion: "answer-" + p.id }'
)
open('src/pages/admin/RoundTest.tsx', 'w', encoding='utf-8', newline='\n').write(c)
print('done')
