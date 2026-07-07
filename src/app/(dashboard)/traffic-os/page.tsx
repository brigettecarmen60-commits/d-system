"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useGeneration } from "@/hooks/use-generation"
import { recordActivity } from "@/lib/activity"
import { Shuffle, Loader2, Copy, RotateCcw } from "lucide-react"

const GROUPS: Record<string, { label: string; items: string[] }> = {
  A: { label: "常见技法", items: ["内部人员揭秘","强反差","没事找事测试","吐槽共同敌人","罪己诏/降低预期"] },
  B: { label: "流量36计精选", items: ["色欲/性引力","社死/社牛","搞对立","视角切换","老头老太","发疯文学","白日做梦","设置情景","男人/女人减速带","回忆杀","互联网嘴替","贫穷/省钱","模仿秀/蹭热度","拟人化/拟物化","养成系/电子宠物","够大/极致","秩序成瘾/ASMR","扮猪吃虎","利益相关","娱乐化"] },
  C: { label: "实体邪典24式", items: ["主人的任务","吃独食","反向宰客","老板的私人恩怨","沉浸式被虐","借宿式消费","慢性自爆","说明书式接客","职业乞讨式","霸总式发疯","有限资源争夺战","黑粉经济实体化","强制入股","监控叙事","充实的一天","救助弱小","顾客来找茬","找小号拍","同城八卦家","热闹的氛围","激情互动","pua顾客","找外援","十年体"] },
  D: { label: "暗器异术24式", items: ["知识诅咒破解术","替身冒险/代偿体验","人设养成/连续剧化","造节/仪式感构建","微观上帝视角","情绪拆解与重装","信息差变现剧场","无意义但高技术门槛","集体记忆的盗墓者","痛苦品鉴指南","伪纪录片式虚构","终极较真实验室","平行身份交换/错位生存","能力剥夺挑战","时间胶囊纪录片","新概念词典发明家","无限流/读档重开叙事","开放源代码式共创","幕后过程正片化","万物说明书/解构式立传","反效率/无用治愈学","碎片拼图式悬念","内心弹幕/脑内议会","能力展示型分类"] },
  E: { label: "多维技法补充", items: ["可视化排行榜","身份认证标准","可填空的指令","从业者的条件反射","外行的无知成本清单","翻译成人话的暗语系统","行业默认的排序规则","看一眼就知道系列"] },
}

export default function TrafficOSPage() {
  const [niche, setNiche] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const { phase, statusMessage, rawText, error, runTrafficOS, reset } = useGeneration()
  const toggle = (t: string) => { if (selected.includes(t)) setSelected(selected.filter(s => s !== t)); else if (selected.length < 5) setSelected([...selected, t]) }
  function handleGenerate() { runTrafficOS(niche, selected.join("、")) }
  if (phase === "complete" && rawText) recordActivity({ type: "traffic-os", niche, title: "Traffic OS", timestamp: Date.now() })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2"><Shuffle className="h-6 w-6 text-purple-500" />Traffic OS</h1>
      <p className="text-sm text-muted-foreground">自选5个技法，AI帮你撞出方向。换一组技法=换一批创意。</p>
      {phase === "idle" && (
        <div className="space-y-4">
          <Card className="border shadow-sm"><CardContent className="p-4">
            <label className="text-sm font-medium mb-1.5 block">赛道 <span className="text-red-400">*</span></label>
            <Textarea placeholder="记账报税 / 陪诊服务 / 少儿体能 / 二手车检测" value={niche} onChange={e => setNiche(e.target.value)} rows={1} className="resize-none" />
          </CardContent></Card>
          <Card className="border shadow-sm"><CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between"><p className="text-sm font-medium">选5个技法 <span className="text-xs text-muted-foreground">（{selected.length}/5）</span></p><Button variant="ghost" size="sm" onClick={() => setSelected([])}>清空</Button></div>
            {Object.entries(GROUPS).map(([key, group]) => (
              <div key={key}><p className="text-xs font-medium text-gray-400 mb-1">{key}组 · {group.label}</p>
                <div className="flex flex-wrap gap-1.5">{group.items.map(t => { const s = selected.includes(t); const f = selected.length >= 5 && !s
                  return <button key={t} onClick={() => toggle(t)} disabled={f} className={`px-2.5 py-1 rounded-md text-xs transition-colors ${s ? "bg-purple-500 text-white" : f ? "bg-gray-100 text-gray-300 cursor-not-allowed" : "bg-gray-100 text-gray-600 hover:bg-purple-100"}`}>{t}</button>
                })}</div></div>))}
          </CardContent></Card>
          <Button onClick={handleGenerate} disabled={!niche.trim() || selected.length !== 5} className="w-full h-11 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium shadow-sm"><Shuffle className="h-4 w-4 mr-2" />碰撞生成 5 个方向</Button>
        </div>
      )}
      {phase === "generating" && (<Card className="border shadow-sm"><CardContent className="py-16 text-center space-y-5"><Loader2 className="h-10 w-10 text-purple-500 animate-spin mx-auto" /><p>{statusMessage||"技法碰撞中…"}</p><Button variant="outline" size="sm" onClick={reset}>取消</Button></CardContent></Card>)}
      {phase === "complete" && rawText && (<div className="space-y-4"><Card className="border shadow-sm"><CardContent className="p-6"><pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre></CardContent></Card><div className="flex gap-3"><Button variant="outline" onClick={() => navigator.clipboard.writeText(rawText)}><Copy className="h-4 w-4 mr-2" />复制</Button><Button variant="outline" onClick={handleGenerate}><Shuffle className="h-4 w-4 mr-2" />换一批</Button><Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-2" />改技法</Button></div></div>)}
      {phase === "error" && (<Card className="border-2 border-destructive/30"><CardContent className="py-12 text-center"><p className="text-destructive mb-4">{error}</p><Button variant="outline" onClick={reset}>返回</Button></CardContent></Card>)}
    </div>
  )
}
