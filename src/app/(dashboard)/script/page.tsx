"use client"

import { useState, useRef } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGeneration } from "@/hooks/use-generation"
import { PenLine, Loader2, Copy, RotateCcw, Sparkles, BarChart3, Shield, Check, AlertTriangle } from "lucide-react"
import { recordActivity, recordPipelineStage } from "@/lib/activity"
import { DnaPresetSelector } from "@/components/DnaPresetSelector"

export default function ScriptPage() {
  const searchParams = useSearchParams()
  const topicFromUrl = searchParams.get("topic") || ""
  const useDna = searchParams.get("useDna") === "true"

  const [topic, setTopic] = useState(topicFromUrl)
  const [contentType, setContentType] = useState("auto")
  const [dna, setDna] = useState("")
  const [scriptMode, setScriptMode] = useState<"framework" | "copy">("framework")
  const [structure, setStructure] = useState("auto")

  // 从定位页带过来的DNA
  if (useDna && !dna) {
    const stored = sessionStorage.getItem("last-dna")
    if (stored) setDna(stored)
  }

  const { phase, statusMessage, rawText, output, tokens, error, runScript, runScriptCopy, reset } = useGeneration()

  // ─── 违规检测（独立状态） ──────────────
  const [weiguiPhase, setWeiguiPhase] = useState<"idle" | "generating" | "complete" | "error">("idle")
  const [weiguiResult, setWeiguiResult] = useState("")
  const [weiguiError, setWeiguiError] = useState("")
  const weiguiAbortRef = useRef<AbortController | null>(null)

  async function handleWeiguiCheck() {
    setWeiguiPhase("generating")
    setWeiguiResult("")
    setWeiguiError("")
    const ctrl = new AbortController()
    weiguiAbortRef.current = ctrl
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "weigui", scriptContent: rawText }),
        signal: ctrl.signal,
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error || "检查失败") }
      const reader = res.body?.getReader()
      if (!reader) throw new Error("无响应流")
      const dec = new TextDecoder()
      let buf = "", acc = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += dec.decode(value, { stream: true })
        const lines = buf.split("\n\n"); buf = lines.pop() || ""
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue
          try {
            const ev = JSON.parse(line.slice(6))
            if (ev.type === "chunk") { acc += ev.content || ""; setWeiguiResult(acc) }
            else if (ev.type === "done") { setWeiguiPhase("complete") }
            else if (ev.type === "error") throw new Error(ev.message)
          } catch { /* skip parse errors */ }
        }
      }
    } catch (err: any) {
      setWeiguiError(err.name === "AbortError" ? "已取消" : (err.message || "检查失败"))
      setWeiguiPhase("error")
    }
  }

  function handleGenerate() {
    if (scriptMode === "copy") {
      runScriptCopy(topic, contentType, dna)
    } else {
      runScript(topic, contentType, dna, structure)
    }
  }

  // 活动追踪
  if (phase === "complete" && rawText) {
    recordActivity({ type: scriptMode === "copy" ? "script-copy" : "script", niche: topic, title: topic, timestamp: Date.now() })
    recordPipelineStage("script", topic)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><PenLine className="h-6 w-6 text-primary" />写脚本</h1>
      <p className="text-muted-foreground">输入选题，老D 自动判定类型→to who→叙事结构→管线执行。</p>

      {phase === "idle" && (
        <Card className="border shadow-sm shadow-sm">
          <CardContent className="p-6 space-y-4">
            {/* 模式切换 */}
            <Tabs value={scriptMode} onValueChange={(v) => setScriptMode(v as "framework" | "copy")}>
              <TabsList className="w-full">
                <TabsTrigger value="framework" className="flex-1">框架驱动</TabsTrigger>
                <TabsTrigger value="copy" className="flex-1">文案驱动</TabsTrigger>
              </TabsList>
            </Tabs>

            <Textarea
              placeholder={scriptMode === "framework"
                ? "输入选题，比如：为什么90%的人买保险都踩坑了？"
                : "输入选题，比如：我做了十年会计，最怕听到的一句话是…"}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="text-base resize-none bg-white/50 dark:bg-slate-900/50 border-border/50"
            />
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">传递卡 / DNA（可选）</label>
                <DnaPresetSelector dna={dna} onLoad={setDna} />
              </div>
              <Textarea
                placeholder="粘贴定位系统生成的 DNA JSON。也可以从上方预设加载。"
                value={dna}
                onChange={(e) => setDna(e.target.value)}
                rows={3}
                className="text-sm resize-none bg-white/50 dark:bg-slate-900/50 border-border/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">内容目的</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动判定</SelectItem>
                  <SelectItem value="流量型">流量型</SelectItem>
                  <SelectItem value="转化型">转化型</SelectItem>
                  <SelectItem value="信任型">信任型</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {scriptMode === "copy" && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">叙事结构</label>
              <Select value={structure} onValueChange={setStructure}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="max-h-80">
                  <SelectItem value="auto">自动判定 — 28选1</SelectItem>
                  <SelectItem value="SCQA">SCQA</SelectItem>
                  <SelectItem value="认知对撞">认知对撞</SelectItem>
                  <SelectItem value="黄金圈">黄金圈</SelectItem>
                  <SelectItem value="类比降维">类比降维</SelectItem>
                  <SelectItem value="辩证二元">辩证二元</SelectItem>
                  <SelectItem value="剥洋葱">剥洋葱</SelectItem>
                  <SelectItem value="英雄之旅">英雄之旅</SelectItem>
                  <SelectItem value="救猫咪">救猫咪</SelectItem>
                  <SelectItem value="悬疑盒子">悬疑盒子</SelectItem>
                  <SelectItem value="预期违背">预期违背</SelectItem>
                  <SelectItem value="倒叙悬念">倒叙悬念</SelectItem>
                  <SelectItem value="平行时空">平行时空</SelectItem>
                  <SelectItem value="起承转合">起承转合</SelectItem>
                  <SelectItem value="Harmon故事圈">Harmon故事圈</SelectItem>
                  <SelectItem value="情绪过山车">情绪过山车</SelectItem>
                  <SelectItem value="替身宣泄">替身宣泄</SelectItem>
                  <SelectItem value="时光机">时光机</SelectItem>
                  <SelectItem value="假如重来">假如重来</SelectItem>
                  <SelectItem value="镜像共鸣">镜像共鸣</SelectItem>
                  <SelectItem value="PAS">PAS</SelectItem>
                  <SelectItem value="FAB利益">FAB利益</SelectItem>
                  <SelectItem value="参照锚点">参照锚点</SelectItem>
                  <SelectItem value="信任阶梯">信任阶梯</SelectItem>
                  <SelectItem value="滞后揭示链">滞后揭示链</SelectItem>
                  <SelectItem value="证据链叙事">证据链叙事</SelectItem>
                  <SelectItem value="信息缺口">信息缺口</SelectItem>
                  <SelectItem value="阵营对立">阵营对立</SelectItem>
                  <SelectItem value="A/B对照实验">A/B对照实验</SelectItem>
                </SelectContent>
              </Select>
            </div>
            )}
            <Button onClick={handleGenerate} disabled={!topic.trim()} className="w-full h-11 smooth">
              <Sparkles className="h-4 w-4 mr-2" />
              {scriptMode === "copy" ? "生成口播稿" : "生成脚本"}
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card className="border shadow-sm shadow-sm">
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <p className="text-lg font-medium">{statusMessage}</p>
            <p className="text-sm text-muted-foreground">路由判定 → to who → 叙事结构 → 管线执行...</p>
            {rawText && <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 rounded-xl p-4 text-left max-h-48 overflow-y-auto">{rawText.slice(-500)}</pre>}
            <Button variant="outline" size="sm" onClick={reset}>取消</Button>
          </CardContent>
        </Card>
      )}

      {phase === "complete" && rawText && (
        <div className="space-y-5">
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Link href={`/retro?topic=${encodeURIComponent(topic)}`}>
              <Button variant="outline"><BarChart3 className="h-4 w-4 mr-2" />发布后去复盘</Button>
            </Link>
            <Button variant="outline" onClick={handleWeiguiCheck} disabled={weiguiPhase === "generating"}>
              <Shield className="h-4 w-4 mr-2" />
              {weiguiPhase === "generating" ? "检测中…" : weiguiPhase === "complete" ? "重新检测" : "检查违规"}
            </Button>
            <Button onClick={reset} variant="outline"><RotateCcw className="h-4 w-4 mr-2" />新脚本</Button>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(rawText)}><Copy className="h-4 w-4 mr-2" />复制全文</Button>
          </div>

          {/* 违规检测结果 */}
          {weiguiPhase === "generating" && (
            <Card className="border border-amber-200 bg-amber-50/50">
              <CardContent className="py-8 text-center">
                <Loader2 className="h-6 w-6 text-amber-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-amber-700">正在扫描7类违规…</p>
              </CardContent>
            </Card>
          )}
          {weiguiPhase === "complete" && weiguiResult && (
            <Card className="border shadow-sm">
              <CardContent className="p-5">
                <h3 className="font-bold text-sm flex items-center gap-2 mb-3"><Shield className="h-4 w-4 text-emerald-500" />违规检测报告</h3>
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed bg-muted/20 rounded-lg p-4 max-h-80 overflow-y-auto">{weiguiResult}</pre>
              </CardContent>
            </Card>
          )}
          {weiguiPhase === "error" && (
            <Card className="border-2 border-destructive/30">
              <CardContent className="py-6 text-center">
                <AlertTriangle className="h-5 w-5 text-destructive mx-auto mb-2" />
                <p className="text-sm text-destructive">{weiguiError}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => setWeiguiPhase("idle")}>关闭</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {phase === "error" && (
        <Card className="glass border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>
      )}
    </div>
  )
}
