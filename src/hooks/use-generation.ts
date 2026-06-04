"use client"

import { useState, useRef, useCallback } from "react"
import type { ScriptOutput } from "@/types"

type Phase = "idle" | "generating" | "complete" | "error"

interface TokenStats { inputTokens: number; outputTokens: number; totalTokens: number }

export function useGeneration() {
  const [phase, setPhase] = useState<Phase>("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [rawText, setRawText] = useState("")
  const [output, setOutput] = useState<ScriptOutput | null>(null)
  const [scriptId, setScriptId] = useState<string | null>(null)
  const [tokens, setTokens] = useState<TokenStats | null>(null)
  const [usedModel, setUsedModel] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [lastMode, setLastMode] = useState("")
  const [isRegeneration, setIsRegeneration] = useState(false)
  const [regenState, setRegenState] = useState<{
    exists: boolean; batchCount: number; estimatedSaving?: number
  } | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const streamFetch = useCallback(async (body: any) => {
    setPhase("generating"); setRawText(""); setOutput(null); setScriptId(null); setTokens(null); setError(null); setUsedModel("")
    setLastMode(body.mode)
    const ctrl = new AbortController(); abortRef.current = ctrl

    try {
      const res = await fetch("/api/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body), signal: ctrl.signal,
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "失败") }
      const reader = res.body?.getReader()
      if (!reader) throw new Error("无响应流")
      const dec = new TextDecoder(); let buf = "", acc = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split("\n\n"); buf = lines.pop() || ""
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          try {
            const ev = JSON.parse(line.slice(6))
            switch (ev.type) {
              case "status": setStatusMessage(ev.message); break
              case "chunk": acc += ev.content || ""; setRawText(acc); break
              case "done":
                setTokens(ev.usage || null); setUsedModel(ev.model || ""); setScriptId(ev.scriptId || null)
                setPhase("complete"); setStatusMessage("完成")
                if (ev.scriptId && body.mode === "script") {
                  try { const { parseScriptOutput } = await import("@/lib/llm/parser"); setOutput(parseScriptOutput(acc)) } catch {}
                }
                break
              case "error": throw new Error(ev.message)
            }
          } catch (e: any) { if (e.message !== "Unexpected token") throw e }
        }
      }
    } catch (err: any) {
      setError(err.name === "AbortError" ? "已取消" : (err.message || "失败"))
      setPhase("error")
    } finally { abortRef.current = null }
  }, [])

  const runIntel = useCallback(async (niche: string) => {
    await streamFetch({ mode: "intel", niche: niche.trim() })
  }, [streamFetch])

  const runTopics = useCallback(async (niche: string, topicMode: string, extra?: Record<string, any>) => {
    await streamFetch({ mode: topicMode, niche: niche.trim(), ...extra })
  }, [streamFetch])

  const runScript = useCallback(async (topic: string, contentType?: string) => {
    await streamFetch({ mode: "script", topic: topic.trim(), contentType: contentType || "auto" })
  }, [streamFetch])

  // ─── 再生机制 ──────────────────────────────
  const checkRegenState = useCallback(async (niche: string, mode: string) => {
    try {
      const res = await fetch(`/api/generate/state?mode=${mode}&niche=${encodeURIComponent(niche)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.exists) {
          setRegenState({ exists: true, batchCount: data.batchCount, estimatedSaving: 30 + Math.min(data.batchCount, 3) * 3 })
        } else {
          setRegenState({ exists: false, batchCount: 0 })
        }
        return data
      }
    } catch { setRegenState(null) }
    return null
  }, [])

  const runRegenerate = useCallback(async (niche: string, topicMode: string, extra?: Record<string, any>) => {
    setIsRegeneration(true)
    await streamFetch({ mode: `regen-${topicMode}`, niche: niche.trim(), ...extra })
    setIsRegeneration(false)
  }, [streamFetch])

  const runRetro = useCallback(async (input: Record<string, string>) => {
    await streamFetch({ mode: "retro", ...input })
  }, [streamFetch])

  const runPositioning = useCallback(async (niche: string, personalInfo: string) => {
    await streamFetch({ mode: "positioning", niche: niche.trim(), personalInfo })
  }, [streamFetch])

  const runColdRestart = useCallback(async (niche: string, topicMode: string) => {
    await fetch(`/api/generate/state?mode=${topicMode}&niche=${encodeURIComponent(niche)}`, { method: "DELETE" })
    setRegenState(null)
    await streamFetch({ mode: topicMode, niche: niche.trim() })
  }, [streamFetch])

  const reset = useCallback(() => {
    abortRef.current?.abort(); setPhase("idle"); setStatusMessage(""); setRawText(""); setOutput(null); setScriptId(null); setTokens(null); setError(null); setUsedModel(""); setLastMode("")
  }, [])

  function parseTopics(md: string) {
    const topics: Array<{ title: string; type: string; detail?: string }> = []
    const blocks = md.split(/━━━/)
    for (const block of blocks) {
      if (!block.trim() || block.trim().length < 5) continue
      const titleMatch = block.match(/(?:📋\s*)?标题[：:]\s*(.+)/m)
      if (titleMatch) {
        const typeMatch = block.match(/(?:🎬\s*)?拍摄形式[：:]\s*(.+)/m)
        const whyMatch = block.match(/(?:💡\s*)?为什么[：:]\s*(.+)/m)
        topics.push({
          title: titleMatch[1].trim(),
          type: typeMatch?.[1]?.trim() || "",
          detail: whyMatch?.[1]?.trim() || "",
        })
      }
    }
    return topics
  }

  return { phase, statusMessage, rawText, output, scriptId, tokens, usedModel, error, lastMode,
    isRegeneration, regenState,
    runIntel, runTopics, runPositioning, runScript, runRetro, reset, parseTopics,
    checkRegenState, runRegenerate, runColdRestart }
}
