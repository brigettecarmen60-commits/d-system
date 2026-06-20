"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGeneration } from "@/hooks/use-generation"
import { Camera, Loader2, Copy, RotateCcw, Sparkles, Shuffle } from "lucide-react"

const FRAMEWORKS = [
  { value: "auto", label: "自动匹配" },
  { value: "time-entropy", label: "时间熵增与不可逆" },
  { value: "unequal-exchange", label: "关系中的非等价交换" },
  { value: "mirror-reconciliation", label: "镜像与和解" },
  { value: "giant-mayfly", label: "巨物与蜉蝣" },
  { value: "ordinary-journey", label: "凡人之旅" },
  { value: "genuine-closure", label: "真诚的闭环" },
  { value: "hidden-order", label: "隐秘的秩序" },
]

const EMOTIONS = [
  { value: "auto", label: "自动匹配" },
  { value: "warm", label: "温暖" },
  { value: "release", label: "释然" },
  { value: "laugh", label: "笑" },
  { value: "surprise", label: "惊喜" },
  { value: "regret-warm", label: "遗憾但温暖" },
  { value: "anger-clarity", label: "愤怒后清醒" },
  { value: "absurd-relief", label: "荒诞后释然" },
  { value: "admiration", label: "向下兼容的仰视" },
  { value: "loved-unseen", label: "被世界暗中爱着" },
  { value: "fullness", label: "充盈——原来我一直被爱" },
]

const EMBED_DEPTHS = [
  { value: "bg-prop", label: "浅：产品只入镜，不主讲" },
  { value: "narrative-carrier", label: "中：产品推动故事，不是主角" },
  { value: "no-embed", label: "不提产品：故事独立成立" },
]

export default function SeedingPage() {
  const [product, setProduct] = useState("")
  const [face, setFace] = useState("")
  const [vow, setVow] = useState("")
  const [audience, setAudience] = useState("")
  const [framework, setFramework] = useState("auto")
  const [emotion, setEmotion] = useState("auto")
  const [embedDepth, setEmbedDepth] = useState("narrative-carrier")
  const { phase, statusMessage, rawText, error, runSeeding, reset } = useGeneration()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-2">
        <Camera className="h-5 w-5" />
        <h1 className="text-xl font-bold">剧情种草</h1>
      </div>
      <p className="text-sm text-gray-500">
        产品是道具，人是主角。六框架 × 情绪落点 → 完整脚本。
      </p>

      {phase === "idle" && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">产品 <span className="text-red-400">*</span></label>
              <Textarea
                placeholder="比如：得物App球鞋 / 赫莲娜面霜礼盒 / YSL口红 / XX颈椎按摩仪"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
                rows={2}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">人设脸谱</label>
                <Input placeholder="凡人之旅 / 技术狂魔 / …" value={face} onChange={(e) => setFace(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">发愿</label>
                <Input placeholder="守住底线 / 揭露真相 / …" value={vow} onChange={(e) => setVow(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">目标人群</label>
                <Input placeholder="打工人 / 年轻妈妈 / …" value={audience} onChange={(e) => setAudience(e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">情绪框架</label>
                <Select value={framework} onValueChange={setFramework}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FRAMEWORKS.map(f => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">情绪落点</label>
                <Select value={emotion} onValueChange={setEmotion}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMOTIONS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
                <label className="text-sm font-medium mb-1.5 block">嵌入深度</label>
                <Select value={embedDepth} onValueChange={setEmbedDepth}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {EMBED_DEPTHS.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            <div className="flex gap-3">
              <Button onClick={() => runSeeding(product, face, vow, audience, framework, emotion, embedDepth)} disabled={!product.trim()} className="flex-1 h-11">
                <Sparkles className="h-4 w-4 mr-2" />生成种草脚本
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setFramework("auto")
                  setEmotion("auto")
                  setEmbedDepth("narrative-carrier")
                  runSeeding(product, face, vow, audience, "auto", "auto", "narrative-carrier")
                }}
                disabled={!product.trim()}
                className="h-11"
                title="随机框架+情绪"
              >
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {phase === "generating" && (
        <Card>
          <CardContent className="py-16 text-center space-y-5">
            <Loader2 className="h-10 w-10 animate-spin mx-auto" />
            <p className="text-lg font-medium">{statusMessage || "选框架 → 定情绪 → 写故事…"}</p>
            {rawText && (
              <pre className="text-sm whitespace-pre-wrap font-sans bg-gray-50 rounded-xl p-4 text-left max-h-48 overflow-y-auto blur-[3px] select-none pointer-events-none">
                {rawText.slice(-500)}
              </pre>
            )}
            <Button variant="outline" size="sm" onClick={reset}>取消</Button>
          </CardContent>
        </Card>
      )}

      {phase === "complete" && rawText && (
        <div className="space-y-5">
          <Card>
            <CardContent className="p-6">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigator.clipboard.writeText(rawText)}>
              <Copy className="h-4 w-4 mr-2" />复制
            </Button>
            <Button variant="ghost" onClick={reset}>
              <RotateCcw className="h-4 w-4 mr-2" />重新生成
            </Button>
          </div>
        </div>
      )}

      {phase === "error" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 font-medium">生成失败</p>
            <p className="text-sm text-red-500 mt-1">{error}</p>
            <Button variant="outline" className="mt-4" onClick={reset}>重试</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
