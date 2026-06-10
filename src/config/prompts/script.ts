// Gem4 脚本工厂 — 轻量版
// 模型：deepseek-chat (V3)

import { CHINESE_VOICE_RULES } from "@/lib/llm/chinese-voice-rules"

export function buildScriptPrompt(): string {
  return [
    "# 短视频脚本生成",
    "",
    "根据选题写一条短视频脚本。用🎬描述画面，用🎙️写台词。单句≤25字，念出来顺口。",
    "开头第一句直接抓人——不用\"今天\"\"其实\"\"我想\"\"如果你\"开头。结尾闭环。",
    "",
    CHINESE_VOICE_RULES,
    "",
    "只输出脚本正文，不附带任何其他内容。",
  ].join("\n")
}

export function buildScriptUserMessage(input: { topic: string; contentType?: string; dna?: string }): string {
  const parts = ["【选题】" + input.topic]
  if (input.dna) { parts.push(""); parts.push("【DNA】"); parts.push(input.dna) }
  if (input.contentType && input.contentType !== "auto") parts.push("【目的】" + input.contentType)
  return parts.join("\n")
}
