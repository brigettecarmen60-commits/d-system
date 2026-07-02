"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useGeneration } from "@/hooks/use-generation"
import { recordActivity } from "@/lib/activity"
import { Film, Loader2, Copy, RotateCcw, Sparkles } from "lucide-react"

export default function SeriesPage() {
  const [niche, setNiche] = useState("")
  const [edge, setEdge] = useState("")
  const [dna, setDna] = useState("")
  const { phase, statusMessage, rawText, error, runSeries, reset } = useGeneration()

  function handleGenerate() {
    runSeries(niche, edge, dna)
  }

  if (phase === "complete" && rawText) {
    recordActivity({ type: "series", niche, title: "系列策划", timestamp: Date.now() })
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Film className="h-6 w-6 text-violet-500" />系列策划</h1>
      <p className="text-sm text-muted-foreground">输入赛道和你的底牌，编导视角出系列方向——不一样、有趣、能持续。</p>

      {phase === "idle" && (
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">赛道 <span className="text-red-400">*</span></label>
              <Textarea
                placeholder="你在做什么？比如：成都陪诊 / 企业财税 / 家庭教育咨询"
                value={niche}
                onChange={e => setNiche(e.target.value)}
                rows={1}
                className="resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">我的底牌 <span className="text-gray-400 text-xs">（选填）</span></label>
              <Textarea
                placeholder="知道多少写多少——做过什么、见过什么、有什么和别人不一样的地方。不确定就写个大概，也可以空着。比如：做陪诊两三年了，每天就是带人看病挂号取药，跟老人打交道比较多。"
                value={edge}
                onChange={e => setEdge(e.target.value)}
                rows={5}
                className="resize-none text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">DNA（可选）</label>
              <Textarea
                placeholder="从定位页粘贴DNA……"
                value={dna}
                onChange={e => setDna(e.target.value)}
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            <Button onClick={handleGenerate} disabled={!niche.trim()}
              className="w-full h-11 bg-[#1a1a2e] hover:bg-[#2d2d4a] text-white rounded-lg font-medium shadow-sm">
              <Sparkles className="h-4 w-4 mr-2" />策划系列方向
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card className="border shadow-sm">
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 text-violet-500 animate-spin mx-auto" />
            <p className="text-lg font-medium">{statusMessage || "扫描内容矿脉 → 找系列钩子 → 策划方向…"}</p>
            {rawText && <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 rounded-xl p-4 text-left max-h-48 overflow-y-auto blur-[3px] select-none">{rawText.slice(-500)}</pre>}
            <Button variant="outline" size="sm" onClick={reset}>取消</Button>
          </CardContent>
        </Card>
      )}

      {phase === "complete" && rawText && (
        <div className="space-y-4">
          <Card className="border shadow-sm">
            <CardContent className="p-6">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(rawText)}><Copy className="h-4 w-4 mr-2" />复制</Button>
            <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-2" />重新策划</Button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <Card className="border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>
      )}
    </div>
  )
}
