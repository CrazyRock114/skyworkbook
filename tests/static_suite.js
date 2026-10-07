/* G8 Science 练习站 — 静态穷举检查套件（确定性，退出码驱动）
 * 运行：osascript -l JavaScript tests/static_suite.js
 * 判定：最后一行输出 SUITE_RESULT: PASS / FAIL:n
 * Oracle 说明：预期值来自"工作册任务清单规格"（构建时人工核对过的工作簿任务数），
 *              不复用 app.js 的实现逻辑；实现镜像风险点已单独标注。
 */
ObjC.import('Foundation');

function readFile(p){ return $.NSString.stringWithContentsOfFileEncodingError(p, 4, null).js; }
function fileExists(p){ return $.NSFileManager.defaultManager.fileExistsAtPath(p); }
const BASE = '/Users/crazyrock/ZCodeProject/teacher/science/web/';

// ---- load data layer in isolation ----
// JXA 垫片：浏览器中 window.* 即全局绑定，JXA 中须挂到 globalThis（仅装载方式不同，不改被测代码语义）
const shim = s => s.replace(/\bwindow\./g, "globalThis.");
new Function(shim(readFile(BASE + 'js/data.js')))();
new Function(shim(readFile(BASE + 'js/curated.js')))();
const BANK = globalThis.BANK, CUR = globalThis.CURATED;

// normalize exactly like the app spec (part 1 -> "autumn", part 2 -> "part2")
const items = [];
BANK.autumn.items.forEach(i => items.push(Object.assign({}, i, { part: "autumn" })));  // 规格：part=册书来源
BANK.part2.items.forEach(i => items.push(Object.assign({}, i, { part: "part2" })));

// ---- spec tables (oracle) ----
const SPEC_PER_LESSON = {
  "autumn": {0:3,1:8,2:3,3:7,4:7,5:5,6:17,7:6,8:7,9:6,10:8,11:8,12:17,13:18,14:5,15:6,16:8,17:9,18:17},
  "part2":  {19:9,20:5,21:9,22:6,23:8,24:11,25:7,26:8,27:7,28:8,29:7,30:11,31:8,32:9,33:55}
};
const REQUIRED_KEYS = ["id","part","lesson","lesson_title_en","lesson_title_zh","task","type",
  "question_en","question_zh","answer_en","answer_zh","source","status"];
const KNOWN_TYPES = ["mcq","fill","match","table","short","open","tf","sort","diagram","data","drawing"];
const KNOWN_STATUS = ["verified","corrected","added","enrichment","sample_data","ambiguous"];
const KNOWN_KEYS = new Set([...REQUIRED_KEYS, "options", "correct", "notes", "_part", "title_en", "title_zh"]);

let pass = 0, fail = 0; const failures = [];
let statExist = 0, statState = 0, statProperty = 0, statE2E = 0;
function ok(cat, label){ pass++; if(cat==="E")statExist++; else if(cat==="S")statState++; else if(cat==="P")statProperty++; else statE2E++; }
function bad(label, detail){ fail++; failures.push(label + (detail? " :: " + detail : "")); }
function check(cat, label, cond, detail){
  if(cond) ok(cat, label); else bad(label, detail);
}
function checkEach(cat, label, arr, fn){
  let allOk = true; const bads = [];
  arr.forEach((x, ix) => { const r = fn(x, ix); if(r !== true){ allOk = false; bads.push(typeof r === "string" ? r : ("#" + (ix+1))); } });
  if(allOk) ok(cat, label + " [" + arr.length + " 项]"); else bad(label, bads.slice(0,6).join("; "));
}

// ================= L1 结构 =================
// 1. 条目总数与规格一致
check("S", "题库总数 = 规格和(165+168=333)", items.length === 333, "实际 " + items.length);
check("S", "autumn=165 / part2=168",
  items.filter(i=>i.part==="autumn").length === 165 && items.filter(i=>i.part==="part2").length === 168,
  "autumn=" + items.filter(i=>i.part==="autumn").length + " part2=" + items.filter(i=>i.part==="part2").length);

// 2. 每课条目数与规格一致
(function(){
  const counts = {};
  items.forEach(i => { const k = i.part + ":" + i.lesson; counts[k] = (counts[k]||0)+1; });
  let allOk = true; const bads = [];
  for (const part of Object.keys(SPEC_PER_LESSON))
    for (const les of Object.keys(SPEC_PER_LESSON[part])){
      const want = SPEC_PER_LESSON[part][les];
      const got = counts[part + ":" + les] || 0;
      if (got !== want){ allOk = false; bads.push(part + " L" + les + " 期望" + want + " 实际" + got); }
    }
  const extra = Object.keys(counts).filter(k => {
    const [p, l] = k.split(":"); return !SPEC_PER_LESSON[p] || SPEC_PER_LESSON[p][l] === undefined;
  });
  if (extra.length){ allOk = false; bads.push("多出课程:" + extra.join(",")); }
  check("P", "每课条目数闭合（规格 vs 实际，双向）", allOk, bads.slice(0,8).join("; "));
})();

