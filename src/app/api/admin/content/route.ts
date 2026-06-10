import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await auth()
  const user = session?.user as any
  if (!user?.id) return Response.json({ error: "未登录" }, { status: 401 })

  // 检查是否是管理员
  const adminEmail = process.env.ADMIN_EMAIL
  if (!adminEmail || user.email !== adminEmail) {
    return Response.json({ error: "无权限" }, { status: 403 })
  }

  const type = req.nextUrl.searchParams.get("type") || "topics"
  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") || "50"), 100)

  if (type === "topics") {
    const topics = await db.topic.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { email: true, name: true } } },
    })
    return Response.json({ topics: topics.map(t => ({
      id: t.id, email: t.user.email, niche: t.niche, mode: t.mode,
      content: t.content.slice(0, 500), createdAt: t.createdAt,
    })) })
  }

  if (type === "scripts") {
    const scripts = await db.script.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: { email: true, name: true } } },
    })
    return Response.json({ scripts: scripts.map(s => ({
      id: s.id, email: s.user.email, topic: s.topic,
      content: s.outputMarkdown.slice(0, 800), createdAt: s.createdAt,
    })) })
  }

  return Response.json({ error: "未知类型" }, { status: 400 })
}
