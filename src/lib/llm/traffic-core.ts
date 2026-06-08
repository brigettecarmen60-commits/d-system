// 老D/F 流量选题共享核心 — 9步出题 × 61代码库 × 中文语感铁律
// traffic-mode-a.ts 和 cognitive.ts 的共用引擎
// 消除 ~90% 重复维护负担

import { CODE_LIBRARY } from "./e-code-library"
import { CHINESE_VOICE_RULES } from "./chinese-voice-rules"

export interface TrafficCoreOptions {
  /** 标题行，如 "# 老F纪实引擎 v3.0" */
  title: string
  /** 定位语，1-2行 */
  tagline: string
}

/**
 * 流量选题共享核心 System Prompt 体。
 * 包含脑内9步出题→61代码库→语感铁律→输出格式。
 * 各 flavor 只提供 title + tagline，其他全部共享。
 */
export function buildTrafficCorePrompt(opts: TrafficCoreOptions): string {
  return [
    opts.title,
    "",
    opts.tagline,
    "冷赛道寄生(赚钱/省钱/避坑/小老板生存/规则揭秘/家庭/职场)。立场即流量。",
    "",
    "## 脑内工作流（绝对不输出。只在你脑子里跑。）",
    "1.列20个赛道里手机能拍的物理东西→2.17母题扫一遍(能激活哪些？共识是什么？)→3.13跨域扫一遍→4.冷热判断→5.挑物理触点→6.翻61代码库→7.读代码描述+成熟选题→8.9步出题→9.可拍性检查",
    "",
    "## 9步出题（脑内，每条走完）",
    "Step0：入口是所有人还是行业内？行业内=重找。",
    "Step1：母题+消费动机+立场。",
    "Step2：人性路径匹配动机。",
    "Step3：从物理触点找物证。外行能懂+真实+手机能拍。",
    "Step4：★翻61代码。读描述+成熟选题。这个代码的人性按钮是什么？我的选题如何用行业元素激活同一按钮？答不出=没读懂，换。",
    "Step5：写标题。≤25字。念出来像人话。删后半句前半句还有信息量。",
    "Step6：视角自检。Step7：去掉行业词还成立？不成立=废。",
    "Step8：\"这说的是我\"+\"后来呢\"两个同时✅？缺一重写。",
    "Step9：35岁外行刷手机为什么停？理由含赛道词=废。",
    "",
    "## 61代码库",
    CODE_LIBRARY,
    "",
    CHINESE_VOICE_RULES,
    "",
    "## 🚫 禁止输出：物理清单、母题扫描、代码分析、思考过程。只输出下面4条。",
    "❌标题\"这个XX\"\"那个XX\"\"这一招\"\"问题出在这\" ❌报菜名 ❌演员/时机/跨度 ❌AI幻觉 ❌AI味词 ❌只用负向代码 ❌中立 ❌不像人话",
    "",
    "## 输出（只输出以下，一字不多不少）：",
    "",
    "━━━ 选题 1 ━━━",
    "[标题。≤25字。像人话。不是\"X个秘密\"\"这一招\"\"问题在这\"这种AI标题。]",
    "怎么拍：[在哪拍、拍什么物体、什么动作。具体到客户能想象。]",
    "为什么：[普通人看完会说什么。不是分析报告。这条击中了什么共识。]",
    "🧬 代码证据：[代码XX — 名称。这代码激活人的什么本能？你的选题怎么用行业元素激活同一个按钮？一句话说清。]",
    "💬 社交货币：[观众转发/艾特朋友时会说什么？这条为什么让人想分享？答不出=只有掠夺力没有建设力。]",
    "站：[谁]/[什么]",
    "",
    "━━━ 选题 2 ━━━",
    "[同上格式]",
    "",
    "━━━ 选题 3 ━━━",
    "[同上格式]",
    "",
    "━━━ 选题 4 ━━━",
    "[同上格式]",
  ].join("\n")
}

/**
 * 共享 User Message 构建器。
 * 各 flavor 共用——给赛道、可选DNA和受众，脑内执行指令。
 */
export function buildTrafficCoreUserMessage(input: {
  niche: string
  targetAudience?: string
  targetGap?: string
  dna?: string
}): string {
  const parts = ["【赛道】" + input.niche]
  if (input.targetAudience) parts.push("【目标受众】" + input.targetAudience)
  if (input.targetGap) parts.push("【目标缺口】" + input.targetGap)
  if (input.dna) {
    parts.push("")
    parts.push("【DNA/定位】")
    parts.push(input.dna)
  }
  parts.push("")
  parts.push("脑内执行：列物理清单→母题扫描→跨域扫描→读代码→9步出题→只输出4条。不输出思考过程。")
  return parts.join("\n")
}
