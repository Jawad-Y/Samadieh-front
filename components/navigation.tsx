'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Heart, Menu, LogOut } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { getCurrentUser, logout } from '@/lib/api'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface User {
  email?: string | null
}

export default function Navigation() {
  const [user, setUser] = useState<User | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)

    let isActive = true

    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!isActive) return
      setUser(currentUser)

      if (currentUser) {
        localStorage.setItem('supabase_user', JSON.stringify(currentUser))
      } else {
        localStorage.removeItem('supabase_user')
        localStorage.removeItem('supabase_auth_token')
      }
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!isActive) return
      const nextUser = session?.user ?? null
      setUser(nextUser)

      if (nextUser) {
        localStorage.setItem('supabase_user', JSON.stringify(nextUser))
        if (session?.access_token) {
          localStorage.setItem('supabase_auth_token', session.access_token)
        }
      } else {
        localStorage.removeItem('supabase_user')
        localStorage.removeItem('supabase_auth_token')
      }
    })

    return () => {
      isActive = false
      subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      setUser(null)
      setIsOpen(false)
      router.push('/')
      router.refresh()
      toast.success('تم تسجيل الخروج')
    } catch (err) {
      console.error('Logout error:', err)
      toast.error('تعذر تسجيل الخروج')
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-auto items-center justify-between gap-4 py-4 sm:h-16 sm:py-0">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Heart className="h-6 w-6 text-rose-500" />
            <span className="hidden sm:inline">صمدية</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
              المجمعات
            </Link>
            
            {user ? (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 transition">
                  لوحة التحكم
                </Link>
                <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      {user.email?.split('@')[0] || 'Account'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.email}
                    </div>
                    <Separator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        لوحة التحكم
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4 ml-2" />
                      تسجيل الخروج
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline">تسجيل الدخول</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>ابدأ الآن</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            {user ? (
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      لوحة التحكم
                    </Link>
                  </DropdownMenuItem>
                  <Separator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 ml-2" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/auth/login" className="cursor-pointer">
                      تسجيل الدخول
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/auth/register" className="cursor-pointer">
                      ابدأ الآن
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
