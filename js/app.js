/* App shell: state, bank index, router, home, badges */
window.App = (function(){
  const $ = sel => document.querySelector(sel);
  const el = (html) => { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; };
  const esc = s => String(s===undefined||s===null?"":s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

  const LS_KEY = "g8sci_v1";
  const defaultState = { xp:0, seen:{}, mastered:{}, wrong:{}, correctCount:0, answered:0, gamesPlayed:{}, best:{}, tfSeen:{} };
  let S = load();
  function load(){ try{ return Object.assign({}, defaultState, JSON.parse(localStorage.getItem(LS_KEY)||"{}")); }catch(e){ return {...defaultState}; } }
  function save(){ localStorage.setItem(LS_KEY, JSON.stringify(S)); paintXp(); }

  /* ---------- bank index ---------- */
  const PARTS = {
    autumn: { key:"autumn", name:"Autumn 秋季 · 消化与循环", range:"Lesson 1–18" },
    part2:  { key:"part2",  name:"Physiology Part 2 · 生理二册", range:"Lesson 19–32 + 复习题" }
  };
  const items = [];
  // part 归属 = 册书来源（规格），不依赖条目内的 part 数字字段（防御构建期字段漂移）
  BANK.autumn.items.forEach(i => items.push(Object.assign({}, i, { part: "autumn" })));
  BANK.part2.items.forEach(i => items.push(Object.assign({}, i, { part: "part2" })));
  const byId = {}; items.forEach(i => byId[i.id] = i);

  // lesson registry (ordered)
  const lessons = [];
  const seenLessons = new Set();
  items.forEach(i => {
    const key = i.part + "-" + i.lesson;
    if(!seenLessons.has(key)){
      seenLessons.add(key);
      lessons.push({ key, part:i.part, no:i.lesson, en:i.lesson_title_en, zh:i.lesson_title_zh });
    }
  });
  const lessonByKey = {}; lessons.forEach(l => lessonByKey[l.key] = l);

  const mcqPool = items.filter(i => i.type==="mcq" && Array.isArray(i.options) && i.options.length>=3 && !CURATED.DIAGRAM_ONLY_IDS.includes(i.id));

  /* ---------- XP / mastery ---------- */
  function addXp(n){ S.xp = Math.max(0, S.xp + n); save(); }
  function level(){ return Math.floor(S.xp/100)+1; }
  function markSeen(id){ if(!S.seen[id]){ S.seen[id]=1; } }
  function markMaster(id){ S.mastered[id]=1; delete S.wrong[id]; markSeen(id); addXp(5); }
  function recordAnswer(id, ok){
    S.answered++;
    if(ok){ S.correctCount++; delete S.wrong[id]; addXp(10); }
    else { S.wrong[id]=(S.wrong[id]||0)+1; addXp(2); }
    save();
  }
  function lessonStats(no, part){
    const its = items.filter(i => i.lesson===no && i.part===part);
    const m = its.filter(i => S.mastered[i.id]).length;
    return { total: its.length, mastered: m, pct: its.length? Math.round(m*100/its.length):0 };
  }
  function overallMastery(){
    const t = items.length, m = Object.keys(S.mastered).length;
    return { t, m, pct: Math.round(m*100/t) };
  }

  /* ---------- badges ---------- */
  const BADGES = [
    { id:"first", ico:"🌱", nm:"初次探索", test:s=>s.answered>=1, hint:"完成第1题" },
    { id:"ten", ico:"🔥", nm:"十连击", test:s=>(s.best.btcStreak||0)>=10 || (s._streakBest||0)>=10, hint:"极速答题连对10题" },
    { id:"hundred", ico:"🧠", nm:"百题斩", test:s=>s.correctCount>=100, hint:"累计答对100题" },
    { id:"gamer", ico:"🎮", nm:"游戏达人", test:s=>["memory","btc","tfblitz","sequence","diagram"].every(g=>s.gamesPlayed[g]), hint:"玩过全部5个游戏" },
    { id:"scholar", ico:"📚", nm:"学而时习", test:s=>Object.keys(s.mastered).length>=50, hint:"掌握50张学习卡" },
    { id:"ace", ico:"🏆", nm:"全科通关", test:s=>s.answered>=40 && s.correctCount/s.answered>=0.85, hint:"累计正确率≥85%（≥40题）" },
  ];
  function badgesWon(){ return BADGES.filter(b=>b.test(S)); }

  /* ---------- router ---------- */
  const routes = { home:renderHome, study:()=>Study.render($("#app")), quiz:()=>Quiz.render($("#app")), games:()=>Games.render($("#app")), library:()=>Library.render($("#app")), review:renderReview };
  function nav(){
    const h = (location.hash||"#home").slice(1).split("?")[0];
    const r = routes[h] ? h : "home";
    document.querySelectorAll("#tabs a").forEach(a=>a.classList.toggle("active", a.dataset.route===r));
    $("#app").innerHTML = "";
    routes[r]($("#app"));
    window.scrollTo(0,0);
  }
  function boot(){
    document.querySelectorAll("#tabs a").forEach(a=>a.addEventListener("click",()=>{ setTimeout(nav,0); }));
    window.addEventListener("hashchange", nav);
    paintXp(); nav();
  }
  function paintXp(){
    const b = badgesWon().length;
    $("#xpBox").innerHTML = `⭐ ${S.xp} XP · Lv.${level()} · 🏅 徽章 ${b}/${BADGES.length}`;
  }

  /* ---------- home ---------- */
  function renderHome(root){
    const om = overallMastery();
    const acc = S.answered ? Math.round(100*S.correctCount/S.answered) : 0;
    root.appendChild(el(`
      <div>
        <h2 class="sect">👋 欢迎来到 G8 Science 练习站</h2>
        <div class="grid g3 mb8">
          <div class="stat-tile"><div class="v">${S.answered}</div><div class="k">已答题目</div></div>
          <div class="stat-tile"><div class="v">${acc}%</div><div class="k">正确率</div></div>
          <div class="stat-tile"><div class="v">${om.m}<span class="muted" style="font-size:14px">/${om.t}</span></div><div class="k">已掌握知识卡</div></div>
        </div>
        <div class="card mt8">
          <div class="spread"><b>总体掌握度</b><span class="muted small">${om.m} / ${om.t} 张卡</span></div>
          <div class="bar mt8"><i style="width:${om.pct}%"></i></div>
        </div>
        <div class="grid g2 mt">
          ${Object.values(PARTS).map(p=>{
            const its = items.filter(i=>i.part===p.key);
            const m = its.filter(i=>S.mastered[i.id]).length;
            const pct = Math.round(100*m/its.length);
            return `<div class="card">
              <b>${p.name}</b> <span class="pill">${p.range}</span>
              <div class="small muted" style="margin:6px 0">${m}/${its.length} 张知识卡已掌握</div>
              <div class="bar"><i style="width:${pct}%"></i></div>
              <div class="row mt8">
                <button class="btn sm" onclick="location.hash='#study';setTimeout(()=>Study.openPart('${p.key}'),80)">📚 学习</button>
                <button class="btn sm ghost" onclick="location.hash='#quiz';setTimeout(()=>Quiz.quick('${p.key}'),80)">✍️ 练习</button>
              </div>
            </div>`;
          }).join("")}
        </div>
        <h2 class="sect mt">🏅 成就徽章</h2>
        <div class="grid g3">
          ${BADGES.map(b=>`<div class="badge ${b.test(S)?"won":""}">
            <div class="ico">${b.ico}</div><div class="nm">${b.nm}</div>
            <div class="small muted">${b.test(S)?"已达成":b.hint}</div></div>`).join("")}
        </div>
        <div class="card mt">
          <div class="spread"><b>📖 答案总库</b><span class="pill">新</span></div>
          <p class="small muted" style="margin:6px 0 10px">做作业卡住了？按课程浏览全部题目、双语答案与教材出处，支持按 Task 号 / 关键词 / 页码全文搜索。</p>
          <button class="btn" onclick="location.hash='#library'">打开答案总库 →</button>
        </div>
        <h2 class="sect mt">🎮 速玩入口</h2>
        <div class="grid g3">
          <div class="game-tile" onclick="Games.open('memory')"><div class="ico">🃏</div><div class="nm">记忆翻牌</div><div class="ds">术语配对挑战</div></div>
          <div class="game-tile" onclick="Games.open('btc')"><div class="ico">⚡</div><div class="nm">极速60秒</div><div class="ds">限时抢答选择题</div></div>
          <div class="game-tile" onclick="Games.open('sequence')"><div class="ico">🧩</div><div class="nm">排序挑战</div><div class="ds">把过程按顺序排好</div></div>
        </div>
      </div>`));
  }

  /* ---------- review (wrong answers) ---------- */
  // 合成 ID（TF:/CLOZE:/DIAG:）解析为可展示条目；否则错题本会漏掉非选择题错题
  function resolveWrong(id){
    if (byId[id]) return byId[id];
    const num = id.includes(":") ? Number(id.split(":")[1]) : NaN;
    if (id.startsWith("TF:") && CURATED.TF[num]){ const t = CURATED.TF[num];
      return { id, title_zh:"判断题", question_en:t.s, question_zh:"",
        answer_zh:(t.a?"True 正确":"False 错误")+" — "+t.why, source:["精选自教材知识点"] }; }
    if (id.startsWith("CLOZE:") && CURATED.CLOZE[num]){ const c = CURATED.CLOZE[num];
      return { id, title_zh:"数字填空", question_en:c.q, question_zh:"",
        answer_zh:"答案："+c.a.join("/")+(c.unit?" "+c.unit:""), source:[c.src] }; }
    if (id.startsWith("DIAG:") && CURATED.DIAGRAM_QUIZ[num]){ const q = CURATED.DIAGRAM_QUIZ[num];
      return { id, title_zh:"看图题", question_en:q.q_en, question_zh:"",
        answer_zh:q.why, source:[q.src] }; }
    return null;
  }
  function renderReview(root){
    const entries = Object.keys(S.wrong).map(resolveWrong).filter(Boolean);
    const mcqIds = entries.filter(e => byId[e.id] && byId[e.id].type === "mcq").map(e => e.id);
    root.appendChild(el(`<div>
      <h2 class="sect">🔁 错题本（${entries.length}）</h2>
      ${entries.length? `<div class="row mb8">
        <button class="btn sm" id="drillWrong" ${mcqIds.length? "" : "disabled title='没有选择题错题'"}>✍️ 只练选择题错题（${mcqIds.length}）</button>
        <button class="btn sm ghost" id="clearWrong">清空错题本</button></div>
        <p class="small muted">判断/填空/看图题的错题可在对应游戏或练习中重做，答对即自动移出错题本。</p>
      <div class="card mt8"><ul class="wl">${entries.map(e=>{
        return `<li><span class="kp">${esc((lessonByKey[e.part+"-"+e.lesson]||{}).zh || e.title_zh || "")}</span>${e.task?` <span class="kp" style="margin-left:4px">${esc(e.task)}</span>`:""}
          <b>${esc(e.title_zh||e.title_en||e.task||"")}</b><br>${esc(e.question_en||"")}
          <br><span class="muted small">✔ ${esc((e.answer_zh||e.answer_en||"").slice(0,140))}</span>
          <br><span class="src">出处：${esc((e.source||[]).join("；"))}</span></li>`;
      }).join("")}</ul></div>`
      : `<div class="card">太棒了，目前没有错题！去 <a href="#quiz">闯关练习</a> 或 <a href="#games">游戏</a> 里检验自己吧。</div>`}
    </div>`));
    const dw = root.querySelector("#drillWrong");
    if(dw) dw.onclick = ()=>Quiz.start({ partFilter:"all", lessonKey:"all", count:mcqIds.length, onlyIds:mcqIds, types:["mcq"], mode:"mcq" });
    const cw = root.querySelector("#clearWrong");
    if(cw) cw.onclick = ()=>{ S.wrong={}; save(); nav(); };
  }

  function shuffle(a){ a=[...a]; for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function fmtTime(sec){ const m=Math.floor(sec/60), s=sec%60; return `${m}:${String(s).padStart(2,"0")}`; }

  return { $, el, esc, S, save, addXp, level, markSeen, markMaster, recordAnswer,
    items, byId, mcqPool, lessons, lessonByKey, PARTS, lessonStats, overallMastery,
    nav, boot, shuffle, fmtTime, BADGES, CURATED };
})();
