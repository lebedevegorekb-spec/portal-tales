content = open("supabase/functions/round-advance/index.ts", encoding="utf-8").read()
content = content.replace(
    '  if (isTie) {\n    return { team_scored: false, saboteur_scored: false, team_points: 0, saboteur_points: 0, is_tie: true };\n  }',
    '  if (isTie) {\n    return { team_scored: true, saboteur_scored: true, team_points: 1, saboteur_points: 1, is_tie: true };\n  }'
)
open("supabase/functions/round-advance/index.ts", "w", encoding="utf-8", newline="\n").write(content)
print("ok")
