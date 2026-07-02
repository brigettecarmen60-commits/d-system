"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Loader2, RotateCcw, Copy, Check } from "lucide-react"
import { useGeneration } from "@/hooks/use-generation"
import { recordActivity, recordPipelineStage } from "@/lib/activity"

const STAGES = [
  { key: "A", label: "从零开始", desc: "0内容/0粉丝——什么都没验证" },
  { key: "B", label: "有内容没方向", desc: "数据无规律——缺乏系统性" },
  { key: "C", label: "有方向没规模", desc: "知道什么有效但不稳定" },
  { key: "D", label: "有规模没转化", desc: "有流量不赚钱——收割链路没通" },
  { key: "E", label: "转型/重启", desc: "老号换赛道或长期停更" },
]

export default function SprintPage() {
  const [stage, setStage] = useState("")
  const [goal, setGoal] = useState("")
  const [niche, setNiche] = useState("")
  const [recentData, setRecentData] = useState("")
  const [copied, setCopied] = useState(false)
  const { phase, statusMessage, rawText, error, runSprint, reset } = useGeneration()

  function handleGenerate() {
    runSprint(stage, goal, niche, recentData)
  }

  async function copyResult() {
    await navigator.clipboard.writeText(rawText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 追踪活动
  if (phase === "complete" && rawText) {
    recordActivity({ type: "sprint", niche: niche || "运营规划", title: `Sprint规划 · ${STAGES.find(s => s.key === stage)?.label || stage}`, timestamp: Date.now() })
    recordPipelineStage("sprint", niche || "运营规划", `Sprint规划`)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><CalendarDays className="h-6 w-6 text-indigo-500" />两周冲刺</h1>
      <p className="text-sm text-muted-foreground">Sprint制运营规划。不预测未来，设计学习速度。不做90天日历——那第3天就会作废。</p>

      {phase === "idle" && (
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-4">
            {/* 阶段选择 */}
            <div>
              <p className="text-sm font-medium mb-2">账号当前阶段</p>
              <div className="grid gap-2 sm:grid-cols-5">
                {STAGES.map(s => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setStage(s.key)}
                    className={`p-2.5 rounded-lg border text-left transition-colors ${
                      stage === s.key
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-gray-100 hover:border-gray-200 text-gray-600"
                    }`}
                  >
                    <p className="text-xs font-bold">{s.key}. {s.label}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <Textarea
              placeholder="季度目标（Season Objective）：用一句话说清楚本季度要达成什么。
比如：验证'企业财税避坑'这个方向能不能跑通 / 把完播率从20%拉到35% / 建立稳定的周更节奏并积累50个咨询"
              value={goal}
              onChange={e => setGoal(e.target.value)}
              rows={3}
              className="resize-none"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="赛道（可选）" value={niche} onChange={e => setNiche(e.target.value)} />
            </div>

            <Textarea
              placeholder="近期数据（可选）：粉丝数、已发条数、最高播放、咨询/成交情况、当前发布频率、最大卡点…"
              value={recentData}
              onChange={e => setRecentData(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />

            <Button onClick={handleGenerate} disabled={!stage || !goal.trim()}
              className="w-full h-11 bg-[#1a1a2e] hover:bg-[#2d2d4a] text-white rounded-lg font-medium shadow-sm">
              <CalendarDays className="h-4 w-4 mr-2" />生成 Sprint 规划
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card className="border shadow-sm">
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
            <p className="text-lg font-medium">{statusMessage}</p>
            {rawText && (
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 rounded-xl p-4 text-left max-h-48 overflow-y-auto blur-[3px] select-none">
                {rawText.slice(-500)}
              </pre>
            )}
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
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyResult}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "已复制" : "复制"}
            </Button>
            <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-2" />重新规划</Button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <Card className="border-2 border-destructive/30">
          <CardContent className="py-12 text-center">
            <p className="text-destructive font-medium mb-4">{error}</p>
            <Button variant="outline" onClick={reset}>返回</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
