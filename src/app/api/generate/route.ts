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
import { buildModeAPrompt, buildModeAUserMessage } from "@/config/prompts/traffic-mode-a"
import { buildModeBPrompt, buildModeBUserMessage } from "@/config/prompts/traffic-mode-b"
import { buildCognitivePrompt, buildCognitiveUserMessage } from "@/config/prompts/cognitive"
import { buildConversionTopicPrompt, buildConversionTopicUserMessage } from "@/config/prompts/conversion-topic"
import { buildTrustTopicPrompt, buildTrustTopicUserMessage } from "@/config/prompts/trust-topic"
import { buildScriptPrompt, buildScriptUserMessage, buildScriptRoutingPrompt, buildScriptRoutingUserMessage, buildScriptGenUserMessage } from "@/config/prompts/script"
import { buildPositioningPrompt, buildPositioningUserMessage } from "@/config/prompts/positioning"
import { buildCContentPrompt, buildCContentUserMessage } from "@/config/prompts/c-content"
import { buildRetroPrompt, buildRetroUserMessage, buildAccountRetroPrompt, buildAccountRetroUserMessage } from "@/config/prompts/retro"
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
    case "mode-a":      return runTopics(req, userId, body, buildModeAPrompt, buildModeAUserMessage, "Mode A 纪实选题")
    case "mode-b":      return runTopics(req, userId, body, buildModeBPrompt, buildModeBUserMessage, "Mode B 荒诞选题")
    case "mode-n":      return runTopics(req, userId, body, buildCognitivePrompt, buildCognitiveUserMessage, "Gem1-N 认知选题")
    case "conversion":  return runTopics(req, userId, body, buildConversionTopicPrompt, buildConversionTopicUserMessage, "E2 转化选题")
    case "trust":       return runTopics(req, userId, body, buildTrustTopicPrompt, buildTrustTopicUserMessage, "E3 信任选题")
    case "positioning":       return runPositioning(req, userId, body)
    case "c-content":        return runCContent(req, userId, body)
    case "retro":             return runRetro(req, userId, body)
    case "account-retro":     return runAccountRetro(req, userId, body)
    case "script":             return runScript(req, userId, body)
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
    send({ type: "status", phase: "intel", message: "正在搜索行业真实数据…" })

    // 搜索真实数据
    const [search1, search2] = await Promise.all([
      searchWeb(`${niche} 行业分析 市场规模 2024 2025`),
      searchWeb(`${niche} 痛点 竞争 趋势`),
    ])
    const searchResults = [search1, search2].filter(Boolean).join("\n\n---\n\n")
    if (searchResults) {
      send({ type: "status", phase: "intel", message: "搜索完成，正在分析…" })
    }

    const r = await streamGenerate(
      buildIntelPrompt(),
      buildIntelUserMessage({ niche: niche.trim(), searchResults: searchResults || undefined }),
      model,
      (t: string) => send({ type: "chunk", content: t }),
      req.signal
    )
    const cost = getCreditCost("intel").cost
    await deductCredits(userId, cost)
    send({ type: "done", intel: r.fullText, usage: r.usage, cost })
  })
}

// ─── Topics (R1) ─────────────────────────────────

async function runTopics(
  req: NextRequest, userId: string, body: any,
  buildPrompt: () => string, buildUser: (input: any) => string, label: string
) {
  const { niche, targetAudience, targetGap } = body
  if (!niche?.trim() || niche.trim().length < 2) return Response.json({ error: "请输入赛道" }, { status: 400 })
  const model = selectModel("topics")
  return sse(req, async (send) => {
    send({ type: "status", phase: "topics", message: "正在分析赛道，生成选题中…" })
    const r = await streamGenerate(buildPrompt(), buildUser({ niche: niche.trim(), targetAudience, targetGap, dna: body.dna }), model, (t: string) => send({ type: "chunk", content: t }), req.signal)
    const cost = getCreditCost(body.mode || "mode-a").cost
    await deductCredits(userId, cost)

    // 保存再生状态（冷启动后自动缓存分析结论）
    // DB表未创建时静默跳过，不影响主流程
    try {
      const modeKey = body.mode || "mode-a"
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