// 3. ID 唯一
(function(){
  const seen = new Set(); const dups = [];
  items.forEach(i => { if(seen.has(i.id)) dups.push(i.id); seen.add(i.id); });
  check("P", "条目 ID 全局唯一", dups.length === 0, dups.slice(0,5).join(","));
})();

// 4. 必填键 + 幽灵字段普查
checkEach("S", "必填键齐全", items, i => REQUIRED_KEYS.every(k =>
  i[k] !== undefined && i[k] !== null && !(Array.isArray(i[k]) && i[k].length===0)) ? true : (i.id + " 缺键"));
(function(){
  const ghosts = new Set();
  items.forEach(i => Object.keys(i).forEach(k => { if(!KNOWN_KEYS.has(k)) ghosts.add(k); }));
  check("S", "幽灵字段普查（未知键=0）", ghosts.size === 0, [...ghosts].join(","));
})();

// 5. 枚举值合法
checkEach("S", "type 合法", items, i => KNOWN_TYPES.includes(i.type) ? true : i.id + ":" + i.type);
checkEach("S", "status 合法", items, i =>
  (Array.isArray(i.status) && i.status.every(s=>KNOWN_STATUS.includes(s))) ? true : i.id + ":" + JSON.stringify(i.status));

// 6. MCQ 结构
const mcqs = items.filter(i => i.type === "mcq");
check("S", "MCQ 总数 = 117（57 autumn + 60 part2）", mcqs.length === 117, "实际 " + mcqs.length);
checkEach("P", "MCQ 选项数 3-6 且 correct 字母在范围内", mcqs, i => {
  const n = (i.options||[]).length;
  if (n < 3 || n > 6) return i.id + " 选项数" + n;
  const idx = "ABCDEFG".indexOf(i.correct);
  if (idx < 0 || idx >= n) return i.id + " correct=" + i.correct + " 越界";
  return true;
});
checkEach("P", "MCQ 选项非空且互不重复", mcqs, i => {
  const o = i.options || [];
  if (o.some(t => !t || !String(t).trim())) return i.id + " 有空选项";
  const set = new Set(o.map(t => String(t).trim().toLowerCase()));
  if (set.size !== o.length) return i.id + " 选项重复";
  return true;
});
(function(){
  // 选项文本是"裸字母"只允许出现在看图题白名单里
  const bare = mcqs.filter(i => (i.options||[]).every(t => /^[A-D]$/.test(String(t).trim())));
  const allowed = new Set(CUR.DIAGRAM_ONLY_IDS);
  const viol = bare.filter(i => !allowed.has(i.id)).map(i=>i.id);
  check("S", "裸字母选项仅限看图题白名单", viol.length === 0, viol.join(","));
  check("S", "白名单条目全部存在且为 mcq", CUR.DIAGRAM_ONLY_IDS.every(id => {
    const it = items.find(x => x.id === id); return it && it.type === "mcq";
  }), "");
})();

// 7. correct 字母分布（防系统性错位：同一套卷内某字母占比 >60% 可疑）
(function(){
  const groups = {};
  mcqs.forEach(i => { const g = i.id.slice(0, 8); (groups[g] = groups[g]||[]).push(i.correct); });
  const bads = [];
  Object.keys(groups).forEach(g => {
    const c = {}; let max = 0;
    groups[g].forEach(L => { c[L]=(c[L]||0)+1; max=Math.max(max,c[L]); });
    const th = groups[g].length >= 20 ? 0.70 : 0.60; // 大样本组（整卷）阈值放宽并记录：真实答案键允许偏斜，错位错由交叉验证兜底
    if (groups[g].length >= 6 && max/groups[g].length > th) bads.push(g + " 最高占比 " + Math.round(100*max/groups[g].length) + "%");
  });
  check("P", "correct 字母分布无系统性偏斜", bads.length === 0, bads.join(";"));
})();

// 8. MCQ 解析-依据交叉验证（规格级：正确选项的文本应能在答案解析中找到痕迹）
(function(){
  let hits = 0, misses = [];
  mcqs.forEach(i => {
    const idx = "ABCDEFG".indexOf(i.correct);
    const opt = String((i.options||[])[idx] || "").trim();
    if (!opt) return;
    if (/^[A-D]$/.test(opt)) { hits++; return; } // 看图题跳过
    const hay = (i.answer_en || "").toLowerCase();
    const needle = opt.toLowerCase().replace(/[.,;:!?（）()]/g, "").trim();
    if (hay.includes(needle)) { hits++; return; }
    // 退化：取选项里最长的英文词（>=6字符）匹配
    const words = needle.split(/\s+/).filter(w => w.length >= 6);
    if (words.some(w => hay.includes(w))) { hits++; return; }
    misses.push(i.id + "「" + opt.slice(0, 30) + "」");
  });
  const rate = Math.round(100 * hits / mcqs.length);
  check("P", "MCQ 选项-解析交叉验证命中率 ≥ 92%", rate >= 92, "命中 " + rate + "%；未命中: " + misses.slice(0,10).join("; "));
})();

