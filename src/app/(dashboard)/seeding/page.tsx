"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useGeneration } from "@/hooks/use-generation"
import { recordActivity } from "@/lib/activity"
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

const STORYTELLERS = [
  { value: "auto", label: "不指定（AI 自动判断）" },
  { value: "everyman", label: "普通人 — 没光环、没背景、靠死磕硬扛。观众觉得'他也是我'" },
  { value: "obsessive-expert", label: "较真的专家 — 对一件事钻到变态。观众觉得'他说的我信'" },
  { value: "scarred-veteran", label: "踩过坑的老手 — 有伤痕、在交底。观众觉得'他在帮我'" },
  { value: "truth-teller", label: "敢说真话的人 — 看见潜规则就拆穿。观众觉得'终于有人说了'" },
  { value: "custom", label: "自定义 — 我自己描述讲故事的人" },
]

export default function SeedingPage() {
  const [product, setProduct] = useState("")
  const [storyteller, setStoryteller] = useState("")
  const [storytellerCustom, setStorytellerCustom] = useState("")
  const [audience, setAudience] = useState("")
  const [framework, setFramework] = useState("auto")
  const [emotion, setEmotion] = useState("auto")
  const [embedDepth, setEmbedDepth] = useState("narrative-carrier")
  const [medium, setMedium] = useState("auto")
  const [depth, setDepth] = useState("standard")
  const [structure, setStructure] = useState("auto")
  const { phase, statusMessage, rawText, error, runSeeding, reset } = useGeneration()

  function handleGenerate(randomize = false) {
    const st = storyteller === "custom" ? storytellerCustom : storyteller
    runSeeding(
      product,
      st || undefined,
      undefined, // vow — merged into storyteller
      audience,
      randomize ? "auto" : framework,
      randomize ? "auto" : emotion,
      embedDepth,
      randomize ? "auto" : medium,
      depth,
      randomize ? "auto" : structure
    )
  }

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
            {/* 产品 */}
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

            {/* 讲故事的人 + 目标人群 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">讲故事的人</label>
                <Select value={storyteller} onValueChange={setStoryteller}>
                  <SelectTrigger><SelectValue placeholder="选一个最像你的人…" /></SelectTrigger>
                  <SelectContent>
                    {STORYTELLERS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                {storyteller === "custom" && (
                  <Input
                    placeholder="比如：一个在城中村开理发店的单亲妈妈 / 一个被裁后决定做自己的前大厂员工"
                    value={storytellerCustom}
                    onChange={(e) => setStorytellerCustom(e.target.value)}
                    className="mt-2"
                  />
                )}
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">目标人群</label>
                <Input placeholder="比如：25岁独居女生 / 新手爸妈 / 刚被裁的人" value={audience} onChange={(e) => setAudience(e.target.value)} />
              </div>
            </div>

            {/* 框架 + 情绪 */}
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

            {/* 嵌入深度 */}
            <div>
              <label className="text-sm font-medium mb-1.5 block">介质</label>
              <Select value={medium} onValueChange={setMedium}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动判定</SelectItem>
                  <SelectItem value="口播">口播型 — 对着镜头讲</SelectItem>
                  <SelectItem value="Vlog">Vlog型 — 画面+旁白</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">脚本结构</label>
              <Select value={structure} onValueChange={setStructure}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">自动判定</SelectItem>
                  <SelectItem value="起承转合">起承转合</SelectItem>
                  <SelectItem value="Harmon故事圈">Harmon故事圈</SelectItem>
                  <SelectItem value="救猫咪">救猫咪 — 困境→转机→胜利</SelectItem>
                  <SelectItem value="倒叙悬念">倒叙悬念 — 结局前置</SelectItem>
                  <SelectItem value="时光机">时光机 — 旧物→闪回→升华</SelectItem>
                  <SelectItem value="镜像共鸣">镜像共鸣 — 你是不是也…</SelectItem>
                  <SelectItem value="悬疑盒子">悬疑盒子 — 钩子→线索→反转</SelectItem>
                  <SelectItem value="滞后揭示链">滞后揭示链 — FW2→FW1→FW6→FW3</SelectItem>
                  <SelectItem value="证据链叙事">证据链叙事</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">叙事深度</label>
              <Select value={depth} onValueChange={setDepth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">超短 — 单技法，极度压缩</SelectItem>
                  <SelectItem value="standard">标准 — 双技法叠加</SelectItem>
                  <SelectItem value="long">长篇 — 三技法完整弧线</SelectItem>
                </SelectContent>
              </Select>
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
              <Button onClick={() => handleGenerate(false)} disabled={!product.trim() || (storyteller === "custom" && !storytellerCustom.trim())} className="flex-1 h-11">
                <Sparkles className="h-4 w-4 mr-2" />生成种草脚本
              </Button>
              <Button variant="outline" onClick={() => handleGenerate(true)} disabled={!product.trim() || (storyteller === "custom" && !storytellerCustom.trim())} className="h-11" title="随机框架+情绪">
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
          {(() => { recordActivity({ type: "seeding", title: "剧情种草", timestamp: Date.now() }); return null })()}
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
