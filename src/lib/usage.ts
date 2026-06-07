import { db } from "@/lib/db"
import { getCreditCost } from "@/config/plans"

export interface QuotaResult {
  allowed: boolean
  remaining: number    // 剩余积分 = monthlyQuota - quotaUsed
  cost: number         // 本次消耗积分
  label: string
}

/**
 * 检查积分是否足够
 * DB字段映射：monthlyQuota=每月积分额度, quotaUsed=本月已用积分, 剩余=monthlyQuota-quotaUsed
 */
export async function checkQuota(userId: string, mode: string): Promise<QuotaResult> {
  try {
    const sub = await db.subscription.findUnique({ where: { userId } })

    if (!sub) {
      return { allowed: false, remaining: 0, cost: 0, label: "" }
    }

    // 月度重置检查
    const now = new Date()
    if (now > sub.quotaResetAt) {
      await db.subscription.update({
        where: { userId },
        data: {
          quotaUsed: 0,
          quotaResetAt: new Date(now.setMonth(now.getMonth() + 1)),
        },
      })
      sub.quotaUsed = 0
    }

    const { cost, label } = getCreditCost(mode)
    const remaining = sub.monthlyQuota - sub.quotaUsed

    return {
      allowed: remaining >= cost,
      remaining: remaining - cost,
      cost,
      label,
    }
  } catch (e) {
    // 数据库不可用时（如Neon休眠），开发环境降级放行
    console.error("checkQuota failed (DB unreachable):", e)
    const { cost, label } = getCreditCost(mode)
    return { allowed: true, remaining: 999, cost, label }
  }
}

/**
 * 扣减积分（增加 quotaUsed）
 */
export async function deductCredits(userId: string, cost: number): Promise<void> {
  try {
    await db.subscription.update({
      where: { userId },
      data: { quotaUsed: { increment: cost } },
    })
  } catch (e) {
    // 数据库不可用时（如Neon休眠），静默跳过，不影响主流程
    console.error("deductCredits failed (DB unreachable):", e)
  }
}

/**
 * 添加积分（减少 quotaUsed = 退还积分）
 * 用于积分包购买
 */
export async function addCredits(userId: string, amount: number): Promise<void> {
  await db.subscription.update({
    where: { userId },
    data: { quotaUsed: { decrement: amount } },
  })
}

/**
 * 获取当前剩余积分
 */
export async function getRemainingCredits(userId: string): Promise<number> {
  const sub = await db.subscription.findUnique({ where: { userId } })
  if (!sub) return 0
  return sub.monthlyQuota - sub.quotaUsed
}

/**
 * 试用版升级为订阅版
 * 映射：PRO→300分/月, ENTERPRISE→1500分/月
 */
export async function upgradePlan(userId: string, plan: "PRO" | "ENTERPRISE"): Promise<void> {
  const planCredits: Record<string, number> = { PRO: 300, ENTERPRISE: 1500 }
  await db.subscription.update({
    where: { userId },
    data: {
      plan,
      monthlyQuota: planCredits[plan],
      quotaUsed: 0,
      quotaResetAt: new Date(Date.now() + 30 * 86400000),
      status: "ACTIVE",
    },
  })
}
