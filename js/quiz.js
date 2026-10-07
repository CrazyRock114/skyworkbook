/* Quiz mode: MCQ / True-False / numeric cloze, with feedback, sources and XP */
window.Quiz = (function(){
  const { el, esc, mcqPool, items, byId, lessons, S, save, recordAnswer } = App;

  let session = null; // {queue:[], idx, score, cfg}

  function render(root){
    root.appendChild(el(`<div>
      <h2 class="sect">✍️ 闯关练习</h2>
      <div class="card">
        <div class="grid g2">
          <div><label class="f">教材范围 Scope</label>
            <select id="cfgPart"><option value="all">全部 All</option><option value="autumn">Autumn 秋季</option><option value="part2">Part 2 生理二册</option></select></div>
          <div><label class="f">课程 Lesson</label>
            <select id="cfgLesson"><option value="all">全部课程</option></select></div>
        </div>
        <label class="f">题型 Types（可多选）</label>
        <div class="row">
          <label><input type="checkbox" id="tMcq" checked> 选择题 MCQ</label>
          <label><input type="checkbox" id="tTf"> 判断题 True/False</label>
          <label><input type="checkbox" id="tCloze"> 数字填空 Number Fill</label>
        </div>
        <div class="row mt8">
          <div><label class="f">题量 Count</label>
            <select id="cfgCount"><option>10</option><option>15</option><option>20</option><option value="99">不限</option></select></div>
          <div style="align-self:flex-end"><button class="btn" id="go">开始练习 →</button></div>
        </div>
        <p class="small muted mt8">共 ${mcqPool.length} 道选择题、${App.CURATED.TF.length} 道判断题、${App.CURATED.CLOZE.length} 道数字填空可抽。答题后立即显示答案与教材出处。<br>⚠️ 判断题与数字填空仅在“教材范围=全部”时抽取；按单课练习时只出选择题。</p>
      </div>
    </div>`));
    const partSel = root.querySelector("#cfgPart"), lesSel = root.querySelector("#cfgLesson");
    function fillLessons(){
      lesSel.innerHTML = `<option value="all">全部课程</option>` + lessons
        .filter(l=>partSel.value==="all"||l.part===partSel.value)
        .map(l=>`<option value="${l.part}-${l.no}">${l.no===33?"期末复习":"Lesson "+l.no} · ${esc(l.zh)}</option>`).join("");
    }
    partSel.onchange = fillLessons; fillLessons();
    root.querySelector("#go").onclick = ()=>{
      const types = [];
      if(root.querySelector("#tMcq").checked) types.push("mcq");
      if(root.querySelector("#tTf").checked) types.push("tf");
      if(root.querySelector("#tCloze").checked) types.push("cloze");
      if(!types.length){ alert("请至少选择一种题型"); return; }
      start({ partFilter:partSel.value, lessonKey:lesSel.value,
        count:Number(root.querySelector("#cfgCount").value), types, mode:"mixed" });
    };
  }

  function quick(part){ start({ partFilter:part, lessonKey:"all", count:10, types:["mcq"], mode:"mixed" }); }

  function buildQueue(cfg){
    const types = cfg.types || ["mcq"];
    let pool = [];
    if(types.includes("mcq")){
      pool = mcqPool.filter(i=>
        (cfg.partFilter==="all"||i.part===cfg.partFilter) &&
        (cfg.lessonKey==="all"||(i.part+"-"+i.lesson)===cfg.lessonKey));
      if(cfg.onlyIds) pool = pool.filter(i=>cfg.onlyIds.includes(i.id));
    }
    const q = pool.map(i=>({ kind:"mcq", i }));
    if(!cfg.onlyIds){
      if(types.includes("tf")){
        App.CURATED.TF.forEach((t,ix)=>{ if(partAllowedTf(cfg)) q.push({ kind:"tf", t, ix }); });
      }
      if(types.includes("cloze")){
        App.CURATED.CLOZE.forEach((c,ix)=>{ if(partAllowedCloze(cfg)) q.push({ kind:"cloze", c, ix }); });
      }
    }
    q.forEach(x=>x.ord=Math.random());
    q.sort((a,b)=>a.ord-b.ord);
    return cfg.count>=99 ? q : q.slice(0, Math.min(cfg.count, q.length));
  }
  function partAllowedTf(cfg){ return cfg.partFilter==="all"; } // TF 集覆盖两册
  function partAllowedCloze(cfg){ return cfg.partFilter==="all"; }

  function start(cfg){
    const queue = buildQueue(cfg);
    if(!queue.length){ alert("该筛选条件下没有可用题目，换一个范围试试"); return; }
    session = { cfg, queue, idx:0, score:0 };
    renderQ(App.$("#app"));
  }

  function renderQ(root){
    root.innerHTML = "";
    const q = session.queue[session.idx];
    const head = el(`<div>
      <div class="spread mt8">
        <span class="pill">第 ${session.idx+1} / ${session.queue.length} 题</span>
        <span class="pill gold">✅ ${session.score}</span>
      </div></div>`);
    root.appendChild(head);

    const box = el(`<div class="card mt8"></div>`);
    root.appendChild(box);

    const done = ()=>{
      session.idx++;
      if(session.idx >= session.queue.length) renderResult(root);
      else renderQ(root);
    };

    if(q.kind==="mcq"){
      const i = q.i;
      const lesson = App.lessonByKey[i.part+"-"+i.lesson];
      box.appendChild(el(`<div>
        <div class="kp">${esc(lesson?lesson.zh:"")}</div>
        <span class="kp" style="margin-left:4px">${esc(i.task||"")}</span> · ${esc(i.title_zh||i.title_en||"")}
        <div class="qtext mt8">${esc(i.question_en||"")}</div>
        <div class="qzh">${esc(i.question_zh||"")}</div>
        <div id="opts"></div><div id="fbArea"></div>
      </div>`));
      const optsDiv = box.querySelector("#opts");
      const letters = "ABCDEFG";
      i.options.forEach((opt,ix)=>{
        const b = el(`<button class="opt"><b>${letters[ix]}.</b> ${esc(opt)}</button>`);
        b.onclick = ()=>{
          const ok = letters[ix]===i.correct;
          optsDiv.querySelectorAll(".opt").forEach((bb,jx)=>{
            bb.disabled = true;
            if(letters[jx]===i.correct) bb.classList.add("correct");
            else if(letters[jx]===letters[ix] && !ok) bb.classList.add("wrong");
          });
          feedback(box, ok, i.answer_en, i.answer_zh, (i.source||[]).join("；"));
          recordAnswer(i.id, ok);
          if(ok) session.score++;
          setTimeout(done, ok?1100:2300);
        };
        optsDiv.appendChild(b);
      });
    }

    if(q.kind==="tf"){
      const t = q.t;
      box.appendChild(el(`<div>
        <div class="kp">判断题 True / False</div>
        <div class="qtext mt8">${esc(t.s)}</div>
        <div class="row mt8" id="tfbtns">
          <button class="btn ok" data-v="1">✔ 正确 True</button>
          <button class="btn bad" data-v="0">✘ 错误 False</button>
        </div><div id="fbArea"></div>
      </div>`));
      box.querySelectorAll("#tfbtns .btn").forEach(b=>{
        b.onclick = ()=>{
          const v = b.dataset.v==="1";
          const ok = v===t.a;
          box.querySelectorAll("#tfbtns .btn").forEach(bb=>bb.disabled=true);
          feedback(box, ok, `正确答案：${t.a?"True 正确":"False 错误"}。${t.why}`, "", "精选自教材知识点");
          recordAnswer("TF:"+q.ix, ok);
          if(ok) session.score++;
          setTimeout(done, ok?1100:2300);
        };
      });
    }

    if(q.kind==="cloze"){
      const c = q.c;
      box.appendChild(el(`<div>
        <div class="kp">数字填空 Number Fill</div>
        <div class="qtext mt8">${esc(c.q)}</div>
        <div class="row mt8">
          <input type="text" id="cIn" inputmode="decimal" placeholder="输入数字…" style="width:140px">
          ${c.unit?`<span class="muted">${esc(c.unit)}</span>`:""}
          <button class="btn" id="cGo">提交</button>
        </div><div id="fbArea"></div>
      </div>`));
      const inp = box.querySelector("#cIn");
      inp.focus();
      const submit = ()=>{
        const v = inp.value.trim().toLowerCase().replace(/\s/g,"");
        if(!v) return;
        const ok = c.a.map(x=>x.toLowerCase()).includes(v);
        inp.disabled = true; box.querySelector("#cGo").disabled = true;
        feedback(box, ok, `正确答案：${c.a[0]}${c.unit?" "+c.unit:""}`, "", "出处：" + c.src);
        recordAnswer("CLOZE:"+q.ix, ok);
        if(ok) session.score++;
        setTimeout(done, ok?1100:2300);
      };
      box.querySelector("#cGo").onclick = submit;
      inp.addEventListener("keydown", e=>{ if(e.key==="Enter") submit(); });
    }
  }

  function feedback(box, ok, ansEn, ansZh, src){
    const fb = el(`<div class="fb ${ok?"ok":"bad"}">
      <b>${ok?"✅ 答对了！":"❌ 再想想～"}</b>
      ${ansEn?`<div>${esc(ansEn)}</div>`:""}
      ${ansZh?`<div class="muted">${esc(ansZh)}</div>`:""}
      ${src?`<div class="src">📖 ${esc(src)}</div>`:""}
    </div>`);
    box.querySelector("#fbArea").appendChild(fb);
  }

  function renderResult(root){
    root.innerHTML = "";
    const n = session.queue.length, sc = session.score, pct = Math.round(100*sc/n);
    const wrongIds = [];
    // recompute wrong ids from this session by scanning state wrongs set during session is complex; simpler: track during session
    root.appendChild(el(`<div class="card center" style="max-width:520px;margin:30px auto">
      <div style="font-size:44px">${pct>=80?"🎉":pct>=60?"💪":"📖"}</div>
      <h2>${sc} / ${n} · ${pct}%</h2>
      <p class="muted">${pct>=80?"非常棒，继续保持！":pct>=60?"不错的开始，错题记得去错题本复习！":"多看看学习卡，再来一轮！"}</p>
      <div class="bar mt8"><i style="width:${pct}%"></i></div>
      <div class="row mt" style="justify-content:center">
        <button class="btn" id="again">再来一轮</button>
        <button class="btn ghost" id="home">回首页</button>
      </div>
    </div>`));
    root.querySelector("#again").onclick = ()=>start(session.cfg);
    root.querySelector("#home").onclick = ()=>location.hash="#home";
    App.save();
  }

  return { render, quick, start };
})();
