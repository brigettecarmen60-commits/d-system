import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// ─── Auth ───────────────────────────────────────
async function getUserId(): Promise<string | null> {
  const session = await auth()
  if (session?.user?.id) return session.user.id
  if (process.env.NODE_ENV !== "production") {
    const devEmail = "admin@dev.local"
    let user = await db.user.findUnique({ where: { email: devEmail } })
    if (!user) user = await db.user.create({ data: { email: devEmail, name: "管理员" } })
    return user.id
  }
  return null
}

// GET — 查询再生状态
export async function GET(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: "请先登录" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get("mode")
  const niche = searchParams.get("niche")

  if (!mode || !niche) return Response.json({ error: "缺少 mode 或 niche 参数" }, { status: 400 })

  let state = null
  try {
    state = await db.generationState.findUnique({
      where: { userId_niche_mode: { userId, niche: niche.trim(), mode } },
    })
  } catch {
    // DB 表尚未创建（prisma db push 待执行），降级返回无缓存
    return Response.json({ exists: false, degraded: true })
  }

  if (!state) return Response.json({ exists: false })

  return Response.json({
    exists: true,
    batchCount: state.batchCount,
    usedAngles: state.usedAngles,
    usedCodes: state.usedCodes,
    usedMolds: state.usedMolds,
    lastGeneratedAt: state.lastGeneratedAt,
  })
}

// DELETE — 删除状态（强制冷重启）
export async function DELETE(req: NextRequest) {
  const userId = await getUserId()
  if (!userId) return Response.json({ error: "请先登录" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const mode = searchParams.get("mode")
  const niche = searchParams.get("niche")

  if (!mode || !niche) return Response.json({ error: "缺少 mode 或 niche 参数" }, { status: 400 })

  try {
    await db.generationState.delete({
      where: { userId_niche_mode: { userId, niche: niche.trim(), mode } },
    })
  } catch {
    // 表不存在或记录不存在，都视为已删除
  }

  return Response.json({ deleted: true })
}
