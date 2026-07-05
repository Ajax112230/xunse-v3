# 赛博占色 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在寻色原版基础上新增「赛博占色」功能——五道题+姓名+生日→本命色→分享卡片。

**Architecture:** 单文件 `index.html` 内增。所有新增代码在现有 script 块内（紧接 main IIFE 之后），CSS 追加至 `</style>` 前，HTML 追加至 `</body>` 前。现有寻色流程（input-screen / result-screen / galaxy）不做任何修改。

**Tech Stack:** 原生 HTML + CSS + JS，零依赖。Canvas 渲染分享卡片（1080×1440px）。

## Global Constraints

- 所有代码在 `d:/xunse-v3/index.html` 单文件内
- 不修改现有寻色流程（input-screen / result-screen / showColor / showInput 和 galaxy 初始化）
- 不引入任何 JS 库或 CSS 框架
- 复用现有 161 色 COLORS 数据、getColor 哈希函数
- 分享卡片用 Canvas 渲染，1080×1440px，竖版 3:4

---

### Task 1: 赛博占色入口 + 题目面板 HTML + CSS

**Files:**
- Modify: `d:/xunse-v3/index.html`

**Interfaces:**
- Produces: `#cyber-screen` 输入区（三栏：姓名/生日/五道题）、CSS 样式
- Consumes: `#input-screen` 下方的 DOM 位置（新屏与旧屏并列，默认隐藏）

**CSS 添加位置：** `</style>` 之前（约 line 448）
**HTML 添加位置：** `</body>` 之前（约 line 803）

- [ ] **Step 1: 添加赛博占色入口按钮 CSS+HTML**

CSS 追加：
```css
/* ─── 赛博占色 ─────────────────────────────── */
.cyber-tab-bar {
  display: flex; justify-content: center; gap: 8px; margin-top: 24px;
}
.cyber-tab {
  padding: 8px 20px; border-radius: 50px; font-size: 13px;
  font-family: inherit; cursor: pointer;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.4); transition: all 0.3s;
}
.cyber-tab.active { background: rgba(201,169,110,0.15); border-color: rgba(201,169,110,0.35); color: #c9a96e; }
.cyber-tab:hover { color: rgba(255,255,255,0.7); }
```

在 `hint` 行（line 461）后、`</div>` 闭合前插入入口按钮：
```html
    <div class="cyber-tab-bar">
      <span class="cyber-tab active" onclick="switchCyberTab('xunse')">🔮 姓名寻色</span>
      <span class="cyber-tab" onclick="switchCyberTab('cyber')">⭐ 赛博占色</span>
    </div>
```

- [ ] **Step 2: 添加题目面板 HTML**

在 `<div id="result-screen">`（line 463）后、galaxy-bg div 对应位置插入新屏：

```html
<div id="cyber-screen">
  <div class="center">
    <h1 class="title">赛 博 占 色</h1>
    <p class="sub">五个问题 · 找到你的本命色</p>

    <!-- 三栏输入 -->
    <div class="cyber-inputs">
      <div class="ci-row"><span class="ci-label">姓名</span><input class="ci-input" id="ci-name" placeholder="你的名字" maxlength="10"></div>
      <div class="ci-row"><span class="ci-label">生日</span><input class="ci-input" id="ci-birth" placeholder="月/日，如 01/15" maxlength="5"></div>
    </div>

    <!-- 五道题 -->
    <div class="cyber-questions" id="cyber-qs"></div>

    <button class="cyber-submit" onclick="calcCyberColor()">✨ 开启占色</button>
    <p class="hint" style="margin-top:12px">五道题答完即可生成 · 越认真越准</p>
  </div>
</div>
```

- [ ] **Step 3: 五道题 CSS + 题目渲染**

