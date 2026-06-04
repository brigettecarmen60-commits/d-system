import { NextRequest } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "请先登录" }, { status: 401 })
  }

  const { id } = await params
  const script = await db.script.findUnique({ where: { id } })

  if (!script || script.userId !== session.user.id) {
    return Response.json({ error: "脚本不存在" }, { status: 404 })
  }

  return Response.json(script)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: "请先登录" }, { status: 401 })
  }

  const { id } = await params
  const script = await db.script.findUnique({ where: { id } })

  if (!script || script.userId !== session.user.id) {
    return Response.json({ error: "脚本不存在" }, { status: 404 })
  }

  await db.script.delete({ where: { id } })
  return Response.json({ success: true })
}
