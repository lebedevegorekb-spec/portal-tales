with open('src/components/MediaUpload.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''export function MediaUpload({ scenarioId, path, type, currentUrl, onUploaded, onRemoved }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);'''

new = '''export function MediaUpload({ scenarioId, path, type, currentUrl, onUploaded, onRemoved }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localUrl, setLocalUrl] = useState<string | undefined>(currentUrl);
  const inputRef = useRef<HTMLInputElement>(null);'''

content = content.replace(old, new)

# При успешной загрузке — обновить localUrl
old2 = '''      if (uploadError) throw uploadError;
      onUploaded(storagePath);'''

new2 = '''      if (uploadError) throw uploadError;
      setLocalUrl(storagePath);
      onUploaded(storagePath);'''

content = content.replace(old2, new2)

# При удалении — сбросить localUrl
old3 = '''  const handleRemove = async () => {
    await supabase.storage.from("scenario-media").remove([storagePath]);
    onRemoved();
  };'''

new3 = '''  const handleRemove = async () => {
    await supabase.storage.from("scenario-media").remove([storagePath]);
    setLocalUrl(undefined);
    onRemoved();
  };'''

content = content.replace(old3, new3)

# Использовать localUrl вместо currentUrl в рендере
content = content.replace(
    '      {currentUrl ? (',
    '      {localUrl ? ('
)

with open('src/components/MediaUpload.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
