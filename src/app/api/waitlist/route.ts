import { NextRequest } from "next/server"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const { email, name, reason } = await req.json().catch(() => ({}))
    if (!email?.trim()) return Response.json({ error: "请输入邮箱" }, { status: 400 })

    // 保存到 User 表（不创建 subscription，等邀请码激活）
    const existing = await db.user.findUnique({ where: { email: email.trim() } })
    if (existing) {
      return Response.json({ message: "已存在", userId: existing.id })
    }

    const user = await db.user.create({
      data: {
        email: email.trim(),
        name: name?.trim() || email.trim().split("@")[0],
      },
    })

    return Response.json({ message: "ok", userId: user.id })
  } catch (e: any) {
    // DB 不可用时静默失败，前端已处理
    console.error("Waitlist error:", e.message)
    return Response.json({ error: "服务暂时不可用" }, { status: 500 })
  }
}
