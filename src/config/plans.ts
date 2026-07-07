// ─── 套餐定义 ──────────────────────────────

export const PLANS = {
  TRIAL: {
    name: "试用版",
    monthlyCredits: 150,
    price: 0,
    isOneTime: true,
    features: [
      "150 积分（够跑 3 次完整流程）",
      "全模式开放",
      "DeepSeek 引擎",
      "内测期间免费",
    ],
  },
  PRO: {
    name: "创作者版",
    monthlyCredits: 600,
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "600 积分/月（≈15 次完整流程）",
      "全模式开放",
      "DeepSeek 引擎",
      "热再生节省积分",
      "优先支持",
    ],
  },
  PLUS: {
    name: "工作室版",
    monthlyCredits: 2000,
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      "2000 积分/月（≈50 次完整流程）",
      "全模式开放",
      "DeepSeek 引擎",
      "Claude 深度模式（3x 积分）",
      "专属支持通道",
      "API 接入",
    ],
  },
} as const

export type PlanType = keyof typeof PLANS

// ─── 积分消耗表 ──────────────────────────────

export const CREDIT_COSTS = {
  intel:        { cost: 5, label: "赛道分析",        model: "deepseek-chat" },
  positioning:  { cost: 10, label: "个人定位",       model: "deepseek-chat" },
  "mode-a":     { cost: 4, label: "纪实选题-冷启动",  model: "deepseek-reasoner" },
  "mode-b":     { cost: 4, label: "荒诞选题-冷启动",  model: "deepseek-reasoner" },
  "mode-n":     { cost: 4, label: "共识选题-冷启动",  model: "deepseek-reasoner" },
  conversion:   { cost: 4, label: "转化选题-冷启动",  model: "deepseek-reasoner" },
  trust:        { cost: 4, label: "信任选题-冷启动",  model: "deepseek-reasoner" },
  // 热再生（跳过分析，同价）
  "regen-mode-a":    { cost: 4, label: "纪实选题-热再生", model: "deepseek-reasoner" },
  "regen-mode-b":    { cost: 4, label: "荒诞选题-热再生", model: "deepseek-reasoner" },
  "regen-mode-n":    { cost: 4, label: "共识选题-热再生", model: "deepseek-reasoner" },
  "regen-conversion": { cost: 4, label: "转化选题-热再生", model: "deepseek-reasoner" },
  "regen-trust":     { cost: 4, label: "信任选题-热再生", model: "deepseek-reasoner" },
  script:      { cost: 10, label: "脚本生成",        model: "deepseek-reasoner" },
  seeding:     { cost: 20, label: "剧情种草",        model: "deepseek-reasoner" },
  series:      { cost: 5,  label: "系列策划",        model: "deepseek-chat" },
  hit:         { cost: 5,  label: "共识挖掘",        model: "deepseek-chat" },
  "traffic-os": { cost: 3,  label: "创意实验室",     model: "deepseek-chat" },
  sprint:      { cost: 8,  label: "两周冲刺",        model: "deepseek-chat" },
  "script-copy": { cost: 8,  label: "纯文案脚本",    model: "deepseek-reasoner" },
  "convert-script": { cost: 10, label: "转化脚本",   model: "deepseek-reasoner" },
  redian:      { cost: 6,  label: "热点选题",        model: "deepseek-chat" },
  weigui:      { cost: 3,  label: "违规检测",        model: "deepseek-chat" },
  "traffic-os": { cost: 6,  label: "创意实验室",       model: "deepseek-chat" },
  // Claude 深度模式（未来）
  "claude-topic":  { cost: 6,  label: "Claude 深度选题", model: "claude" },
  "claude-script": { cost: 15, label: "Claude 深度脚本", model: "claude" },
} as const

export type CreditOperation = keyof typeof CREDIT_COSTS

// ─── 积分包（非订阅，一次性购买） ──────────

export const CREDIT_PACKS = [
  { id: "pack-30",  credits: 30,  price: 0,  label: "30 积分包" },
  { id: "pack-80",  credits: 80,  price: 0,  label: "80 积分包" },
  { id: "pack-200", credits: 200, price: 0,  label: "200 积分包" },
] as const

// ─── 工具函数 ──────────────────────────────

/** 获取操作的积分消耗和标签 */
export function getCreditCost(mode: string): { cost: number; label: string } {
  const entry = CREDIT_COSTS[mode as CreditOperation]
  if (entry) return { cost: entry.cost, label: entry.label }
  // 默认：选题冷启动 2 分
  return { cost: 2, label: mode }
}

/** 试算：一次完整流程需要多少积分 */
export function estimateFullFlow(): number {
  return CREDIT_COSTS.intel.cost + CREDIT_COSTS.positioning.cost +
    CREDIT_COSTS["mode-a"].cost + CREDIT_COSTS.script.cost
  // = 5 + 10 + 4 + 10 = 29
}
