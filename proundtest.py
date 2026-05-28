p='src/pages/admin/RoundTest.tsx'
c=open(p,encoding='utf-8').read()

# Фикс 1: joke_vote симуляция сломана — исправить и добавить авто-advance
old='''  const handleAutoSubmit = (scenario: "team_wins" | "saboteur_wins" | "tie") => {
    if (!currentRound) return;
    const newSubs: RoundSubmission[] = [];
    const mech = currentRound.mechanic;
    if (mech === "fork") {
      const correct = (currentRound as any).options?.find((o: any) => o.is_correct);
      const joke = (currentRound as any).options?.find((o: any) => o.is_joke);
      const wrong = (currentRound as any).options?.find((o: any) => !o.is_correct && !o.is_joke);
      const optId = scenario === "team_wins" ? correct?.id : scenario === "tie" ? joke?.id : wrong?.id;
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { option_id: optId })));
    } else if (mech === "joke_vote") {
      const answers = players.map(p => makeSubmission(p.id, currentRound.id, mech, { answer: "joke-" + p.id }));
      if (scenario === "saboteur_wins") {
        const sabAnswer = answers.find(a => a.player_id === saboteurId)!;
        players.filter(p => p.id !== saboteurId).forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { vote_for_submission_id: sabAnswer.id })));
      } else {
        const nonSab = answers.filter(a => a.player_id !== saboteurId);
        newSubs.push(...answers, makeSubmission("player-1", currentRound.id, mech, { vote_for_submission_id: nonSab[0].id }));
      }
      newSubs.push(...answers);
    } else if (mech === "vote_saboteur") {
      if (scenario === "team_wins") players.filter(p => p.id !== saboteurId).forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { accused_player_id: saboteurId })));
      else players.filter(p => p.id !== saboteurId).forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { accused_player_id: "player-1" })));
    } else {
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { answer: "auto" })));
    }
    setSubmissions(newSubs);
  };'''

new='''  const handleAutoSubmit = (scenario: "team_wins" | "saboteur_wins" | "tie") => {
    if (!currentRound) return;
    const newSubs: RoundSubmission[] = [];
    const mech = currentRound.mechanic;
    if (mech === "fork") {
      const correct = (currentRound as any).options?.find((o: any) => o.is_correct);
      const joke = (currentRound as any).options?.find((o: any) => o.is_joke);
      const wrong = (currentRound as any).options?.find((o: any) => !o.is_correct && !o.is_joke);
      const optId = scenario === "team_wins" ? correct?.id : scenario === "tie" ? joke?.id : wrong?.id;
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { option_id: optId })));
    } else if (mech === "joke_vote") {
      const answers = players.map(p => makeSubmission(p.id, currentRound.id, mech, { answer: "joke-" + p.id }));
      newSubs.push(...answers);
      const sabAnswer = answers.find(a => a.player_id === saboteurId)!;
      const nonSabAnswers = answers.filter(a => a.player_id !== saboteurId);
      if (scenario === "saboteur_wins") {
        players.filter(p => p.id !== saboteurId).forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { vote_for_submission_id: sabAnswer.id })));
        newSubs.push(makeSubmission(saboteurId, currentRound.id, mech, { vote_for_submission_id: sabAnswer.id }));
      } else if (scenario === "tie") {
        newSubs.push(makeSubmission(players[0].id, currentRound.id, mech, { vote_for_submission_id: nonSabAnswers[0].id }));
        newSubs.push(makeSubmission(players[1].id, currentRound.id, mech, { vote_for_submission_id: nonSabAnswers[1]?.id ?? nonSabAnswers[0].id }));
        newSubs.push(makeSubmission(saboteurId, currentRound.id, mech, { vote_for_submission_id: sabAnswer.id }));
      } else {
        players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { vote_for_submission_id: nonSabAnswers[0].id })));
      }
    } else if (mech === "vote_saboteur") {
      if (scenario === "team_wins") players.filter(p => p.id !== saboteurId).forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { accused_player_id: saboteurId })));
      else players.filter(p => p.id !== saboteurId).forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { accused_player_id: players.find(x => x.id !== saboteurId)?.id })));
    } else if (mech === "quiz" || mech === "blitz") {
      const questions = (currentRound as any).questions ?? [];
      players.forEach(p => {
        const answers: Record<string,string> = {};
        questions.forEach((q: any) => { answers[q.id] = scenario === "team_wins" ? q.correct_id : "wrong"; });
        newSubs.push(makeSubmission(p.id, currentRound.id, mech, { answers }));
      });
    } else if (mech === "guess_author") {
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { completion: "test answer from " + p.id })));
      players.forEach(p => {
        const guesses: Record<string,string> = {};
        players.filter(x => x.id !== p.id).forEach(x => { guesses[x.id] = scenario === "team_wins" ? saboteurId : x.id; });
        newSubs.push(makeSubmission(p.id, currentRound.id, mech, { guesses }));
      });
    } else if (mech === "pitch") {
      players.forEach((p, i) => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { my_option_index: i })));
      const sabIdx = players.findIndex(p => p.id === saboteurId);
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { vote_for_option_index: scenario === "saboteur_wins" ? sabIdx : (sabIdx === 0 ? 1 : 0) })));
    } else {
      players.forEach(p => newSubs.push(makeSubmission(p.id, currentRound.id, mech, { answer: "auto" })));
    }
    setSubmissions(newSubs);
    // Авто-advance через 500мс
    setTimeout(() => {
      const res = calcRoundResult(currentRound, newSubs, saboteurId, players.length);
      setResult(res);
      setScores(prev => ({ team: prev.team + res.team_points, saboteur: prev.saboteur + res.saboteur_points }));
      const queue: Array<{speaker:"host"|"morty";text:string;audioPath?:string}> = [];
      if (res.is_joke && (currentRound as any).joke_option) {
        const jo = (currentRound as any).joke_option;
        if (jo?.joke_host_line) queue.push({ speaker: "host", text: jo.joke_host_line, audioPath: jo.joke_host_audio });
        if (jo?.joke_morty_line) queue.push({ speaker: "morty", text: jo.joke_morty_line, audioPath: jo.joke_morty_audio });
      } else if (res.is_tie && (currentRound as any).tie_host) {
        queue.push({ speaker: "host", text: (currentRound as any).tie_host, audioPath: (currentRound as any).tie_host_audio });
        if ((currentRound as any).tie_morty) queue.push({ speaker: "morty", text: (currentRound as any).tie_morty, audioPath: (currentRound as any).tie_morty_audio });
      } else if (res.team_scored) {
        if (currentRound.success_host) queue.push({ speaker: "host", text: currentRound.success_host, audioPath: currentRound.success_host_audio });
        if (currentRound.success_morty) queue.push({ speaker: "morty", text: currentRound.success_morty, audioPath: currentRound.success_morty_audio });
      } else {
        if (currentRound.fail_host) queue.push({ speaker: "host", text: currentRound.fail_host, audioPath: currentRound.fail_host_audio });
        if (currentRound.fail_morty) queue.push({ speaker: "morty", text: currentRound.fail_morty, audioPath: currentRound.fail_morty_audio });
      }
      startReplicas(queue);
      setPhase(queue.length > 0 ? "result_replicas" : "result_screen");
    }, 300);
  };'''

if old in c:
    c=c.replace(old,new)
    print("ok")
else:
    print("NOT FOUND")
    idx=c.find('const handleAutoSubmit')
    print(repr(c[idx:idx+100]))

open(p,'w',encoding='utf-8',newline='\n').write(c)
