import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Compass, Lightbulb, PenLine, BookOpen, Camera, BarChart3, Sparkles, ArrowRight, Coffee } from "lucide-react"

const steps = [
  {
    icon: Search,
    title: "1. 赛道分析",
    href: "/analyze",
    badge: "Gem0 · 情报官",
    desc: "输入赛道名称，系统搜索真实行业数据，输出六点雷达扫描 + 赛道机会判断。告诉你这个赛道能不能做，钱在哪，坑在哪。",
    tip: "输入要具体——「企业财税」比「财税」好，「手工皮具修理」比「手工」好。",
  },
  {
    icon: Compass,
    title: "2. 个人定位",
    href: "/positioning",
    badge: "Gem0.5 · 策划定位",
    desc: "输入赛道 + 个人经历/优势/资源。四 Phase 定位系统生成 Strategy_DNA：人设脸谱、发愿锚点、立场、三个钉子、语气人格。",
    tip: "输出的 DNA JSON 可以粘贴到选题/脚本/故事页面，让内容对齐人设。经历越详实，定位越精准。",
  },
  {
    icon: Lightbulb,
    title: "3. 选题生成",
    href: "/topics",
    badge: "Gem1/2/3 · 选题引擎",
    desc: "输入赛道 + 定位 DNA，五种模式可选：",
    modes: [
      { name: "纪实进化", desc: "日常真实切片拍出悬念。有实物可拍的行业首选。" },
      { name: "荒诞进化", desc: "极端错位制造视觉奇观。枯燥业务拍出离谱效果。" },
      { name: "共识挖掘", desc: "找到所有人的共识缺口。行业是答案容器，人性是主菜。" },
      { name: "转化选题", desc: "在顾客犹豫的五个决策节点精准推一把。秀肌肉不喊口号。" },
      { name: "信任选题", desc: "补齐观众脑子里的信任拼图。让事实替你说话。" },
    ],
    tip: "先跑一轮「纪实」看有哪些可拍的，再用「荒诞」拓宽创意边界。转化和信任选题适合主页置顶。",
  },
  {
    icon: PenLine,
    title: "4. 写脚本",
    href: "/script",
    badge: "Gem4 · 文案工厂",
    desc: "从选题列表里挑一条，粘贴进来。系统自动做四件事：判定类型（口播/Vlog/框架驱动）→ 判断受众意识层级 → 选叙事结构 → 按管线生成完整脚本。开头激活认知异常，中段推情绪给价值，结尾闭环。",
    tip: "粘贴定位 DNA 可以让脚本的语气、人称、姿态完全匹配你的人设。",
  },
  {
    icon: BookOpen,
    title: "5. 人设故事",
    href: "/story",
    badge: "Gem6 · 故事工厂",
    desc: "输入真实人生经历 + 定位 DNA。系统从六大情绪框架中自动匹配最适合的那个，然后用对应的技法组合写出非虚构故事脚本。这不是编故事——是找到你身上最能击穿人性的那个瞬间，用最合适的方式讲出来。",
    tip: "素材越具体越好——时间、地点、数字、对话、情绪最强烈的那个时刻。不要概括。",
  },
  {
    icon: Camera,
    title: "6. 剧情种草",
    href: "/seeding",
    badge: "剧情种草系统",
    desc: "输入产品 + 人设脸谱 + 发愿 + 目标人群。系统自动匹配六大情绪框架，输出含时间轴的完整种草脚本（画面 + 台词 + 时长 + 产品出现位置）。",
    tip: "适合有明确产品要推广的场景。框架和情绪选「自动」即可，系统会判断。",
  },
  {
    icon: BarChart3,
    title: "7. 内容复盘",
    href: "/retro",
    badge: "复盘系统",
    desc: "输入已发布内容的数据（播放/互动/转化/评论），系统自动计算派生比率、诊断转化漏斗、聚类评论情绪，输出优化建议。知道为什么成了，为什么没成。",
    tip: "带评论区原文的复盘效果远超纯数字复盘。评论是观众最真实的反馈。",
  },
]

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />使用教程
        </h1>
        <p className="text-muted-foreground mt-2">
          七步管线，每一步都有专门设计的处理环节。不是简单的输入-输出。建议按顺序跑完首次全流程，后续各模块可独立使用。
        </p>
      </div>

      {/* Pipeline Overview */}
      <Card className="border-0 bg-amber-50/50">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-amber-700 mb-3">📋 全链路管线</p>
          <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono text-amber-800">
            <span className="bg-white px-2 py-1 rounded">赛道分析</span>
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span className="bg-white px-2 py-1 rounded">个人定位</span>
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span className="bg-white px-2 py-1 rounded">选题生成</span>
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span className="bg-white px-2 py-1 rounded">写脚本</span>
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span className="bg-white px-2 py-1 rounded">人设故事</span>
            <ArrowRight className="h-3 w-3 shrink-0" />
            <span className="bg-white px-2 py-1 rounded">数据复盘</span>
          </div>
          <p className="text-xs text-amber-600 mt-3">
            个人定位生成的 DNA 贯穿全管线——选题用 DNA 对齐人设，脚本用 DNA 匹配语气，故事用 DNA 锁定框架。
          </p>
        </CardContent>
      </Card>

      {/* Step Cards */}
      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.title} className="border border-gray-100 shadow-none hover:border-gray-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <a href={step.href} className="shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <step.icon className="h-5 w-5 text-gray-600" />
                </a>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href={step.href} className="font-semibold text-lg hover:text-amber-500 transition-colors">{step.title}</a>
                    <Badge variant="secondary" className="text-xs">{step.badge}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>

                  {"modes" in step && step.modes && (
                    <div className="grid gap-1.5 mt-2">
                      {step.modes.map((m: any) => (
                        <div key={m.name} className="flex items-baseline gap-2 text-sm pl-3 border-l-2 border-gray-200">
                          <span className="font-medium shrink-0">{m.name}</span>
                          <span className="text-muted-foreground text-xs">{m.desc}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-start gap-1.5 pt-1">
                    <span className="text-amber-500 shrink-0 text-xs mt-0.5">💡</span>
                    <p className="text-xs text-gray-400">{step.tip}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Start */}
      <Card className="border-0 bg-black text-white">
        <CardContent className="p-6 space-y-3">
          <p className="font-semibold">🚀 首次使用快速上手</p>
          <ol className="text-sm space-y-2 text-white/80 list-decimal list-inside leading-relaxed">
            <li>打开「赛道分析」，输入你的行业 → 看赛道能不能做</li>
            <li>打开「个人定位」，贴上你的经历 → 拿到 DNA</li>
            <li>打开「选题生成」→ 选「纪实进化」→ 赛道 + DNA → 出 6 条选题</li>
            <li>从选题里挑一条 → 打开「写脚本」→ 粘贴选题 + DNA → 生成脚本</li>
            <li>打开「人设故事」→ 粘贴真实经历 + DNA → 出人设故事脚本</li>
            <li>发布后打开「内容复盘」→ 填数据 → 看优化建议</li>
          </ol>
          <p className="text-xs text-white/50 pt-2">
            每一步的输出都可以作为下一步的输入。DNA 是贯穿全链路的纽带。
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
