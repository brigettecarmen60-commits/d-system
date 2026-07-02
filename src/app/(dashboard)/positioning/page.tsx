"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Compass, Loader2, ArrowRight, ArrowLeft, Sparkles } from "lucide-react"
import { useGeneration } from "@/hooks/use-generation"
import { PositioningReport } from "./report"

const STEPS = [
  { num: 1, title: "基本情况", desc: "Phase 0 前置判断" },
  { num: 2, title: "优势与投入", desc: "Phase 1 商业模式" },
  { num: 3, title: "灵魂挖掘", desc: "Phase 2 核心" },
  { num: 4, title: "差异化角色", desc: "Phase 3 基因" },
  { num: 5, title: "生成 DNA", desc: "打包输出" },
]

// 多选组件
function RadioGroup({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid gap-2">
      {options.map((o, i) => {
        const label = o.replace(/^\d+\.\s*/, "")
        return (
          <label key={i} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors text-sm ${
            value === label ? "border-black bg-black/5" : "border-gray-200 hover:border-gray-300"
          }`}>
            <input type="radio" className="sr-only" checked={value === label} onChange={() => onChange(label)} />
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
              value === label ? "border-black" : "border-gray-300"
            }`}>
              {value === label && <div className="w-2 h-2 rounded-full bg-black" />}
            </div>
            <span>{label}</span>
          </label>
        )
      })}
    </div>
  )
}

