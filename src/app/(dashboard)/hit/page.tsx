"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useGeneration } from "@/hooks/use-generation"
import { recordActivity } from "@/lib/activity"
import { Flame, Loader2, Copy, RotateCcw, Sparkles, RefreshCw } from "lucide-react"

export default function HitPage() {
  const [topic, setTopic] = useState("")
  const [niche, setNiche] = useState("")
  const [material, setMaterial] = useState("")
  const [dna, setDna] = useState("")
  const { phase, statusMessage, rawText, error, runHitDesigner, reset } = useGeneration()

  function handleGenerate() { runHitDesigner(topic, niche, material, dna) }
  function handleRegenerate() { runHitDesigner(topic, niche, (material||"") + "\n\n【上一批结果——必须完全不同】\n" + rawText, dna) }
  if (phase === "complete" && rawText) recordActivity({ type: "hit", niche: niche || topic, title: topic, timestamp: Date.now() })

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Flame className="h-6 w-6 text-red-500" />爆款设计</h1>
      <p className="text-sm text-muted-foreground">拿一个选题，找到最强的反差和冲突，设计一个观众不转发就难受的瞬间。目标是100万+播放。</p>

      {phase === "idle" && (
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">赛道 <span className="text-red-400">*</span></label>
              <Textarea placeholder="你在什么行业？比如：二手车检测 / 家电清洗 / 陪诊服务" value={niche} onChange={e => setNiche(e.target.value)} rows={1} className="resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">选题 <span className="text-gray-400 text-xs">（选填）</span></label>
              <Textarea placeholder="有具体想法就写，没有就空着——AI 根据赛道帮你设计。比如：我拆了一台三年没洗的空调……" value={topic} onChange={e => setTopic(e.target.value)} rows={2} className="resize-none" />
            </div>
            <Textarea placeholder="素材——你有什么料？（可选）具体的事、画面、数据、客户反馈……" value={material} onChange={e => setMaterial(e.target.value)} rows={3} className="resize-none text-sm" />
            <Input placeholder="DNA（可选）" value={dna} onChange={e => setDna(e.target.value)} className="text-sm" />
            <Button onClick={handleGenerate} disabled={!niche.trim()} className="w-full h-11 bg-[#1a1a2e] hover:bg-[#2d2d4a] text-white rounded-lg font-medium shadow-sm">
              <Sparkles className="h-4 w-4 mr-2" />设计爆款
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card className="border shadow-sm"><CardContent className="py-16 text-center space-y-5">
          <Loader2 className="h-10 w-10 text-red-500 animate-spin mx-auto" /><p className="text-lg font-medium">{statusMessage || "找反差→推冲突→设计转发瞬间…"}</p>
          <Button variant="outline" size="sm" onClick={reset}>取消</Button>
        </CardContent></Card>
      )}
      {phase === "complete" && rawText && (
        <div className="space-y-4"><Card className="border shadow-sm"><CardContent className="p-6"><pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre></CardContent></Card>
          <div className="flex gap-3"><Button variant="outline" onClick={() => navigator.clipboard.writeText(rawText)}><Copy className="h-4 w-4 mr-2" />复制</Button><Button variant="outline" onClick={handleRegenerate}><RefreshCw className="h-4 w-4 mr-2" />换一批</Button><Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-2" />重新设计</Button></div></div>
      )}
      {phase === "error" && (<Card className="border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>)}
    </div>
  )
}
