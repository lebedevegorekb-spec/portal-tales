with open('src/pages/Catalog.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Добавить state для isAdmin
old = '  const [busy, setBusy] = useState<string | null>(null);'
new = '  const [busy, setBusy] = useState<string | null>(null);\n  const [isAdmin, setIsAdmin] = useState(false);'
content = content.replace(old, new)

# Загрузить роль после загрузки entitlements
old2 = '    if (!user) return;\n    supabase\n      .from("entitlements")'
new2 = '''    if (!user) return;
    supabase.from("profiles").select("role").eq("user_id", user.id).single()
      .then(({ data }) => { if (data?.role === "admin") setIsAdmin(true); });
    supabase
      .from("entitlements")'''
content = content.replace(old2, new2)

# Добавить функцию startTest
old3 = '  const startRun = async (id: string) => {'
new3 = '''  const startTest = async (id: string) => {
    if (!user) return;
    setBusy(id + "_test");
    const { data, error } = await supabase.functions.invoke("room-create", {
      body: {
        scenario_id: id,
        host_user_id: user.id,
        host_name: "ТЕСТ",
        min_players: 1,
      },
    });
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Ошибка");
      setBusy(null);
      return;
    }
    const roomId = data.room.id;
    const { data: startData, error: startError } = await supabase.functions.invoke("party-start", {
      body: { room_id: roomId },
    });
    setBusy(null);
    if (startError || startData?.error) {
      toast.error(startData?.error || startError?.message || "Ошибка старта");
      return;
    }
    window.location.href = `/scene/${startData.run_id}`;
  };

  const startRun = async (id: string) => {'''
content = content.replace(old3, new3)

# Добавить кнопку Тест рядом с кнопкой Создать комнату
old4 = '''                      ) : (
                        <Link to={`/payment/${s.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            <Lock className="h-4 w-4" />
                            Купить за ₽{s.price_rub}
                          </Button>
                        </Link>
                      )}'''
new4 = '''                      ) : (
                        <Link to={`/payment/${s.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            <Lock className="h-4 w-4" />
                            Купить за ₽{s.price_rub}
                          </Button>
                        </Link>
                      )}
                      {isAdmin && (
                        <Button variant="outline" size="sm"
                          onClick={() => startTest(s.id)}
                          disabled={busy === s.id + "_test"}
                          className="w-full border-yellow-500/40 text-yellow-500 hover:bg-yellow-500/10 mt-1">
                          {busy === s.id + "_test" ? "..." : "⚡ Тест (1 игрок)"}
                        </Button>
                      )}'''
content = content.replace(old4, new4)

with open('src/pages/Catalog.tsx', 'w', encoding='utf-8', newline='\n') as f:
    f.write(content)
print('done')