CSS 追加：
```css
#cyber-screen { display: none; position:fixed; top:var(--safe-top); left:0; z-index:1; width:100%; height:100%; height:100dvh; align-items:center; justify-content:center; padding:var(--safe-top) 0 var(--safe-bottom); overflow-y:auto; }
#cyber-screen.active { display:flex; }

.cyber-inputs { max-width:360px; margin:0 auto 20px; }
.ci-row { display:flex; align-items:center; gap:10px; margin-bottom:10px; }
.ci-label { font-size:14px; color:#a09880; min-width:40px; letter-spacing:0.1em; }
.ci-input { flex:1; padding:10px 14px; background:rgba(255,255,255,0.04); border:1px solid rgba(201,169,110,0.25); border-radius:50px; color:#e8dcc8; font-size:14px; font-family:inherit; outline:none; }
.ci-input::placeholder { color:rgba(255,255,255,0.15); }
.ci-input:focus { border-color:rgba(201,169,110,0.6); }

.cyber-questions { max-width:460px; margin:0 auto 20px; text-align:left; }

.cq { margin-bottom:20px; }
.cq-q { font-size:14px; color:#d5cbb5; margin-bottom:8px; letter-spacing:0.04em; }
.cq-q .cq-num { color:#c9a96e; margin-right:6px; }
.cq-opt { display:block; width:100%; text-align:left; padding:10px 16px; margin-bottom:6px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:12px; color:rgba(255,255,255,0.55); font-size:13px; font-family:inherit; cursor:pointer; transition:all 0.2s; }
.cq-opt:hover { background:rgba(255,255,255,0.05); border-color:rgba(201,169,110,0.2); }
.cq-opt.selected { background:rgba(201,169,110,0.12); border-color:rgba(201,169,110,0.4); color:#c9a96e; }
.cq-opt .cq-let { display:inline-block; width:20px; height:20px; line-height:20px; text-align:center; border-radius:50%; border:1px solid rgba(255,255,255,0.15); font-size:11px; margin-right:10px; }
.cq-opt.selected .cq-let { background:rgba(201,169,110,0.3); border-color:#c9a96e; }

.cyber-submit { padding:14px 42px; background:rgba(201,169,110,0.15); border:1px solid rgba(201,169,110,0.35); border-radius:50px; color:#c9a96e; font-size:17px; font-family:inherit; cursor:pointer; letter-spacing:0.08em; transition:all 0.25s; }
.cyber-submit:hover { background:rgba(201,169,110,0.25); }
.cyber-submit:disabled { opacity:0.3; cursor:default; }
```

HTML 追加（在 cyber-submit 按钮后加隐藏的结果区占位）：
```html
    <div id="cyber-result" style="display:none"></div>
  </div>
</div>
```

- [ ] **Step 4: 提交**

```bash
git add index.html
git commit -m "feat: 赛博占色入口+题目面板+CSS"
```

---

### Task 2: 题目渲染 JS + 评分引擎 + 原型匹配

**Files:**
- Modify: `d:/xunse-v3/index.html`

**Interfaces:**
- Produces: 五道题 `renderCyberQuestions()`、评分 `calcCyberColor()`、原型→颜色映射、结果渲染 `showCyberColor()`
- Consumes: `COLORS[]`、`getColor()` 哈希函数

**JS 添加位置：** 紧接 `})()` — main IIFE 闭合（约 line 772）之后、`</script>` 之前

- [ ] **Step 1: 评分引擎常量 + 题目数据 + switchCyberTab 函数**

