"use client"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, Settings, User } from "lucide-react"
import { Sparkles } from "lucide-react"

export function Navbar() {
  const { data: session } = useSession()

  return (
    <header className="sticky top-0 z-40 border-b border-border/30 bg-card/70 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-2 md:hidden">
          <div className="h-7 w-7 rounded-md bg-amber-500 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-base font-bold">老D</span>
        </div>
        <div className="flex-1 md:hidden" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-9 cursor-pointer">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-xs font-medium">
                {session?.user?.name?.[0] || session?.user?.email?.[0] || "?"}
              </div>
              <span className="hidden sm:inline text-sm font-medium">
                {session?.user?.name || session?.user?.email}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 text-sm text-muted-foreground truncate max-w-[180px]">
              {session?.user?.email}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href="/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                设置
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
