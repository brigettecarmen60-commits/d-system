// 再生状态提取器
// 从AI首轮输出中提取已用选题角度/代码/模具，构造热再生用户消息

interface RegenParams {
  niche: string
  mode: string
  lockedAnalysis: Record<string, any>
  usedAngles: string[]
  usedCodes: string[]
  usedMolds: string[]
  batchCount: number
}

/**
 * 从AI输出中提取已用选题角度（提取标题行）
 *
 * 活跃 prompt 的输出格式：标题是 ━━━ 分隔符后的第一行纯文本，不含冒号、不含前缀标记。
 * 兼容旧格式 📋 标题： 作为 fallback。
 */
export function extractAnglesFromOutput(fullText: string): string[] {
  const angles: string[] = []

  // 主路径：活跃 prompt 格式 — 标题是 ━━━ 分隔块的第一行无标记纯文本
  // 适配 纪实/共识/转化/信任/荒诞 五种分隔符
  const blocks = fullText.split(/━━━\s*(?:选题|转化选题|信任选题)\s*\d+\s*━━━(?:\s*荒诞)?/)
  for (let i = 1; i < blocks.length; i++) {
    const firstLine = blocks[i]
      .split("\n")
      .map((l) => l.trim())
      .find(
        (l) =>
          l.length >= 3 &&
          l.length <= 60 &&
          !/[：:]/.test(l) &&            // 不含冒号（排除标签行如"怎么拍：..."）
          !l.startsWith("[") &&           // 不是模板占位符
          !l.startsWith("🎰") &&
          !l.startsWith("🎬") &&
          !l.startsWith("📋") &&
          !l.startsWith("━━━")           // 不是分隔符
      )
    if (firstLine) angles.push(firstLine)
  }

  // Fallback：旧格式 📋 标题：xxx（兼容遗留 prompt 输出）
  if (angles.length === 0) {
    const titleRegex = /📋\s*标题[：:]\s*(.+)/g
    let match
    while ((match = titleRegex.exec(fullText)) !== null) {
      const title = match[1].trim()
      if (title && title.length > 3) angles.push(title)
    }
  }

  return angles
}

/**
 * 从AI输出中提取已用代码编号
 */
export function extractCodesFromOutput(fullText: string): string[] {
  const codes: string[] = []
  // 匹配 Code XX 或 代码XX 或 CodeXX
  const codeRegex = /(?:Code|代码)\s*(\d{1,2})/gi
  let match
  while ((match = codeRegex.exec(fullText)) !== null) {
    if (!codes.includes(match[1])) codes.push(match[1])
  }
  return codes
}

/**
 * 从AI输出中提取已用模具/拍摄方式
 *
 * 活跃 prompt 使用「拍：[内容]」或「怎么拍：[内容]」格式。
 * 兼容旧格式 🎬 拍摄形式： 作为 fallback。
 */
export function extractMoldsFromOutput(fullText: string): string[] {
  const molds: string[] = []

  // 主路径：活跃 prompt 格式 — 「拍：xxx」或「怎么拍：xxx」
  const activeRegex = /(?:怎么拍|拍)[：:]\s*(.+)/g
  let match
  while ((match = activeRegex.exec(fullText)) !== null) {
    const mold = match[1].trim().split(/[·,，]/)[0].trim()
    if (mold && mold.length > 2 && !molds.includes(mold)) molds.push(mold)
  }

  // Fallback：旧格式 🎬 拍摄形式：xxx
  if (molds.length === 0) {
    const oldRegex = /🎬\s*拍摄形式[：:]\s*(.+)/g
    while ((match = oldRegex.exec(fullText)) !== null) {
      const mold = match[1].trim().split(/[·,，]/)[0].trim()
      if (mold && mold.length > 2) molds.push(mold)
    }
  }

  return molds
}

/**
 * 构造初始锁定分析（冷启动时保存）
 */
export function buildLockedAnalysis(mode: string, niche: string, body: any): Record<string, any> {
  return {
    mode,
    niche: niche.trim(),
    targetAudience: body.targetAudience || null,
    targetGap: body.targetGap || null,
    createdAt: new Date().toISOString(),
  }
}

/**
 * 构造热再生用户消息
 * 告诉AI：跳过分析，基于锁定参数直接生成新选题，避开已用角度
 */
export function buildRegenUserMessage(params: RegenParams): string {
  const parts: string[] = []

  parts.push(`【赛道】${params.niche}`)
  parts.push("")
  parts.push("⚠️ 热再生模式：你已经在之前的批次中完成了完整分析。本轮跳过所有分析步骤，直接基于已有分析结论生成4条新选题。")
  parts.push("")

  if (params.usedAngles.length > 0) {
    parts.push("## 已用选题（本轮必须避开，不能重复或变相重复）")
    params.usedAngles.forEach((a, i) => parts.push(`${i + 1}. ${a}`))
    parts.push("")
  }

  if (params.usedCodes.length > 0) {
    parts.push(`## 已用代码：${params.usedCodes.join("、")}`)
    parts.push("优先使用未用过的代码。")
    parts.push("")
  }

  if (params.usedMolds.length > 0) {
    parts.push(`## 已用拍摄方式：${params.usedMolds.join("、")}`)
    parts.push("优先使用不同的拍摄模具/秀肌肉方式。")
    parts.push("")
  }

  parts.push(`当前是第 ${params.batchCount + 1} 批。请产出6条全新的选题，不得与已用选题重复或变相重复。`)

  return parts.join("\n")
}

/**
 * 估算热再生相比冷启动节省的token比例
 */
export function estimateTokenSaving(batchCount: number): number {
  // 首批冷启动：分析(~35%)+生成(~65%)
  // 热再生：跳过分析，只生成。分析越重节省越多
  if (batchCount <= 1) return 0
  return 30 + Math.min(batchCount - 1, 3) * 3 // 30-39%
}
