// 简易内存限流器（单实例部署可用，多实例需换 Redis）

const ipMap = new Map<string, { count: number; resetAt: number }>()
const userMap = new Map<string, { count: number; resetAt: number }>()

// 清理过期条目（每5分钟一次）
setInterval(() => {
  const now = Date.now()
  for (const [k, v] of ipMap) { if (now > v.resetAt) ipMap.delete(k) }
  for (const [k, v] of userMap) { if (now > v.resetAt) userMap.delete(k) }
}, 300000)

/**
 * 检查限流
 * @param ip 客户端IP
 * @param userId 用户ID（可选）
 * @returns 是否允许
 */
export function checkRateLimit(ip: string, userId?: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now()

  // IP 限流：每分钟 20 次
  const ipEntry = ipMap.get(ip)
  if (ipEntry && now < ipEntry.resetAt && ipEntry.count >= 20) {
    return { allowed: false, retryAfter: Math.ceil((ipEntry.resetAt - now) / 1000) }
  }
  if (!ipEntry || now >= ipEntry.resetAt) {
    ipMap.set(ip, { count: 1, resetAt: now + 60000 })
  } else {
    ipEntry.count++
  }

  // 用户限流：每分钟 8 次
  if (userId) {
    const userEntry = userMap.get(userId)
    if (userEntry && now < userEntry.resetAt && userEntry.count >= 8) {
      return { allowed: false, retryAfter: Math.ceil((userEntry.resetAt - now) / 1000) }
    }
    if (!userEntry || now >= userEntry.resetAt) {
      userMap.set(userId, { count: 1, resetAt: now + 60000 })
    } else {
      userEntry.count++
    }
  }

  return { allowed: true, retryAfter: 0 }
}

/**
 * 从请求中提取 IP
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp
  return "127.0.0.1"
}
