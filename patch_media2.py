with open('src/components/MediaUpload.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Изменить storagePath чтобы использовал оригинальное имя файла
old = '''  const ext = type === "audio" ? "mp3" : "jpg";
  const storagePath = `${scenarioId}/${path}.${ext}`;'''

new = '''  const [storagePath, setStoragePath] = useState<string>(`${scenarioId}/${path}`);'''

content = content.replace(old, new)

# Обновить handleUpload чтобы использовал реальное имя файла
old2 = '''  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const { error: uploadError } = await supabase.storage
        .from("scenario-media")
        .upload(storagePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      setLocalUrl(storagePath);
      onUploaded(storagePath);'''

new2 = '''  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError(null);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const fullPath = `${scenarioId}/${path}/${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("scenario-media")
        .upload(fullPath, file, { upsert: true });
      if (uploadError) throw uploadError;
      setStoragePath(fullPath);
      setLocalUrl(fullPath);
      onUploaded(fullPath);'''

content = content.replace(old2, new2)

with open('src/components/MediaUpload.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
