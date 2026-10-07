/* 答案总库 Library：全部题目按课浏览 + 全文搜索 + Task 锚点手风琴 */
window.Library = (function(){
  const { el, esc, items, lessons } = App;
  let state = { part:"autumn", lesson:"all", q:"" };

  function norm(s){ return String(s||"").toLowerCase(); }
  // 英式/美式拼写容错：haemoglobin/oestrogen/foetus 等 ae ↔ e（IGCSE 两式皆可）
  function loose(s){ return norm(s).replace(/ae/g, "e").replace(/æ/g, "e"); }

  function filtered(){
    return items.filter(i =>
      i.part === state.part &&
      (state.lesson === "all" || String(i.lesson) === state.lesson) &&
      (!state.q || [i.question_en, i.question_zh, i.answer_en, i.answer_zh,
                    i.title_en, i.title_zh, i.task,
                    (i.source||[]).join(" ")].some(t => loose(t).includes(loose(state.q)))));
  }

  function lessonLabel(no){
    if (no === 33) return "期末复习题";
    if (no === 0) return "选做作业";
    return "Lesson " + no;
  }

  function render(root){
    root.innerHTML = "";
    root.appendChild(el(`<div>
      <h2 class="sect">📖 答案总库 <span class="muted small" style="font-weight:400">— 做作业时按课查阅全部题目、答案与教材出处</span></h2>
      <div class="lib-bar">
        <select id="libPart">
          <option value="autumn">🍂 Autumn 秋季（消化与循环）</option>
          <option value="part2">🫀 Part 2 人体生理学（含复习题）</option>
        </select>
        <select id="libLesson"><option value="all">全部课程</option></select>
        <input type="text" id="libSearch" placeholder="🔍 搜题干 / 答案 / Task 号 / 出处关键词…" value="${esc(state.q)}">
      </div>
      <div class="lib-count" id="libCount"></div>
      <div id="libList"></div>
    </div>`));

    const partSel = root.querySelector("#libPart"),
          lesSel = root.querySelector("#libLesson"),
          search = root.querySelector("#libSearch");
    partSel.value = state.part;

    function fillLessons(){
      const opts = [`<option value="all">全部课程</option>`];
      lessons.filter(l => l.part === state.part).forEach(l => {
        opts.push(`<option value="${l.no}">${lessonLabel(l.no)} · ${esc(l.zh)}</option>`);
      });
      lesSel.innerHTML = opts.join("");
      lesSel.value = state.lesson;
      if (lesSel.value !== state.lesson) { state.lesson = "all"; lesSel.value = "all"; }
    }

    function paint(){
      const list = filtered();
      root.querySelector("#libCount").textContent =
        `共 ${list.length} 条${state.q ? `（搜索“${state.q}”命中）` : ""} · 点击卡片展开答案`;
      const box = root.querySelector("#libList");
      if (!list.length){
        box.innerHTML = `<div class="lib-empty">没有命中的题目——换个关键词试试（支持中英文、Task 号如 "1.1"、页码如 "p.95"）</div>`;
        return;
      }
      box.innerHTML = list.map(i => {
        const task = i.task && i.task !== "—"? i.task : (i.title_zh || i.title_en || "");
        return `<div class="lib-item" data-id="${esc(i.id)}">
          <div class="lib-head">
            <span class="anchor">${esc(task)}</span>
            <div class="ttl"><b>${esc(i.title_zh || i.title_en || i.question_zh || i.question_en)}</b>
              <span>${lessonLabel(i.lesson)} · ${esc(i.lesson_title_zh || i.lesson_title_en || "")} · ${esc(i.type)}</span></div>
            <span class="arrow">▶</span>
          </div>
          <div class="lib-body">
            <div class="lib-q"><b>题：</b>${esc(i.question_en || "")}</div>
            <div class="lib-q muted qzh">${esc(i.question_zh || "")}</div>
            <div class="lib-ans"><b>答案 Answer</b>
${App.S.lang==="en" ? esc(i.answer_en || "") : (esc(i.answer_en || "") + '<br><br>——<br><br>' + esc(i.answer_zh || ""))}</div>
            <div class="lib-tags">${(i.status||[]).map(s=>{
              const map = { verified:["✅ Verified 教材有依据","ok"], corrected:["✏️ v2已更正","bad"], added:["➕ 已补全","gold"], enrichment:["📘 教师拓展·非判分",""], sample_data:["🧪 学生实测·无固定答案",""], ambiguous:["⚠️ 题目/教材待明确","bad"] };
              const m = map[s] || [s, ""];
              return `<span class="pill ${m[1]}">${m[0]}</span>`;
            }).join("")}
            ${(i.source||[]).map(s=>`<span class="lib-cite">📖 ${esc(s)}</span>`).join("")}</div>
          </div>
        </div>`;
      }).join("");
      box.querySelectorAll(".lib-head").forEach(h => {
        h.onclick = () => h.parentElement.classList.toggle("open");
      });
    }

    partSel.onchange = () => { state.part = partSel.value; state.lesson = "all"; fillLessons(); paint(); };
    lesSel.onchange = () => { state.lesson = lesSel.value; paint(); };
    let tid = null;
    search.oninput = () => {
      clearTimeout(tid);
      tid = setTimeout(() => { state.q = search.value.trim(); paint(); }, 200);
    };

    fillLessons(); paint();
  }

  return { render };
})();
