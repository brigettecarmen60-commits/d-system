import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { checkQuota, deductCredits } from "@/lib/usage"
import { getCreditCost } from "@/config/plans"
import { checkRateLimit, getClientIP } from "@/lib/rate-limit"
import { streamGenerate, selectModel } from "@/lib/llm/client"
import { parseScriptOutput } from "@/lib/llm/parser"
import { db } from "@/lib/db"

// Prompt configs — user-editable
import { buildIntelPrompt, buildIntelUserMessage } from "@/config/prompts/intel"
import { buildModeAPrompt, buildModeAUserMessage, buildModeARoutingPrompt, buildModeARoutingUserMessage, buildModeAGenUserMessage } from "@/config/prompts/traffic-mode-a"
import { buildModeBPrompt, buildModeBUserMessage, buildModeBRoutingPrompt, buildModeBRoutingUserMessage, buildModeBGenUserMessage } from "@/config/prompts/traffic-mode-b"
import { buildCognitivePrompt, buildCognitiveUserMessage, buildCognitiveRoutingPrompt, buildCognitiveRoutingUserMessage, buildCognitiveGenUserMessage } from "@/config/prompts/cognitive"
import { buildConversionTopicPrompt, buildConversionTopicUserMessage, buildConversionRoutingPrompt, buildConversionRoutingUserMessage, buildConversionGenUserMessage } from "@/config/prompts/conversion-topic"
import { buildTrustTopicPrompt, buildTrustTopicUserMessage, buildTrustRoutingPrompt, buildTrustRoutingUserMessage, buildTrustGenUserMessage } from "@/config/prompts/trust-topic"
import { buildScriptPrompt, buildScriptUserMessage, buildScriptRoutingPrompt, buildScriptRoutingUserMessage, buildScriptGenUserMessage } from "@/config/prompts/script"
import { buildPositioningPrompt, buildPositioningUserMessage } from "@/config/prompts/positioning"
import { buildCContentPrompt, buildCContentUserMessage } from "@/config/prompts/c-content"
import { buildRetroPrompt, buildRetroUserMessage, buildAccountRetroPrompt, buildAccountRetroUserMessage } from "@/config/prompts/retro"
import { buildSeedingPrompt } from "@/config/prompts/seeding"
import { buildRetellPrompt, buildRetellUserMessage } from "@/config/prompts/retell"
import { buildStoryPrompt, buildStoryRoutingPrompt, buildStoryRoutingUserMessage, buildStoryGenUserMessage } from "@/config/prompts/story"
import { buildSprintPrompt, buildSprintUserMessage } from "@/config/prompts/sprint"
import { buildWeiguiPrompt, buildWeiguiUserMessage } from "@/config/prompts/weigui"
import { buildHotTopicPrompt, buildHotTopicUserMessage } from "@/config/prompts/hot-topic"
import { buildScriptCopyPrompt, buildScriptCopyUserMessage } from "@/config/prompts/script"
import {
  extractAnglesFromOutput,
  extractCodesFromOutput,
  extractMoldsFromOutput,
  buildLockedAnalysis,
  buildRegenUserMessage,
} from "@/lib/llm/state-extractor"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"
export const maxDuration = 180

// ─── Auth ───────────────────────────────────────

async function getUserId(): Promise<string | null> {
  const session = await auth()
  if (session?.user?.id) return session.user.id

  // 开发环境：无需登录即可使用
  if (process.env.NODE_ENV !== "production") {
    try {
      const devEmail = "admin@dev.local"
      let user = await db.user.findUnique({ where: { email: devEmail } })
      if (!user) user = await db.user.create({ data: { email: devEmail, name: "管理员" } })
      const sub = await db.subscription.findUnique({ where: { userId: user.id } })
      if (!sub) {
        await db.subscription.create({ data: { userId: user.id, plan: "FREE", monthlyQuota: 50, quotaUsed: 0, quotaResetAt: new Date(Date.now() + 30 * 86400000) } })
      }
      const q = await checkQuota(user.id, "intel")
      if (!q.allowed) {
        try { await db.subscription.update({ where: { userId: user.id }, data: { quotaUsed: 0, quotaResetAt: new Date(Date.now() + 30 * 86400000) } }) } catch {}
      }
      return user.id
    } catch (e) {
      // 数据库不可用时（如Neon休眠），返回虚拟dev用户ID，跳过所有DB操作
      console.error("getUserId DB unreachable, using fake dev ID:", e)
      return "dev-no-db"
    }
  }

  // 生产环境：必须登录
  return null
}