export default function PositioningPage() {
  const [step, setStep] = useState(1)

  // Step 1: 基本情况
  const [niche, setNiche] = useState("")
  const [contentStatus, setContentStatus] = useState("")   // Q1
  const [revenueStatus, setRevenueStatus] = useState("")    // Q2
  const [corePurpose, setCorePurpose] = useState("")

  // Step 2: 优势与投入
  const [advantage, setAdvantage] = useState("")            // Q4
  const [timeCommit, setTimeCommit] = useState("")          // Q5
  const [acceptSlow, setAcceptSlow] = useState("")          // Q6
  const [background, setBackground] = useState("")

  // Step 3: 灵魂挖掘
  const [idealLife, setIdealLife] = useState("")            // Q7
  const [threeMonthGoal, setThreeMonthGoal] = useState("")  // Q8
  const [anger, setAnger] = useState("")                    // Aggression
  const [userDream, setUserDream] = useState("")            // Eros
  const [doForFree, setDoForFree] = useState("")            // 发愿兜底
  const [personality, setPersonality] = useState("")
  const [selfIntro, setSelfIntro] = useState("")            // Q15

  // Step 4: 差异化与角色
  const [monetization, setMonetization] = useState("")
  const [contentOutput, setContentOutput] = useState("")
  const [differentiation, setDifferentiation] = useState("")
  const [signatureStyle, setSignatureStyle] = useState("")
  const [targetAudience, setTargetAudience] = useState("")

  const { phase, statusMessage, rawText, error, reset, runPositioning } = useGeneration()

  function canProceed(s: number): boolean {
    switch (s) {
      case 1: return niche.trim().length >= 2
      case 2: return background.trim().length >= 2
      case 3: return anger.trim().length >= 2 && userDream.trim().length >= 2
      case 4: return true
      default: return true
    }
  }

  function buildPersonalInfo(): string {
    const parts = [
      "【赛道/行业】" + niche,
      "",
      "===== Phase 0: 前置判断 =====",
      "【是否已在做内容】" + (contentStatus || "未填"),
      "【变现状态】" + (revenueStatus || "未填"),
      "【核心目的】" + (corePurpose || "未填"),
      "",
      "===== Phase 1: 商业模式 =====",
      "【核心优势】" + (advantage || "未填"),
      "【愿投入时间】" + (timeCommit || "未填"),
      "【是否接受前期不追涨粉】" + (acceptSlow || "未填"),
      "【出镜人背景】" + background,
      "",
      "===== Phase 2: 灵魂挖掘 =====",
      "【理想状态】" + (idealLife || "未填"),
      "【3个月目标】" + (threeMonthGoal || "未填"),
      "【最生气的行业现象/Aggression】" + anger,
      "【用户终极梦想/Eros】" + userDream,
      "【赚不到钱也愿做/发愿兜底】" + (doForFree || "未填"),
      "【性格特质】" + (personality || "未填"),
      "【自我介绍100字】" + (selfIntro || "未填"),
      "",
      "===== Phase 3: 基因打包 =====",
      "【变现手段】" + (monetization || "未填"),
      "【内容产出方式】" + (contentOutput || "未填"),
      "【差异化定位】" + (differentiation || "未填"),
      "【标志性风格】" + (signatureStyle || "未填"),
      "【目标用户】" + (targetAudience || "未填"),
    ]
    return parts.join("\n")
  }

  function handleGenerate() {
    runPositioning(niche, buildPersonalInfo())
  }


  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Compass className="h-6 w-6 text-black" />个人IP定位</h1>

      {phase === "idle" && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-1.5">
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                step === s.num ? "bg-black text-white" :
                step > s.num ? "bg-gray-100 text-gray-400" : "bg-gray-50 text-gray-300"
              }`}>
                <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] ${
                  step === s.num ? "bg-white/20 text-white" :
                  step > s.num ? "bg-gray-300/50 text-gray-500" : "bg-gray-200/50 text-gray-400"
                }`}>{step > s.num ? "✓" : s.num}</span>
                {s.title}
              </div>
              {i < 4 && <div className="w-4 h-px bg-gray-200" />}
            </div>
          ))}
        </div>
      )}

      {/* ====== STEP 1: 基本情况 ====== */}
      {phase === "idle" && step === 1 && (
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Phase 0 · 前置判断</p>
            <div>
              <label className="text-sm font-medium mb-1.5 block">赛道/行业 *</label>
              <Input placeholder="比如：企业财税、家庭教育、保险规划…" value={niche} onChange={e => setNiche(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">你是否已经在尝试做内容？</label>
              <RadioGroup options={[
                "1. 是，稳定更新中", "2. 偶尔发，没有规律", "3. 还没开始"
              ]} value={contentStatus} onChange={setContentStatus} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">目前的变现状态是？</label>
              <RadioGroup options={[
                "1. 有收入，稳定", "2. 有收入但不稳定", "3. 有收入但很差", "4. 完全不知道怎么变现"
              ]} value={revenueStatus} onChange={setRevenueStatus} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">核心目的是什么？</label>
              <Input placeholder="主要为了赚钱，还是为了影响力/表达？还是两者都要？" value={corePurpose} onChange={e => setCorePurpose(e.target.value)} />
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={() => setStep(2)} disabled={!canProceed(1)} className="bg-black text-white hover:bg-black/90 rounded-full">
                下一步 <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====== STEP 2: 优势与投入 ====== */}
      {phase === "idle" && step === 2 && (
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Phase 1 · 商业模式定盘</p>
            <div>
              <label className="text-sm font-medium mb-2 block">你最核心的优势是什么？（可多写几句）</label>
              <Textarea placeholder="比如：专业技能（干了10年）、行业地位/资源（认识X）、特殊天赋（一眼能看出Y）、时间投入（全职All in）…"
                value={advantage} onChange={e => setAdvantage(e.target.value)} rows={3} className="resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">愿意为这个IP投入多长时间？</label>
              <RadioGroup options={[
                "1. 1-3个月试试水", "2. 半年", "3. 1年以上", "4. 不确定"
              ]} value={timeCommit} onChange={setTimeCommit} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">能否接受前期不追涨粉，只搭建内容结构和信任基础？</label>
              <RadioGroup options={[
                "1. 接受", "2. 勉强接受", "3. 不接受"
              ]} value={acceptSlow} onChange={setAcceptSlow} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">出镜人背景 *</label>
              <Textarea placeholder="你是谁？做过什么、经历过什么、手里有什么资源？越具体越好。"
                value={background} onChange={e => setBackground(e.target.value)} rows={4} className="resize-none" />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-1" />上一步</Button>
              <Button onClick={() => setStep(3)} disabled={!canProceed(2)} className="bg-black text-white hover:bg-black/90 rounded-full">
                下一步 <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====== STEP 3: 灵魂挖掘 ====== */}
      {phase === "idle" && step === 3 && (
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Phase 2 · 灵魂与特性放大</p>
            <div>
              <label className="text-sm font-medium mb-1.5 block">你理想的生活/工作状态是什么？</label>
              <Input placeholder="不需要宏大，越具体越好" value={idealLife} onChange={e => setIdealLife(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">3个月内只能解决一件事，选哪个？</label>
              <RadioGroup options={[
                "1. 找到个人定位", "2. 稳定输出内容", "3. 找到新的商业方向"
              ]} value={threeMonthGoal} onChange={setThreeMonthGoal} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">你最生气这个行业里的什么现象？* （Aggression 攻击点）</label>
              <Textarea placeholder="什么行为让你想骂人？什么潜规则害了用户？不说具体人，说现象。"
                value={anger} onChange={e => setAnger(e.target.value)} rows={3} className="resize-none" />
              <p className="text-xs text-gray-400 mt-1">你的人设兵器——你打什么，决定了谁站你这边</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">你的用户最想要什么？* （Eros 引力钩子）</label>
              <Textarea placeholder="他们的终极梦想、理想状态。不是产品功能，是得到了什么人生改变。"
                value={userDream} onChange={e => setUserDream(e.target.value)} rows={3} className="resize-none" />
              <p className="text-xs text-gray-400 mt-1">你承诺帮他们实现的东西——这是他们追随你的理由</p>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">赚不到钱，你还愿意做这行吗？做什么？（发愿兜底）</label>
              <Input placeholder="如果完全不考虑收入，你还会继续吗？愿和交付必须一致。" value={doForFree} onChange={e => setDoForFree(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">你的性格特质</label>
              <Input placeholder="一个词或一句话。比如：暴躁但护短 / 冷静到冷血 / 温暖像邻家大哥" value={personality} onChange={e => setPersonality(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">简要介绍自己（100字以内）</label>
              <Textarea placeholder="让别人快速了解你——你是谁、做什么、为什么做"
                value={selfIntro} onChange={e => setSelfIntro(e.target.value)} rows={3} maxLength={100} className="resize-none" />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(2)}><ArrowLeft className="h-4 w-4 mr-1" />上一步</Button>
              <Button onClick={() => setStep(4)} disabled={!canProceed(3)} className="bg-black text-white hover:bg-black/90 rounded-full">
                下一步 <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====== STEP 4: 差异化与角色 ====== */}
      {phase === "idle" && step === 4 && (
        <Card className="border shadow-sm">
          <CardContent className="p-6 space-y-5">
            <p className="text-xs text-gray-400 uppercase tracking-wider">Phase 3 · 稀缺性与基因打包</p>
            <div>
              <label className="text-sm font-medium mb-2 block">IP的商业变现手段？</label>
              <RadioGroup options={[
                "1. 直接卖货/服务", "2. 咨询/顾问", "3. 个人品牌（先不管钱）", "4. 还没想好"
              ]} value={monetization} onChange={setMonetization} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">内容产出，你预期怎么做？</label>
              <RadioGroup options={[
                "1. 全部自己创作", "2. 分工——我出思路，系统出稿", "3. 找人替我拍/写"
              ]} value={contentOutput} onChange={setContentOutput} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">你的差异化是什么？</label>
              <Textarea placeholder="既然大家都在装X，我就做Y。你跟同行最不一样的地方在哪？"
                value={differentiation} onChange={e => setDifferentiation(e.target.value)} rows={2} className="resize-none" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">标志性风格/话术/动作（视觉钉+语言钉+行为钉）</label>
              <Input placeholder="口头禅？标志性动作？独特表达方式？" value={signatureStyle} onChange={e => setSignatureStyle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">目标用户是谁？</label>
              <Input placeholder="年龄/身份/处境/最痛的点" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} />
            </div>
            <div className="flex justify-between pt-2">
              <Button variant="ghost" onClick={() => setStep(3)}><ArrowLeft className="h-4 w-4 mr-1" />上一步</Button>
              <Button onClick={() => { setStep(5); handleGenerate() }} className="bg-black text-white hover:bg-black/90 rounded-full">
                <Sparkles className="h-4 w-4 mr-1" />生成 Strategy_DNA
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====== STEP 5: 结果 ====== */}
      {(phase === "generating" || phase === "complete" || phase === "error") && (
        <>
          {phase === "generating" && (
            <Card className="border shadow-sm">
              <CardContent className="py-16 text-center space-y-5">
                <Loader2 className="h-10 w-10 animate-spin mx-auto text-gray-400" />
                <p className="text-lg font-medium text-gray-500">{statusMessage || "系统思考中，请稍候…"}</p>
                {rawText && <pre className="text-sm whitespace-pre-wrap font-sans bg-gray-50 rounded-xl p-4 text-left max-h-80 overflow-y-auto">{rawText.slice(-800)}</pre>}
                <Button variant="outline" size="sm" onClick={reset}>取消</Button>
              </CardContent>
            </Card>
          )}

          {phase === "complete" && rawText && (
            <PositioningReport rawText={rawText} niche={niche} />
          )}

          {phase === "error" && (
            <Card className="border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={() => { reset(); setStep(1) }}>重新开始</Button></CardContent></Card>
          )}
        </>
      )}
    </div>
  )
}
