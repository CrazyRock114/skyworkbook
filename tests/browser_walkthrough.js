/* L6 浏览器交互走查（可重跑）
 * 运行方式：在 ZCode 会话中经 browser-use 的 mcp__node_repl__js 分步执行；
 *           本文件是走查的步骤与断言清单（每步的期望值已标注），供回归时照单重放。
 * 前置：cd web && python3 -m http.server 8765；基线：localStorage.clear() + reload 并读回确认全 0。
 *
 * W1 路由扫掠
 *   #study   → 地标文本"学习卡 · 选择课程"；.lesson-card 数量 = 34（含选做作业 lesson 0 与复习课 33）
 *   #quiz    → 页面宣称 "共 N 道选择题、26 道判断题、13 道数字填空"，N === App.mcqPool.length（116）
 *   #games   → .game-tile 数量 = 5
 *   #review  → 无错题时显示"目前没有错题"
 *   #home    → 总体掌握度分母含 "333"
 * W2 主张可达成（作弊代理）★状态断言
 *   Quiz.start({count:5,types:["mcq"]}) → 每题按 BANK 正确字母作答 → 结果页 "5 / 5 · 100%"，XP +50
 * W3/W4 逆向与闭环 ★状态断言
 *   故意答错 3 题 → S.wrong 增至 3 → #review 列出条目（含出处）→ drillWrong 点击
 *   → 逐题答对 → S.wrong 归零（疫苗：drill 调用必须带 types:["mcq"]，见缺陷 D5）
 * W5 记忆翻牌状态转移 idle→playing→win
 *   Games.memory(app,0) → 按 CURATED.MEMORY_SETS[0].pairs 词对映射点击 → .mem-card.done=12
 *   → "配对完成"面板 → S.best["mem_enzymes"]>0 → XP+15
 * W6 排序挑战双向
 *   乱序点满+检查 → "位置不对" 且 XP 不变（答错不得分）；正确顺序 → "完全正确" XP+12
 * W7 判断快闪
 *   按 CURATED.TF 真值答 12 题 → 结算 "12 / 12"
 * W8 极速60秒（_test 钩子）
 *   window.G8_TEST={} 后 Games.btc → 答对 1 题（score=1）→ G8_TEST.btcFinish() → "时间到"
 *   → S.best.btc ≥ 1
 * W9 看图答题
 *   Games.diagram → 按 CURATED.DIAGRAM_QUIZ[q_en].correct 连答 6 题 → "6 / 6"
 * W10 持久化与徽章
 *   reload 后 XP>0、gamesPlayed 含全部 5 键；全玩过后徽章 gamer 达成
 * W11 移动端 375px
 *   documentElement.scrollWidth ≤ clientWidth+1；.mem-grid 计算列数 = 3
 *
 * 已知测试注意点（非被测物缺陷）：
 * - location.hash 赋值不触发 hashchange 时（值未变）需手动调 App.nav()；
 * - Quiz.session 未导出，测试以 #opts/.qtext 的 DOM 存在性为准；
 * - 资源经 ?v= 版本号加载（index.html），改动 JS 后需升版本号防浏览器缓存旧代码。
 */
module.exports = {};
