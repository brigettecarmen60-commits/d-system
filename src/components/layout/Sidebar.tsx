"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Search, Lightbulb, PenLine, FileText, Settings, Sparkles, Compass, Ticket, Loader2, Shield, BarChart3, Coffee, Camera } from "lucide-react"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

const navItems = [
  { title: "赛道分析", href: "/analyze", icon: Search },
  { title: "个人定位", href: "/positioning", icon: Compass },
  { title: "普通人挖掘", href: "/c-content", icon: Coffee },
  { title: "选题生成", href: "/topics", icon: Lightbulb },
  { title: "写脚本", href: "/script", icon: PenLine },
  { title: "剧情种草", href: "/seeding", icon: Camera },
  { title: "内容复盘", href: "/retro", icon: BarChart3 },
  { title: "我的脚本", href: "/scripts", icon: FileText },
  { title: "设置", href: "/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [usage, setUsage] = useState({ credits: 0, monthlyCredits: 0, plan: "FREE", isAdmin: false })
  const [redeemCode, setRedeemCode] = useState("")
  const [redeeming, setRedeeming] = useState(false)
  const [redeemMsg, setRedeemMsg] = useState("")

  const refreshUsage = () => {
    fetch("/api/user/usage")
      .then((r) => r.json())
      .then((data) => { if (!data.error) setUsage(data) })
      .catch(() => {})
  }

  useEffect(() => { refreshUsage() }, [])

  async function handleRedeem() {
    if (!redeemCode.trim()) return
    setRedeeming(true)
    setRedeemMsg("")
    const res = await fetch("/api/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: redeemCode.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      setRedeemMsg(`已激活 +${data.credits} 分`)
      setRedeemCode("")
      refreshUsage()
    } else {
      setRedeemMsg(data.error || "兑换失败")
    }
    setRedeeming(false)
  }

  return (
    <aside className="flex w-[72px] md:w-64 flex-col border-r border-gray-100 bg-white shrink-0">
      <div className="px-3 md:px-6 py-5 flex items-center justify-center md:justify-start gap-2 border-b border-gray-100">
        <div className="h-8 w-8 rounded-lg bg-black flex items-center justify-center shrink-0">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold hidden md:block">老D</span>
      </div>

      <nav className="flex-1 px-1.5 md:px-3 py-4 space-y-1">
        {usage.isAdmin && (
          <Link href="/admin">
            <Button variant="ghost" size="sm"
              className="w-full justify-center md:justify-start gap-0 md:gap-3 h-10 text-amber-600 px-1 md:px-3">
              <Shield className="h-4 w-4" />
              <span className="hidden md:block text-xs font-medium">管理后台</span>
            </Button>
          </Link>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/analyze" && pathname.startsWith(item.href))
          return (
            <Link key={item.href} href={item.href} title={item.title}>
              <Button
                variant="ghost" size="sm"
                className={`w-full justify-center md:justify-start gap-0 md:gap-3 h-10 px-1 md:px-3 ${
                  isActive ? "bg-gray-100 text-black" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                <span className="hidden md:block text-xs font-medium">{item.title}</span>
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* 底部信息 — 移动端隐藏文字 */}
      <div className="px-2 md:px-4 py-4 border-t border-gray-100 space-y-2">
        <p className="text-[10px] md:text-xs text-gray-400 text-center md:text-left">
          <span className="font-medium text-sm md:hidden">{usage.credits}</span>
          <span className="hidden md:inline">剩余 <span className="font-medium">{usage.credits}</span> 分</span>
        </p>
        <Progress value={usage.monthlyCredits > 0 ? Math.round((usage.credits / usage.monthlyCredits) * 100) : 0} className="h-1" />
        <p className="text-[10px] text-gray-400 hidden md:block">
          {usage.plan === "FREE" ? "试用版" : usage.plan === "PRO" ? "创作者版" : "工作室版"}
        </p>

        {usage.credits <= 0 && (
          <div className="pt-2 border-t border-gray-100 space-y-1.5 hidden md:block">
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Ticket className="h-3 w-3" /><span>激活码</span>
            </div>
            <div className="flex gap-1">
              <Input placeholder="E-XXXX" value={redeemCode}
                onChange={e => setRedeemCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === "Enter" && handleRedeem()}
                className="h-8 text-xs font-mono" />
              <Button size="sm" onClick={handleRedeem} disabled={redeeming || !redeemCode.trim()} className="h-8 text-xs">
                {redeeming ? <Loader2 className="h-3 w-3 animate-spin" /> : "兑"}
              </Button>
            </div>
            {redeemMsg && <p className={`text-[10px] ${redeemMsg.includes("激活") ? "text-green-600" : "text-red-500"}`}>{redeemMsg}</p>}
          </div>
        )}
      </div>
    </aside>
  )
}
