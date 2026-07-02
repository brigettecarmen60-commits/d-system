"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGeneration } from "@/hooks/use-generation"
import { recordActivity } from "@/lib/activity"
import { RefreshCw, Loader2, Copy, RotateCcw, Sparkles } from "lucide-react"

const FRAMEWORKS = [
  { value: "auto", label: "自动判定" },
  { value: "time-entropy", label: "时间熵增与不可逆" },
  { value: "unequal-exchange", label: "关系中的非等价交换" },
  { value: "mirror-reconciliation", label: "镜像与和解" },
  { value: "giant-mayfly", label: "巨物与蜉蝣" },
  { value: "ordinary-journey", label: "凡人之旅" },
  { value: "hidden-order", label: "隐秘的秩序" },
]

const STRUCTURES = [
  { value: "auto", label: "自动判定" },
  { value: "英雄之旅", label: "英雄之旅" },
  { value: "救猫咪", label: "救猫咪：困境→转机→胜利" },
  { value: "悬疑盒子", label: "悬疑盒子：钩子→线索→反转" },
  { value: "倒叙悬念", label: "倒叙悬念：结局前置" },
  { value: "情绪过山车", label: "情绪过山车：低谷→爬坡→下坠→反弹" },
  { value: "时光机模型", label: "时光机：旧物→闪回→现实→升华" },
  { value: "镜像共鸣", label: "镜像共鸣：你是不是也…→归属感" },
  { value: "认知对撞", label: "认知对撞：打破常识→揭示真相" },
  { value: "滞后揭示链", label: "滞后揭示链：FW2→FW1→FW6→FW3" },
  { value: "证据链叙事", label: "证据链叙事：数据→时间→多人印证" },
]

const EMOTIONS = [
  { value: "auto", label: "自动判定" },
  { value: "warm", label: "温暖" },
  { value: "release", label: "释然" },
  { value: "surprise", label: "惊喜" },
  { value: "regret-warm", label: "遗憾但温暖" },
  { value: "anger-clarity", label: "愤怒后清醒" },
  { value: "absurd-relief", label: "荒诞后释然" },
  { value: "admiration", label: "向下兼容的仰视" },
  { value: "loved-unseen", label: "被世界暗中爱着" },
  { value: "fullness", label: "充盈——原来我一直被爱" },
]

export default function RetellPage() {
  const [material, setMaterial] = useState("")
  const [framework, setFramework] = useState("auto")
  const [structure, setStructure] = useState("auto")
  const [emotion, setEmotion] = useState("auto")
  const [medium, setMedium] = useState("auto")
  const { phase, statusMessage, rawText, error, runRetell, reset } = useGeneration()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><RefreshCw className="h-6 w-6 text-primary" />故事重述</h1>
      <p className="text-muted-foreground">输入真实事件素材 → 六框架 × 脚本结构 → 重新讲好一个故事。不编造，只重组。</p>

      {phase === "idle" && (
        <Card className="border shadow-sm shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">真实事件素材 <span className="text-red-500">*</span></label>
              <Textarea
                placeholder="把你看到的/听到的/经历的真实事件写进来。越具体越好——时间、地点、数字、原话。"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                rows={8}
                className="text-base resize-none bg-white/50 dark:bg-slate-900/50 border-border/50"
              />
              <p className="text-xs text-muted-foreground mt-1">不是你的故事也可以。肥娟小吃店、独腿烧烤哥、任何真实事件——扔进来。</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">情绪框架</label>
                <Select value={framework} onValueChange={setFramework}>
                  <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>{FRAMEWORKS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">脚本结构</label>
                <Select value={structure} onValueChange={setStructure}>
                  <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>{STRUCTURES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">情绪落点</label>
                <Select value={emotion} onValueChange={setEmotion}>
                  <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>{EMOTIONS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">介质</label>
                <Select value={medium} onValueChange={setMedium}>
                  <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-border/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自动判定</SelectItem>
                    <SelectItem value="口播">口播型（对着镜头讲）</SelectItem>
                    <SelectItem value="Vlog">Vlog型（画面+旁白）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={() => runRetell(material, framework, structure, emotion, medium)} disabled={!material.trim() || material.trim().length < 10} className="w-full h-11 smooth">
              <Sparkles className="h-4 w-4 mr-2" />重新讲述
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card className="border shadow-sm shadow-sm">
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 text-primary animate-spin mx-auto" />
            <p className="text-lg font-medium">{statusMessage}</p>
            <p className="text-sm text-muted-foreground">判定框架 → 选结构 → 重组素材 → 生成脚本…</p>
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
          <div className="flex gap-3">
            <Button onClick={reset} variant="outline" className="smooth"><RotateCcw className="h-4 w-4 mr-2" />新故事</Button>
            <Button variant="outline" className="smooth" onClick={() => navigator.clipboard.writeText(rawText)}><Copy className="h-4 w-4 mr-2" />复制全文</Button>
          </div>
          {(() => { recordActivity({ type: "retell", title: "故事重述", timestamp: Date.now() }); return null })()}
        </div>
      )}

      {phase === "error" && (
        <Card className="glass border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>
      )}
    </div>
  )
}
