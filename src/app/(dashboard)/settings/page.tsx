"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { User, Crown, Zap, Check, Sparkles } from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [name, setName] = useState(session?.user?.name || "")
  const [usage, setUsage] = useState({ quotaUsed: 0, monthlyQuota: 3, remaining: 3 })

  useEffect(() => {
    fetch("/api/user/usage")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setUsage(data)
      })
      .catch(() => {})
  }, [])

  const pct = usage.monthlyQuota > 0
    ? Math.round((usage.quotaUsed / usage.monthlyQuota) * 100)
    : 0

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">设置</h1>

      {/* Profile */}
      <Card className="border shadow-sm shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-cyan-500" />
            个人信息
          </CardTitle>
          <CardDescription>你的基本账户信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">邮箱</label>
            <Input value={session?.user?.email || ""} disabled className="bg-muted/30" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">名字</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="你的名字"
              className="bg-white/50 dark:bg-slate-900/50"
            />
          </div>
          <Button size="sm" className="smooth">保存</Button>
        </CardContent>
      </Card>

      {/* Subscription & Usage */}
      <Card className="border shadow-sm shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Crown className="h-4 w-4 text-cyan-500" />
            方案与用量
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            当前方案：<Badge variant="secondary" className="font-medium">免费版</Badge>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">本月用量</span>
              <span className="font-semibold">{usage.quotaUsed} / {usage.monthlyQuota} 条</span>
            </div>
            <Progress value={pct} className="h-1.5" />
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              剩余 {usage.remaining} 条 · 下月自动重置
            </p>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium mb-4">需要更多额度？</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="border-cyan-200 dark:border-cyan-800 bg-cyan-50/30 dark:bg-cyan-950/10 shadow-sm">
                <CardContent className="p-5 text-center">
                  <Sparkles className="h-5 w-5 text-cyan-500 mx-auto mb-2" />
                  <p className="font-bold text-lg">Pro · 300 积分/月</p>
                  <p className="text-sm text-muted-foreground mt-1">完整功能 · 热再生</p>
                  <Button className="w-full mt-4 h-9 text-sm smooth" disabled>
                    即将开放
                  </Button>
                </CardContent>
              </Card>
              <Card className="glass shadow-sm">
                <CardContent className="p-5 text-center">
                  <Crown className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                  <p className="font-bold text-lg">Enterprise · 1500 积分/月</p>
                  <p className="text-sm text-muted-foreground mt-1">50次/月 · API接入 · Claude深度</p>
                  <Button className="w-full mt-4 h-9 text-sm" variant="outline" disabled>
                    即将开放
                  </Button>
                </CardContent>
              </Card>
            </div>
            <p className="text-xs text-muted-foreground mt-4 text-center">
              💡 内测阶段，升级请微信联系客服
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
