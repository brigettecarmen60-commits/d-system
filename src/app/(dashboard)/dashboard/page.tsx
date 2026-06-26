"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Search, Lightbulb, PenLine, Compass, BarChart3, Camera, CalendarDays, ArrowRight, Sparkles, Clock } from "lucide-react"
import { getRecentActivity, getPipelineState, getTypeLabel, getPipelineStages, type ActivityRecord } from "@/lib/activity"

export default function DashboardPage() {
  const [usage, setUsage] = useState({ credits: 0, monthlyCredits: 0, plan: "FREE" })
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [pipelineState, setPipelineState] = useState<ReturnType<typeof getPipelineState>>({})

  useEffect(() => {
    // 积分
    fetch("/api/user/usage")
      .then(r => r.json())
      .then(d => { if (!d.error) setUsage(d) })
      .catch(() => {})
    // 活动 + 管线状态
    setActivities(getRecentActivity())
    setPipelineState(getPipelineState())
  }, [])

  const pipelineStages = getPipelineStages()
  const completedStages = pipelineStages.filter(s => pipelineState[s.key]?.status === "complete").length

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />老D 工作台
          </h1>
          <p className="text-sm text-muted-foreground mt-1">商业IP内容引擎 · 管线总览</p>
        </div>
        <Badge variant="secondary" className="text-xs">{usage.plan === "FREE" ? "试用版" : usage.plan === "PRO" ? "创作者版" : "工作室版"}</Badge>
      </div>

      {/* 积分 + 管线进度 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-gray-100 shadow-none">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-medium text-gray-500">剩余积分</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{usage.credits}</span>
              <span className="text-sm text-muted-foreground">/ {usage.monthlyCredits} 分</span>
            </div>
            <Progress value={usage.monthlyCredits > 0 ? Math.round((usage.credits / usage.monthlyCredits) * 100) : 0} className="h-1.5" />
          </CardContent>
        </Card>

        <Card className="border border-gray-100 shadow-none">
          <CardContent className="p-5 space-y-3">
            <p className="text-sm font-medium text-gray-500">管线进度</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{completedStages}</span>
              <span className="text-sm text-muted-foreground">/ {pipelineStages.length} 阶段完成</span>
            </div>
            <div className="flex gap-1">
              {pipelineStages.map(s => (
                <div key={s.key}
                  className={`h-1.5 flex-1 rounded-full ${pipelineState[s.key]?.status === "complete" ? "bg-amber-500" : "bg-gray-200"}`}
                  title={s.label}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              {pipelineStages.map(s => (
                <span key={s.key} className={pipelineState[s.key]?.status === "complete" ? "text-amber-600 font-medium" : ""}>
                  {s.label.slice(0, 2)}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速入口 */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-3">快速入口</p>
        <div className="grid gap-3 md:grid-cols-3">
          {[
            { href: "/analyze", icon: Search, label: "赛道分析", desc: "六点雷达扫描" },
            { href: "/positioning", icon: Compass, label: "个人定位", desc: "一页战略卡" },
            { href: "/topics", icon: Lightbulb, label: "选题生成", desc: "五种模式" },
            { href: "/script", icon: PenLine, label: "写脚本", desc: "框架+文案" },
            { href: "/seeding", icon: Camera, label: "剧情种草", desc: "七框架" },
            { href: "/sprint", icon: CalendarDays, label: "两周冲刺", desc: "Sprint规划" },
          ].map(item => (
            <Link key={item.href} href={item.href}>
              <Card className="border border-gray-100 shadow-none hover:border-amber-200 hover:bg-amber-50/50 transition-colors cursor-pointer h-full">
                <CardContent className="p-4">
                  <item.icon className="h-5 w-5 text-amber-500 mb-2" />
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* 最近动态 */}
      <div>
        <p className="text-sm font-medium text-gray-500 mb-3">最近动态</p>
        {activities.length === 0 ? (
          <Card className="border border-gray-100 shadow-none">
            <CardContent className="py-12 text-center">
              <Clock className="h-8 w-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">还没有活动记录</p>
              <p className="text-xs text-muted-foreground mt-1">从任意管线页面生成内容后，这里会显示记录</p>
              <Link href="/analyze">
                <Button variant="outline" size="sm" className="mt-4">
                  开始使用 <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activities.slice(0, 10).map((a, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-gray-50 bg-gray-50/50">
                <Badge variant="secondary" className="text-[10px] shrink-0">{getTypeLabel(a.type)}</Badge>
                <span className="text-sm truncate flex-1">{a.title || a.niche || "—"}</span>
                <span className="text-xs text-muted-foreground shrink-0">
                  {new Date(a.timestamp).toLocaleDateString("zh-CN")} {new Date(a.timestamp).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
