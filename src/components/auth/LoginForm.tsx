"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sparkles, Mail, Key, Lock, ArrowLeft, Loader2 } from "lucide-react"
import { siteConfig } from "@/config/site"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError("")
    try {
      const credentials: any = { email: email.trim(), redirect: false }
      if (isAdmin) {
        credentials.password = password
      } else if (code.trim()) {
        credentials.code = code.trim().toUpperCase()
      }

      const result: any = await signIn("credentials", credentials)
      if (result?.ok) { router.push("/analyze"); router.refresh() }
      else { setError(isAdmin ? "邮箱或密码错误" : "登录失败，请检查邮箱和邀请码") }
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
          <CardDescription>{isAdmin ? "管理员登录" : "使用邀请码登录"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input type="email" placeholder="your@email.com" value={email}
                onChange={(e) => setEmail(e.target.value)} required autoFocus className="pl-10" />
            </div>

            {isAdmin ? (
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input type="password" placeholder="管理员密码" value={password}
                  onChange={(e) => setPassword(e.target.value)} required className="pl-10" />
              </div>
            ) : (
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input type="text" placeholder="邀请码 E-XXXX-XXXX" value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())} className="pl-10 font-mono" />
              </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-black text-white hover:bg-black/90 rounded-full" disabled={loading}>
              {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />处理中...</> : "登录"}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button type="button" onClick={() => setIsAdmin(!isAdmin)}
              className="text-sm text-gray-400 hover:text-black transition-colors">
              {isAdmin ? "使用邀请码登录" : "管理员登录"}
            </button>
          </div>

          <p className="mt-3 text-center text-sm text-gray-400">
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
