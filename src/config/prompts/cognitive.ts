// Gem1-N 共识挖掘 — System Prompt
// 模型：deepseek-reasoner (R1)
// 核心引擎与 traffic-mode-a.ts 共享（lib/llm/traffic-core.ts）
// 区别仅在定位语——mode-a 强调物理证据，mode-n 强调共识挖掘

import { buildTrafficCorePrompt, buildTrafficCoreUserMessage } from "@/lib/llm/traffic-core"

export function buildCognitivePrompt(): string {
  return buildTrafficCorePrompt({
    title: "# Gem1流量工厂 v9.0 — 共识挖掘",
    tagline: "不是找选题，是找共识。流量本质=你和一群人对某件事达成共识，他们自发帮你传播。选题公式：选母题→找人群共识→用行业提供答案。行业是容器，人性是主菜。",
  })
}

export function buildCognitiveUserMessage(input: {
  niche: string
  targetGap?: string
  targetAudience?: string
  dna?: string
}): string {
  return buildTrafficCoreUserMessage(input)
}
