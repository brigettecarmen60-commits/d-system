"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Coffee, Loader2, RotateCcw, Copy, Check, ArrowRight } from "lucide-react"
import { useGeneration } from "@/hooks/use-generation"
import Link from "next/link"

export default function CContentPage() {
  const [content, setContent] = useState("")
  const [copied, setCopied] = useState(false)
  const { phase, statusMessage, rawText, error, runTopics, reset } = useGeneration()

  function handleGenerate() {
    runTopics(content, "c-content", {})
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(rawText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Coffee className="h-6 w-6 text-amber-500" />普通人挖掘</h1>
      <p className="text-muted-foreground text-sm">
        不需要赛道、不需要专业、不需要IP。告诉我你手边有什么，4拉杆老虎机帮你算出能拍的有趣内容。
      </p>

      {phase === "idle" && (
        <Card className="border border-gray-100 shadow-none">
          <CardContent className="p-6 space-y-4">
            <Textarea
              placeholder={`随便写，想到什么写什么。比如：

"我一个人住，养了只猫。每天下班回来就煮泡面、撸猫、刷手机。阳台种了几盆多肉快死了。周末偶尔去菜市场。"`}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="resize-none text-base"
            />
            <Button
              onClick={handleGenerate}
              disabled={!content.trim() || content.trim().length < 10}
              className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <Coffee className="h-4 w-4 mr-2" />看看我能拍什么
            </Button>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card className="border border-gray-100 shadow-none">
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 text-amber-500 animate-spin mx-auto" />
            <p className="text-lg font-medium text-gray-500">{statusMessage || "正在帮你看…"}</p>
            {rawText && <pre className="text-sm whitespace-pre-wrap font-sans bg-gray-50 rounded-xl p-4 text-left max-h-80 overflow-y-auto blur-[3px] select-none">{rawText.slice(-300)}</pre>}
            <Button variant="outline" size="sm" onClick={reset}>取消</Button>
          </CardContent>
        </Card>
      )}

      {phase === "complete" && rawText && (
        <div className="space-y-4">
          <Card className="border border-gray-100 shadow-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold">你的内容方向</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                    {copied ? "已复制" : "复制"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={reset}>重新来</Button>
                </div>
              </div>
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-none bg-gray-50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">想认真做一个IP？</p>
                <p className="text-xs text-gray-500">老D定位系统帮你做完整战略判断——路线、人设、发愿、三个钉子。</p>
              </div>
              <Link href="/positioning">
                <Button variant="outline" size="sm"><ArrowRight className="h-4 w-4 mr-1" />去老D定位</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {phase === "error" && (
        <Card className="border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>
      )}
    </div>
  )
}
