"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lightbulb, Loader2, RotateCcw, Coins, Copy, Check, TrendingUp, Sparkles, Brain, Target, Heart, Save, Zap, Download } from "lucide-react"
import { useGeneration } from "@/hooks/use-generation"
import { downloadMarkdown } from "@/lib/utils"

const MODES = [
  { key: "mode-a", label: "纪实进化", icon: TrendingUp, desc: "日常真实切片拍出悬念。有物理场景、有实物可拍的行业。" },
  { key: "mode-b", label: "荒诞进化", icon: Sparkles, desc: "极端错位制造视觉奇观。把枯燥业务拍出离谱效果。" },
  { key: "mode-n", label: "共识挖掘", icon: Brain, desc: "找到所有人都有的共识缺口。行业只是答案，人性才是战场。" },
  { key: "conversion", label: "转化选题", icon: Target, desc: "在顾客犹豫的每个卡点精准推一把。秀肌肉不喊口号。" },
  { key: "trust", label: "信任选题", icon: Heart, desc: "补齐观众脑子里的信任拼图。让事实替你说话。" },
]

export default function TopicsPage() {
  const [niche, setNiche] = useState("")
  const [dna, setDna] = useState("")
  const [activeMode, setActiveMode] = useState("mode-a")
  const [copied, setCopied] = useState<string | null>(null)
  const { phase, statusMessage, rawText, tokens, usedModel, error, isRegeneration, regenState,
    runTopics, reset, parseTopics, checkRegenState, runRegenerate, runColdRestart } = useGeneration()

  const topics = (phase === "complete" || phase === "generating") && rawText ? parseTopics(rawText) : []

  useEffect(() => {
    if (phase === "complete" && niche.trim() && activeMode && !isRegeneration) {
      checkRegenState(niche, activeMode)
    }
  }, [phase, niche, activeMode, isRegeneration, checkRegenState])

  const extraParams = { targetAudience: dna ? dna.slice(0, 200) : undefined, dna: dna || undefined }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(text.slice(0, 20))
    setTimeout(() => setCopied(null), 2000)
  }

  function handleSave() {
    const saved = JSON.parse(localStorage.getItem("e-topics") || "[]")
    saved.unshift({ niche, mode: activeMode, content: rawText, date: new Date().toISOString() })
    localStorage.setItem("e-topics", JSON.stringify(saved.slice(0, 50)))
  }

  function handleGenerate() { runTopics(niche, activeMode, extraParams) }
  function handleRegenerate() { runRegenerate(niche, activeMode, extraParams) }

  const mode = MODES.find((m) => m.key === activeMode)!

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Lightbulb className="h-6 w-6 text-amber-500" />选题生成</h1>

      {tokens && phase === "complete" && (
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <Coins className="h-3.5 w-3.5" />{tokens.totalTokens.toLocaleString()} tokens
          {usedModel && <span className="opacity-50">| {usedModel}</span>}
          {isRegeneration && <span className="text-green-500">| 热再生</span>}
        </div>
      )}

      {phase === "idle" && (
        <Card className="glass border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <Textarea
              placeholder="输入赛道，比如：企业财税、家庭教育…

目标受众、产品信息、个人信息、竞对等，信息越全，选题效果越好"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              rows={4}
              className="bg-white/50 dark:bg-slate-900/50 border-border/50 resize-none text-base"
            />

            <Textarea
              placeholder="定位信息 / DNA（可选）。粘贴 Strategy_DNA、传递卡，或直接描述：人设、发愿、立场、卖点、目标客户等。"
              value={dna}
              onChange={(e) => setDna(e.target.value)}
              rows={3}
              className="bg-white/50 dark:bg-slate-900/50 border-border/50 resize-none text-sm"
            />

            <Tabs value={activeMode} onValueChange={setActiveMode}>
              <TabsList className="w-full flex-wrap h-auto gap-1">
                {MODES.map((m) => (
                  <TabsTrigger key={m.key} value={m.key} className="flex-1 min-w-[90px] gap-1.5 text-xs py-2">
                    <m.icon className="h-3.5 w-3.5" />{m.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value={activeMode} className="mt-3">
                <p className="text-sm text-muted-foreground">{mode.desc}</p>
              </TabsContent>
            </Tabs>

            <Button
              onClick={handleGenerate}
              disabled={!niche.trim() || niche.trim().length < 2}
              className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white smooth"
            >
              <mode.icon className="h-4 w-4 mr-2" />
              生成{mode.label}选题
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card className="glass border-0 shadow-sm">
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin mx-auto" />
            <p className="text-lg font-medium">{statusMessage}</p>
            {rawText && <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 rounded-xl p-4 text-left max-h-48 overflow-y-auto">{rawText.slice(-500)}</pre>}
            <Button variant="outline" size="sm" onClick={reset}>取消</Button>
          </CardContent>
        </Card>
      )}

      {phase === "complete" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold">{topics.length} 个选题</h2>
              <p className="text-xs text-muted-foreground">{mode.label} · {niche.slice(0, 30)}{niche.length > 30 ? "…" : ""}{isRegeneration ? " · 热再生" : ""}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleCopy(rawText)} className="smooth">
                {copied === rawText.slice(0, 20) ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied === rawText.slice(0, 20) ? "已复制" : "复制全部"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleSave} className="smooth">
                <Save className="h-4 w-4 mr-1" />保存
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadMarkdown(rawText, `选题-${mode.label}-${new Date().toISOString().slice(0, 10)}`)}>
                <Download className="h-4 w-4 mr-1" />导出
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {topics.map((t, i) => (
              <Card key={i} className="glass border-0 shadow-sm group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold leading-snug mb-2">{t.title}</h3>
                      {t.type && <Badge variant="secondary" className="text-xs">{t.type}</Badge>}
                      {t.detail && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{t.detail}</p>}
                    </div>
                    <Button
                      variant="ghost" size="sm" className="shrink-0 opacity-0 group-hover:opacity-100 smooth"
                      onClick={() => handleCopy(t.title + "\n" + (t.detail || ""))}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4 border-t">
            {regenState?.exists ? (
              <>
                <Button onClick={handleRegenerate} disabled={phase === "generating"} className="bg-amber-500 hover:bg-amber-600 text-white">
                  <Zap className="h-4 w-4 mr-2" />热再生（换一批）
                </Button>
                <span className="text-xs text-muted-foreground">已生成 {regenState.batchCount} 批 · 预计节省 ~{regenState.estimatedSaving}% token</span>
                <Button variant="ghost" size="sm" onClick={() => runColdRestart(niche, activeMode)}><RotateCcw className="h-3.5 w-3.5 mr-1" />重新分析</Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleGenerate} disabled={phase === "generating"}>
                <RotateCcw className="h-4 w-4 mr-2" />换一批（冷启动）
              </Button>
            )}
          </div>

          <div className="text-xs text-muted-foreground text-center pt-2">保存位置：浏览器本地存储</div>
        </div>
      )}

      {phase === "error" && (
        <Card className="glass border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>
      )}
    </div>
  )
}
