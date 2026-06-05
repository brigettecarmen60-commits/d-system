import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dev.local"

async function isAdmin(): Promise<boolean> {
  const session = await auth()
  return session?.user?.email === ADMIN_EMAIL
}

function genCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
  return `E-${seg()}-${seg()}`
}

// GET — 列表邀请码
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "无权限" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const page = parseInt(searchParams.get("page") || "1")
  const take = 50

  const [codes, total] = await Promise.all([
    db.inviteCode.findMany({
      orderBy: { createdAt: "desc" },
      take,
      skip: (page - 1) * take,
    }),
    db.inviteCode.count(),
  ])

  return Response.json({ codes, total, page, totalPages: Math.ceil(total / take) })
}

// POST — 批量生成邀请码
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "无权限" }, { status: 403 })

  const { count = 10, credits = 50 } = await req.json().catch(() => ({}))
  const session = await auth()
  const adminId = session?.user?.id || "admin"

  const codes = []
  for (let i = 0; i < Math.min(count, 100); i++) {
    const code = genCode()
    const record = await db.inviteCode.create({
      data: { code, credits, createdBy: adminId },
    })
    codes.push({ code: record.code, credits: record.credits })
  }

  return Response.json({ codes, generated: codes.length })
}

// DELETE — 删除未使用的邀请码
export async function DELETE(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "无权限" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (id) {
    await db.inviteCode.delete({ where: { id } }).catch(() => {})
    return Response.json({ deleted: true })
  }

  // 批量删除所有未使用的
  const result = await db.inviteCode.deleteMany({ where: { usedBy: null } })
  return Response.json({ deleted: result.count })
}
