"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useGeneration } from "@/hooks/use-generation"
import { recordActivity } from "@/lib/activity"
import { Shuffle, Loader2, Copy, RotateCcw } from "lucide-react"

export default function TrafficOSPage() {
  const [niche, setNiche] = useState("")
  const { phase, statusMessage, rawText, error, runTrafficOS, reset } = useGeneration()
  function extractIds(text: string): string { return (text.match(/^(\d+)/gm)||[]).join(',') }
  function handleGenerate(prev?: string) { runTrafficOS(niche, prev) }
  if (phase === "complete" && rawText) recordActivity({ type: "traffic-os", niche, title: "Traffic OS", timestamp: Date.now() })

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shuffle className="h-6 w-6 text-purple-500" />Traffic OS</h1>
      <p className="text-sm text-muted-foreground">填赛道，AI走完五步拆解→判动机→抽技法→碰撞→自检。换一批=全新技法组合。</p>
      {phase === "idle" && (
        <Card className="border shadow-sm"><CardContent className="p-4 space-y-3">
          <label className="text-sm font-medium">赛道 <span className="text-red-400">*</span></label>
          <Textarea placeholder="记账报税 / 陪诊服务 / 少儿体能 / 二手车检测" value={niche} onChange={e => setNiche(e.target.value)} rows={1} className="resize-none" />
          <Button onClick={handleGenerate} disabled={!niche.trim()} className="w-full h-11 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium shadow-sm"><Shuffle className="h-4 w-4 mr-2" />碰撞生成 5 个方向</Button>
        </CardContent></Card>
      )}
      {phase === "generating" && (<Card className="border shadow-sm"><CardContent className="py-16 text-center space-y-5"><Loader2 className="h-10 w-10 text-purple-500 animate-spin mx-auto" /><p>{statusMessage||"五步碰撞中…"}</p><Button variant="outline" size="sm" onClick={reset}>取消</Button></CardContent></Card>)}
      {phase === "complete" && rawText && (<div className="space-y-4"><Card className="border shadow-sm"><CardContent className="p-6"><pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre></CardContent></Card><div className="flex gap-3"><Button variant="outline" onClick={() => navigator.clipboard.writeText(rawText)}><Copy className="h-4 w-4 mr-2" />复制</Button><Button variant="outline" onClick={() => handleGenerate(extractIds(rawText))}><Shuffle className="h-4 w-4 mr-2" />换一批</Button><Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-2" />重新来</Button></div></div>)}
      {phase === "error" && (<Card className="border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>)}
    </div>
  )
}
