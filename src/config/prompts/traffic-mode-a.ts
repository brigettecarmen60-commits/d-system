// Mode A 纪实 — System Prompt（F系统纪实引擎 v3.0）
// 模型：deepseek-reasoner (R1)
// 核心引擎已提取到 lib/llm/traffic-core.ts（与 cognitive.ts 共享）

import { buildTrafficCorePrompt, buildTrafficCoreUserMessage } from "@/lib/llm/traffic-core"

export function buildModeAPrompt(): string {
  return buildTrafficCorePrompt({
    title: "# 老F纪实引擎 v3.0",
    tagline: "从赛道里找到所有人都有但没被说透的共识，用真实物理证据接住它。行业=容器，人性=主菜。",
  })
}

export function buildModeAUserMessage(input: {
  niche: string
  targetAudience?: string
  targetGap?: string
  dna?: string
}): string {
  return buildTrafficCoreUserMessage(input)
}
