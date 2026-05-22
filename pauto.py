import glob, re

def add_auto_advance(filepath, all_done_var):
    c = open(filepath, encoding='utf-8').read()
    
    # Добавить useEffect импорт если нет
    if 'useEffect' not in c:
        c = c.replace('import {', 'import { useEffect, ', 1)
    
    # Добавить авто-advance после определения all_done переменной
    hook = f'''
  useEffect(() => {{
    if (!{all_done_var} || !onAdvance) return;
    const t = setTimeout(() => onAdvance(), 2000);
    return () => clearTimeout(t);
  }}, [{all_done_var}]);
'''
    # Вставить перед return
    c = c.replace('\n  return (', hook + '\n  return (', 1)
    return c

# JokeVote — два этапа, allVoted — финальный
p = 'src/mechanics/JokeVote/HostView.tsx'
c = open(p, encoding='utf-8').read()
if 'useEffect' not in c:
    c = c.replace('import {', 'import { useEffect, ', 1)
c = c.replace('import { useMemo }', 'import { useEffect, useMemo }')
hook = '''
  useEffect(() => {
    if (!allVoted || !onAdvance) return;
    const t = setTimeout(() => onAdvance(), 2000);
    return () => clearTimeout(t);
  }, [allVoted]);
'''
c = c.replace('\n  if (!allAnswered) {', hook + '\n  if (!allAnswered) {', 1)
# Убрать кнопку подвести итог
c = re.sub(r'\{onAdvance && \(\s*<button onClick=\{onAdvance\}[^}]+>\s*Подвести итог →\s*</button>\s*\)\}', '', c)
open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('JokeVote ok')

# Fork
p = 'src/mechanics/Fork/HostView.tsx'
c = open(p, encoding='utf-8').read()
if 'useEffect' not in c:
    c = c.replace('from "react"', 'from "react"')
    c = c.replace('import {', 'import { useEffect, ', 1)
# найдем allVoted переменную
hook = '''
  useEffect(() => {
    if (!allVoted || !onAdvance) return;
    const t = setTimeout(() => onAdvance(), 2000);
    return () => clearTimeout(t);
  }, [allVoted]);
'''
c = c.replace('\n  return (', hook + '\n  return (', 1)
c = re.sub(r'\{onAdvance && \([^)]*<button onClick=\{onAdvance\}[\s\S]*?</button>\s*\)\}', '', c)
open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('Fork ok')

# GuessAuthor
p = 'src/mechanics/GuessAuthor/HostView.tsx'
c = open(p, encoding='utf-8').read()
if 'useEffect' not in c:
    c = c.replace('import {', 'import { useEffect, ', 1)
hook = '''
  useEffect(() => {
    if (!allWrote || !onAdvance) return;
    const t = setTimeout(() => onAdvance(), 2000);
    return () => clearTimeout(t);
  }, [allWrote]);
'''
c = c.replace('\n  return (', hook + '\n  return (', 1)
c = re.sub(r'\{onAdvance && \(\s*<button[^>]*onClick=\{onAdvance\}[\s\S]*?</button>\s*\)\}', '', c)
open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('GuessAuthor ok')

# Blitz
p = 'src/mechanics/Blitz/HostView.tsx'
c = open(p, encoding='utf-8').read()
if 'useEffect' not in c:
    c = c.replace('import {', 'import { useEffect, ', 1)
hook = '''
  useEffect(() => {
    if (!allAnswered || !onAdvance) return;
    const t = setTimeout(() => onAdvance(), 2000);
    return () => clearTimeout(t);
  }, [allAnswered]);
'''
c = c.replace('\n  return (', hook + '\n  return (', 1)
c = re.sub(r'\{onAdvance && \(\s*[\s\S]*?Подвести итог[\s\S]*?\)\}', '', c)
open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('Blitz ok')

# Quiz
p = 'src/mechanics/Quiz/HostView.tsx'
c = open(p, encoding='utf-8').read()
if 'useEffect' not in c:
    c = c.replace('import {', 'import { useEffect, ', 1)
hook = '''
  useEffect(() => {
    if (!allAnswered || !onAdvance) return;
    const t = setTimeout(() => onAdvance(), 2000);
    return () => clearTimeout(t);
  }, [allAnswered]);
'''
c = c.replace('\n  return (', hook + '\n  return (', 1)
c = re.sub(r'\{onAdvance && \(\s*<button[\s\S]*?</button>\s*\)\}', '', c)
open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('Quiz ok')

# Pitch
p = 'src/mechanics/Pitch/HostView.tsx'
c = open(p, encoding='utf-8').read()
if 'useEffect' not in c:
    c = c.replace('import {', 'import { useEffect, ', 1)
hook = '''
  useEffect(() => {
    if (!allVoted || !onAdvance) return;
    const t = setTimeout(() => onAdvance(), 2000);
    return () => clearTimeout(t);
  }, [allVoted]);
'''
c = c.replace('\n  return (', hook + '\n  return (', 1)
c = re.sub(r'\{onAdvance && \(\s*<button[\s\S]*?</button>\s*\)\}', '', c)
open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('Pitch ok')

# VoteSaboteur
p = 'src/mechanics/VoteSaboteur/HostView.tsx'
c = open(p, encoding='utf-8').read()
if 'useEffect' not in c:
    c = c.replace('import {', 'import { useEffect, ', 1)
hook = '''
  useEffect(() => {
    if (!allVoted || !onAdvance) return;
    const t = setTimeout(() => onAdvance(), 2000);
    return () => clearTimeout(t);
  }, [allVoted]);
'''
c = c.replace('\n  return (', hook + '\n  return (', 1)
c = re.sub(r'\{onAdvance && \(\s*<button[\s\S]*?</button>\s*\)\}', '', c)
open(p, 'w', encoding='utf-8', newline='\n').write(c)
print('VoteSaboteur ok')

print('All done')
