with open('src/components/MediaUpload.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# publicUrl должен использовать актуальный storagePath
old = '''  const publicUrl = `${baseUrl}/storage/v1/object/public/scenario-media/${storagePath}`;'''
new = '''  const publicUrl = `${baseUrl}/storage/v1/object/public/scenario-media/${localUrl ?? storagePath}`;'''

if old in content:
    content = content.replace(old, new)
    print('replaced ok')
else:
    print('NOT FOUND')
    idx = content.find('publicUrl')
    print(repr(content[idx-50:idx+150]))

with open('src/components/MediaUpload.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
