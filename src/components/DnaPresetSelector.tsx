"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Save, Trash2, Loader2 } from "lucide-react"

interface Preset {
  id: string
  slot: number
  name: string
  content: string
}

interface Props {
  dna: string
  onLoad: (content: string) => void
}

export function DnaPresetSelector({ dna, onLoad }: Props) {
  const [presets, setPresets] = useState<Preset[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSlot, setSelectedSlot] = useState<string>("")
  const [saveName, setSaveName] = useState("")
  const [saveSlot, setSaveSlot] = useState(1)
  const [saving, setSaving] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [msg, setMsg] = useState("")

  const fetchPresets = useCallback(async () => {
    try {
      const res = await fetch("/api/dna-presets")
      const data = await res.json()
      setPresets(data.presets || [])
    } catch { setPresets([]) }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPresets() }, [fetchPresets])

  function handleLoad() {
    const slot = parseInt(selectedSlot)
    const preset = presets.find(p => p.slot === slot)
    if (preset) onLoad(preset.content)
  }

  async function handleSave() {
    if (!dna.trim()) { setMsg("没有 DNA 内容可保存"); return }
    if (!saveName.trim()) { setMsg("请输入预设名称"); return }
    setSaving(true); setMsg("")
    try {
      await fetch("/api/dna-presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slot: saveSlot, name: saveName.trim(), content: dna }),
      })
      setSaveOpen(false)
      await fetchPresets()
    } catch { setMsg("保存失败") }
    setSaving(false)
  }

  async function handleDelete(slot: number) {
    await fetch("/api/dna-presets", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slot }),
    })
    await fetchPresets()
  }

  const loadedSlots = presets.map(p => p.slot)

  return (
    <div className="flex items-center gap-2">
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : presets.length > 0 ? (
        <>
          <Select value={selectedSlot} onValueChange={setSelectedSlot}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="加载预设…" />
            </SelectTrigger>
            <SelectContent>
              {presets.map(p => (
                <SelectItem key={p.id} value={String(p.slot)}>
                  档{p.slot} · {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" variant="ghost" onClick={handleLoad} disabled={!selectedSlot} className="text-xs">
            加载
          </Button>
        </>
      ) : (
        <span className="text-xs text-muted-foreground">暂无预设</span>
      )}

      {/* 保存弹窗 */}
      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={!dna.trim()} className="text-xs gap-1">
            <Save className="h-3 w-3" />保存当前DNA
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>保存 DNA 预设</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div>
              <label className="text-xs font-medium">档位</label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3].map(s => (
                  <Button
                    key={s}
                    size="sm"
                    variant={saveSlot === s ? "default" : "outline"}
                    onClick={() => setSaveSlot(s)}
                    className="flex-1"
                  >
                    档{s}{loadedSlots.includes(s) ? " (覆盖)" : ""}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">名称</label>
              <Input placeholder="如：老D主号DNA" value={saveName} onChange={e => setSaveName(e.target.value)} className="mt-1" />
            </div>
            {msg && <p className="text-xs text-red-500">{msg}</p>}
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "保存"}
              </Button>
              {loadedSlots.includes(saveSlot) && (
                <Button variant="destructive" size="sm" onClick={() => { handleDelete(saveSlot); setSaveOpen(false) }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
