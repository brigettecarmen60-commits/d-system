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
        password: { label: "密码", type: "password" },
        code: { label: "邀请码", type: "text" },
      },
      async authorize(credentials) {
        const email = (credentials as any)?.email?.trim() || ""
        const password = (credentials as any)?.password || ""
        const code = (credentials as any)?.code?.trim() || ""
        if (!email) return null

        const adminEmail = process.env.ADMIN_EMAIL
        const adminPassword = process.env.ADMIN_PASSWORD
        const isDev = process.env.NODE_ENV !== "production"

        // 管理员登录
        if (adminEmail && adminPassword && email === adminEmail && password === adminPassword) {
          let user = await db.user.findUnique({ where: { email } })
          if (!user) user = await db.user.create({ data: { email, name: "管理员" } })
          const sub = await db.subscription.findUnique({ where: { userId: user.id } })
          if (!sub) {
            await db.subscription.create({
              data: { userId: user.id, plan: "FREE", monthlyQuota: 9999, quotaUsed: 0,
                quotaResetAt: new Date(Date.now() + 365 * 86400000) },
            })
          }
          return { id: user.id, email: user.email!, name: user.name }
        }

        // 开发模式：无需密码
        if (isDev) {
          let user = await db.user.findUnique({ where: { email } })
          if (!user) user = await db.user.create({ data: { email, name: email.split("@")[0] } })
          const sub = await db.subscription.findUnique({ where: { userId: user.id } })
          if (!sub) {
            await db.subscription.create({
              data: { userId: user.id, plan: "FREE", monthlyQuota: 50, quotaUsed: 0,
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
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30天记住登录
  callbacks: {
    async jwt({ token, user }) { if (user) token.id = user.id; return token },
    async session({ session, token }) { if (session.user && token.id) session.user.id = token.id as string; return session },
    async signIn() { return true },
  },
  pages: { signIn: "/login", error: "/login?error=1" },
})
