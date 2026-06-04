"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ArrowRight, Sparkles } from "lucide-react"
import { InviteCodeModal } from "@/components/auth/InviteCodeModal"
import { siteConfig } from "@/config/site"

export default function LandingPage() {
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <InviteCodeModal open={inviteOpen} onOpenChange={setInviteOpen} />

      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight text-black">
            <span className="h-7 w-7 rounded-md bg-black text-white flex items-center justify-center text-xs font-bold">D</span>
            {siteConfig.name}
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-500 hover:text-black transition-colors">登录</Link>
            <Link href="/register">
              <Button size="sm" className="bg-black text-white hover:bg-black/90 rounded-full h-9 px-5 text-sm font-medium">申请内测</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="pt-32 pb-20 px-6">
          <div className="mx-auto max-w-4xl text-center">
            <Badge className="mb-8 px-4 py-1.5 text-xs bg-gray-100 text-gray-500 border-0 rounded-full">
              邀请制内测中
            </Badge>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-black">
              不只是写脚本
              <br />
              <span className="text-gray-300">是建立一套</span>
              <br />
              <span className="text-amber-500">内容生产线</span>
            </h1>
            <p className="mt-8 text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
              赛道分析 → 个人定位 → 选题生成 → 脚本输出 → 数据复盘。
              <br />
              每一步都有方法论支撑，每条内容都经过情绪设计。
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 rounded-full bg-black text-white hover:bg-black/90 font-medium"
                onClick={() => setInviteOpen(true)}>
                获取邀请码
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <a href="#workflow">
                <Button variant="ghost" size="lg" className="h-12 px-8 rounded-full text-gray-400 hover:text-black">
                  了解更多
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* 完整工作流 */}
        <section id="workflow" className="px-6 py-24 border-t border-gray-100">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-16">
              <p className="text-sm font-medium text-amber-500 tracking-widest uppercase mb-4">How it works</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">完整工作流</h2>
              <p className="mt-4 text-gray-400 max-w-lg mx-auto">
                五步闭环。每一步都有专门设计的处理环节，不是简单的输入-输出。
              </p>
            </div>

            <div className="grid gap-3">
              {[
                { step: "01", title: "赛道分析", desc: "六点雷达扫描 + 真实数据搜索。告诉你这个赛道能不能做，钱在哪，坑在哪。" },
                { step: "02", title: "个人定位", desc: "四 Phase 定位系统：前置过滤→商业模式→灵魂挖掘→Strategy_DNA。找到只有你能占的位置。" },
                { step: "03", title: "选题生成", desc: "五种模式：纪实进化/荒诞进化/共识挖掘/转化工厂/信任工厂。每条选题都击中人性的某个共识。" },
                { step: "04", title: "脚本输出", desc: "情绪路径设计 × 语气人格匹配 × 去AI味扫描。不是AI腔，是一个真人在说话。" },
                { step: "05", title: "数据复盘", desc: "自动计算派生比率 + 转化漏斗诊断 + 评论聚类 + 优化建议。知道为什么成了，为什么没成。" },
              ].map((p) => (
                <div key={p.step} className="flex items-start gap-6 p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-300">
                    {p.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-black">{p.title}</h3>
                    <p className="text-sm text-gray-400 mt-1">{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Demo placeholder */}
            <div className="mt-8 rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-3 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gray-300" /><div className="w-3 h-3 rounded-full bg-gray-300" /><div className="w-3 h-3 rounded-full bg-gray-300" />
                </div>
                <span className="text-xs text-gray-400 ml-3">输出示例 — 待补充</span>
              </div>
              <div className="p-12 text-center text-gray-300 text-sm">示例内容将由老D提供</div>
            </div>
          </div>
        </section>

        {/* 内测邀请 */}
        <section className="px-6 py-24 border-t border-gray-100">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-black">内测邀请中</h2>
            <p className="mt-6 text-gray-400 max-w-md mx-auto">
              内测阶段采用邀请制。添加客服 QQ 获取邀请码，即刻解锁全部功能。
            </p>
            <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gray-50 border border-gray-100">
              <span className="text-sm text-gray-400">客服 QQ</span>
              <span className="text-xl font-bold font-mono text-black">471665044</span>
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText("471665044") }}>
                复制
              </Button>
            </div>
            <div className="mt-8 flex justify-center gap-6">
              <div className="w-32 h-32 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1">
                <Sparkles className="h-8 w-8 text-gray-300" />
                <span className="text-xs text-gray-300">微信</span>
              </div>
              <div className="w-32 h-32 rounded-xl bg-gray-50 border border-dashed border-gray-200 flex flex-col items-center justify-center gap-1">
                <Sparkles className="h-8 w-8 text-gray-300" />
                <span className="text-xs text-gray-300">二维码</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-10 px-6">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-5 w-5 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">D</span>
            <span className="text-sm font-medium text-gray-400">{siteConfig.name}</span>
          </div>
          <p className="text-sm text-gray-300">商业IP内容引擎 · 邀请制内测</p>
          <div className="flex gap-6 text-sm text-gray-300">
            <span>隐私政策</span>
            <span>服务条款</span>
            <span>联系我们</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
