"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Key, Users, Copy, Check, Plus, Trash2, ClipboardList } from "lucide-react"

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">管理后台</h1>
      <Tabs defaultValue="invite-codes">
        <TabsList>
          <TabsTrigger value="invite-codes"><Key className="h-4 w-4 mr-1" />邀请码</TabsTrigger>
          <TabsTrigger value="users"><Users className="h-4 w-4 mr-1" />用户管理</TabsTrigger>
          <TabsTrigger value="waitlist"><ClipboardList className="h-4 w-4 mr-1" />登记列表</TabsTrigger>
        </TabsList>
        <TabsContent value="invite-codes" className="mt-4">
          <InviteCodePanel />
        </TabsContent>
        <TabsContent value="users" className="mt-4">
          <UserPanel />
        </TabsContent>
        <TabsContent value="waitlist" className="mt-4">
          <WaitlistPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InviteCodePanel() {
  const [codes, setCodes] = useState<any[]>([])
  const [count, setCount] = useState(10)
  const [credits, setCredits] = useState(50)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const loadCodes = useCallback(async () => {
    const res = await fetch("/api/admin/invite-codes")
    if (res.ok) {
      const data = await res.json()
      setCodes(data.codes || [])
    }
  }, [])

  useEffect(() => { loadCodes() }, [loadCodes])

  async function generate() {
    setGenerating(true)
    const res = await fetch("/api/admin/invite-codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count, credits }),
    })
    if (res.ok) {
      const data = await res.json()
      // 自动复制最新一批
      const allCodes = data.codes.map((c: any) => c.code).join("\n")
      await navigator.clipboard.writeText(allCodes)
      setCopied("all")
      setTimeout(() => setCopied(null), 3000)
      loadCodes()
    }
    setGenerating(false)
  }

  async function deleteAll() {
    if (!confirm("确定删除所有未使用的邀请码？")) return
    await fetch("/api/admin/invite-codes", { method: "DELETE" })
    loadCodes()
  }

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle className="text-lg">生成邀请码</CardTitle></CardHeader>
        <CardContent className="flex gap-3 items-end flex-wrap">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">数量</label>
            <Input type="number" value={count} onChange={e => setCount(parseInt(e.target.value) || 10)} min={1} max={100} className="w-24" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">每张积分</label>
            <Input type="number" value={credits} onChange={e => setCredits(parseInt(e.target.value) || 50)} min={10} max={5000} step={10} className="w-24" />
          </div>
          <Button onClick={generate} disabled={generating} className="bg-amber-500 hover:bg-amber-600 text-white">
            <Plus className="h-4 w-4 mr-1" />
            {generating ? "生成中..." : copied === "all" ? "已生成并复制 ✓" : "生成"}
          </Button>
          <Button variant="ghost" size="sm" onClick={deleteAll} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-1" />清空未使用
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">邀请码列表（{codes.length}）</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {codes.map((c: any) => (
              <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm">
                <div className="flex items-center gap-3">
                  <code className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{c.code}</code>
                  <Badge variant="secondary">{c.credits} 分</Badge>
                  {c.usedBy ? (
                    <span className="text-xs text-muted-foreground">已使用 · {new Date(c.usedAt).toLocaleDateString()}</span>
                  ) : (
                    <span className="text-xs text-green-600">可用</span>
                  )}
                </div>
                {!c.usedBy && (
                  <Button variant="ghost" size="sm" onClick={() => copyCode(c.code)}>
                    {copied === c.code ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UserPanel() {
  const [users, setUsers] = useState<any[]>([])
  const [query, setQuery] = useState("")
  const [adding, setAdding] = useState<{ [id: string]: number }>({})

  async function search(q?: string) {
    const url = q ? `/api/admin/users?q=${encodeURIComponent(q)}` : "/api/admin/users"
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      setUsers(data.users || [])
    }
  }

  useEffect(() => { search() }, [])

  async function addCredits(userId: string, credits: number) {
    await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, credits }),
    })
    search(query)
    setAdding(prev => ({ ...prev, [userId]: 0 }))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Input placeholder="搜索用户邮箱..." value={query} onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search(query)}
              className="max-w-sm" />
            <Button variant="outline" onClick={() => search(query)}>搜索</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">用户列表（{users.length}）</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <div>
                    <p className="font-medium truncate">{u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.name || "—"}</p>
                  </div>
                  <Badge variant={u.plan === "FREE" ? "outline" : u.plan === "PRO" ? "default" : "secondary"}>
                    {u.plan === "FREE" ? "试用版" : u.plan === "PRO" ? "创作者版" : u.plan === "ENTERPRISE" ? "工作室版" : "无套餐"}
                  </Badge>
                  <span className="text-xs font-medium">{u.credits} 分剩余</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Input type="number" placeholder="加分" min={10} max={5000}
                    value={adding[u.id] ?? ""}
                    onChange={e => setAdding(prev => ({ ...prev, [u.id]: parseInt(e.target.value) || 0 }))}
                    className="w-20 h-8 text-xs" />
                  <Button size="sm" variant="outline" disabled={!adding[u.id]}
                    onClick={() => addCredits(u.id, adding[u.id])}>
                    充值
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── 登记列表（已注册但未激活邀请码的用户） ───
function WaitlistPanel() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    const res = await fetch("/api/admin/waitlist")
    if (res.ok) {
      const data = await res.json()
      setEntries(data.entries || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          登记列表（{entries.length}）
          <Button variant="ghost" size="sm" onClick={load} disabled={loading}>刷新</Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-8">加载中...</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">暂无登记</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {entries.map((e: any) => (
              <div key={e.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30 text-sm">
                <div>
                  <p className="font-medium">{e.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {e.name || "—"} · {new Date(e.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <Badge variant={e.hasSubscription ? "default" : "outline"}>
                  {e.hasSubscription ? "已激活" : "待发码"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