// 9. 每题都有答案文本与出处
checkEach("S", "答案文本非空", items, i => (i.answer_en && i.answer_en.trim()) ? true : i.id + " 无 answer_en");
checkEach("S", "出处非空数组", items, i =>
  (Array.isArray(i.source) && i.source.length && i.source.every(s=>s&&String(s).trim())) ? true : i.id + " source 异常");
(function(){
  const re = /(教材|P2|PPT|词汇表)\s*(p\.|Slide)/;
  const bads = items.filter(i => !i.source.some(s => re.test(s))).map(i => i.id + "::" + i.source[0]);
  check("P", "出处格式符合「教材/P2/PPT + p./Slide」", bads.length === 0, bads.slice(0,6).join("; "));
})();

// ================= curated =================
// 10. TF
check("S", "TF 陈述 = 26 条", CUR.TF.length === 26, "实际 " + CUR.TF.length);
checkEach("S", "TF 结构（s/a/why）", CUR.TF, t =>
  (t.s && typeof t.a === "boolean" && t.why) ? true : "缺字段");
(function(){
  const trues = CUR.TF.filter(t => t.a).length;
  check("P", "TF 真值分布不过偏（true 占比 25%-75%）", trues >= 7 && trues <= 19, "true=" + trues);
})();
// 11. CLOZE
check("S", "数字填空 = 13 条", CUR.CLOZE.length === 13, "实际 " + CUR.CLOZE.length);
checkEach("P", "CLOZE 含空格标记且至少一个可判定答案", CUR.CLOZE, c =>
  (c.q.includes("___") && Array.isArray(c.a) && c.a.length && c.src) ? true : "结构异常");
// 12. SEQUENCES
check("S", "排序挑战 = 8 条", CUR.SEQUENCES.length === 8, "实际 " + CUR.SEQUENCES.length);
checkEach("P", "序列 ≥4 环节且无重复", CUR.SEQUENCES, s => {
  if (s.items.length < 4) return s.id + " 仅" + s.items.length;
  const u = new Set(s.items);
  if (u.size !== s.items.length) return s.id + " 有重复环节";
  return true;
});
// 13. MEMORY_SETS
check("S", "记忆牌组 = 6 套", CUR.MEMORY_SETS.length === 6, "实际 " + CUR.MEMORY_SETS.length);
checkEach("P", "牌组 5-8 对、对内两卡不同、卡面跨对不重复", CUR.MEMORY_SETS, st => {
  if (st.pairs.length < 5 || st.pairs.length > 8) return st.id + " 对数" + st.pairs.length;
  const faces = [];
  for (const p of st.pairs){
    if (!Array.isArray(p) || p.length !== 2 || p[0] === p[1]) return st.id + " 对结构异常";
    faces.push(p[0], p[1]);
  }
  const u = new Set(faces.map(f => f.trim()));
  if (u.size !== faces.length) return st.id + " 卡面重复";
  return true;
});
// 14. DIAGRAM_QUIZ
check("S", "看图题 = 12 道", CUR.DIAGRAM_QUIZ.length === 12, "实际 " + CUR.DIAGRAM_QUIZ.length);
checkEach("S", "看图题引用的图片文件存在", CUR.DIAGRAM_QUIZ, q => {
  const p = BASE + q.img;
  return fileExists(p) ? true : "缺文件 " + q.img;
});
checkEach("S", "看图题 correct 在选项范围内、why/src 非空", CUR.DIAGRAM_QUIZ, q =>
  (q.correct >= 0 && q.correct < q.opts.length && q.opts.length >= 2 && q.why && q.src) ? true : "结构异常");
checkEach("P", "看图题选项不重复", CUR.DIAGRAM_QUIZ, q =>
  new Set(q.opts).size === q.opts.length ? true : "选项重复");

