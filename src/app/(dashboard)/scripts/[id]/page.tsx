"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

export default function ScriptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [script, setScript] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/scripts/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/scripts")
        } else {
          setScript(data)
        }
      })
      .catch(() => router.push("/scripts"))
      .finally(() => setLoading(false))
  }, [params.id, router])

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!script) return null

  const output = script.outputJson as any

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/scripts" className="text-sm text-muted-foreground hover:underline">
            ← 返回列表
          </Link>
          <h1 className="text-2xl font-bold mt-1">{script.topic}</h1>
          <div className="flex gap-2 mt-2">
            {script.emotionPath && <Badge variant="secondary">{script.emotionPath}</Badge>}
            {script.tonePersona && <Badge variant="outline">{script.tonePersona}</Badge>}
            {script.contentType && <Badge variant="outline">{script.contentType}</Badge>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigator.clipboard.writeText(script.outputMarkdown)}
          >
            复制全文
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const blob = new Blob([script.outputMarkdown], { type: "text/markdown" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `${script.topic.slice(0, 30)}.md`
              a.click()
              URL.revokeObjectURL(url)
            }}
          >
            下载 .md
          </Button>
        </div>
      </div>

      {/* Emotion Design */}
      {output?.emotionDesign && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🎬 情绪设计</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1 text-sm">
            <div>路径：{output.emotionDesign.path}</div>
            <div>A→B：{output.emotionDesign.abTransition}</div>
            <div>语气：{output.emotionDesign.tonePersona}</div>
          </CardContent>
        </Card>
      )}

      {/* Raw Markdown Output */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">📝 完整脚本</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
            {script.outputMarkdown}
          </pre>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground text-center pb-8">
        生成于 {new Date(script.createdAt).toLocaleString("zh-CN")}
      </div>
    </div>
  )
}
