"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useGeneration } from "@/hooks/use-generation"
import { Search, Loader2, RotateCcw, Lightbulb, Compass } from "lucide-react"
import Link from "next/link"
import { recordActivity, recordPipelineStage } from "@/lib/activity"

export default function AnalyzePage() {
  const [niche, setNiche] = useState("")
  const { phase, statusMessage, rawText, error, runIntel, reset } = useGeneration()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Search className="h-6 w-6" />赛道分析</h1>
      <p className="text-sm text-muted-foreground">六点雷达扫描：钱·坑·人·局·流·判。自动搜索真实行业数据，给结论不给废话。</p>

      {phase === "idle" && (
        <Card className="border border-gray-100 shadow-none">
          <CardContent className="p-6 space-y-4">
            <Textarea
              placeholder="输入赛道，比如：互联网保险、新能源汽车维修、职场成长培训…
信息越具体，分析越精准。可以附带你的已知信息。"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              rows={3}
              className="resize-none"
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); runIntel(niche) } }}
            />
            <Button onClick={() => runIntel(niche)} disabled={!niche.trim() || niche.trim().length < 2}
              className="w-full h-11 bg-black text-white hover:bg-black/90 rounded-full">
              <Search className="h-4 w-4 mr-2" />开始分析
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card className="border border-gray-100 shadow-none">
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 animate-spin mx-auto text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">{statusMessage}</p>
            {rawText && (
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 rounded-xl p-4 text-left max-h-48 overflow-y-auto">
                {rawText.slice(-500)}
              </pre>
            )}
            <Button variant="outline" size="sm" onClick={reset}>取消</Button>
          </CardContent>
        </Card>
      )}

      {phase === "complete" && (
        <div className="space-y-4">
          <Card className="border border-gray-100 shadow-none">
            <CardContent className="p-6">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-2">
            <Link href={`/topics?niche=${encodeURIComponent(niche)}`}>
              <Button variant="outline"><Lightbulb className="h-4 w-4 mr-2" />基于此赛道生成选题</Button>
            </Link>
            <Link href={`/positioning?niche=${encodeURIComponent(niche)}`}>
              <Button variant="outline"><Compass className="h-4 w-4 mr-2" />基于此赛道做定位</Button>
            </Link>
            <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-2" />重新分析</Button>
          </div>
          {/* 活动追踪 */}
          {(() => { recordActivity({ type: "analyze", niche, title: niche, timestamp: Date.now() }); recordPipelineStage("analyze", niche); return null })()}
        </div>
      )}

      {phase === "error" && (
        <Card className="border-2 border-destructive/30 shadow-none">
          <CardContent className="py-12 text-center">
            <p className="text-destructive font-medium mb-4">{error}</p>
            <Button variant="outline" onClick={reset}>返回</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
