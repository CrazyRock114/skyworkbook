/* Games hub: memory match, beat-the-clock, TF blitz, sequence challenge, diagram quiz */
window.Games = (function(){
  const { el, esc, shuffle, mcqPool, S, save, recordAnswer } = App;
  let timerId = null;

  function render(root){
    stopTimer();
    root.appendChild(el(`<div>
      <h2 class="sect">🎮 趣味游戏</h2>
      <div class="grid g3">
        <div class="game-tile" data-g="memory"><div class="ico">🃏</div><div class="nm">记忆翻牌 Memory Match</div><div class="ds">翻开两张牌，把术语和它的"搭档"配对。共 ${App.CURATED.MEMORY_SETS.length} 套主题牌组。</div></div>
        <div class="game-tile" data-g="btc"><div class="ico">⚡</div><div class="nm">极速60秒 Beat the Clock</div><div class="ds">60 秒内尽可能多地答对选择题，连对有加分！个人最佳：${S.best.btc||0} 分</div></div>
        <div class="game-tile" data-g="tfblitz"><div class="ico">🌗</div><div class="nm">判断快闪 True/False Blitz</div><div class="ds">12 条陈述快速判断对错，答后立刻看解析。</div></div>
        <div class="game-tile" data-g="sequence"><div class="ico">🧩</div><div class="nm">排序挑战 Sequence</div><div class="ds">把生理过程按正确顺序排列（消化路径、凝血、心跳、月经周期……）。</div></div>
        <div class="game-tile" data-g="diagram"><div class="ico">🖼️</div><div class="nm">看图答题 Diagram Quiz</div><div class="ds">真实教材插图：心脏、肺泡、肾单位、月经轮盘……看图选出正确结构。</div></div>
      </div>
    </div>`));
    root.querySelectorAll("[data-g]").forEach(t=>t.onclick=()=>open(t.dataset.g));
  }
  function open(g){ Games[g](App.$("#app")); }
  function stopTimer(){ if(timerId){ clearInterval(timerId); timerId=null; } }

  /* ============ 1. Memory match ============ */
  function memory(root, setIdx){
    stopTimer(); root.innerHTML="";
    const sets = App.CURATED.MEMORY_SETS;
    if(setIdx==null){
      root.appendChild(el(`<div><a class="back-link" href="#games">← 游戏大厅</a>
        <h2 class="sect">🃏 记忆翻牌 · 选择牌组</h2>
        <div class="grid g3">${sets.map((s,i)=>`<div class="game-tile" data-i="${i}">
          <div class="ico">${s.emoji}</div><div class="nm">${esc(s.name)}</div>
          <div class="ds">${s.pairs.length} 对 · 个人最佳：${S.best["mem_"+s.id]?App.fmtTime(S.best["mem_"+s.id]):"—"}</div></div>`).join("")}</div></div>`));
      root.querySelectorAll("[data-i]").forEach(t=>t.onclick=()=>memory(root, Number(t.dataset.i)));
      return;
    }
    const set = sets[setIdx];
    const cards = shuffle(set.pairs.flatMap((p,i)=>[{pid:i,txt:p[0]},{pid:i,txt:p[1]}]));
    let opened=[], matched=0, moves=0, t0=Date.now();
    root.appendChild(el(`<div><a class="back-link" href="#games" onclick="stopT()">← 游戏大厅</a>
      <div class="spread"><h2 class="sect" style="margin:0">${set.emoji} ${esc(set.name)}</h2>
      <div><span class="pill" id="mMoves">步数 0</span> <span class="pill gold" id="mTime">0:00</span></div></div>
      <div class="mem-grid mt8" id="grid"></div>
      <div class="tap-hint">点击两张牌，配对成功会变绿。全部配对即获胜！</div></div>`));
    window.stopT = stopTimer;
    const grid = root.querySelector("#grid");
    cards.forEach((c,ix)=>{
      const d = el(`<div class="mem-card" data-ix="${ix}"><div class="mem-inner">
        <div class="mem-face mem-front">🧬</div><div class="mem-face mem-back">${esc(c.txt)}</div></div></div>`);
      grid.appendChild(d);
      d.onclick = ()=>{
        if(opened.length >= 2) return; // 疫苗-2: 已翻开两张时忽略第三张，防状态卡死
        if(d.classList.contains("open")||d.classList.contains("done")) return;
        d.classList.add("open"); opened.push({d,c});
        if(opened.length===2){
          moves++; root.querySelector("#mMoves").textContent="步数 "+moves;
          const [a,b]=opened;
          if(a.c.pid===b.c.pid){
            a.d.classList.add("done"); b.d.classList.add("done");
            matched++; opened=[];
            if(matched===set.pairs.length){
              const sec = Math.round((Date.now()-t0)/1000);
              if(!S.best["mem_"+set.id] || sec < S.best["mem_"+set.id]) S.best["mem_"+set.id]=sec;
              S.gamesPlayed.memory=1; App.addXp(15); save();
              setTimeout(()=>{ root.appendChild(el(`<div class="card center mt" style="max-width:420px;margin:16px auto">
                <h2>🎉 配对完成！</h2><p>用时 <b>${App.fmtTime(sec)}</b> · 步数 ${moves}</p>
                <div class="row" style="justify-content:center"><button class="btn" onclick="Games.memory(document.getElementById('app'),${setIdx})">再玩一次</button>
                <button class="btn ghost" onclick="location.hash='#games'">游戏大厅</button></div></div>`)); }, 500);
            }
          } else {
            setTimeout(()=>{ a.d.classList.remove("open"); b.d.classList.remove("open"); opened=[]; }, 750);
          }
        }
      };
    });
    timerId = setInterval(()=>{ const tEl=root.querySelector("#mTime"); if(tEl) tEl.textContent=App.fmtTime(Math.round((Date.now()-t0)/1000)); }, 500);
  }

  /* ============ 2. Beat the clock ============ */
  function btc(root){
    stopTimer(); root.innerHTML="";
    let score=0, streak=0, left=60, q=null, locked=false;
    const pool = shuffle(mcqPool);
    let qi=0;
    root.appendChild(el(`<div><a class="back-link" href="#games" onclick="stopT()">← 游戏大厅</a>
      <div class="spread"><h2 class="sect" style="margin:0">⚡ 极速60秒</h2>
      <div class="row"><span class="streak" id="streak"></span><span class="pill gold">得分 <b id="score">0</b></span><span class="timer" id="clock">60</span></div></div>
      <div class="card mt8" id="qbox"><div class="center muted">准备开始…</div></div>
      <p class="small muted mt8">答对 +1 分；连对 3 题起每题额外 +1；答错扣 2 秒。个人最佳：${S.best.btc||0} 分</p></div>`));
    window.stopT = stopTimer;
    const qbox = root.querySelector("#qbox");

    function nextQ(){
      locked=false;
      if(qi>=pool.length) pool.push(...shuffle(mcqPool));
      q = pool[qi++];
      const letters="ABCDEFG";
      qbox.innerHTML = `<div class="kp">${esc((App.lessonByKey[q.part+"-"+q.lesson]||{}).zh||"")}</div>
        <div class="qtext mt8">${esc(q.question_en||"")}</div>
        <div class="qzh">${esc(q.question_zh||"")}</div>
        <div id="opts"></div>`;
      const od = qbox.querySelector("#opts");
      q.options.forEach((o,ix)=>{
        const b = el(`<button class="opt"><b>${letters[ix]}.</b> ${esc(o)}</button>`);
        b.onclick = ()=>{
          if(locked) return; locked=true;
          const ok = letters[ix]===q.correct;
          od.querySelectorAll(".opt").forEach((bb,jx)=>{
            bb.disabled=true;
            if(letters[jx]===q.correct) bb.classList.add("correct");
            else if(letters[jx]===letters[ix]&&!ok) bb.classList.add("wrong");
          });
          recordAnswer(q.id, ok);
          if(ok){ streak++; score += 1 + (streak>=3?1:0);
            if(streak>(S.best.btcStreak||0)){ S.best.btcStreak=streak; }
          } else { streak=0; left=Math.max(0,left-2); }
          root.querySelector("#score").textContent=score;
          root.querySelector("#streak").textContent = streak>=3? `🔥 ${streak} 连对！`:"";
          setTimeout(nextQ, ok?350:900);
        };
        od.appendChild(b);
      });
    }
    if (window.G8_TEST) window.G8_TEST.btcFinish = finish; // _test 钩子：直达终局状态
    nextQ();
    timerId = setInterval(()=>{
      left--; const c=root.querySelector("#clock"); if(c) c.textContent=left;
      if(left<=0) finish();
    }, 1000);
    function finish(){
      stopTimer();
      S.gamesPlayed.btc=1;
      if(score>(S.best.btc||0)) S.best.btc=score;
      App.addXp(score); save();
      qbox.innerHTML = `<div class="center"><div style="font-size:40px">⏰</div>
        <h2 class="big">时间到！得分 ${score}</h2>
        <p class="muted">个人最佳：${S.best.btc} 分 · ⭐ 获得 ${score} XP</p>
        <div class="row mt8" style="justify-content:center">
        <button class="btn" onclick="Games.btc(document.getElementById('app'))">再来一局</button>
        <button class="btn ghost" onclick="location.hash='#games'">游戏大厅</button></div></div>`;
    }
  }

  /* ============ 3. TF blitz ============ */
  function tfblitz(root){
    stopTimer(); root.innerHTML="";
    const picks = shuffle(App.CURATED.TF.map((t,ix)=>({t,ix}))).slice(0,12);
    let idx=0, score=0;
    root.appendChild(el(`<div><a class="back-link" href="#games">← 游戏大厅</a>
      <div class="spread"><h2 class="sect" style="margin:0">🌗 判断快闪</h2><span class="pill gold">✅ <b id="s">0</b>/12</span></div>
      <div class="card mt8" id="box"></div></div>`));
    const box = root.querySelector("#box");
    function show(){
      if(idx>=picks.length){
        S.gamesPlayed.tfblitz=1; App.addXp(score); save();
        box.innerHTML = `<div class="center"><div style="font-size:40px">${score>=10?"🏆":score>=7?"👍":"📖"}</div>
          <h2 class="big">${score} / 12</h2>
          <div class="row mt8" style="justify-content:center">
          <button class="btn" onclick="Games.tfblitz(document.getElementById('app'))">再来一轮</button>
          <button class="btn ghost" onclick="location.hash='#games'">游戏大厅</button></div></div>`;
        return;
      }
      const {t,ix} = picks[idx];
      box.innerHTML = `<div class="kp">第 ${idx+1} / 12 条</div>
        <div class="qtext mt8">${esc(t.s)}</div>
        <div class="row mt8"><button class="btn ok" id="bt">✔ True 对</button>
        <button class="btn bad" id="bf">✘ False 错</button></div><div id="fb"></div>`;
      const answer = v=>{
        const ok = v===t.a;
        recordAnswer("TF:"+ix, ok);
        if(ok){ score++; root.querySelector("#s").textContent=score; }
        box.querySelector("#bt").disabled = box.querySelector("#bf").disabled = true;
        box.querySelector("#fb").appendChild(el(`<div class="fb ${ok?"ok":"bad"}">
          <b>${ok?"✅ 正确！":"❌ 错啦～"}</b> 答案是 ${t.a?"True":"False"}。${esc(t.why)}</div>`));
        setTimeout(()=>{ idx++; show(); }, ok?900:1900);
      };
      box.querySelector("#bt").onclick = ()=>answer(true);
      box.querySelector("#bf").onclick = ()=>answer(false);
    }
    show();
  }

  /* ============ 4. Sequence challenge ============ */
  function sequence(root, seqIdx){
    stopTimer(); root.innerHTML="";
    const seqs = App.CURATED.SEQUENCES;
    if(seqIdx==null){
      root.appendChild(el(`<div><a class="back-link" href="#games">← 游戏大厅</a>
        <h2 class="sect">🧩 排序挑战 · 选择一个过程</h2>
        <div class="grid g3">${seqs.map((s,i)=>`<div class="game-tile" data-i="${i}">
          <div class="nm">${esc(s.name)}</div><div class="ds">${s.items.length} 个环节 · 出处：${esc(s.source)}</div></div>`).join("")}</div></div>`));
      root.querySelectorAll("[data-i]").forEach(t=>t.onclick=()=>sequence(root, Number(t.dataset.i)));
      return;
    }
    const seq = seqs[seqIdx];
    const pool = shuffle(seq.items.map((t,i)=>({t,i})));
    let placed = [];
    root.appendChild(el(`<div><a class="back-link" href="#games">← 游戏大厅</a>
      <div class="spread"><h2 class="sect" style="margin:0">🧩 ${esc(seq.name)}</h2><span class="pill">出处：${esc(seq.source)}</span></div>
      <p class="small muted">按先后顺序依次点击下方卡片（点错可点击答案区的卡片撤回）。</p>
      <div class="seq-answer mt8" id="ansRow"></div>
      <div class="seq-pool mt8" id="pool"></div>
      <div class="row mt8"><button class="btn" id="check">检查顺序</button><span id="seqFb"></span></div></div>`));
    const poolEl = root.querySelector("#pool"), ansEl = root.querySelector("#ansRow");
    function paint(){
      poolEl.innerHTML=""; ansEl.innerHTML="";
      pool.filter(x=>!placed.includes(x)).forEach(x=>{
        const c = el(`<div class="chip">${esc(x.t)}</div>`);
        c.onclick = ()=>{ placed.push(x); paint(); };
        poolEl.appendChild(c);
      });
      placed.forEach((x,i)=>{
        const c = el(`<div class="chip placed"><span class="seq-num">${i+1}</span>${esc(x.t)}</div>`);
        c.onclick = ()=>{ placed = placed.filter(y=>y!==x); paint(); };
        ansEl.appendChild(c);
      });
    }
    paint();
    root.querySelector("#check").onclick = ()=>{
      if(placed.length!==seq.items.length){ alert(`已放置 ${placed.length}/${seq.items.length} 张卡片`); return; }
      S.gamesPlayed.sequence=1;
      let allOk = true;
      ansEl.querySelectorAll(".chip").forEach((c,i)=>{
        const ok = placed[i].i===i;
        c.classList.add(ok?"pos-ok":"pos-bad");
        if(!ok) allOk=false;
      });
      const fb = root.querySelector("#seqFb");
      if(allOk){
        App.addXp(12); save();
        fb.innerHTML = `<span class="pill ok">🎉 完全正确！+12 XP</span>
          <button class="btn sm mt8" onclick="Games.sequence(document.getElementById('app'),${seqIdx})">再来</button>
          <button class="btn sm ghost mt8" onclick="location.hash='#games'">大厅</button>`;
      } else {
        fb.innerHTML = `<span class="pill bad">还有标红的卡片位置不对，调整后再检查</span>`;
        setTimeout(paint, 1500);
      }
    };
  }

  /* ============ 5. Diagram quiz ============ */
  function diagram(root, picks, idx, score){
    stopTimer();
    if(!picks){ picks = shuffle(App.CURATED.DIAGRAM_QUIZ.map((d,i)=>({d,i}))).slice(0,6); idx=0; score=0; }
    root.innerHTML="";
    if(idx>=picks.length){
      S.gamesPlayed.diagram=1; App.addXp(score*2); save();
      root.appendChild(el(`<div><a class="back-link" href="#games">← 游戏大厅</a>
        <div class="card center" style="max-width:520px;margin:20px auto">
        <div style="font-size:40px">${score>=5?"🖼️🎉":"📖"}</div>
        <h2 class="big">${score} / ${picks.length}</h2>
        <div class="row mt8" style="justify-content:center">
        <button class="btn" onclick="Games.diagram(document.getElementById('app'))">再来一轮</button>
        <button class="btn ghost" onclick="location.hash='#games'">游戏大厅</button></div></div></div>`));
      return;
    }
    const q = picks[idx].d;
    const letters = "ABCD";
    root.appendChild(el(`<div><a class="back-link" href="#games">← 游戏大厅</a>
      <div class="spread"><h2 class="sect" style="margin:0">🖼️ 看图答题</h2>
      <span class="pill">第 ${idx+1} / ${picks.length} 题</span><span class="pill gold">✅ ${score}</span></div>
      <div class="imgbox mt8"><img src="${q.img}" alt="diagram"></div>
      <div class="card mt8"><div class="qtext">${esc(q.q_en)}</div>
      <div id="opts"></div><div id="fbArea"></div></div></div>`));
    const od = root.querySelector("#opts");
    q.opts.forEach((o,ix)=>{
      const b = el(`<button class="opt"><b>${letters[ix]}.</b> ${esc(o)}</button>`);
      b.onclick = ()=>{
        const ok = ix===q.correct;
        od.querySelectorAll(".opt").forEach((bb,jx)=>{
          bb.disabled=true;
          if(jx===q.correct) bb.classList.add("correct");
          else if(jx===ix&&!ok) bb.classList.add("wrong");
        });
        App.recordAnswer("DIAG:"+picks[idx].i, ok);
        if(ok) score++;
        root.querySelectorAll(".pill.gold b").forEach(x=>x.textContent=score);
        const fb = el(`<div class="fb ${ok?"ok":"bad"}"><b>${ok?"✅ 答对了！":"❌ 再想想～"}</b>
          <div>${esc(q.why)}</div><div class="src">📖 出处：${esc(q.src)}</div></div>`);
        root.querySelector("#fbArea").appendChild(fb);
        setTimeout(()=>diagram(root, picks, idx+1, score), ok?1100:2200);
      };
      od.appendChild(b);
    });
  }

  return { render, open, memory, btc, tfblitz, sequence, diagram };
})();
