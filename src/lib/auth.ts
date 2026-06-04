import NextAuth from "next-auth"
import Email from "next-auth/providers/email"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Email({
      server: process.env.EMAIL_SERVER || "smtp://localhost:1025",
      from: process.env.EMAIL_FROM || "D-System <noreply@dsystem.cn>",
    }),
    Credentials({
      credentials: {
        email: { label: "邮箱", type: "text" },
        code: { label: "邀请码", type: "text" },
      },
      async authorize(credentials) {
        const email = (credentials as any)?.email?.trim() || ""
        const code = (credentials as any)?.code?.trim() || ""
        if (!email) return null

        const adminEmail = process.env.ADMIN_EMAIL
        const isDev = process.env.NODE_ENV !== "production"

        // 管理员登录（dev 模式：任意邮箱；生产：ADMIN_EMAIL）
        if (isDev || email === adminEmail) {
          let user = await db.user.findUnique({ where: { email } })
          if (!user) user = await db.user.create({ data: { email, name: email === adminEmail ? "管理员" : email.split("@")[0] } })
          const sub = await db.subscription.findUnique({ where: { userId: user.id } })
          if (!sub) {
            await db.subscription.create({
              data: { userId: user.id, plan: "FREE",
                monthlyQuota: email === adminEmail ? 9999 : 50, quotaUsed: 0,
                quotaResetAt: new Date(Date.now() + 30 * 86400000) },
            })
          }
          return { id: user.id, email: user.email!, name: user.name }
        }

        // 普通用户用邀请码登录
        if (code) {
          const invite = await db.inviteCode.findUnique({ where: { code: code.toUpperCase() } })
          if (!invite || invite.usedBy) return null

          let user = await db.user.findUnique({ where: { email } })
          if (!user) user = await db.user.create({ data: { email, name: email.split("@")[0] } })

          // 激活邀请码
          await db.inviteCode.update({ where: { code: code.toUpperCase() }, data: { usedBy: user.id, usedAt: new Date() } })

          // 给积分
          const sub = await db.subscription.findUnique({ where: { userId: user.id } })
          if (sub) {
            await db.subscription.update({ where: { userId: user.id }, data: { quotaUsed: 0, monthlyQuota: { increment: invite.credits } } })
          } else {
            await db.subscription.create({
              data: { userId: user.id, plan: "FREE", monthlyQuota: invite.credits, quotaUsed: 0,
                quotaResetAt: new Date(Date.now() + 30 * 86400000) },
            })
          }
          return { id: user.id, email: user.email!, name: user.name }
        }

        return null
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) { if (user) token.id = user.id; return token },
    async session({ session, token }) { if (session.user && token.id) session.user.id = token.id as string; return session },
    async signIn() { return true },
  },
  pages: { signIn: "/login", error: "/login?error=1" },
})
