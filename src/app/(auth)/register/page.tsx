"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signIn } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, Mail, User, Lock, Key, MessageCircle, Loader2, ArrowLeft, Copy, Check } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [hasCode, setHasCode] = useState(false)

  // 公共字段
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  // 正式注册
  const [password, setPassword] = useState("")
  const [inviteCode, setInviteCode] = useState("")
  // 等记制
  const [reason, setReason] = useState("")

  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)
  const qq = "471665044"

  async function handleFullRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || !inviteCode) return
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password, inviteCode: inviteCode.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        // 自动登录
        const r = await signIn("credentials", { email: email.trim(), password, redirect: false })
        if (r?.ok) { router.push("/analyze"); router.refresh() }
        else { setDone(true) }
      } else {
        setError(data.error || "注册失败")
      }
    } catch { setError("网络错误，请重试") }
    finally { setLoading(false) }
  }

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError("")
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), name: name.trim(), reason: reason.trim() }),
      })
      setDone(true)
    } catch { setDone(true) }
    finally { setLoading(false) }
  }

  async function copyQQ() {
    await navigator.clipboard.writeText(qq)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 bg-white">
        <Card className="w-full max-w-md border border-gray-100 shadow-none">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <MessageCircle className="h-6 w-6 text-amber-500" />
            </div>
            <CardTitle>{hasCode ? "注册成功" : "已登记"}</CardTitle>
            <CardDescription>
              {hasCode ? (
                "账号已创建。如未自动跳转，请返回登录页。"
              ) : (
                <>感谢 <span className="font-medium text-black">{email}</span>，你的申请已收到。</>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-5">
            <div className="p-4 rounded-xl bg-gray-50 text-left space-y-3">
              <p className="text-sm text-gray-500">添加客服获取邀请码：</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400">客服 QQ</p>
                  <p className="text-lg font-bold font-mono">{qq}</p>
                </div>
                <Button variant="outline" size="sm" onClick={copyQQ}>
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-1">{copied ? "已复制" : "复制"}</span>
                </Button>
              </div>
              <p className="text-xs text-gray-400">添加时请备注"老D邀请码"</p>
            </div>
            <div className="flex justify-center gap-3">
              <Link href="/login"><Button variant="ghost" size="sm">去登录</Button></Link>
              <Link href="/"><Button variant="ghost" size="sm"><ArrowLeft className="h-3.5 w-3.5 mr-1" />返回首页</Button></Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-white">
      <Card className="w-full max-w-md border border-gray-100 shadow-none">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-xl bg-black flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
          </Link>
          <CardTitle>{hasCode ? "注册账号" : "申请内测资格"}</CardTitle>
          <CardDescription>
            {hasCode ? "使用邀请码创建账号" : "留下联系方式，客服将为你分配邀请码"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={hasCode ? handleFullRegister : handleWaitlist} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input type="text" placeholder="你的名字" value={name} onChange={(e) => setName(e.target.value)} required className="pl-10" />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus className="pl-10" />
            </div>

            {hasCode ? (
              <>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input type="password" placeholder="设置密码" value={password} onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input type="text" placeholder="邀请码 E-XXXX-XXXX" value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value.toUpperCase())} required className="pl-10 font-mono" />
                </div>
              </>
            ) : (
              <Textarea placeholder="为什么想使用老D？（选填）" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} className="resize-none" />
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 rounded-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />处理中...</> : hasCode ? "注册" : "提交申请"}
            </Button>
          </form>

          {/* 切换模式 */}
          <div className="mt-4 text-center">
            <button type="button" onClick={() => { setHasCode(!hasCode); setError("") }}
              className="text-sm text-gray-400 hover:text-black transition-colors">
              {hasCode ? "没有邀请码？申请内测资格" : "已有邀请码？立即注册"}
            </button>
          </div>

          <p className="mt-3 text-center text-sm text-gray-400">
            已有账号？{" "}<Link href="/login" className="text-black hover:underline font-medium">登录</Link>
          </p>
          <div className="mt-4 text-center">
            <Link href="/" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-black">
              <ArrowLeft className="h-3 w-3" />返回首页
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
