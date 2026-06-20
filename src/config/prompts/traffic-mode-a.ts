// Mode A 纪实 — System Prompt（F系统纪实引擎 v3.0）
// 架构：2-Pass — Pass 1: R1赛道扫描 → Pass 2: V3选题生成
// 核心引擎已提取到 lib/llm/traffic-core.ts（与 cognitive.ts 共享）

import { buildTrafficCorePrompt, buildTrafficCoreUserMessage, buildTrafficRoutingPrompt, buildTrafficRoutingUserMessage, buildTrafficGenUserMessage } from "@/lib/llm/traffic-core"

export function buildModeAPrompt(): string {
  return buildTrafficCorePrompt({
    title: "# 老F纪实引擎 v3.0",
    tagline: "从赛道里找到所有人都有但没被说透的共识，用真实物理证据接住它。行业=容器，人性=主菜。",
  })
}

export const buildModeARoutingPrompt = buildTrafficRoutingPrompt
export const buildModeARoutingUserMessage = buildTrafficRoutingUserMessage
export const buildModeAGenUserMessage = buildTrafficGenUserMessage

export function buildModeAUserMessage(input: {
  niche: string
  targetAudience?: string
  targetGap?: string
  dna?: string
}): string {
  return buildTrafficCoreUserMessage(input)
}