```javascript
var CYBER_QUESTIONS = [
  {
    q: '独处的时候你更偏向？',
    opts: [
      { t: '安安静静待着，什么也不想', d: { jing:2, deep:1 } },
      { t: '看书追剧，给自己找点事做', d: { wen:2, li:1 } },
      { t: '约朋友出来走走聊聊', d: { lie:2, wai:1 } },
      { t: '运动/出门/做点不一样的', d: { lie:1, dong:2 } },
    ]
  },
  {
    q: '朋友一般怎么形容你？',
    opts: [
      { t: '温柔细心的', d: { wen:2, rou:1 } },
      { t: '热情可靠的', d: { lie:2, ren:1 } },
      { t: '冷静通透的', d: { jing:2, li:2 } },
      { t: '有趣有梗的', d: { dong:2, wai:1 } },
    ]
  },
  {
    q: '你现在的人生阶段更像？',
    opts: [
      { t: '全力冲刺，有目标在追', d: { lie:2, dong:1 } },
      { t: '慢慢沉淀，积累自己', d: { jing:2, deep:1 } },
      { t: '探索变化，寻找方向', d: { dong:2, rou:1 } },
      { t: '安住当下，珍惜日常', d: { wen:2, jing:1 } },
    ]
  },
  {
    q: '做决定时你更依赖？',
    opts: [
      { t: '直觉，凭感觉走', d: { rou:2, gan:1 } },
      { t: '逻辑，想清楚再动', d: { li:2, jing:1 } },
      { t: '经验，相信走过的路', d: { ren:2, deep:1 } },
      { t: '直觉+逻辑，结合来看', d: { ping:2 } },
    ]
  },
  {
    q: '你理想中生活的一天的开头是？',
    opts: [
      { t: '被阳光自然叫醒，慢悠悠吃早餐', d: { wen:2, jing:1 } },
      { t: '充满期待地醒来，今天有事做', d: { lie:2, dong:1 } },
      { t: '被闹钟叫醒，但也精神不错', d: { ren:1, li:1 } },
      { t: '无所谓，每天都不一样', d: { dong:1, rou:1 } },
    ]
  },
];

var CYBER_ARCHETYPES = [
  { key:'lie', name:'热烈的守护者', desc:'外冷内热，看似凌厉其实比谁都重情', colors:['朱砂','胭脂','石榴红','辰砂','赤缇','妃色','丹','赤金'] },
  { key:'wen', name:'温柔的守望者', desc:'细腻沉稳，你的存在本身就是一种安定', colors:['月白','天青','象牙白','藕荷','素色','檀色','霜白','缃色'] },
  { key:'jing', name:'清雅的隐士', desc:'自得其乐，不争不抢却自有力量', colors:['竹青','黛色','豆绿','茶绿','艾绿','绿沈','松花绿','缥色'] },
  { key:'dong', name:'不羁的追风者', desc:'停不下来，世界就是你的游乐场', colors:['橘红','酡红','杏黄','橙黄','琥珀','秋香','驼色','橘黄'] },
  { key:'deep', name:'深邃的探索者', desc:'心里藏着一片海，表面越平静底下越深', colors:['黛紫','藏蓝','墨色','靛青','乌黑','玄青','鸦青','铅灰'] },
  { key:'li', name:'通透的智者', desc:'看得透，想得清，活得通透', colors:['秘色','琉璃','霁青','青莲','石青','花青','涧石蓝','海青'] },
  { key:'rou', name:'轻盈的精灵', desc:'灵动可爱，走到哪里都带着春天的气息', colors:['桃红','樱红','葱绿','鹅黄','柳绿','翠绿','嫩绿','粉红'] },
  { key:'ren', name:'沉稳的山岳', desc:'不动如山，你说的话不多但每一句都算数', colors:['赭石','玄青','宝蓝','深蓝','酱色','墨色','棕褐','栗色'] },
];

var CYBER_DIM_NAMES = { jing:'静', wen:'温', lie:'烈', dong:'动', li:'理性', gan:'感性', rou:'柔', ren:'韧', deep:'深邃', wai:'外放', ping:'平衡' };

function switchCyberTab(tab) {
  var xunse = document.getElementById('input-screen');
  var cyber = document.getElementById('cyber-screen');
  var result = document.getElementById('result-screen');
  if (tab === 'xunse') {
    xunse.style.display = ''; cyber.style.display = 'none'; result.style.display = 'none';
    xunse.classList.remove('hide');
  } else {
    xunse.style.display = 'none'; cyber.classList.add('active'); result.style.display = 'none';
    renderCyberQuestions();
  }
  document.querySelectorAll('.cyber-tab').forEach(function(b,i){ b.classList.toggle('active', (tab==='xunse' && i===0) || (tab==='cyber' && i===1)); });
}
```

- [ ] **Step 2: 题目渲染 + 选项点击 + 评分计算**

```javascript
var _cyberAnswers = {};

function renderCyberQuestions() {
  var el = document.getElementById('cyber-qs');
  var letters = ['A','B','C','D'];
  el.innerHTML = CYBER_QUESTIONS.map(function(q, qi) {
    var optsHtml = q.opts.map(function(o, oi) {
      var sel = _cyberAnswers[qi] === oi ? ' selected' : '';
      return '<button class="cq-opt' + sel + '" onclick="selectCyberAnswer(' + qi + ',' + oi + ')">' +
        '<span class="cq-let">' + letters[oi] + '</span>' + o.t + '</button>';
    }).join('');
    return '<div class="cq"><div class="cq-q"><span class="cq-num">' + (qi+1) + '</span>' + q.q + '</div>' + optsHtml + '</div>';
  }).join('');
}

function selectCyberAnswer(qi, oi) {
  _cyberAnswers[qi] = oi;
  renderCyberQuestions();
}
```

