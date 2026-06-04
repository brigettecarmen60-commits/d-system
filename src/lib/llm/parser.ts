import type {
  ScriptOutput,
  EmotionDesign,
  Recognition,
  ScriptOpening,
  ScriptSegment,
  ScriptClosing,
  TrustEvidence,
  CommentTrigger,
  ValidationL1L3,
  ValidationL4,
} from "@/types"

/**
 * Parse the structured markdown output from Gem4 into typed ScriptOutput.
 * Uses section headers as delimiters and regex patterns to extract fields.
 */
export function parseScriptOutput(rawText: string): ScriptOutput {
  return {
    emotionDesign: parseEmotionDesign(rawText),
    recognition: parseRecognition(rawText),
    scriptBody: {
      opening: parseOpening(rawText),
      middleSegments: parseMiddleSegments(rawText),
      closing: parseClosing(rawText),
    },
    attachments: {
      trustEvidence: parseTrustEvidence(rawText),
      commentTriggers: parseCommentTriggers(rawText),
    },
    validation: {
      l1l3: parseL1L3(rawText),
      l4: parseL4(rawText),
    },
  }
}

function extractSection(text: string, sectionName: string): string {
  const regex = new RegExp(
    `##\\s*[🎬🎯📝🔒💬✅🔍📊]*\\s*${sectionName}[\\s\\S]*?(?=##\\s|$)`,
    "i"
  )
  const match = text.match(regex)
  return match ? match[0] : ""
}

function parseEmotionDesign(text: string): EmotionDesign {
  const section = extractSection(text, "情绪设计")
  return {
    path: extractField(section, "情绪路径") || "认知颠覆",
    abTransition: extractField(section, "情绪A\\s*→\\s*B") || "",
    tonePersona: extractField(section, "语气人格") || "沉稳狠人型",
    intensity: extractField(section, "落差强度") || "拉满",
  }
}

function parseRecognition(text: string): Recognition {
  const section = extractSection(text, "识别结果")
  const typeLine = extractField(section, "类型") || ""
  const [driveType, contentType] = typeLine.split("|").map((s) => s.trim())
  return {
    driveType: driveType || "脚本驱动型",
    contentType: contentType || "流量型",
    chassisFormula: extractField(section, "底盘公式") || "",
    suggestedDuration: extractField(section, "建议时长") || "",
    infoPointCount: parseInt(extractField(section, "信息点数") || "0"),
  }
}

function parseOpening(text: string): ScriptOpening {
  const section = extractSection(text, "脚本正文")
  const openingSection = section.match(
    /###\s*开头[\s\S]*?(?=###\s*中段|$)/
  )?.[0] || section
  return {
    visual: extractField(openingSection, "Visual") || "",
    audio: extractField(openingSection, "Audio") || "",
    bridge: extractField(openingSection, "Bridge") || "",
    anomalyType: extractField(openingSection, "异常类型") || "",
    mode: extractField(openingSection, "模式") || "A",
  }
}

function parseMiddleSegments(text: string): ScriptSegment[] {
  const section = extractSection(text, "脚本正文")
  const middleSection = section.match(
    /###\s*中段[\s\S]*?(?=###\s*结尾|$)/
  )?.[0] || ""

  const segments: ScriptSegment[] = []
  const segmentRegex = /\[([\d-]+秒分]+)\]\s*🎙️\s*"([^"]*)"\s*📌\s*任务[：:]\s*(.+)/g
  let match
  while ((match = segmentRegex.exec(middleSection)) !== null) {
    segments.push({
      timeRange: match[1],
      audio: match[2],
      task: match[3].trim(),
    })
  }
  return segments
}

function parseClosing(text: string): ScriptClosing {
  const section = extractSection(text, "脚本正文")
  const closingSection = section.match(
    /###\s*结尾[\s\S]*?(?=##\s|$)/
  )?.[0] || ""
  return {
    audio: extractField(closingSection, "Audio") || "",
    closeType: extractField(closingSection, "闭环")?.includes("流量")
      ? "流量型"
      : extractField(closingSection, "闭环")?.includes("信任")
        ? "信任型"
        : "转化型",
    loopCheck: extractField(closingSection, "闭环") || "",
  }
}

function parseTrustEvidence(text: string): TrustEvidence[] {
  const section = extractSection(text, "信任证据")
  const evidence: TrustEvidence[] = []
  const regex = /类型[：:]\s*(.+?)\s*\|\s*内容[：:]\s*(.+)/g
  let match
  while ((match = regex.exec(section)) !== null) {
    evidence.push({ type: match[1].trim(), content: match[2].trim() })
  }
  return evidence.length > 0 ? evidence : [{ type: "经验背书", content: "" }]
}

function parseCommentTriggers(text: string): CommentTrigger[] {
  const section = extractSection(text, "评论触发器")
  const triggers: CommentTrigger[] = []
  const regex = /\d+[：:]\s*(.+?)\s*[—–-]\s*(.+)/g
  let match
  while ((match = regex.exec(section)) !== null) {
    triggers.push({ type: match[1].trim(), design: match[2].trim() })
  }
  return triggers
}

function parseL1L3(text: string): ValidationL1L3 {
  const section = extractSection(text, "终极校验")
  const l1l3Section = section.match(/L1-L3[\s\S]*?(?=L4|$)/i)?.[0] || section
  return {
    checks: {
      关系检验: l1l3Section.includes("关系"),
      外行检验: l1l3Section.includes("外行"),
      礼物检验: l1l3Section.includes("礼物"),
      主语检验: true,
      开头三验: true,
      闭环检验: true,
      语气一致: true,
      句长检查: true,
      AI腔扫描: true,
    },
    gift: extractField(l1l3Section, "礼物") || "",
    selfRatio: parseInt(
      extractField(l1l3Section, "我.*占比")?.replace(/\D/g, "") || "20"
    ),
  }
}

function parseL4(text: string): ValidationL4 {
  const section = extractSection(text, "终极校验")
  const l4Section = section.match(/L4[\s\S]*?(?=$)/i)?.[0] || section
  return {
    warmth: l4Section.includes("温度感") && l4Section.includes("✅"),
    uniqueness: l4Section.includes("独特性") && l4Section.includes("✅"),
    posture: l4Section.includes("姿态") && l4Section.includes("✅"),
    flow: l4Section.includes("心流") && l4Section.includes("✅"),
    notes: "",
  }
}

function extractField(text: string, fieldName: string): string {
  const patterns = [
    new RegExp(`${fieldName}[：:]\\s*(.+?)(?:\\n|$)`, "i"),
    new RegExp(`${fieldName}\\s*[：:]\\s*(.+?)(?:\\n|$)`, "i"),
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[1].trim()
  }
  return ""
}