// ─── SSE ────────────────────────────────────────

function sse(req: NextRequest, fn: (send: (d: object) => void) => Promise<void>): Response {
  const encoder = new TextEncoder()
  let closed = false
  const stream = new ReadableStream({
    async start(ctrl) {
      const send = (d: object) => { if (closed) return; try { ctrl.enqueue(encoder.encode(`data: ${JSON.stringify(d)}\n\n`)) } catch { closed = true } }
      // 心跳：每15秒发一个ping，防止手机断连
      const heartbeat = setInterval(() => { if (!closed) send({ type: "ping" }) }, 15000)
      try { await fn(send); clearInterval(heartbeat); ctrl.close() } catch (e: any) {
        clearInterval(heartbeat)
        if (e?.name === "AbortError" || req.signal.aborted) send({ type: "error", message: "已取消" })
        else { console.error(e); send({ type: "error", message: e.message || "生成失败" }) }
        ctrl.close()
      }
    },
    cancel() { closed = true },
  })
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive", "X-Accel-Buffering": "no" } })
}

// ─── POST Router ─────────────────────────────────

export async function POST(req: NextRequest) {
  let body; try { body = await req.json() } catch { return Response.json({ error: "请求格式错误" }, { status: 400 }) }
  const userId = await getUserId()
  if (!userId) return Response.json({ error: "请先登录" }, { status: 401 })

  // 频率限制
  const ip = getClientIP(req)
  const limit = checkRateLimit(ip, userId)
  if (!limit.allowed) {
    return Response.json({ error: `请求过于频繁，请 ${limit.retryAfter} 秒后重试` }, { status: 429 })
  }

  const mode = body.mode || "script"

  switch (mode) {
    case "intel":       return runIntel(req, userId, body)
    case "mode-a":      return runTopics2Pass(req, userId, body, buildModeAPrompt, buildModeARoutingPrompt, buildModeARoutingUserMessage, buildModeAGenUserMessage, "mode-a", "Mode A 纪实选题")
    case "mode-b":      return runTopics2Pass(req, userId, body, buildModeBPrompt, buildModeBRoutingPrompt, buildModeBRoutingUserMessage, buildModeBGenUserMessage, "mode-b", "Mode B 荒诞选题")
    case "mode-n":      return runTopics2Pass(req, userId, body, buildCognitivePrompt, buildCognitiveRoutingPrompt, buildCognitiveRoutingUserMessage, buildCognitiveGenUserMessage, "mode-n", "Gem1-N 认知选题")
    case "conversion":  return runTopics2Pass(req, userId, body, buildConversionTopicPrompt, buildConversionRoutingPrompt, buildConversionRoutingUserMessage, buildConversionGenUserMessage, "conversion", "E2 转化选题")
    case "trust":       return runTopics2Pass(req, userId, body, buildTrustTopicPrompt, buildTrustRoutingPrompt, buildTrustRoutingUserMessage, buildTrustGenUserMessage, "trust", "E3 信任选题")
    case "positioning":       return runPositioning(req, userId, body)
    case "c-content":        return runCContent(req, userId, body)
    case "retro":             return runRetro(req, userId, body)
    case "account-retro":     return runAccountRetro(req, userId, body)
    case "script":             return runScript(req, userId, body)
    case "script-copy":       return runScriptCopy(req, userId, body)
    case "seeding":           return runSeeding(req, userId, body)
    case "retell":            return runRetell(req, userId, body)
    case "story":            return runStory(req, userId, body)
    case "sprint":           return runSprint(req, userId, body)
    case "redian":           return runRedian(req, userId, body)
    case "weigui":           return runWeigui(req, userId, body)
    case "regen-mode-a":      return runRegenerate(req, userId, body, "mode-a")
    case "regen-mode-b":      return runRegenerate(req, userId, body, "mode-b")
    case "regen-mode-n":      return runRegenerate(req, userId, body, "mode-n")
    case "regen-conversion":  return runRegenerate(req, userId, body, "conversion")
    case "regen-trust":       return runRegenerate(req, userId, body, "trust")
    default:                  return Response.json({ error: "未知模式: " + mode }, { status: 400 })
  }
}

