"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGeneration } from "@/hooks/use-generation"
import { BookOpen, Loader2, Copy, RotateCcw, Sparkles } from "lucide-react"

export default function StoryPage() {
  const [material, setMaterial] = useState("")
  const [dna, setDna] = useState("")
  const [medium, setMedium] = useState("auto")
  const { phase, statusMessage, rawText, error, runStory, reset } = useGeneration()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary" />人设故事</h1>
      <p className="text-muted-foreground">输入真实经历 + 传递卡，老D 自动匹配六大情绪框架 → 生成人设故事脚本。</p>

      {phase === "idle" && (
        <Card className="glass border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">真实故事素材 <span className="text-red-500">*</span></label>
              <Textarea
                placeholder="把你真实的经历写进来。比如：我做了11年奢侈品鉴定，见过两万只包，没有一只是我自己的。上个月我终于说了句真话，告诉客户她买贵了——结果她走了。"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                rows={6}
                className="text-base resize-none bg-white/50 dark:bg-slate-900/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground mt-1">越具体越好——时间、地点、数字、对话、情绪最强烈的那个时刻。</p>
            </div>
            <Textarea
              placeholder="传递卡 / DNA（可选）。粘贴定位系统生成的 DNA JSON，故事将匹配人设、发愿、语气。"
              value={dna}
              onChange={(e) => setDna(e.target.value)}
              rows={3}
              className="text-sm resize-none bg-white/50 dark:bg-slate-900/50 border-border/50"
            />
            <div>
              <label className="text-sm font-medium mb-1.5 block">介质偏好</label>
              <Select value={medium} onValueChange={setMedium}>
                <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-border/50 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动判定</SelectItem>
                  <SelectItem value="口播">口播型（对着镜头讲）</SelectItem>
                  <SelectItem value="Vlog">Vlog型（画面+旁白）</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => runStory(material, dna, medium)} disabled={!material.trim() || material.trim().length < 10} className="w-full h-11 smooth">
              <Sparkles className="h-4 w-4 mr-2" />生成故事脚本
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card className="glass border-0 shadow-sm">
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <p className="text-lg font-medium">{statusMessage}</p>
            <p className="text-sm text-muted-foreground">框架匹配 → 介质判断 → 编导三问 → 写故事...</p>
            {rawText && <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 rounded-xl p-4 text-left max-h-48 overflow-y-auto">{rawText.slice(-500)}</pre>}
            <Button variant="outline" size="sm" onClick={reset}>取消</Button>
          </CardContent>
        </Card>
      )}

      {phase === "complete" && rawText && (
        <div className="space-y-5">
          <Card className="border border-gray-100 shadow-none">
            <CardContent className="p-6">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button onClick={reset} variant="outline" className="smooth"><RotateCcw className="h-4 w-4 mr-2" />新故事</Button>
            <Button variant="outline" className="smooth" onClick={() => navigator.clipboard.writeText(rawText)}><Copy className="h-4 w-4 mr-2" />复制全文</Button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <Card className="glass border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>
      )}
    </div>
  )
}
