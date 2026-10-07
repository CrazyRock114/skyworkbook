# G8 Science 练习站（Sky Workbook）

G8 科学双册工作簿的配套互动练习站：学习卡、闯关练习、趣味游戏、错题本与进度系统。全部题目与答案依据以下两册工作簿逐题生成，**每题附教材出处**：

- 《5008_IG Science G8_Science_Autumn.pdf》—— Lesson 1–18（消化与循环）
- 《G8_Science_Human_Physiology_Part2.pdf》—— Lesson 19–32 + 期末复习题

## 在线使用

打开站点即可：纯静态单页应用，零依赖、无后端，进度保存在浏览器本地（localStorage）。

**板块**：🏠 首页（统计/徽章）· 📚 学习卡（33 课双语翻转卡）· ✍️ 闯关练习（117 选择 + 26 判断 + 13 数字填空）· 🎮 趣味游戏（记忆翻牌 / 极速60秒 / 判断快闪 / 排序挑战 / 看图答题）· 🔁 错题本（自动收录，答对移出）

## 本地运行

```bash
python3 -m http.server 8765
# 访问 http://127.0.0.1:8765/
```

## 目录结构

```
index.html          入口（资源带 ?v= 版本号，改 JS 后需升版本）
css/style.css       样式
js/data.js          题库数据（由两个权威 JSON 生成，勿手改）
js/curated.js       精选游戏内容（配对/排序/判断/填空/看图，全部带出处）
js/app.js           路由 / 进度 / XP / 徽章 / 错题本
js/study.js         学习卡
js/quiz.js          闯关练习
js/games.js         5 个游戏
img/                教材插图（10 张，从 PDF 提取）
tests/              静态穷举套件 + 浏览器走查清单 + 测试报告
```

## 测试

```bash
osascript -l JavaScript tests/static_suite.js
# 尾行 SUITE_RESULT: PASS 即通过（38 组断言）
```

## 更新题库

修改 `../textbook/g8_science_*.json` 后重新生成 `js/data.js`（构建脚本见 work/ 目录），并同步升高 index.html 中的 `?v=` 版本号。