// ─── Intel (V3 + 搜索) ──────────────────────────

async function searchWeb(query: string): Promise<string> {
  const key = process.env.TAVILY_API_KEY
  if (!key) return ""

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ api_key: key, query, search_depth: "basic", max_results: 5 }),
    })
    if (!res.ok) return ""
    const data = await res.json()
    const results = data.results || []
    return results.map((r: any, i: number) =>
      `[${i + 1}] ${r.title}\n${r.content}\n来源: ${r.url}`
    ).join("\n\n")
  } catch { return "" }
}

async function runIntel(req: NextRequest, userId: string, body: any) {
  const { niche } = body
  if (!niche?.trim() || niche.trim().length < 2) return Response.json({ error: "请输入赛道" }, { status: 400 })
  const model = selectModel("intel")
  return sse(req, async (send) => {
    send({ type: "status", phase: "intel", message: "正在搜索6个维度真实数据…" })

    // 六维度分维搜索——每个维度一个独立query，结果独立编号
    const dimensions = {
      money:    `${niche} 市场规模 客单价 毛利率 收入 盈利模式 2024 2025`,
      pit:      `${niche} 行业乱象 失败原因 骗局 投诉 消费者踩坑 风险`,
      people:   `${niche} 用户画像 目标人群 消费者 购买动机 痛点`,
      landscape:`${niche} 竞争格局 头部品牌 市场份额 排名 新进入者`,
      traffic:  `${niche} 获客渠道 流量来源 推广方式 获客成本`,
      verdict:  `${niche} 行业前景 投资机会 风险提示 趋势 2025`,
    }

    const searches = await Promise.all([
      searchWeb(dimensions.money),
      searchWeb(dimensions.pit),
      searchWeb(dimensions.people),
      searchWeb(dimensions.landscape),
      searchWeb(dimensions.traffic),
      searchWeb(dimensions.verdict),
    ])

    const dimKeys = ["money", "pit", "people", "landscape", "traffic", "verdict"] as const
    const searchResults: Record<string, string> = {}
    let hitCount = 0
    dimKeys.forEach((key, i) => {
      if (searches[i]) { searchResults[key] = searches[i]; hitCount++ }
    })

    send({ type: "status", phase: "intel", message: `搜索完成（${hitCount}/6 维度有数据），正在分析…` })

    const r = await streamGenerate(
      buildIntelPrompt(),
      buildIntelUserMessage({ niche: niche.trim(), searchResults }),
      model,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )
    const cost = getCreditCost("intel").cost
    await deductCredits(userId, cost)
    send({ type: "done", intel: r.fullText, usage: r.usage, cost })
  })
}

// ─── Topics 2-Pass ───────────────────────────────

