import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 懒加载：只在第一次调用时连接 DB，避免构建时连接失败
function createPrismaClient() {
  return new PrismaClient()
}

let _db: PrismaClient | undefined

export const db = new Proxy({} as PrismaClient, {
  get(_, prop) {
    if (!_db) {
      _db = globalForPrisma.prisma ?? createPrismaClient()
      if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = _db
    }
    const val = (_db as any)[prop]
    return typeof val === "function" ? val.bind(_db) : val
  },
})
