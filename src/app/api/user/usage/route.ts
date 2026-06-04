import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "请先登录" }, { status: 401 })
  }

  const adminEmail = process.env.ADMIN_EMAIL || "admin@dev.local"
  const isAdmin = session.user.email === adminEmail

  const sub = await db.subscription.findUnique({ where: { userId: session.user.id } })

  if (!sub) {
    return Response.json({ credits: 0, monthlyCredits: 0, plan: "FREE", isAdmin })
  }

  const now = new Date()
  if (now > sub.quotaResetAt) {
    const updated = await db.subscription.update({
      where: { userId: session.user.id },
      data: { quotaUsed: 0, quotaResetAt: new Date(now.setMonth(now.getMonth() + 1)) },
    })
    return Response.json({
      credits: updated.monthlyQuota,
      monthlyCredits: updated.monthlyQuota,
      plan: updated.plan,
      isAdmin,
    })
  }

  return Response.json({
    credits: sub.monthlyQuota - sub.quotaUsed,
    monthlyCredits: sub.monthlyQuota,
    plan: sub.plan,
    isAdmin,
  })
}