async function runTopics2Pass(
  req: NextRequest, userId: string, body: any,
  buildPrompt: () => string,
  buildRoutingPrompt: () => string,
  buildRoutingUser: (input: any) => string,
  buildGenUser: (input: any) => string,
  modeKey: string,
  label: string
) {
  const { niche, targetAudience, targetGap } = body
  if (!niche?.trim() || niche.trim().length < 2) return Response.json({ error: "请输入赛道" }, { status: 400 })
  return sse(req, async (send) => {
    // Pass 1: R1 路由分析
    send({ type: "status", phase: "topics", message: "正在扫描赛道…" })
    const routingModel = selectModel("topics") // R1
    const routingResult = await streamGenerate(
      buildRoutingPrompt(),
      buildRoutingUser({ niche: niche.trim(), dna: body.dna }),
      routingModel,
      () => {}, // 不流式输出路由JSON
      req.signal
    )
    let routingJson = routingResult.fullText
    // 提取JSON
    try { JSON.parse(routingJson.match(/```json\s*([\s\S]*?)```/)?.[1] || routingJson) } catch {
      routingJson = JSON.stringify({ error: "routing parse failed" })
    }

    // Pass 2: V3 选题生成
    send({ type: "status", phase: "topics", message: "正在生成选题…" })
    const genModel = selectModel("intel") // V3
    const r = await streamGenerate(
      buildPrompt(),
      buildGenUser({ niche: niche.trim(), routing: routingJson, dna: body.dna }),
      genModel,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )
    const cost = getCreditCost(modeKey).cost
    await deductCredits(userId, cost)

    // 保存再生状态
    try {
      await db.generationState.upsert({
        where: { userId_niche_mode: { userId, niche: niche.trim(), mode: modeKey } },
        create: {
          userId, niche: niche.trim(), mode: modeKey,
          lockedAnalysis: buildLockedAnalysis(modeKey, niche.trim(), body),
          usedAngles: extractAnglesFromOutput(r.fullText),
          usedCodes: extractCodesFromOutput(r.fullText),
          usedMolds: extractMoldsFromOutput(r.fullText),
        },
        update: {
          lockedAnalysis: buildLockedAnalysis(modeKey, niche.trim(), body),
          usedAngles: extractAnglesFromOutput(r.fullText),
          usedCodes: extractCodesFromOutput(r.fullText),
          usedMolds: extractMoldsFromOutput(r.fullText),
          batchCount: { increment: 0 },
        },
      })
    } catch (e) { console.error("保存再生状态失败:", e) }

    try {
      await db.topic.create({ data: { userId, niche: niche.trim(), mode: modeKey, content: r.fullText } })
    } catch (e) { console.error("保存选题失败:", e) }

    send({ type: "done" })
  })
}

// ─── Regenerate（热再生） ────────────────────────

async function runRegenerate(req: NextRequest, userId: string, body: any, baseMode: string) {
  const { niche } = body
  if (!niche?.trim()) return Response.json({ error: "请输入赛道" }, { status: 400 })

  const state = await db.generationState.findUnique({
    where: { userId_niche_mode: { userId, niche: niche.trim(), mode: baseMode } },
  })

  if (!state || !state.lockedAnalysis) {
    return Response.json({ needsColdStart: true, message: "无缓存状态，请先进行完整分析" }, { status: 409 })
  }

  const buildPrompt = getRegenBuilders(baseMode)
  const model = selectModel("topics")

  return sse(req, async (send) => {
    send({ type: "status", phase: "topics", message: "正在生成新一批选题…" })

    const userMsg = buildRegenUserMessage({
      niche: niche.trim(),
      mode: baseMode,
      lockedAnalysis: state.lockedAnalysis as Record<string, any>,
      usedAngles: state.usedAngles,
      usedCodes: state.usedCodes,
      usedMolds: state.usedMolds,
      batchCount: state.batchCount,
    })

    // 如果用户提供了DNA，追加到再生消息中
    const finalUserMsg = body.dna ? userMsg + "\n\n【DNA / 定位信息】\n" + body.dna : userMsg

    const r = await streamGenerate(buildPrompt(), finalUserMsg, model, (t: string) => send({ type: "chunk", content: t }), req.signal)
    const regenCost = getCreditCost(`regen-${baseMode}`).cost
    await deductCredits(userId, regenCost)

    // 更新已用追踪
    await db.generationState.update({
      where: { userId_niche_mode: { userId, niche: niche.trim(), mode: baseMode } },
      data: {
        usedAngles: { push: extractAnglesFromOutput(r.fullText) },
        usedCodes: { push: extractCodesFromOutput(r.fullText) },
        usedMolds: { push: extractMoldsFromOutput(r.fullText) },
        batchCount: { increment: 1 },
      },
    })

    send({ type: "done", regeneration: true, batchCount: state.batchCount + 1 })
  })
}

