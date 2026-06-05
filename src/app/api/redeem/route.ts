import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { addCredits } from "@/lib/usage"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return Response.json({ error: "请先登录" }, { status: 401 })

  const { code } = await req.json().catch(() => ({}))
  if (!code?.trim()) return Response.json({ error: "请输入邀请码" }, { status: 400 })

  const cleanCode = code.trim().toUpperCase()

  const invite = await db.inviteCode.findUnique({ where: { code: cleanCode } })
  if (!invite) return Response.json({ error: "邀请码无效" }, { status: 404 })
  if (invite.usedBy) return Response.json({ error: "此邀请码已被使用" }, { status: 409 })

  await db.inviteCode.update({
    where: { code: cleanCode },
    data: { usedBy: session.user.id, usedAt: new Date() },
  })

  await addCredits(session.user.id, invite.credits)

  const sub = await db.subscription.findUnique({ where: { userId: session.user.id } })
  if (!sub) {
    await db.subscription.create({
      data: {
        userId: session.user.id,
        plan: "FREE",
        monthlyQuota: invite.credits,
        quotaUsed: 0,
        quotaResetAt: new Date(Date.now() + 30 * 86400000),
      },
    })
  }

  return Response.json({ success: true, credits: invite.credits })
}
