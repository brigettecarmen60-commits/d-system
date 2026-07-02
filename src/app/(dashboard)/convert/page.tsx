"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGeneration } from "@/hooks/use-generation"
import { recordActivity, recordPipelineStage } from "@/lib/activity"
import { Target, Loader2, Copy, RotateCcw, Sparkles, BarChart3, Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

const SHOW_MUSCLES = [
  { value: "auto", label: "自动判定" },
  { value: "打痛点", label: "打痛点 — 场景还原+后果量化" },
  { value: "画未来", label: "画未来 — 使用后状态+前后对比" },
  { value: "演示过程", label: "演示过程 — 全流程实拍+关键特写" },
  { value: "案例展示", label: "案例展示 — 问题→方案→现状完整还原" },
  { value: "客户评价", label: "客户评价 — 真实反应+对话截图" },
]

const EVIDENCE_POSTURES = [
  { value: "auto", label: "AI 自动选择" },
  { value: "事件流露", label: "事件流露（最强）— 让观众自己看到" },
  { value: "他人证言", label: "他人证言 — 第三方为你说话" },
  { value: "配角行为", label: "配角行为 — 间接证明你的品质" },
  { value: "自己说", label: "自己说（最弱）— 仅在建立认知锚点时用" },
]

export default function ConvertPage() {
  const searchParams = useSearchParams()
  const topicFromUrl = searchParams.get("topic") || ""

  const [topic, setTopic] = useState(topicFromUrl)
  const [painPoint, setPainPoint] = useState("")
  const [solution, setSolution] = useState("")
  const [showMuscle, setShowMuscle] = useState("auto")
  const [evidencePosture, setEvidencePosture] = useState("auto")
  const [dna, setDna] = useState("")
  const [ctaPreference, setCtaPreference] = useState("auto")
  const { phase, statusMessage, rawText, error, runConvertScript, reset } = useGeneration()

  function handleGenerate() {
    runConvertScript(topic, painPoint, solution, showMuscle, evidencePosture, dna, ctaPreference)
  }

  if (phase === "complete" && rawText) {
    recordActivity({ type: "convert-script", niche: topic, title: topic, timestamp: Date.now() })
    recordPipelineStage("convert", topic)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Target className="h-6 w-6 text-emerald-500" />转化脚本</h1>
      <p className="text-sm text-muted-foreground">追求行动转化。证据链驱动。让人信你、找你、买你。</p>

      {phase === "idle" && (
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">选题 <span className="text-red-400">*</span></label>
              <Textarea
                placeholder="你想帮用户解决什么问题？比如：为什么你的口播没人看？/ 做了三年保险，第一个月就放弃了——问题出在第一步"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">用户痛点</label>
                <Textarea
                  placeholder="他们现在在受什么罪？比如：每天发视频但播放量从没超过500，不知道哪里出了问题"
                  value={painPoint}
                  onChange={e => setPainPoint(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">你的方案</label>
                <Textarea
                  placeholder="你怎么帮他们？凭什么信你？比如：我拆了200条爆款口播，发现它们开头都做了同一件事……"
                  value={solution}
                  onChange={e => setSolution(e.target.value)}
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">展示方式</label>
                <Select value={showMuscle} onValueChange={setShowMuscle}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SHOW_MUSCLES.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">证据姿态</label>
                <Select value={evidencePosture} onValueChange={setEvidencePosture}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EVIDENCE_POSTURES.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">CTA 偏好</label>
                <Select value={ctaPreference} onValueChange={setCtaPreference}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自动判定</SelectItem>
                    <SelectItem value="软引导">软引导 — "我放在主页了"</SelectItem>
                    <SelectItem value="硬引导">硬引导 — "现在下单"</SelectItem>
                    <SelectItem value="不引导">不引导 — 纯信任建设</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">DNA（可选）</label>
              <Textarea
                placeholder="粘贴定位DNA……"
                value={dna}
                onChange={e => setDna(e.target.value)}
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            <Button onClick={handleGenerate} disabled={!topic.trim()} className="w-full h-11 bg-[#1a1a2e] hover:bg-[#2d2d4a] text-white rounded-lg font-medium shadow-sm">
              <Sparkles className="h-4 w-4 mr-2" />生成转化脚本
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card className="border shadow-sm">
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto" />
            <p className="text-lg font-medium">{statusMessage}</p>
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
          <div className="flex flex-wrap gap-3">
            <Link href={`/retro?topic=${encodeURIComponent(topic)}`}>
              <Button variant="outline"><BarChart3 className="h-4 w-4 mr-2" />发布后去复盘</Button>
            </Link>
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(rawText)}><Copy className="h-4 w-4 mr-2" />复制全文</Button>
            <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-2" />新脚本</Button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <Card className="border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>
      )}
    </div>
  )
}
