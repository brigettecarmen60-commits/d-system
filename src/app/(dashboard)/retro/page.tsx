"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { BarChart3, Loader2, Copy, Check, Coins, Download } from "lucide-react"
import { downloadMarkdown } from "@/lib/utils"
import { useGeneration } from "@/hooks/use-generation"

export default function RetroPage() {
  const [topic, setTopic] = useState("")
  const [publishDate, setPublishDate] = useState("")
  const [platform, setPlatform] = useState("")
  const [performance, setPerformance] = useState("")
  const [conversion, setConversion] = useState("")
  const [comments, setComments] = useState("")
  const [copied, setCopied] = useState(false)

  const { phase, statusMessage, rawText, tokens, usedModel, error, reset, runRetro } = useGeneration()

  function handleSubmit() {
    if (!topic.trim()) return
    runRetro({ topic: topic.trim(), publishDate, platform, performance, conversion, comments })
  }

  async function copyResult() {
    await navigator.clipboard.writeText(rawText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-emerald-500" />内容复盘</h1>

      {tokens && phase === "complete" && (
        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
          <Coins className="h-3.5 w-3.5" />{tokens.totalTokens.toLocaleString()} tokens
        </div>
      )}

      {/* 输入表单 */}
      {phase === "idle" && (
        <Card className="border border-gray-100 shadow-none">
          <CardContent className="p-6 space-y-4">
            <p className="text-sm text-muted-foreground">
              输入已发布内容的各项数据，系统自动分析表现、诊断转化漏斗、提炼优化建议。
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="内容标题/选题 *" value={topic} onChange={e => setTopic(e.target.value)} />
              <Input placeholder="发布平台（抖音/B站/小红书等）" value={platform} onChange={e => setPlatform(e.target.value)} />
            </div>
            <Input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)}
              className="max-w-[200px]" />

            <Textarea
              placeholder={"表现数据（直接粘贴，格式随意）：\n播放 71.1w\n点赞 2.4w\n评论 899\n转发 1.8w\n收藏 5251"}
              value={performance} onChange={e => setPerformance(e.target.value)}
              rows={5} className="resize-none text-sm" />

            <Textarea
              placeholder={"转化数据（选填）：\n主页访问 3.2w\n涨粉 4200\n私域导流（加微信/进群）320\n付费转化 47单 / ¥3290"}
              value={conversion} onChange={e => setConversion(e.target.value)}
              rows={4} className="resize-none text-sm" />

            <Textarea
              placeholder={"Top 评论（选填，直接粘贴高赞评论，每条带赞数）：\n👍128 终于有人说这个了！\n👍89 怎么买？在哪买？\n👍56 关注了关注了"}
              value={comments} onChange={e => setComments(e.target.value)}
              rows={5} className="resize-none text-sm" />

            <Button onClick={handleSubmit} disabled={!topic.trim()}
              className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white">
              <BarChart3 className="h-4 w-4 mr-2" />开始复盘
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 生成中 */}
      {phase === "generating" && (
        <Card className="border border-gray-100 shadow-none">
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto" />
            <p className="text-lg font-medium">{statusMessage || "系统思考中，请稍候…"}</p>
            {rawText && (
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 rounded-xl p-4 text-left max-h-80 overflow-y-auto">
                {rawText.slice(-800)}
              </pre>
            )}
            <Button variant="outline" size="sm" onClick={reset}>取消</Button>
          </CardContent>
        </Card>
      )}

      {/* 结果 */}
      {phase === "complete" && rawText && (
        <Card className="border border-gray-100 shadow-none">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">复盘报告</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyResult}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "已复制" : "复制"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadMarkdown(rawText, `复盘-${topic.slice(0, 20)}-${new Date().toISOString().slice(0, 10)}`)}>
                  <Download className="h-4 w-4 mr-1" />导出 MD
                </Button>
              </div>
            </div>
            <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/30 rounded-xl p-4 max-h-[600px] overflow-y-auto leading-relaxed">
              {rawText}
            </pre>
            <div className="flex justify-between pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={reset}>重新复盘</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "error" && (
        <Card className="border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>
      )}
    </div>
  )
}
