"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Loader2, Copy, Check, Coins, Download, TrendingUp } from "lucide-react"
import { downloadMarkdown } from "@/lib/utils"
import { useGeneration } from "@/hooks/use-generation"
import { recordActivity, recordPipelineStage } from "@/lib/activity"

export default function RetroPage() {
  const searchParams = useSearchParams()
  const topicFromUrl = searchParams.get("topic") || ""
  const [activeTab, setActiveTab] = useState("single")

  // Plan A
  const [topic, setTopic] = useState(topicFromUrl)
  const [singlePurpose, setSinglePurpose] = useState("")
  const [publishDate, setPublishDate] = useState("")
  const [platform, setPlatform] = useState("")
  const [performance, setPerformance] = useState("")
  const [conversion, setConversion] = useState("")
  const [comments, setComments] = useState("")

  // Plan B
  const [accountPurpose, setAccountPurpose] = useState("")
  const [recent10, setRecent10] = useState("")
  const [best, setBest] = useState("")
  const [worst, setWorst] = useState("")

  const [copied, setCopied] = useState(false)
  const { phase, statusMessage, rawText, tokens, error, reset, runRetro, runAccountRetro } = useGeneration()

  function handleSingleRetro() {
    if (!topic.trim()) return
    runRetro({ topic: topic.trim(), purpose: singlePurpose.trim(), publishDate, platform, performance, conversion, comments })
  }

  function handleAccountRetro() {
    if (!accountPurpose.trim() || !recent10.trim()) return
    runAccountRetro({ purpose: accountPurpose.trim(), recent10: recent10.trim(), best: best.trim(), worst: worst.trim() })
  }

  async function copyResult() {
    await navigator.clipboard.writeText(rawText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="h-6 w-6 text-emerald-500" />内容复盘</h1>


      {phase === "idle" && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="single" className="flex-1">单条复盘</TabsTrigger>
            <TabsTrigger value="account" className="flex-1">账号体检</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <Card className="border shadow-sm mt-4">
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">输入已发布内容的数据，诊断哪里行、哪里不行、下次试什么。</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input placeholder="内容标题/选题 *" value={topic} onChange={e => setTopic(e.target.value)} />
                  <Input placeholder="目的 * （流量/转化/信任）" value={singlePurpose} onChange={e => setSinglePurpose(e.target.value)} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input placeholder="发布平台" value={platform} onChange={e => setPlatform(e.target.value)} />
                  <Input type="date" value={publishDate} onChange={e => setPublishDate(e.target.value)} />
                </div>
                <Textarea placeholder={"漏斗数据（直接粘贴）：\n播放 71.1w\n2秒跳出率 32%\n5秒完播率 55%\n均播时长 42s\n完播率 18%\n点赞 2.4w\n评论 899\n转发 1.8w\n收藏 5251"} value={performance} onChange={e => setPerformance(e.target.value)} rows={5} className="resize-none text-sm" />
                <Textarea placeholder={"转化数据（选填）：\n主页访问 3.2w\n涨粉 4200"} value={conversion} onChange={e => setConversion(e.target.value)} rows={3} className="resize-none text-sm" />
                <Textarea placeholder={"评论（选填，带赞数）：\n👍128 终于有人说这个了！\n👍89 怎么买？"} value={comments} onChange={e => setComments(e.target.value)} rows={4} className="resize-none text-sm" />
                <Button onClick={handleSingleRetro} disabled={!topic.trim() || !singlePurpose.trim()} className="w-full h-11 bg-[#1a1a2e] hover:bg-[#2d2d4a] text-white rounded-lg font-medium shadow-sm">
                  <BarChart3 className="h-4 w-4 mr-2" />复盘这条
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account">
            <Card className="border shadow-sm mt-4">
              <CardContent className="p-6 space-y-4">
                <p className="text-sm text-muted-foreground">提供账号目的、近期数据、历史最好/最差内容——系统对比判断方向对不对。</p>
                <Input placeholder="账号目的 * （如：通过抖音获客卖课 / 建个人IP做咨询 / 泛流量接广告）" value={accountPurpose} onChange={e => setAccountPurpose(e.target.value)} />
                <Textarea placeholder={"近期10条数据 * \n每条一行，粘数据就行：\n6/1 选题A — 播放5.2w 赞1200 评89\n6/3 选题B — 播放8k 赞150 评12\n..."} value={recent10} onChange={e => setRecent10(e.target.value)} rows={6} className="resize-none text-sm" />
                <Textarea placeholder={"历史最好内容（选填）\n粘2-3条最好的，格式同上"} value={best} onChange={e => setBest(e.target.value)} rows={3} className="resize-none text-sm" />
                <Textarea placeholder={"历史最差内容（选填）\n粘2-3条最差的，格式同上"} value={worst} onChange={e => setWorst(e.target.value)} rows={3} className="resize-none text-sm" />
                <Button onClick={handleAccountRetro} disabled={!accountPurpose.trim() || !recent10.trim()} className="w-full h-11 bg-[#1a1a2e] hover:bg-[#2d2d4a] text-white rounded-lg font-medium shadow-sm">
                  <TrendingUp className="h-4 w-4 mr-2" />账号体检
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {phase === "generating" && (
        <Card className="border shadow-sm">
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto" />
            <p className="text-lg font-medium">{statusMessage || "分析中…"}</p>
            {rawText && <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans bg-muted/30 rounded-xl p-4 text-left max-h-80 overflow-y-auto">{rawText.slice(-500)}</pre>}
            <Button variant="outline" size="sm" onClick={reset}>取消</Button>
          </CardContent>
        </Card>
      )}

      {phase === "complete" && rawText && (
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">{activeTab === "single" ? "复盘报告" : "体检报告"}</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyResult}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "已复制" : "复制"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => downloadMarkdown(rawText, `复盘-${new Date().toISOString().slice(0, 10)}`)}>
                  <Download className="h-4 w-4 mr-1" />导出
                </Button>
              </div>
            </div>
            <pre className="text-sm whitespace-pre-wrap font-sans bg-muted/30 rounded-xl p-4 max-h-[600px] overflow-y-auto leading-relaxed">{rawText}</pre>
            <div className="flex justify-between pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={reset}>重新复盘</Button>
            </div>
            {/* 活动追踪 */}
            {(() => { recordActivity({ type: "retro", niche: topic, title: topic, timestamp: Date.now() }); recordPipelineStage("retro", topic); return null })()}
          </CardContent>
        </Card>
      )}

      {phase === "error" && (
        <Card className="border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>
      )}
    </div>
  )
}
