import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Compass, Lightbulb, PenLine, BookOpen, Camera, BarChart3, Sparkles, ArrowRight, Coffee, Target, Film, CalendarDays, Shield } from "lucide-react"

const pipelineSteps = [
  {
    icon: Search, title: "赛道分析", href: "/analyze",
    desc: "输入赛道，系统搜索6个维度真实数据（钱/坑/人/局/流/判），输出六点雷达扫描 + 判词。告诉你这个赛道能不能做。",
    tip: "越具体越好——「成都陪诊」比「医疗」好。每个数据标注 [搜X] 来源，可追溯。",
  },
  {
    icon: Compass, title: "个人定位", href: "/positioning",
    desc: "输入你的经历和优势。系统判断你该走单人IP、A+B双号还是矩阵，输出一页战略卡 + DNA JSON。DNA 是贯穿全链路的纽带——选题、脚本、故事都用它对齐人设。",
    tip: "输出后点「一键复制 DNA」，去选题或脚本页面直接粘贴。",
  },
  {
    icon: Film, title: "系列策划", href: "/series",
    desc: "编导视角出系列方向。输入赛道+你的底牌（具体经历，不是职业介绍），输出3个系列——每个有系列名、钩子、为什么能火、前三集、可持续性和3个月进化路径。",
    tip: "底牌写得越具体越好。「我在成都做了两年陪诊，接过最离谱的单是……」比「我是陪诊师」效果好十倍。",
  },
  {
    icon: Lightbulb, title: "选题生成", href: "/topics",
    desc: "六种模式：纪实进化（有实物可拍）/ 荒诞进化（枯燥业务拍出离谱效果）/ 共识挖掘（找到人性共识缺口）/ 转化选题（在顾客犹豫节点推一把）/ 信任选题（补齐信任拼图）/ 热点选题（改编全网热点到你的赛道）。每条选题有标题、拍什么、为什么停、立场。",
    tip: "先跑纪实看有什么可拍 → 用热点借势 → 转化和信任选题适合主页置顶。",
  },
  {
    icon: PenLine, title: "写脚本（通用）", href: "/script",
    desc: "输入选题，系统自动选路由→判定受众层级→选叙事结构→生成脚本。两种模式：框架驱动（输出拍摄框架，给亮点节点和捕捉信号）和文案驱动（输出完整口播逐字稿）。",
    tip: "生成后点「检查违规」扫描7类平台违规词。有DNA就贴——语气、人设、姿态完全匹配。",
  },
  {
    icon: Target, title: "转化脚本", href: "/convert",
    desc: "专门做成交型内容。证据链驱动——每个信息点绑定一个证据（数字/案例/对比/证言/演示）。开头做精准共鸣不做认知异常。中段70%位置放「诚实时刻」。结尾CTA匹配客户决策节点。",
    tip: "输入痛点+方案效果远超只输入选题。你的真实案例是最好的证据。",
  },
  {
    icon: Camera, title: "剧情种草", href: "/seeding",
    desc: "产品是道具，人是主角。选一个「讲故事的人」——普通人/较真专家/踩过坑的老手/敢说真话的人——系统按这个视角构建七框架剧情。按时间轴输出画面+台词+时长+产品出现位置。",
    tip: "选「讲故事的人」会完全改变叙事视角和可信度来源。同一产品换不同的人，出来的是完全不同的故事。",
  },
  {
    icon: BookOpen, title: "人设故事", href: "/story",
    desc: "输入真实人生经历，系统自动匹配六大情绪框架，用对应的技法组合写出非虚构故事脚本。人设故事不是编故事——是找到你身上最能击穿人性的那个瞬间。",
    tip: "素材越具体越好：时间、地点、数字、对话、情绪最强烈的那个时刻。不要概括。",
  },
  {
    icon: BarChart3, title: "内容复盘", href: "/retro",
    desc: "两个模式：单条复盘（填数据→看哪关掉了→给优化建议）和账号体检（近期10条+最好+最差→判断方向对不对）。自动诊断漏斗、聚类评论情绪。",
    tip: "带评论区原文的复盘远超纯数字。评论是观众最真实的反馈。",
  },
  {
    icon: CalendarDays, title: "两周冲刺", href: "/sprint",
    desc: "Sprint制运营规划——不预测未来，设计学习速度。不做90天日历（第3天就会作废），做2周一周期。输入账号阶段+季度目标，输出Season OKR + Sprint规划 + 实验设计 + 回顾模板。",
    tip: "最适合做完定位和选题之后。把你已有的内容资产排进一个有节奏的框架里。",
  },
]

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-amber-500" />使用教程
        </h1>
        <p className="text-muted-foreground mt-2">
          全链路内容生产线。建议首次按顺序走一遍，之后各模块独立使用。DNA 贯穿全管线——做完定位后，DNA 粘贴到任何页面都能对齐人设。
        </p>
      </div>

      {/* Pipeline Overview */}
      <Card className="border-0 bg-amber-50/50">
        <CardContent className="p-6">
          <p className="text-sm font-medium text-amber-700 mb-3">管线全景</p>
          <p className="text-xs text-amber-600 leading-relaxed">
            赛道分析 → 个人定位 → 系列策划 → 选题生成 → 写脚本（通用/娱乐/转化）→ 剧情种草/人设故事 → 内容复盘 → 两周冲刺
            <br />
            定位 DNA 贯穿全链路。每个页面生成完都有「下一步」按钮跳转到下游。
          </p>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        {pipelineSteps.map(step => (
          <Card key={step.title} className="border shadow-sm hover:border-gray-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <a href={step.href} className="shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <step.icon className="h-5 w-5 text-gray-600" />
                </a>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href={step.href} className="font-semibold text-lg hover:text-amber-500 transition-colors">{step.title}</a>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
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
          <p className="font-semibold">首次使用快速上手</p>
          <ol className="text-sm space-y-2 text-white/80 list-decimal list-inside leading-relaxed">
            <li>打开「赛道分析」，输入你的行业 → 看赛道能不能做</li>
            <li>打开「个人定位」，贴上你的经历 → 拿到 DNA</li>
            <li>打开「系列策划」，填赛道+底牌 → 找到你的内容方向</li>
            <li>打开「选题生成」→ 选「纪实进化」→ 赛道+DNA → 生成选题</li>
            <li>挑一条选题 → 打开「娱乐脚本」或「转化脚本」→ 粘贴选题+DNA → 生成脚本</li>
            <li>想推产品就打开「剧情种草」→ 填产品+选讲故事的人 → 出种草脚本</li>
            <li>发布后打开「内容复盘」→ 填数据 → 看哪里掉了、下次试什么</li>
            <li>有方向了 → 打开「两周冲刺」→ 把你的内容排进 Sprint 节奏</li>
          </ol>
          <p className="text-xs text-white/50 pt-2">每一步的产出都是下一步的输入。DNA 是贯穿全链路的身份证。</p>
        </CardContent>
      </Card>
    </div>
  )
}