- [ ] **Step 3: 评分计算 + 原型匹配 + 颜色锁定**

```javascript
function calcCyberColor() {
  var name = document.getElementById('ci-name').value.trim();
  var birth = document.getElementById('ci-birth').value.trim();
  var answered = Object.keys(_cyberAnswers).length;
  if (answered < 5) { alert('答完所有题目才能占色 ✨'); return; }

  // 累加维度分值
  var dims = {};
  for (var qi = 0; qi < 5; qi++) {
    var oi = _cyberAnswers[qi];
    var d = CYBER_QUESTIONS[qi].opts[oi].d;
    for (var k in d) { dims[k] = (dims[k] || 0) + d[k]; }
  }

  // 找出最高分维度
  var maxDim = Object.keys(dims).sort(function(a,b){ return (dims[b]||0) - (dims[a]||0); })[0];

  // 找对应原型
  var archetype = null;
  for (var i = 0; i < CYBER_ARCHETYPES.length; i++) {
    if (CYBER_ARCHETYPES[i].key === maxDim) { archetype = CYBER_ARCHETYPES[i]; break; }
  }
  if (!archetype) {
    for (var i = 0; i < CYBER_ARCHETYPES.length; i++) {
      if (CYBER_ARCHETYPES[i].colors.indexOf(archetypeName) >= 0) { archetype = CYBER_ARCHETYPES[i]; break; }
    }
  }
  // fallback: 随机
  if (!archetype) { archetype = CYBER_ARCHETYPES[Math.floor(Math.random() * CYBER_ARCHETYPES.length)]; }

  // 在原型候选色中 DJB2 哈希
  var seed = (name || '佚名') + '|' + (birth || '01/01');
  var h = 5381;
  for (var si = 0; si < seed.length; si++) { h = ((h<<5)+h+seed.charCodeAt(si)) & 0x7fffffff; }
  var colorName = archetype.colors[h % archetype.colors.length];

  // 从 COLORS 找完整色对象
  var color = null;
  for (var ci = 0; ci < COLORS.length; ci++) { if (COLORS[ci].name === colorName) { color = COLORS[ci]; break; } }
  if (!color) { color = getColor(name || 'default'); }

  showCyberColor(color, archetype, name, birth);
}
```

- [ ] **Step 4: 提交**

```bash
git add index.html
git commit -m "feat: 赛博占色评分引擎+原型匹配+题目UI交互"
```

---

### Task 3: 本命色结果页 + 性格解读

**Files:**
- Modify: `d:/xunse-v3/index.html`

**Interfaces:**
- Consumes: `calcCyberColor()` 输出的 color + archetype 对象
- Produces: `showCyberColor()` → 渲染 `#cyber-result` 内容区域

- [ ] **Step 1: CSS — 结果页**

```css
#cyber-result { max-width:460px; margin:0 auto; text-align:center; }
.cyber-card-wrap { position:relative; margin:0 auto 20px; border-radius:24px; overflow:hidden; box-shadow:0 12px 48px rgba(0,0,0,0.4); }
.cyber-card-color { width:100%; height:240px; display:flex; flex-direction:column; align-items:center; justify-content:center; transition:background 0.6s; }
.cyber-card-color .cc-name { font-size:48px; font-weight:700; color:#fff; text-shadow:0 2px 12px rgba(0,0,0,0.35); letter-spacing:0.1em; }
.cyber-card-color .cc-archetype { font-size:16px; color:rgba(255,255,255,0.85); margin-top:6px; letter-spacing:0.06em; text-shadow:0 1px 4px rgba(0,0,0,0.3); }
.cyber-card-color .cc-poem { font-size:14px; color:rgba(255,255,255,0.65); margin-top:12px; font-style:italic; opacity:0.85; }
.cyber-card-info { background:rgba(255,255,255,0.03); padding:20px; border-radius:0 0 24px 24px; border:1px solid rgba(255,255,255,0.06); border-top:none; }
.cyber-card-info .ci-hex { font-size:12px; color:rgba(255,255,255,0.3); font-family:monospace; margin-bottom:10px; }
.cyber-card-info .ci-name { font-size:14px; color:rgba(255,255,255,0.5); margin-bottom:4px; }
.cyber-card-info .ci-desc { font-size:15px; color:#d5cbb5; line-height:1.8; }

.cyber-actions { display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:20px; }
.cyber-actions .ca-btn { padding:12px 24px; border-radius:50px; font-size:14px; font-family:inherit; cursor:pointer; transition:all 0.25s; }
.cyber-actions .ca-btn.primary { background:rgba(201,169,110,0.15); border:1px solid rgba(201,169,110,0.35); color:#c9a96e; }
.cyber-actions .ca-btn.secondary { background:transparent; border:1px solid rgba(255,255,255,0.1); color:rgba(255,255,255,0.5); }
.cyber-actions .ca-btn:hover { filter:brightness(1.3); }
```

