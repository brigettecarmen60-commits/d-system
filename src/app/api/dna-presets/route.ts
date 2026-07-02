import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

async function getUserId(): Promise<string | null> {
  const session = await auth()
  if (session?.user?.id) return session.user.id
  if (process.env.NODE_ENV !== "production") return "dev-no-db"
  return null
}

export async function GET() {
  const userId = await getUserId()
  if (!userId || userId === "dev-no-db") return Response.json({ presets: [] })
  try {
    const presets = await db.dnaPreset.findMany({
      where: { userId },
      orderBy: { slot: "asc" },
      select: { id: true, slot: true, name: true, content: true },
    })
    return Response.json({ presets })
  } catch {
    return Response.json({ presets: [] })
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserId()
  if (!userId || userId === "dev-no-db") return Response.json({ error: "请先登录" }, { status: 401 })
  const { slot, name, content } = await req.json()
  if (!slot || slot < 1 || slot > 3) return Response.json({ error: "档位必须是 1-3" }, { status: 400 })
  if (!name?.trim()) return Response.json({ error: "请输入预设名称" }, { status: 400 })
  if (!content?.trim()) return Response.json({ error: "DNA 内容不能为空" }, { status: 400 })
  try {
    const preset = await db.dnaPreset.upsert({
      where: { userId_slot: { userId, slot } },
      update: { name: name.trim(), content: content.trim() },
      create: { userId, slot, name: name.trim(), content: content.trim() },
    })
    return Response.json({ preset })
  } catch (e: any) {
    return Response.json({ error: "保存失败" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const userId = await getUserId()
  if (!userId || userId === "dev-no-db") return Response.json({ error: "请先登录" }, { status: 401 })
  const { slot } = await req.json()
  if (!slot || slot < 1 || slot > 3) return Response.json({ error: "无效档位" }, { status: 400 })
  try {
    await db.dnaPreset.deleteMany({ where: { userId, slot } })
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: "删除失败" }, { status: 500 })
  }
}
