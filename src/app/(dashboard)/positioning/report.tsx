"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Check, Download, Lightbulb, PenLine } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { downloadMarkdown } from "@/lib/utils"
import { recordActivity, recordPipelineStage } from "@/lib/activity"

// Parse strategic card table from raw text
function parseStrategyCard(raw: string): { route: string; who: string; fight: string; remember: string; firstTopic: string } | null {
  const section = raw.match(/━━━ 一页战略卡 ━━━([\s\S]*?)(?=━━━ 详细诊断|$)/)
  if (!section) return null
  const text = section[1]
  const get = (label: string) => {
    const m = text.match(new RegExp(`\\\\|\\\\s*\\\\*?\\\\*?${label}\\\\*?\\\\*?\\\\s*\\\\|\\\\s*(.+?)\\\\s*\\\\|`))
    return m ? m[1].replace(/<br>/g, "\n").trim() : ""
  }
  return {
    route: get("路线"),
    who: get("你是谁"),
    fight: get("打什么"),
    remember: get("怎么记住你"),
    firstTopic: get("第一条拍什么"),
  }
}

function parseDNA(raw: string): string {
  const m = raw.match(/```json\n([\s\S]*?)```/)
  return m ? m[1].trim() : ""
}

export function PositioningReport({ rawText, niche }: { rawText: string; niche: string }) {
  const [copied, setCopied] = useState(false)
  const card = parseStrategyCard(rawText)
  const dna = parseDNA(rawText)

  // Store DNA for cross-page use + track activity
  useEffect(() => {
    if (dna) sessionStorage.setItem("last-dna", dna)
    recordActivity({ type: "positioning", niche, title: `定位 · ${niche}`, timestamp: Date.now() })
    recordPipelineStage("positioning", niche)
  }, [dna, niche])

  async function copyDNA() {
    await navigator.clipboard.writeText(dna)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!card) {
    // Fallback: show raw
    return (
      <Card className="border border-gray-100 shadow-none">
        <CardContent className="p-6">
          <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">{rawText}</pre>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 战略卡 */}
      <Card className="border border-gray-100 shadow-none">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">一页战略卡</h2>
            <Badge className="bg-black text-white">{card.route}</Badge>
          </div>

          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium text-gray-500 whitespace-nowrap align-top w-20">你是谁</td>
                <td className="py-3">{card.who}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium text-gray-500 whitespace-nowrap align-top">打什么</td>
                <td className="py-3">{card.fight}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 pr-4 font-medium text-gray-500 whitespace-nowrap align-top">怎么记住你</td>
                <td className="py-3">{card.remember}</td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-gray-500 whitespace-nowrap align-top">第一条拍什么</td>
                <td className="py-3">{card.firstTopic}</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* DNA 传递卡 — 醒目 */}
      <Card className="border-2 border-black shadow-none bg-gray-50">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">DNA 传递卡</h3>
              <p className="text-xs text-gray-500">复制下面这段，粘贴到选题生成页面的「DNA/定位」输入框中</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button size="sm" onClick={copyDNA} className="bg-black text-white hover:bg-black/90">
                {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                {copied ? "已复制" : "一键复制 DNA"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadMarkdown(rawText, `定位-${niche.slice(0, 10)}-${new Date().toISOString().slice(0, 10)}`)}>
                <Download className="h-4 w-4 mr-1" />保存
              </Button>
            </div>
          </div>
          <pre className="text-xs font-mono bg-white rounded-lg p-3 border border-gray-200 max-h-48 overflow-y-auto">{dna}</pre>
        </CardContent>
      </Card>

      {/* 下一步 */}
      <div className="flex flex-wrap gap-2">
        <Link href={`/topics?niche=${encodeURIComponent(niche)}&useDna=true`}>
          <Button variant="outline"><Lightbulb className="h-4 w-4 mr-2" />用此DNA生成选题</Button>
        </Link>
        <Link href={`/script?topic=${encodeURIComponent(card?.firstTopic || niche)}&useDna=true`}>
          <Button variant="outline"><PenLine className="h-4 w-4 mr-2" />用此DNA写脚本</Button>
        </Link>
      </div>

      {/* 详细报告 — 折叠 */}
      <Card className="border border-gray-100 shadow-none">
        <CardContent className="p-0">
          <details className="group">
            <summary className="px-5 py-3 text-sm text-gray-500 cursor-pointer hover:text-gray-700 select-none">
              查看完整诊断报告
            </summary>
            <div className="px-5 pb-5 border-t border-gray-100">
              <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed pt-3 max-h-[500px] overflow-y-auto">{rawText}</pre>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  )
}
