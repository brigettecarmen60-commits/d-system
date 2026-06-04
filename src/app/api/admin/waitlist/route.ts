import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  const session = await auth()
  const adminEmail = process.env.ADMIN_EMAIL || "admin@dev.local"
  if (session?.user?.email !== adminEmail) {
    return Response.json({ error: "无权限" }, { status: 403 })
  }

  try {
    const users = await db.user.findMany({
      include: { subscription: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    const entries = users
      .filter(u => !u.subscription)
      .map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt,
        hasSubscription: false,
      }))

    return Response.json({ entries })
  } catch {
    return Response.json({ entries: [], error: "DB unavailable" })
  }
}
