/* Study mode: bilingual flashcards per lesson with mastery tracking */
window.Study = (function(){
  const { el, esc, items, lessons, lessonByKey, S, save, markMaster } = App;
  let cur = { part:null, lessonKey:null, idx:0, list:[] };

  function render(root){
    if(cur.part && cur.lessonKey && cur.list.length) return renderCards(root);
    renderPicker(root);
  }
  function openPart(part){ cur.part = part; cur.lessonKey = null; render(App.$("#app")); }

  function renderPicker(root, part){
    part = part || cur.part || "autumn";
    cur.part = part;
    const ls = lessons.filter(l=>l.part===part && l.no>=0); // 含选做作业(lesson 0)
    root.appendChild(el(`<div>
      <a class="back-link" href="#home">← 首页</a>
      <h2 class="sect">📚 学习卡 · 选择课程</h2>
      <div class="row mb8">
        ${Object.values(App.PARTS).map(p=>`<button class="btn sm ${p.key===part?"":"ghost"}" data-p="${p.key}">${p.name}</button>`).join("")}
      </div>
      <div class="grid g2">
        ${ls.map(l=>{
          const its = items.filter(i=>i.part===l.part && i.lesson===l.no);
          const m = its.filter(i=>S.mastered[i.id]).length;
          const pct = its.length? Math.round(100*m/its.length):0;
          return `<div class="lesson-card" data-l="${l.part}-${l.no}">
            <div><b>Lesson ${l.no===33?"复习":(l.no===0?"选做作业":l.no)} · ${esc(l.zh)}</b><br><span class="small muted">${esc(l.en)}</span></div>
            <div class="mastery">${m}/${its.length} · ${pct}%</div>
          </div>`;
        }).join("")}
      </div>
    </div>`));
    root.querySelectorAll("[data-p]").forEach(b=>b.onclick=()=>renderPicker(root, b.dataset.p));
    root.querySelectorAll("[data-l]").forEach(c=>c.onclick=()=>{
      openLesson(c.dataset.l.split("-")[0], c.dataset.l.split("-").slice(1).join("-"));
    });
  }

  function openLesson(part, no){
    const key = part+"-"+no;
    cur = { part, lessonKey:key, idx:0, list: items.filter(i=>i.part===part && i.lesson===Number(no)) };
    renderCards(App.$("#app"));
  }

  function renderCards(root){
    root.innerHTML = "";
    const l = lessonByKey[cur.lessonKey];
    const card = cur.list[cur.idx];
    const it = card;
    const done = cur.list.filter(i=>S.mastered[i.id]).length;
    root.appendChild(el(`<div>
      <a class="back-link" href="#study">← 选课列表</a>
      <div class="spread">
        <h2 class="sect" style="margin:0">Lesson ${l.no===33?"复习":l.no} · ${esc(l.zh)}</h2>
        <span class="pill ${S.mastered[it.id]?"ok":""}">${cur.idx+1} / ${cur.list.length} · 已掌握 ${done}</span>
      </div>
      <div class="bar mt8"><i style="width:${Math.round(100*done/cur.list.length)}%"></i></div>

      <div class="fc-wrap mt">
        <div class="fc" id="fc">
          <div class="fc-face fc-front">
            <span class="fc-tag pill">${esc(it.task||it.type)}</span>
            <span class="fc-tag pill" style="top:40px">${esc(it.title_zh||it.title_en||"")}</span>
            <div class="q">${esc(it.question_en||it.title_en||"")}</div>
            <div class="qzh" style="margin-top:8px">${esc(it.question_zh||it.title_zh||"")}</div>
            <div class="tap-hint">👆 点击卡片翻面看答案</div>
          </div>
          <div class="fc-face fc-back">
            <span class="fc-tag pill ok">答案 Answer</span>
            <div class="ans">${App.S.lang==="en" ? esc(it.answer_en||"") : (esc(it.answer_en||"") + '<br><br>——<br><br>' + esc(it.answer_zh||""))}</div>
            <div class="src" style="margin-top:10px">📖 出处：${esc((it.source||[]).join("；"))}</div>
          </div>
        </div>
      </div>
      <div class="tap-hint">考点：<span class="kp">${esc(l.zh)} · ${esc(it.title_zh||it.title_en||"")}</span></div>
      <div class="row center mt" style="justify-content:center">
        <button class="btn ghost" id="prev">← 上一张</button>
        <button class="btn bad" id="again">😵 再复习</button>
        <button class="btn ok" id="got">✅ 掌握了</button>
        <button class="btn ghost" id="next">下一张 →</button>
      </div>
    </div>`));
    const fc = root.querySelector("#fc");
    fc.onclick = ()=>fc.classList.toggle("flip");
    root.querySelector("#prev").onclick = ()=>{ cur.idx = (cur.idx-1+cur.list.length)%cur.list.length; renderCards(root); };
    root.querySelector("#next").onclick = ()=>{ cur.idx = (cur.idx+1)%cur.list.length; renderCards(root); };
    root.querySelector("#got").onclick = ()=>{ App.markMaster(it.id); nextCard(root); };
    root.querySelector("#again").onclick = ()=>{ App.addXp(1); nextCard(root); };
    function nextCard(r){ cur.idx = (cur.idx+1)%cur.list.length; renderCards(r); }
  }

  return { render, openPart, openLesson };
})();
