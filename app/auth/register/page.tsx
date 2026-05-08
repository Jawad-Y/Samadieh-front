'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { register } from '@/lib/api'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      toast.error('كلمتا المرور غير متطابقتين')
      return
    }

    if (password.length < 6) {
      toast.error('يجب ألا تقل كلمة المرور عن 6 أحرف')
      return
    }

    setLoading(true)

    try {
      const data = await register(email, password)

      if (data.session) {
        toast.success('تم إنشاء الحساب بنجاح')
        router.push('/dashboard')
      } else {
        toast.success('تم إنشاء الحساب. تحقق من بريدك الإلكتروني لتأكيد الحساب.')
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Register error:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-blue-50 to-rose-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-rose-500" />
            <h1 className="text-3xl font-bold">صمدية</h1>
          </div>
          <p className="text-gray-600">مجمعات المجتمع</p>
        </div>

        {/* Register Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">ابدأ الآن</CardTitle>
            <CardDescription>
              أنشئ حسابًا للبدء في إدارة المجمعات
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">6 أحرف على الأقل</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">تأكيد كلمة المرور</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
              >
                {loading ? 'جارٍ إنشاء الحساب...' : 'إنشاء الحساب'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">لديك حساب بالفعل؟ </span>
              <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-700">
                سجّل الدخول
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-8">
          بإنشاء حساب، فإنك توافق على شروط الخدمة وسياسة الخصوصية
        </p>
      </div>
    </div>
  )
}
