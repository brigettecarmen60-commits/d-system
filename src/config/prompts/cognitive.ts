// Gem1-N 共识挖掘 — System Prompt
// 架构：2-Pass — Pass 1: R1赛道扫描 → Pass 2: V3选题生成
// 核心引擎与 traffic-mode-a.ts 共享（lib/llm/traffic-core.ts）

import { buildTrafficCorePrompt, buildTrafficCoreUserMessage, buildTrafficRoutingPrompt, buildTrafficRoutingUserMessage, buildTrafficGenUserMessage } from "@/lib/llm/traffic-core"

export function buildCognitivePrompt(): string {
  return buildTrafficCorePrompt({
    title: "# Gem1流量工厂 v9.0 — 共识挖掘",
    tagline: "不是找选题，是找共识。流量本质=你和一群人对某件事达成共识，他们自发帮你传播。选题公式：选母题→找人群共识→用行业提供答案。行业是容器，人性是主菜。",
  })
}

export const buildCognitiveRoutingPrompt = buildTrafficRoutingPrompt
export const buildCognitiveRoutingUserMessage = buildTrafficRoutingUserMessage
export const buildCognitiveGenUserMessage = buildTrafficGenUserMessage

export function buildCognitiveUserMessage(input: {
  niche: string
  targetGap?: string
  targetAudience?: string
  dna?: string
}): string {
  return buildTrafficCoreUserMessage(input)
}