// 热再生时的prompt builder路由（复用已导入的config/prompts builder）
function getRegenBuilders(baseMode: string) {
  switch (baseMode) {
    case "mode-a": return buildModeAPrompt
    case "mode-b": return buildModeBPrompt
    case "mode-n": return buildCognitivePrompt
    case "conversion": return buildConversionTopicPrompt
    case "trust": return buildTrustTopicPrompt
    default: throw new Error("未知模式: " + baseMode)
  }
}

// ─── Positioning (V3) ────────────────────────────

async function runPositioning(req: NextRequest, userId: string, body: any) {
  const { niche, personalInfo } = body
  if (!niche?.trim() || niche.trim().length < 2) return Response.json({ error: "请输入赛道" }, { status: 400 })
  const model = selectModel("intel")
  return sse(req, async (send) => {
    send({ type: "status", phase: "positioning", message: "系统思考中，请稍候…" })
    const r = await streamGenerate(
      buildPositioningPrompt(),
      buildPositioningUserMessage({ niche: niche.trim(), personalInfo: personalInfo || "" }),
      model,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )
    const posCost = getCreditCost("positioning").cost
    await deductCredits(userId, posCost)
    send({ type: "done", usage: r.usage, cost: posCost })
  })
}

// ─── Retro (V3) ──────────────────────────────────

async function runRetro(req: NextRequest, userId: string, body: any) {
  const { topic } = body
  if (!topic?.trim()) return Response.json({ error: "请输入内容标题" }, { status: 400 })
  const model = selectModel("intel")
  return sse(req, async (send) => {
    send({ type: "status", phase: "retro", message: "系统思考中，请稍候…" })
    const r = await streamGenerate(
      buildRetroPrompt(),
      buildRetroUserMessage({
        topic: topic.trim(),
        purpose: body.purpose || "",
        publishDate: body.publishDate,
        platform: body.platform,
        performance: body.performance,
        conversion: body.conversion,
        comments: body.comments,
      }),
      model,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )
    const cost = getCreditCost("intel").cost
    await deductCredits(userId, cost)
    send({ type: "done", usage: r.usage, cost })
  })
}

// ─── 账号体检 Plan B ──────────────────────────

async function runAccountRetro(req: NextRequest, userId: string, body: any) {
  const { purpose, recent10, best, worst } = body
  if (!purpose?.trim() || !recent10?.trim()) return Response.json({ error: "请填写账号目的和近期数据" }, { status: 400 })
  const model = selectModel("intel")
  return sse(req, async (send) => {
    send({ type: "status", phase: "retro", message: "正在对比分析…" })
    const r = await streamGenerate(
      buildAccountRetroPrompt(),
      buildAccountRetroUserMessage({ purpose: purpose.trim(), recent10: recent10.trim(), best: best?.trim() || "", worst: worst?.trim() || "" }),
      model,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )
    const cost = getCreditCost("intel").cost
    await deductCredits(userId, cost)
    send({ type: "done", usage: r.usage, cost })
  })
}

// ─── 老C 内容推荐 ───────────────────────────────

async function runCContent(req: NextRequest, userId: string, body: any) {
  const { niche } = body  // niche field reused as user input text
  if (!niche?.trim() || niche.trim().length < 10) return Response.json({ error: "请多写一点。至少10个字，告诉我你手边有什么、日常在做什么。" }, { status: 400 })
  const model = selectModel("topics")
  return sse(req, async (send) => {
    send({ type: "status", phase: "c-content", message: "正在帮你看…" })
    const r = await streamGenerate(buildCContentPrompt(), buildCContentUserMessage({ content: niche.trim() }), model, (t: string) => send({ type: "chunk", content: t }), req.signal)
    const cost = getCreditCost("intel").cost
    await deductCredits(userId, cost)
    send({ type: "done" })
  })
}

// ─── Script (R1) ─────────────────────────────────

