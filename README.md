# 可视化简历 · Resume Visualizer

上传简历 → 自动提取关键信息 → 生成「类 Tableau」信息图风格的可视化简历。
多模版可选、可在线编辑、可导出 PNG / PDF，支持中英文。

![Tableau template preview](./editor-tableau.png)

## 功能

- **上传解析**：PDF / DOCX / TXT，提取姓名、联系方式、带日期的工作经历、技能（含熟练度）、教育、KPI 统计。
- **LLM 抽取（厂商无关）**：结构化 JSON 输出。支持
  - **Claude API**（`@anthropic-ai/sdk`，tool-use 强制 schema）
  - **OpenAI 兼容 API**（OpenAI 及各类网关，`json_schema`）
  - **本地 Ollama**（`/api/chat` + structured outputs，完全离线）
  - **内置规则解析（mock）**：无任何 API Key 也能端到端体验，并作为云/本地失败时的兜底。
- **多模版**：
  - **Tableau Dashboard（默认）**——甘特职业时间轴 + 打包气泡图 + 点阵技能矩阵,1:1 对标公开的 Tableau 简历。
  - Tableau 信息图（深色侧栏 + KPI 卡 + 雷达 + 时间线）、极简时间线、深色 Bento。
- **可视化原子组件**（手写 SVG / CSS,零图表库依赖）：甘特时间轴(按类别配色)、打包气泡图(贪心螺旋布局)、点阵技能矩阵(分级)、技能条、雷达图、KPI 卡、仪表盘。
- **实时编辑**：左侧表单改字段/拖动技能熟练度，右侧即时预览（Zustand，状态本地持久化）。
- **导出**：客户端 `html-to-image` + `jspdf`，导出 PNG / PDF。

## 快速开始

```bash
npm install
cp .env.example .env.local   # 可选：配置 LLM Provider
npm run dev                  # http://localhost:3000
```

打开后拖入一份简历，或点「加载示例」直接预览。**不配置任何 Key 也能用**（走内置规则解析）。

## 使用方法

1. **上传简历**：打开 http://localhost:3000，把 PDF / DOCX / TXT 拖入虚线框，或点击选择文件（≤ 8MB）。没有简历可点「加载示例」。
2. **选择语言**：上传前可选「自动 / 中文 / English」，影响解析与模版文案（默认自动识别）。
3. **等待解析**：页面显示「正在分析简历…」。规则解析瞬间完成；本地 Ollama 视模型大小约需 30–90 秒；云端 API 几秒。完成后自动跳转编辑页。
4. **切换模版**：编辑页左上「选择模版」——默认 **Tableau Dashboard**，另有 Tableau 信息图 / 极简时间线 / 深色 Bento，点选即时切换。
5. **微调内容**：左侧表单可改姓名/头衔/联系方式/简介、编辑 KPI 卡、**拖动滑块**调技能熟练度（直接影响气泡大小与点阵分级），右侧实时预览。
6. **导出**：右上「导出 PNG / 导出 PDF」，纯前端生成，文件名取自姓名。
7. **顶部状态条**会显示本次实际使用的解析引擎（如 `ollama` / `anthropic` / `mock`），便于确认是否走了 LLM。

> 数据保存在浏览器本地（Zustand 持久化），刷新不丢失；重新上传会覆盖。

## 配置 LLM Provider

在 `.env.local` 设置 `LLM_PROVIDER` 及对应 Key（见 `.env.example`）：

| Provider | 关键变量 |
|---|---|
| `anthropic` | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` |
| `openai` | `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL` |
| `ollama` | `OLLAMA_HOST`, `OLLAMA_MODEL`（如 `qwen2.5`） |
| 未配置 | 自动回退到规则解析 `mock` |

> 密钥仅在服务端（`/api/extract`）使用，绝不进入客户端。

## 架构

```
上传 ─► 文本提取(unpdf/mammoth) ─► LLMProvider.extractResume() ─► ResumeData(Zod 校验)
                                                                      │
                                              可编辑表单 ◄────────────┤
                                                                      ▼
                                          模版渲染(吃同一份 ResumeData) ─► 预览 / PNG / PDF
```

核心是**单一数据契约** `ResumeData`（`src/lib/schema/resume.ts`）：所有模版只依赖它，新增模版无需改解析逻辑。

### 目录

```
src/
  lib/schema/resume.ts        # ResumeData 契约（单一事实来源）
  lib/extract/text.ts         # PDF/DOCX/TXT → 文本
  lib/llm/                    # provider 接口 + anthropic/openai/ollama/mock 实现 + 工厂
  components/viz/             # SVG 技能条/雷达/时间线/仪表盘/KPI 卡
  components/templates/       # 模版 + registry（在此注册新模版）
  components/editor/          # 编辑表单 + 导出按钮
  store/resumeStore.ts        # Zustand 状态（持久化）
  app/page.tsx                # 上传页
  app/editor/page.tsx         # 模版选择 + 预览 + 编辑
  app/api/extract/route.ts    # 上传→提取→抽取→ResumeData
```

## 脚本

```bash
npm run dev     # 开发
npm run build   # 生产构建（含类型检查）
npm test        # 单元测试（vitest）
```

## 更新与重启

改了代码、`.env.local`、`next.config.mjs`、`postcss.config.mjs` 后,**Turbopack 不会热重载这些配置**,需手动重启 dev server:

```bash
# 在运行 dev 的终端按 Ctrl+C,然后
npm run dev
# 若界面残留旧报错(常见于切换 Tailwind/依赖大版本后):
rm -rf .next && npm run dev
```

更新依赖:

```bash
npm install                 # 按 package.json 安装/补齐
npm run build               # 验证类型与构建(等价于一次完整类型检查)
npm test                    # 跑单元测试
```

注意事项:

- **不要在 `npm run dev` 运行时执行 `npm run build`**:二者共用 `.next/` 目录,构建会冲掉 dev 的运行时,导致 `__webpack_modules__[moduleId] is not a function`。要验证生产行为,先 build 再用 `npx next start -p <其它端口>`。
- **切换/升级 Ollama 模型**:改 `.env.local` 的 `OLLAMA_MODEL` 后重启;模型需已 `ollama pull <model>`。`OLLAMA_HOST` 容错写法(如漏 `http://`、写成 `0.0.0.0`)会自动归一化。
- **更换解析引擎**:改 `LLM_PROVIDER` 并填好对应 Key 后重启;顶部状态条会显示当前实际引擎。

## 后续可扩展

- 图片 / 扫描件 OCR（tesseract.js 或视觉模型）
- 分享链接持久化（Prisma + SQLite/Postgres，`/r/[slug]` 公开页）
- 更多模版与配色、服务端 puppeteer 高保真导出（中文字体）
