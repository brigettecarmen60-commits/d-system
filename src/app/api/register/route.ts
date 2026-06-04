import { NextRequest } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { email, password, inviteCode } = await req.json().catch(() => ({}))
    if (!email?.trim() || !password?.trim() || !inviteCode?.trim()) {
      return Response.json({ error: "请填写邮箱、密码和邀请码" }, { status: 400 })
    }

    const cleanEmail = email.trim()
    const cleanCode = inviteCode.trim().toUpperCase()

    // 检查邮箱是否已注册
    const existing = await db.user.findUnique({ where: { email: cleanEmail } })
    if (existing?.password) {
      return Response.json({ error: "该邮箱已注册" }, { status: 409 })
    }

    // 验证邀请码
    const invite = await db.inviteCode.findUnique({ where: { code: cleanCode } })
    if (!invite) return Response.json({ error: "邀请码无效" }, { status: 400 })
    if (invite.usedBy) return Response.json({ error: "此邀请码已被使用" }, { status: 400 })

    // 创建或更新用户
    const hashedPassword = await bcrypt.hash(password, 10)

    let user
    if (existing) {
      // 从 waitlist 升级为正式用户
      user = await db.user.update({
        where: { id: existing.id },
        data: { password: hashedPassword },
      })
    } else {
      user = await db.user.create({
        data: { email: cleanEmail, password: hashedPassword },
      })
    }

    // 标记邀请码已用
    await db.inviteCode.update({
      where: { code: cleanCode },
      data: { usedBy: user.id, usedAt: new Date() },
    })

    // 创建订阅（给邀请码对应的积分）
    const existingSub = await db.subscription.findUnique({ where: { userId: user.id } })
    if (existingSub) {
      await db.subscription.update({
        where: { userId: user.id },
        data: { monthlyQuota: { increment: invite.credits }, quotaUsed: 0 },
      })
    } else {
      await db.subscription.create({
        data: {
          userId: user.id,
          plan: "FREE",
          monthlyQuota: invite.credits,
          quotaUsed: 0,
          quotaResetAt: new Date(Date.now() + 30 * 86400000),
        },
      })
    }

    return Response.json({ success: true, credits: invite.credits })
  } catch (e: any) {
    console.error("Register error:", e.message)
    return Response.json({ error: "注册失败，请重试" }, { status: 500 })
  }
}
