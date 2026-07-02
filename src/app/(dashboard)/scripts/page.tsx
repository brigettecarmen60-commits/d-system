"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Plus, Search, Trash2, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import type { ScriptListItem, PaginatedResponse } from "@/types"

export default function ScriptsPage() {
  const [scripts, setScripts] = useState<ScriptListItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchScripts()
  }, [page, search])

  async function fetchScripts() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" })
      if (search) params.set("search", search)

      const res = await fetch(`/api/scripts?${params}`)
      if (!res.ok) throw new Error("加载失败")
      const data: PaginatedResponse<ScriptListItem> = await res.json()
      setScripts(data.items)
      setTotal(data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("确定删除这条脚本吗？")) return
    setDeleting(id)
    try {
      await fetch(`/api/scripts/${id}`, { method: "DELETE" })
      setScripts((prev) => prev.filter((s) => s.id !== id))
      setTotal((prev) => prev - 1)
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(null)
    }
  }

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">我的脚本</h1>
          <p className="text-muted-foreground text-sm mt-1">共 {total} 条</p>
        </div>
        <Link href="/script">
          <Button className="smooth shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            生成新脚本
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="搜索脚本选题..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="pl-10 bg-white/50 dark:bg-slate-900/50 border-border/50"
        />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="border shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-5 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : scripts.length === 0 ? (
        <Card className="border shadow-sm shadow-sm">
          <CardContent className="py-20 text-center">
            <div className="mx-auto h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-5">
              <FileText className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">还没有生成脚本</p>
            <p className="text-muted-foreground mb-6 mt-1">输入选题，生成你的第一条专业脚本</p>
            <Link href="/script">
              <Button className="smooth shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                去生成
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scripts.map((script) => (
              <Card key={script.id} className="border shadow-sm shadow-sm hover:shadow-md smooth group cursor-pointer">
                <CardContent className="p-5">
                  <Link href={`/scripts/${script.id}`}>
                    <h3 className="font-semibold line-clamp-2 mb-3 group-hover:text-primary smooth leading-snug">
                      {script.topic}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {script.emotionPath && (
                      <Badge variant="secondary" className="text-xs font-normal">{script.emotionPath}</Badge>
                    )}
                    {script.tonePersona && (
                      <Badge variant="outline" className="text-xs font-normal">{script.tonePersona}</Badge>
                    )}
                    {script.contentType && (
                      <Badge variant="outline" className="text-xs font-normal">{script.contentType}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                    {script.preview}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(script.createdAt).toLocaleDateString("zh-CN")}
                    </span>
                    <div className="flex gap-1">
                      <Link href={`/scripts/${script.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 smooth">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive smooth"
                        onClick={() => handleDelete(script.id)}
                        disabled={deleting === script.id}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="smooth"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="smooth"
              >
                下一页
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