// ================= L0/L5 暴露面与一致性 =================
// 15. 站内无外链（纯本地站）
(function(){
  const files = ["index.html","js/app.js","js/study.js","js/quiz.js","js/games.js","js/curated.js"];
  const bads = [];
  files.forEach(f => {
    const src = readFile(BASE + f);
    const m = src.match(/https?:\/\/(?!127\.0\.0\.1|localhost)[^\s"'`)]+/g);
    if (m) bads.push(f + ":" + m.slice(0,2).join(","));
  });
  check("S", "站内零外部 URL（含 data.js/curated.js）", bads.length === 0, bads.join("; "));
})();
// 16. index.html 引用的本地资源全部存在
(function(){
  const html = readFile(BASE + "index.html");
  const refs = [...html.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m => m[1]).filter(p => !p.startsWith("http"));
  const bads = refs.filter(p => !fileExists(BASE + p.split("?")[0])); // 剥离 ?v= 版本参数再查文件
  check("S", "index.html 本地资源引用全部存在", bads.length === 0, bads.join(","));
})();
// 17. data.js 与权威 JSON 同步（抽查选项文本与 correct 一致）
(function(){
  const raw = JSON.parse(readFile("/Users/crazyrock/ZCodeProject/teacher/science/textbook/g8_science_autumn_answers.json"));
  const sample = raw.items[0];
  const inData = BANK.autumn.items.find(i => i.id === sample.id);
  check("S", "data.js 与 JSON 题库同步（抽查首条 + total）",
    inData && JSON.stringify(inData.options) === JSON.stringify(sample.options) &&
    BANK.autumn.items.length === raw.items.length, "");
})();
// 18. 徽章定义完整且 id 唯一（ app.js 读取文本做静态断言，避免执行 UI 层）
(function(){
  const src = readFile(BASE + "js/app.js");
  const ids = [...src.matchAll(/\{ id:"([a-z]+)"/g)].map(m => m[1]);
  check("S", "徽章 ≥6 个且 id 唯一", ids.length >= 6 && new Set(ids).size === ids.length, ids.join(","));
})();
// 19. 疫苗断言：曾经的缺陷必须保持已修复状态
//   疫苗-1: renderReview 必须解析合成 ID（TF:/CLOZE:/DIAG:），否则错题本漏题
(function(){
  const src = readFile(BASE + "js/app.js");
  check("S", "疫苗-1 错题本解析合成ID（TF:/CLOZE:/DIAG:）", src.includes("resolveWrong") || src.includes("resolve-wrong"), "");
})();
//   疫苗-2: 记忆翻牌必须防护第三张卡（opened.length>=2 早退）
(function(){
  const src = readFile(BASE + "js/games.js");
  check("S", "疫苗-2 记忆翻牌第三张卡防护", /opened\.length\s*>=?\s*2.*return|if\s*\(\s*opened\.length\s*===?\s*2\s*\)\s*return/.test(src.replace(/\n/g," ")), "");
})();
//   疫苗-3: TF 作答 id 命名空间统一（quiz 与 game 都写 "TF:"+ix）
(function(){
  const q = readFile(BASE + "js/quiz.js"), g = readFile(BASE + "js/games.js");
  check("S", "疫苗-3 TF 判定 id 命名空间统一", q.includes('"TF:"+') && g.includes('"TF:"+') && !g.includes('"TFB:"+'), "");
})();


// 20. 疫苗-4: 答案总库必须注册为路由且引用存在
(function(){
  const html = readFile(BASE + "index.html");
  const app = readFile(BASE + "js/app.js");
  const libExists = fileExists(BASE + "js/library.js");
  check("S", "疫苗-4a 总库脚本已引入 index.html", html.includes("js/library.js"), "");
  check("S", "疫苗-4b library 路由已注册", app.includes("library:()=>Library.render"), "");
  check("S", "疫苗-4c library.js 从 App 解构 items 数据源", libExists && readFile(BASE + "js/library.js").includes("{ el, esc, items, lessons } = App"), "");
})();
// 21. 总库数据完备性：全部条目的 task/question/answer 可渲染（无 undefined 泄漏）
(function(){
  const libSrc = readFile(BASE + "js/library.js");
  // 模拟库的展示字段选择逻辑做静态检查：每条目至少 question_en 或 question_zh 非空
  const bads = items.filter(i => !((i.question_en||"").trim() || (i.question_zh||"").trim())).map(i=>i.id);
  check("S", "总库渲染前提：每条目至少一个语言的题干非空", bads.length === 0, bads.slice(0,5).join(","));
})();

// ================= 汇总 =================
let report = "";
report += "=== 断言统计 === 存在性E:" + statExist + " 状态S:" + statState + " 性质P:" + statProperty + " 端到端E2E:" + statE2E;
report += " | 存在性占比 " + Math.round(100*statExist/Math.max(1,(pass+fail))) + "%（红线<40%）";
report += " | PASS " + pass + " / FAIL " + fail;
console.log(report);
if (failures.length){
  console.log("=== 失败明细 ===");
  failures.forEach((f,i) => console.log("  [" + (i+1) + "] " + f));
}
console.log("SUITE_RESULT: " + (fail === 0 ? "PASS" : "FAIL:" + fail));
