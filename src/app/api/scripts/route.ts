import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "请先登录" }, { status: 401 })
  }

  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"))
  const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") || "20")))
  const search = url.searchParams.get("search") || ""

  const where: any = { userId: session.user.id }
  if (search) {
    where.topic = { contains: search }
  }

  const [items, total] = await Promise.all([
    db.script.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        topic: true,
        emotionPath: true,
        tonePersona: true,
        chassisFormula: true,
        contentType: true,
        createdAt: true,
        outputMarkdown: true,
      },
    }),
    db.script.count({ where }),
  ])

  return Response.json({
    items: items.map((item) => ({
      id: item.id,
      topic: item.topic,
      emotionPath: item.emotionPath,
      tonePersona: item.tonePersona,
      chassisFormula: item.chassisFormula,
      contentType: item.contentType,
      createdAt: item.createdAt.toISOString(),
      preview: item.outputMarkdown.slice(0, 200),
    })),
    total,
    page,
    limit,
  })
}
