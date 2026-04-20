# Martin Vinyl's Record Store
### 一家只为你开的复古唱片店

**体验地址：** https://martinvinyls-record-store.vercel.app/

一个 AI 驱动的沉浸式音乐推荐体验。你不需要填问卷，不需要选标签——走进来，和店主聊聊天，他会为你挑一张唱片。

---

## 功能演示

### 主页 · 与店主对话
![主页对话演示](./docs/demo-chat.gif)

### 样带播放器
![样带播放器演示](./docs/demo-player.gif)

### 礼品包装台
![礼品包装台演示](./docs/demo-output.gif)

---

## 体验流程

```
走进店里  →  和马丁聊天  →  他为你挑唱片  →  带走它
```

1. 打开页面，和店主马丁·黑胶聊聊今天发生的事、你现在的心情
2. 点击对话中橙色高亮的词汇，收集**心情 / 风格 / 故事**标签
3. 标签积累到阈值后，系统自动推荐最契合你当下心境的音乐风格
4. 前往样带播放器试听，或直接去礼品包装台取走你的唱片

---

## 认识马丁·黑胶

55 岁，郁郁不得志的老派唱片店主。他不会给你鸡汤，不会假装热情，但他真的在听你说话。他的回复简短、犀利，偶尔讽刺，但总能说到点子上。

他不推荐任何现实中存在的音乐——货架上全是他自己的私藏，你在任何平台都找不到。

---

## 页面结构

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 主页 | 与 NPC 马丁·黑胶对话，收集情感标签 |
| `/player` | 样带播放器 | 7 种风格样带试听，波形可视化 |
| `/output` | 礼品包装台 | 展示推荐唱片封面，营造仪式感 |

---

## 音乐风格

| 编号 | 风格 | 曲目 |
|------|------|------|
| 00 | Background | Echoes of Vinyl |
| 01 | Barbershop | Burning Pages |
| 02 | Baroque | Echoes of Love |
| 03 | Blues | Ghosts of Yesterday |
| 04 | Big Band Jazz | Let It Fade |
| 05 | Funk & R&B | Lost Light |
| 06 | Hardcore Punk | Shattered Chains |

---

## 技术栈

- **框架**: Next.js (App Router)
- **样式**: Tailwind CSS v4
- **AI 对话**: DeepSeek API
- **音乐生成**: Suno
- **图像生成**: ComfyUI
- **字体**: IPix（像素风中文字体）

---

## 本地运行

```bash
# 安装依赖
npm install

# 配置环境变量
echo "DEEPSEEK_API_KEY=your_key_here" > .env.local

# 启动开发服务器
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可体验。

---

## 设计理念

**叙事驱动 UI** — 界面设计的第一原则不是"易用"，而是"沉浸"。每一个动画都服务于叙事：NPC 说完结束语后停止浮动（他在专心找唱片），波形随音乐起伏（情绪被可视化），唱片封面在空中漂浮（等待被取走的仪式感）。

**克制的橙色** — 整个界面只有一种强调色 `#ff9800`，模拟昏暗店铺中一盏台灯的光晕。温暖、怀旧、人情味。

---

*"你不是在找一首歌，你是在找一个懂你的人。"*  
*— Martin Vinyl*
