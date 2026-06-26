// 活动追踪 + 管线状态管理（localStorage）
// Dashboard 页面数据源

export interface ActivityRecord {
  type: string       // 'analyze' | 'topics' | 'script' | 'positioning' | 'story' | 'seeding' | 'retro' | 'sprint'
  niche?: string
  title?: string
  timestamp: number
}

export function recordActivity(record: ActivityRecord) {
  try {
    const existing = JSON.parse(localStorage.getItem("recent-activity") || "[]")
    existing.unshift(record)
    localStorage.setItem("recent-activity", JSON.stringify(existing.slice(0, 50)))
  } catch { /* localStorage 不可用时静默失败 */ }
}

export function getRecentActivity(): ActivityRecord[] {
  try {
    return JSON.parse(localStorage.getItem("recent-activity") || "[]")
  } catch { return [] }
}

export interface PipelineStage {
  status: "complete" | "in_progress"
  niche: string
  timestamp: number
  title?: string
}

export function recordPipelineStage(stage: string, niche: string, title?: string) {
  try {
    const state = JSON.parse(localStorage.getItem("pipeline-state") || "{}")
    state[stage] = { status: "complete", niche, timestamp: Date.now(), title }
    localStorage.setItem("pipeline-state", JSON.stringify(state))
  } catch { /* localStorage 不可用时静默失败 */ }
}

export function getPipelineState(): Record<string, PipelineStage> {
  try {
    return JSON.parse(localStorage.getItem("pipeline-state") || "{}")
  } catch { return {} }
}

const TYPE_LABELS: Record<string, string> = {
  analyze: "赛道分析",
  positioning: "个人定位",
  topics: "选题生成",
  script: "写脚本",
  "script-copy": "纯文案脚本",
  story: "人设故事",
  seeding: "剧情种草",
  retro: "内容复盘",
  sprint: "两周冲刺",
}

export function getTypeLabel(type: string): string {
  return TYPE_LABELS[type] || type
}

const PIPELINE_STAGES = ["analyze", "positioning", "topics", "script", "seeding", "retro"]

export function getPipelineStages() {
  return PIPELINE_STAGES.map(key => ({
    key,
    label: TYPE_LABELS[key] || key,
    href: `/${key === "script" ? "script" : key === "seeding" ? "seeding" : key === "retro" ? "retro" : key === "topics" ? "topics" : key === "positioning" ? "positioning" : key}`,
  }))
}
