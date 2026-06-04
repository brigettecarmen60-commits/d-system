"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, Mail, Key, ArrowLeft, Loader2, LogIn } from "lucide-react"
import { siteConfig } from "@/config/site"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError("")
    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        code: code.trim() || undefined,
        redirect: false,
      })
      if (result?.ok) { router.push("/analyze"); router.refresh() }
      else if (result?.error === "Configuration") {
        // 降级：尝试邮箱链接
        const r2 = await signIn("email", { email: email.trim(), redirect: false })
        if (r2?.ok) setError("请检查邮箱中的登录链接")
        else setError("登录失败")
      }
      else { setError("登录失败，请检查邮箱和邀请码") }
    } catch { setError("网络错误") }
    finally { setLoading(false) }
  }

  // 开发模式：一键登录
  async function handleDevLogin() {
    setLoading(true)
    setError("")
    try {
      const result = await signIn("credentials", {
        email: "admin@dev.local",
        redirect: false,
      })
      if (result?.ok) { router.push("/analyze"); router.refresh() }
      else { setError("登录失败") }
    } catch { setError("网络错误") }
    finally { setLoading(false) }
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
          <CardTitle>登录 {siteConfig.name}</CardTitle>
          <CardDescription>输入邮箱和邀请码</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoFocus className="pl-10" />
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input type="text" placeholder="邀请码 E-XXXX-XXXX（选填）" value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())} className="pl-10 font-mono" />
            </div>
            {error && <p className={`text-sm ${error.includes("请检查") ? "text-gray-500" : "text-red-500"}`}>{error}</p>}
            <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 rounded-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />处理中...</> : "登录"}
            </Button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center mb-3">开发模式 — 一键登录</p>
            <Button variant="outline" className="w-full rounded-full" onClick={handleDevLogin} disabled={loading}>
              <LogIn className="h-4 w-4 mr-2" />{loading ? "登录中..." : "一键登录（管理员）"}
            </Button>
          </div>

          <p className="mt-4 text-center text-sm text-gray-400">
            还没有账号？{" "}<Link href="/register" className="text-black hover:underline font-medium">申请内测</Link>
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