async function runScript(req: NextRequest, userId: string, body: any) {
  const { topic, contentType, dna } = body
  if (!topic?.trim()) return Response.json({ error: "请选择选题" }, { status: 400 })
  return sse(req, async (send) => {
    // Pass 1: R1 路由判定
    send({ type: "status", phase: "script", message: "正在分析选题，判定路由…" })
    const routingModel = selectModel("topics") // R1
    const routingResult = await streamGenerate(
      buildScriptRoutingPrompt(),
      buildScriptRoutingUserMessage({ topic: topic.trim() }),
      routingModel,
      () => {},
      req.signal
    )
    let routingJson = routingResult.fullText
    try { JSON.parse(routingJson.match(/```json\s*([\s\S]*?)```/)?.[1] || routingJson) } catch {
      routingJson = JSON.stringify({ type: "文案驱动", toWho: "Problem-aware", narrativeStructure: "认知颠覆", emotionPath: "确信→怀疑→恍然", tone: "深夜聊天型", relationship: "朋友交底", duration: "1-2min" })
    }

    // Pass 2: V3 写脚本
    send({ type: "status", phase: "script", message: "正在写脚本…" })
    const genModel = selectModel("intel") // V3
    const r = await streamGenerate(
      buildScriptPrompt(),
      buildScriptGenUserMessage({ topic: topic.trim(), routing: routingJson, contentType, dna }),
      genModel,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )

    const scriptCost = getCreditCost("script").cost
    await deductCredits(userId, scriptCost)
    send({ type: "done", usage: r.usage, cost: scriptCost })
  })
}

// ─── Story (人设故事) ──────────────────────────────

async function runStory(req: NextRequest, userId: string, body: any) {
  const { material, dna, medium } = body
  if (!material?.trim() || material.trim().length < 10) return Response.json({ error: "请多写一点素材。至少10个字。" }, { status: 400 })
  return sse(req, async (send) => {
    // Pass 1: R1 框架匹配
    send({ type: "status", phase: "story", message: "正在分析素材，匹配故事框架…" })
    const routingModel = selectModel("topics") // R1
    const routingResult = await streamGenerate(
      buildStoryRoutingPrompt(),
      buildStoryRoutingUserMessage({ material: material.trim(), dna }),
      routingModel,
      () => {},
      req.signal
    )
    let routingJson = routingResult.fullText
    try { JSON.parse(routingJson.match(/```json\s*([\s\S]*?)```/)?.[1] || routingJson) } catch {
      routingJson = JSON.stringify({ framework: "凡人之旅", medium: "口播", targetEmotion: "观众感受到这个人的真实和不容易", deityTemplate: "我命由我", anomalyType: "行为异常", endingPurpose: "信任型", techniques: ["愚者的死磕"], likability: "吃苦" })
    }

    // Pass 2: V3 写故事
    send({ type: "status", phase: "story", message: "正在写故事…" })
    const genModel = selectModel("intel") // V3
    const r = await streamGenerate(
      buildStoryPrompt(),
      buildStoryGenUserMessage({ material: material.trim(), routing: routingJson, dna, medium }),
      genModel,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )

    const storyCost = getCreditCost("script").cost
    await deductCredits(userId, storyCost)
    send({ type: "done", usage: r.usage, cost: storyCost })
  })
}

// ─── Retell (故事重述) ─────────────────────────

async function runRetell(req: NextRequest, userId: string, body: any) {
  const { material, framework, structure, emotion, medium } = body
  if (!material?.trim() || material.trim().length < 10) return Response.json({ error: "请多写一点素材。" }, { status: 400 })
  return sse(req, async (send) => {
    send({ type: "status", phase: "retell", message: "正在判定框架，重组故事…" })
    const genModel = selectModel("intel")
    const r = await streamGenerate(
      buildRetellPrompt(),
      buildRetellUserMessage({
        material: material.trim(),
        framework: framework || "auto",
        structure: structure || "auto",
        emotion: emotion || "auto",
        medium: medium || "auto",
      }),
      genModel,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )
    const cost = getCreditCost("script").cost
    await deductCredits(userId, cost)
    send({ type: "done", usage: r.usage, cost: cost })
  })
}

// ─── Seeding (剧情种草) ─────────────────────────

