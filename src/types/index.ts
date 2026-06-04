// ─── Script Generation ───────────────────────────

export interface EmotionDesign {
  path: string // 情绪路径
  abTransition: string // 情绪A→B
  tonePersona: string // 语气人格
  intensity: string // 落差强度
}

export interface Recognition {
  driveType: string // 脚本驱动型 | 过程驱动型
  contentType: string // 流量型 | 转化型 | 信任型
  chassisFormula: string // 底盘公式
  suggestedDuration: string // 建议时长
  infoPointCount: number // 信息点数
}

export interface ScriptOpening {
  visual: string
  audio: string
  bridge: string
  anomalyType: string // 异常类型
  mode: string // A | B | C
}

export interface ScriptSegment {
  timeRange: string
  audio: string
  task: string // 推情绪 | 给价值
}

export interface ScriptClosing {
  audio: string
  closeType: string
  loopCheck: string
}

export interface TrustEvidence {
  type: string
  content: string
}

export interface CommentTrigger {
  type: string
  design: string
}

export interface ValidationL1L3 {
  checks: Record<string, boolean>
  gift: string
  selfRatio: number
}

export interface ValidationL4 {
  warmth: boolean
  uniqueness: boolean
  posture: boolean
  flow: boolean
  notes: string
}

export interface ScriptOutput {
  emotionDesign: EmotionDesign
  recognition: Recognition
  scriptBody: {
    opening: ScriptOpening
    middleSegments: ScriptSegment[]
    closing: ScriptClosing
  }
  attachments: {
    trustEvidence: TrustEvidence[]
    commentTriggers: CommentTrigger[]
  }
  validation: {
    l1l3: ValidationL1L3
    l4: ValidationL4
  }
}

// ─── API Types ────────────────────────────────────

export interface GenerateRequest {
  topic: string
  tonePreference?: string
  contentType?: string
  transferCard?: {
    persona?: string
    mission?: string
    stance?: string
    targetAudience?: string
    voice?: string
  }
}

export interface ScriptListItem {
  id: string
  topic: string
  emotionPath: string | null
  tonePersona: string | null
  chassisFormula: string | null
  contentType: string | null
  createdAt: string
  preview: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

// ─── SSE Event Types ──────────────────────────────

export type SSEEvent =
  | { type: "status"; phase: string; message: string }
  | { type: "chunk"; section: string; content: string }
  | {
      type: "done"
      scriptId: string
      usage: { inputTokens: number; outputTokens: number }
    }
  | { type: "error"; message: string; code?: string }
