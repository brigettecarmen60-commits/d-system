import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { addCredits } from "@/lib/usage"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@dev.local"

async function isAdmin(): Promise<boolean> {
  const session = await auth()
  return session?.user?.email === ADMIN_EMAIL
}

// GET — 搜索用户
export async function GET(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "无权限" }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get("q") || ""
  const users = q
    ? await db.user.findMany({
        where: { email: { contains: q } },
        include: { subscription: true },
        take: 20,
      })
    : await db.user.findMany({
        include: { subscription: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      })

  const result = users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    createdAt: u.createdAt,
    credits: u.subscription ? u.subscription.monthlyQuota - u.subscription.quotaUsed : 0,
    plan: u.subscription?.plan || "NONE",
    monthlyQuota: u.subscription?.monthlyQuota || 0,
  }))

  return Response.json({ users: result })
}

// POST — 给用户加积分
export async function POST(req: NextRequest) {
  if (!(await isAdmin())) return Response.json({ error: "无权限" }, { status: 403 })

  const { userId, credits } = await req.json().catch(() => ({}))
  if (!userId || !credits || credits <= 0) return Response.json({ error: "参数错误" }, { status: 400 })

  await addCredits(userId, credits)
  return Response.json({ success: true, added: credits })
}