- [ ] **Step 2: JS — showCyberColor 结果渲染**

```javascript
function showCyberColor(color, archetype, name, birth) {
  var div = document.getElementById('cyber-screen');
  var result = document.getElementById('cyber-result');
  // 隐藏题目区，显示结果
  document.getElementById('cyber-qs').style.display = 'none';
  document.querySelector('.cyber-submit').style.display = 'none';
  document.querySelector('.cyber-inputs').style.display = 'none';

  var poem = color.poem || '';
  var poetSrc = '';
  if (color.poet && color.poet !== '—') poetSrc += color.poet;
  if (color.dynasty && color.dynasty !== '—') poetSrc += ' · ' + color.dynasty;
  if (color.source && color.source !== '—') poetSrc += ' 《' + color.source + '》';
  if (poem) poem = poem.replace(/^「|」$/g, '');

  result.style.display = 'block';
  result.innerHTML =
    '<div class="cyber-card-wrap">' +
      '<div class="cyber-card-color" style="background:' + color.hex + '">' +
        '<div class="cc-name">' + color.name + '</div>' +
        '<div class="cc-archetype">' + archetype.name + '</div>' +
        (poem ? '<div class="cc-poem">「' + poem + '」</div>' : '') +
      '</div>' +
      '<div class="cyber-card-info">' +
        '<div class="ci-hex">' + color.hex + ' · RGB(' + color.r + ',' + color.g + ',' + color.b + ')</div>' +
        (name ? '<div class="ci-name">' + name + (birth ? ' · ' + birth : '') + '</div>' : '') +
        '<div class="ci-desc">' + archetype.desc + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="cyber-actions">' +
      '<button class="ca-btn primary" onclick="genCyberCard()">📸 生成分享卡片</button>' +
      '<button class="ca-btn secondary" onclick="resetCyber()">🔄 重新占色</button>' +
    '</div>';
}

function resetCyber() {
  _cyberAnswers = {};
  document.getElementById('cyber-qs').style.display = '';
  document.querySelector('.cyber-submit').style.display = '';
  document.querySelector('.cyber-inputs').style.display = '';
  document.getElementById('cyber-result').style.display = 'none';
  renderCyberQuestions();
}
```

- [ ] **Step 3: 提交**

```bash
git add index.html
git commit -m "feat: 本命色结果页+性格解读+色卡展示"
```

---

### Task 4: Canvas 分享卡片生成（1080×1440px）

**Files:**
- Modify: `d:/xunse-v3/index.html`

**Interfaces:**
- Consumes: `showCyberColor()` 渲染的 color + archetype 信息（从 `_lastCyberResult` 全局取）
- Produces: `genCyberCard()` → Canvas 渲染 → 下载

- [ ] **Step 1: 保存最后结果到全局变量**

在 `showCyberColor` 顶部加：
```javascript
function showCyberColor(color, archetype, name, birth) {
  window._lastColor = color;
  window._lastArchetype = archetype;
  window._lastName = name;
  window._lastBirth = birth;
  // ... rest
}
```

- [ ] **Step 2: Canvas 分享卡片生成函数**

