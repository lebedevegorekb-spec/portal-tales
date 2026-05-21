import re

path = "src/pages/admin/ScenarioEdit.tsx"
with open(path, encoding="utf-8") as f:
    c = f.read()

c = c.replace(
    '  const [partyGame, setPartyGame] = useState<PartyGame | null>(null);',
    '  const [partyGame, setPartyGame] = useState<PartyGame | null>(null);\n  const [characters, setCharacters] = useState<any[]>([]);'
)
c = c.replace(
    '      if (data.scenario_json?.party_game) setPartyGame(data.scenario_json.party_game as PartyGame);',
    '      if (data.scenario_json?.party_game) setPartyGame(data.scenario_json.party_game as PartyGame);\n      setCharacters(data.scenario_json?.characters ?? []);'
)
c = c.replace(
    '    const newJson = { ...scenarioJson, ...(partyGame ? { party_game: partyGame } : {}) };',
    '    const newJson = { ...scenarioJson, ...(partyGame ? { party_game: partyGame } : {}), characters };'
)
c = c.replace(
    '  const [tab, setTab] = useState<"basic"|"intro"|"rounds"|"endings">("basic");',
    '  const [tab, setTab] = useState<"basic"|"intro"|"roles"|"rounds"|"endings">("basic");'
)
c = c.replace(
    '[["basic","\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0435"],["intro","\u043f\u0440\u0430\u0432\u0438\u043b\u044c\u043d\u044b\u0439"],["rounds","\u0420\u0430\u0443\u043d\u0434\u044b ("+String(partyGame?.rounds?.length ?? 0)+")"],["endings","\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0435"]]',
    '[["basic","\u041e\u0441\u043d\u043e\u0432\u043d\u043e\u0435"],["intro","\u0412\u0441\u0442\u0443\u043f\u043b\u0435\u043d\u0438\u0435"],["roles","\u041f\u0435\u0440\u0441\u043e\u043d\u0430\u0436\u0438"],["rounds","\u0420\u0430\u0443\u043d\u0434\u044b ("+String(partyGame?.rounds?.length ?? 0)+")"],["endings","\u041a\u043e\u043d\u0446\u043e\u0432\u043a\u0438"]]'
)

with open(path, "w", encoding="utf-8", newline="\n") as f:
    f.write(c)
print("done")
