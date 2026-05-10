with open('vite.config.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Добавить sourcemap в build
content = content.replace(
    'export default defineConfig(({ mode }) => ({',
    'export default defineConfig(({ mode }) => ({\n  build: { sourcemap: true },'
)

with open('vite.config.ts', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