```javascript
function genCyberCard() {
  var color = window._lastColor;
  var archetype = window._lastArchetype;
  if (!color || !archetype) return;

  var W = 1080, H = 1440;
  var canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  var ctx = canvas.getContext('2d');

  // 背景：大色块铺满
  ctx.fillStyle = color.hex;
  ctx.fillRect(0, 0, W, H);

  // 左上角装饰线
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fillRect(80, 80, 60, 2);
  ctx.fillRect(80, 80, 2, 60);

  // 右上角装饰线
  ctx.fillRect(W-140, 80, 60, 2);
  ctx.fillRect(W-82, 80, 2, 60);

  // 左下角
  ctx.fillRect(80, H-82, 60, 2);
  ctx.fillRect(80, H-142, 2, 60);

  // 右下角
  ctx.fillRect(W-140, H-82, 60, 2);
  ctx.fillRect(W-82, H-142, 2, 60);

  // 标题：赛博占色
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = '14px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('· 赛 博 占 色 ·', W/2, 128);

  // 色名（大字）
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 96px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 20;
  ctx.fillText(color.name, W/2, 380);
  ctx.shadowBlur = 0;

  // 色格名
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = '28px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText(archetype.name, W/2, 460);

  // 分隔线
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(W/2-40, 500, 80, 1);

  // 古诗
  var poem = (color.poem || '').replace(/^「|」$/g, '') || '一色一世界';
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.font = '22px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText('「' + poem + '」', W/2, 560);

  // 性格描述
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.font = '20px "PingFang SC","Microsoft YaHei",sans-serif';
  wrapText(ctx, archetype.desc, W/2, 640, 600, 34, 'rgba(255,255,255,0.55)');

  // 底部
  var nameStr = window._lastName || '';
  var birthStr = window._lastBirth || '';
  var infoLine = nameStr + (birthStr ? ' · ' + birthStr : '');
  if (infoLine) {
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.font = '18px "PingFang SC","Microsoft YaHei",sans-serif';
    ctx.fillText(infoLine, W/2, H - 260);
  }

  // 引导文案
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = '16px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText('我在这里测的 👇', W/2, H - 190);

  // 网址
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '18px "PingFang SC","Microsoft YaHei",sans-serif';
  ctx.fillText('taiweixiao.com', W/2, H - 150);

  // 色值小标
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  ctx.font = '12px monospace';
  ctx.fillText(color.hex + ' · RGB(' + color.r + ',' + color.g + ',' + color.b + ')', W/2, H - 100);

  // 下载
  var link = document.createElement('a');
  link.download = '赛博占色_' + color.name + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight, color) {
  if (!text || text.length === 0) return;
  // 简单的按字数分行
  var chars = text.split('');
  var lines = [];
  var cur = '';
  for (var i = 0; i < chars.length; i++) {
    if (ctx.measureText(cur + chars[i]).width > maxWidth && cur.length > 0) {
      lines.push(cur); cur = chars[i];
    } else { cur += chars[i]; }
  }
  if (cur) lines.push(cur);
  ctx.textAlign = 'center';
  lines.forEach(function(l, idx) {
    ctx.fillText(l, x, y + idx * lineHeight);
  });
}
```

- [ ] **Step 3: 验证 + 提交**

```bash
cd d:/xunse-v3 && node -e "var s=require('fs').readFileSync('index.html','utf8');console.log('OK size='+s.length);" && git add index.html && git commit -m "feat: 赛博占色分享卡片 Canvas生成+下载" && git push origin master --force
```

---

### Task 5: 集成测试 + 赛博占色默认入口

**Files:**
- Modify: `d:/xunse-v3/index.html`

- [ ] **Step 1: 验证全部 JS 块语法**

```bash
node -e "
var s=require('fs').readFileSync('index.html','utf8');
var parts=s.split(/<\/script>/);
var ok=true;
for(var i=0;i<parts.length-1;i++){
  var idx=parts[i].lastIndexOf('<script');
  if(idx<0||parts[i].substring(idx).indexOf('initGalaxy')>=0) continue;
  var code=parts[i].substring(idx).replace(/<script[^>]*>/,'');
  try{new Function(code)}catch(e){console.log('BLOCK'+(i+1)+' FAIL:'+e.message.substring(0,80));ok=false}
}
if(ok)console.log('ALL OK');
"
```

- [ ] **Step 2: 推送 + 打开验证**

```bash
git push origin master --force && sleep 20 && start https://taiweixiao.com
```

- [ ] **Step 3: 打开后手动验证流程**

```
1. 看到两个标签：「🔮 姓名寻色」「⭐ 赛博占色」
2. 点「⭐ 赛博占色」→ 显示姓名/生日输入 + 五道题
3. 选完五道题 → 点「✨ 开启占色」→ 出结果页（大色块+色名+色格名+诗+性格解读）
4. 点「📸 生成分享卡片」→ 下载 1080×1440px PNG
5. 点「🔄 重新占色」→ 回到题目
6. 切回「🔮 姓名寻色」→ 原版功能不受影响
```