async function runSeeding(req: NextRequest, userId: string, body: any) {
  const { product, face, vow, audience, framework, emotion, embedDepth } = body
  if (!product?.trim()) return Response.json({ error: "请输入产品信息" }, { status: 400 })
  return sse(req, async (send) => {
    send({ type: "status", phase: "seeding", message: "正在匹配框架，构建剧情…" })
    const genModel = selectModel("intel")

    const frameworkNames: Record<string, string> = {
      "time-entropy": "时间熵增与不可逆",
      "unequal-exchange": "关系中的非等价交换",
      "mirror-reconciliation": "镜像与和解",
      "giant-mayfly": "巨物与蜉蝣",
      "ordinary-journey": "凡人之旅",
      "genuine-closure": "真诚的闭环",
      "hidden-order": "隐秘的秩序",
    }
    const emotionNames: Record<string, string> = {
      "warm": "温暖",
      "release": "释然",
      "laugh": "笑",
      "surprise": "惊喜",
      "regret-warm": "遗憾但温暖",
      "anger-clarity": "愤怒后清醒",
      "absurd-relief": "荒诞后释然",
      "admiration": "向下兼容的仰视",
      "loved-unseen": "被世界暗中爱着",
      "fullness": "充盈——原来我一直被爱",
    }
    const embedDepthNames: Record<string, string> = {
      "bg-prop": "浅：产品只入镜，不主讲。故事完全独立于产品成立。",
      "narrative-carrier": "中：产品推动故事，但人是主角。产品最多3次，每次不超过2秒。",
      "no-embed": "不提产品：故事完全不出现产品。只建立信任。观众因为信这个人而主动问。",
    }

    const frameworkLine = framework && framework !== "auto"
      ? `【指定框架】${frameworkNames[framework] || framework}`
      : "【框架】自动匹配——请根据产品的情绪时刻、假信念、观众感受三个问题自行判定，并在脚本开头声明所选框架。如果多次生成同一产品，请主动换一个框架试试，不要每次都选同一个。"
    const emotionLine = emotion && emotion !== "auto"
      ? `【指定情绪落点】${emotionNames[emotion] || emotion}`
      : "【情绪落点】自动匹配——请在脚本开头声明所选情绪落点。如果多次生成同一产品，请主动换一个情绪试试。"

    const embedDepthLine = embedDepth && embedDepthNames[embedDepth]
      ? `【嵌入深度】${embedDepthNames[embedDepth]} 这是硬约束，必须严格遵守。`
      : ""

    const userMsg = [
      `【产品】${product}`,
      face ? `【人设脸谱】${face}` : "",
      vow ? `【发愿】${vow}` : "",
      audience ? `【目标人群】${audience}` : "",
      frameworkLine,
      emotionLine,
      embedDepthLine,
      "",
      "## 输出要求",
      "1. 最终输出只包含脚本本身——不要任何声明行、框架名、技法名、情绪标签。直接出脚本。",
      "2. 脚本按时间轴：🎥画面 / 🎙️台词 / ⏱时长",
      "3. 脚本末尾：【产品出现位置】第X秒，XX角色，X秒",
      "4. 选框架、技法、情绪是你的内部决策过程——在脑内完成，不要写到输出里。",
      "5. 如果选auto，同一产品多次生成时：换框架、换技法组合、换情绪落点。不要重复上一轮的组合。",
    ].filter(Boolean).join("\n")

    const r = await streamGenerate(
      buildSeedingPrompt(),
      userMsg,
      genModel,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )

    const cost = getCreditCost("seeding").cost
    await deductCredits(userId, cost)
    send({ type: "done", usage: r.usage, cost })
  })
}

// ─── Sprint (V3) ────────────────────────────────

async function runSprint(req: NextRequest, userId: string, body: any) {
  const { stage, goal, niche, recentData } = body
  if (!stage?.trim() || !goal?.trim()) return Response.json({ error: "请选择账号阶段并填写季度目标" }, { status: 400 })
  const model = selectModel("intel")
  return sse(req, async (send) => {
    send({ type: "status", phase: "sprint", message: "正在诊断现状，设定Season OKR…" })
    const r = await streamGenerate(
      buildSprintPrompt(),
      buildSprintUserMessage({ stage: stage.trim(), goal: goal.trim(), niche: niche?.trim(), recentData: recentData?.trim() }),
      model,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )
    const cost = getCreditCost("sprint").cost
    await deductCredits(userId, cost)
    send({ type: "done", usage: r.usage, cost })
  })
}

