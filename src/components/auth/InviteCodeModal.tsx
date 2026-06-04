"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check, MessageCircle, QrCode } from "lucide-react"
import { useState } from "react"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function InviteCodeModal({ open, onOpenChange }: Props) {
  const [copied, setCopied] = useState(false)
  const qq = "471665044"

  async function copyQQ() {
    await navigator.clipboard.writeText(qq)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>获取邀请码</DialogTitle>
          <DialogDescription>
            内测阶段采用邀请制。请通过以下方式联系客服获取。
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 pt-4">
          {/* QQ */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">客服 QQ</p>
                <p className="text-lg font-bold font-mono">{qq}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={copyQQ}>
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              <span className="ml-1">{copied ? "已复制" : "复制"}</span>
            </Button>
          </div>

          {/* QR Placeholders */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/30">
              <QrCode className="h-16 w-16 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">微信二维码</p>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-muted/30 border border-dashed border-muted-foreground/30">
              <QrCode className="h-16 w-16 text-muted-foreground/30" />
              <p className="text-xs text-muted-foreground">支付宝/其他</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            添加好友时请备注"老D邀请码"
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
