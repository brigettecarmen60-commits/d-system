"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGeneration } from "@/hooks/use-generation"
import { PenLine, Loader2, Copy, RotateCcw, Check, FileText, Target, Zap, ShieldCheck, MessageSquare, Eye, Coins, Sparkles } from "lucide-react"

export default function ScriptPage() {
  const [topic, setTopic] = useState("")
  const [contentType, setContentType] = useState("auto")
  const [dna, setDna] = useState("")
  const { phase, statusMessage, rawText, output, tokens, error, runScript, reset } = useGeneration()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><PenLine className="h-6 w-6 text-primary" />写脚本</h1>
      <p className="text-muted-foreground">输入选题，老D 自动判定类型→to who→叙事结构→管线执行。</p>


      {phase === "idle" && (
        <Card className="glass border-0 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <Textarea
              placeholder="输入选题，比如：为什么90%的人买保险都踩坑了？"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="text-base resize-none bg-white/50 dark:bg-slate-900/50 border-border/50"
            />
            <Textarea
              placeholder="传递卡 / DNA（可选）。粘贴定位系统生成的 DNA JSON，脚本将匹配人设、发愿、语气、三个钉子。"
              value={dna}
              onChange={(e) => setDna(e.target.value)}
              rows={3}
              className="text-sm resize-none bg-white/50 dark:bg-slate-900/50 border-border/50"
            />
            <div>
              <label className="text-sm font-medium mb-1.5 block">内容目的偏好</label>
              <Select value={contentType} onValueChange={setContentType}>
                <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-border/50 w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动判定</SelectItem>
                  <SelectItem value="流量型">流量型</SelectItem>
                  <SelectItem value="转化型">转化型</SelectItem>
                  <SelectItem value="信任型">信任型</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => runScript(topic, contentType, dna)} disabled={!topic.trim()} className="w-full h-11 smooth">
              <Sparkles className="h-4 w-4 mr-2" />生成脚本
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card className="glass border-0 shadow-sm">
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
          {output?.scriptBody?.opening?.audio ? <ScriptCards output={output} /> : (
            <Card className="border border-gray-100 shadow-none">
              <CardContent className="p-6">
                <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre>
              </CardContent>
            </Card>
          )}
          <div className="flex gap-3">
            <Button onClick={reset} variant="outline" className="smooth"><RotateCcw className="h-4 w-4 mr-2" />新脚本</Button>
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

function ScriptCards({ output }: { output: any }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Target className="h-4 w-4 text-cyan-500" />情绪设计</CardTitle></CardHeader>
          <CardContent className="grid gap-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">路径</span><Badge variant="secondary">{output.emotionDesign.path}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">A→B</span><span>{output.emotionDesign.abTransition}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">语气</span><Badge variant="secondary">{output.emotionDesign.tonePersona}</Badge></div>
          </CardContent>
        </Card>
        <Card className="glass border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-cyan-500" />路由识别</CardTitle></CardHeader>
          <CardContent className="grid gap-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">类型</span><span>{output.recognition.driveType} | {output.recognition.contentType}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">叙事</span><Badge variant="outline">{output.recognition.chassisFormula}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">时长</span><span>{output.recognition.suggestedDuration}</span></div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-0 shadow-sm border-l-2 border-l-cyan-400">
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-cyan-500" />脚本正文</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-cyan-50/50 dark:bg-cyan-950/20 rounded-xl p-4">
            <p className="text-xs font-semibold text-cyan-600 mb-2">开头</p>
            <p className="text-sm font-medium leading-relaxed">{output.scriptBody.opening.audio}</p>
          </div>
          {output.scriptBody.middleSegments?.map((seg: any, i: number) => (
            <div key={i} className="border border-border/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1.5"><Badge variant="outline" className="text-xs">{seg.timeRange}</Badge><Badge variant="secondary" className="text-xs">{seg.task}</Badge></div>
              <p className="text-sm leading-relaxed">{seg.audio}</p>
            </div>
          ))}
          <div className="bg-muted/30 rounded-xl p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">结尾</p>
            <p className="text-sm font-medium">{output.scriptBody.closing.audio}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="glass border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-500" />信任证据</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {output.attachments.trustEvidence?.map((t: any, i: number) => (
              <div key={i} className="text-sm"><Badge variant="outline" className="text-xs mr-2">{t.type}</Badge>{t.content}</div>
            ))}
          </CardContent>
        </Card>
        <Card className="glass border-0 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-cyan-500" />评论触发器</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {output.attachments.commentTriggers?.map((c: any, i: number) => (
              <div key={i} className="text-sm"><Badge variant="secondary" className="text-xs mr-2">{c.type}</Badge>{c.design}</div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-0 shadow-sm">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye className="h-4 w-4 text-cyan-500" />校验</CardTitle></CardHeader>
        <CardContent><div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-cyan-500" />{output.validation.l1l3.gift}</div>
          <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-cyan-500" />"我" {output.validation.l1l3.selfRatio}%</div>
          <div className="flex items-center gap-1.5">{output.validation.l4.warmth ? <Check className="h-3.5 w-3.5 text-cyan-500" /> : "⚠"}温度感</div>
          <div className="flex items-center gap-1.5">{output.validation.l4.flow ? <Check className="h-3.5 w-3.5 text-cyan-500" /> : "⚠"}心流</div>
        </div></CardContent>
      </Card>
    </>
  )
}