// ─── Script Copy (纯文案模式，双pass) ───────────

async function runScriptCopy(req: NextRequest, userId: string, body: any) {
  const { topic, contentType, dna } = body
  if (!topic?.trim()) return Response.json({ error: "请选择选题" }, { status: 400 })
  return sse(req, async (send) => {
    // Pass 1: R1 路由判定（复用script routing）
    send({ type: "status", phase: "script", message: "正在分析选题，判定路由…" })
    const routingModel = selectModel("topics")
    const routingResult = await streamGenerate(
      buildScriptRoutingPrompt(),
      buildScriptRoutingUserMessage({ topic: topic.trim() }),
      routingModel,
      () => {},
      req.signal
    )
    let routingJson = routingResult.fullText
    try { JSON.parse(routingJson.match(/```json\s*([\s\S]*?)```/)?.[1] || routingJson) } catch {
      routingJson = JSON.stringify({ type: "文案驱动", toWho: "Problem-aware", narrativeStructure: "认知颠覆", emotionPath: "确信→怀疑→恍然", tone: "深夜聊天型", relationship: "朋友交底", duration: "1-2min" })
    }

    // Pass 2: V3 写纯文案（用copy prompt）
    send({ type: "status", phase: "script", message: "正在写口播稿…" })
    const genModel = selectModel("intel")
    const r = await streamGenerate(
      buildScriptCopyPrompt(),
      buildScriptCopyUserMessage({ topic: topic.trim(), routing: routingJson, contentType, dna }),
      genModel,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )

    const cost = getCreditCost("script-copy").cost
    await deductCredits(userId, cost)
    send({ type: "done", usage: r.usage, cost })
  })
}

// ─── Redian 热点选题 (V3 + 搜索) ──────────────────

async function runRedian(req: NextRequest, userId: string, body: any) {
  const { niche } = body
  if (!niche?.trim() || niche.trim().length < 2) return Response.json({ error: "请输入赛道" }, { status: 400 })
  const model = selectModel("intel")
  return sse(req, async (send) => {
    send({ type: "status", phase: "redian", message: "正在抓取多平台热点…" })

    // 搜索当前热点
    const [hot1, hot2] = await Promise.all([
      searchWeb(`${niche} 热点 热搜 最新话题 趋势 2025`),
      searchWeb(`${niche} 热门事件 社交媒体 爆款 2025`),
    ])
    const searchResults = [hot1, hot2].filter(Boolean).join("\n\n---\n\n")
    if (searchResults) {
      send({ type: "status", phase: "redian", message: "热点抓取完成，正在改编为选题…" })
    }

    const r = await streamGenerate(
      buildHotTopicPrompt(),
      buildHotTopicUserMessage({ niche: niche.trim(), searchResults: searchResults || undefined }),
      model,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )
    const cost = getCreditCost("redian").cost
    await deductCredits(userId, cost)
    send({ type: "done", usage: r.usage, cost })
  })
}

// ─── Weigui 违规检测 (V3) ────────────────────────

async function runWeigui(req: NextRequest, userId: string, body: any) {
  const { scriptContent } = body
  if (!scriptContent?.trim() || scriptContent.trim().length < 20) return Response.json({ error: "文案太短，至少20字" }, { status: 400 })
  const model = selectModel("intel")
  return sse(req, async (send) => {
    send({ type: "status", phase: "weigui", message: "正在扫描7类违规…" })
    const r = await streamGenerate(
      buildWeiguiPrompt(),
      buildWeiguiUserMessage({ scriptContent: scriptContent.trim() }),
      model,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )
    const cost = getCreditCost("weigui").cost
    await deductCredits(userId, cost)
    send({ type: "done", usage: r.usage, cost })
  })
}
