'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Navigation from '@/components/navigation'
import { Heart } from 'lucide-react'
import { getPools, getCurrentUser } from '@/lib/api'

interface Pool {
  id: string
  title: string
  description: string
  photo_url?: string | null
  photo_path?: string | null
  share_token: string
  status: string
  goal_amount: string
  total_amount: string
  created_at: string
  progress_percent: string
  remaining_amount: string
}

export default function HomePage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const load = async () => {
      const u = await getCurrentUser()
      setIsLoggedIn(Boolean(u))
      fetchPools()
    }
    load()
  }, [])

  const fetchPools = async () => {
    try {
      const data = await getPools()
      setPools(data)
    } catch (error) {
      console.error('Failed to fetch pools:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="border-b bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-rose-500" />
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                مجمعات صمدية
              </h1>
            </div>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              {!isLoggedIn && (
                <Link href="/auth/login">
                  <Button size="lg" variant="default">
                    تسجيل الدخول
                  </Button>
                </Link>
              )}
              <Link href="/auth/register">
                <Button size="lg" variant="outline">
                  ابدأ الآن
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Active Pools Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold">المجمعات النشطة</h2>
          <p className="mb-8 text-gray-600">انضم إلى مجمع موجود أو أنشئ مجمعك الخاص</p>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">جارٍ تحميل المجمعات...</p>
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">لا توجد مجمعات نشطة بعد. كن أول من ينشئ واحدًا!</p>
              <Link href="/auth/register">
                <Button>إنشاء مجمع</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pools.map((pool) => (
                <Link key={pool.id} href={`/pool/${pool.share_token}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {pool.photo_url ? (
                      <div className="px-6 pt-6">
                        <img
                          src={pool.photo_url}
                          alt={`${pool.title} photo`}
                          className="h-40 w-full rounded-md object-cover"
                        />
                      </div>
                    ) : null}
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{pool.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {pool.description || 'لا يوجد وصف'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">التقدم</span>
                            <span className="font-semibold">{parseFloat(pool.progress_percent).toFixed(2)}%</span>
                          </div>
                          <Progress 
                            value={parseFloat(pool.progress_percent)} 
                            className="h-2"
                          />
                        </div>
                        <div className="text-sm text-gray-600">
                          <p className="font-semibold text-gray-900">
                            {parseFloat(pool.total_amount).toLocaleString()} / {parseFloat(pool.goal_amount).toLocaleString()}
                          </p>
                          <p className="text-xs mt-1">
                            المتبقي {parseFloat(pool.remaining_amount).toLocaleString()}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          تم الإنشاء في {new Date(pool.created_at).toLocaleDateString('ar')}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
