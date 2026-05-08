'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import Navigation from '@/components/navigation'
import { Heart, TrendingUp, Users } from 'lucide-react'

interface Pool {
  id: string
  title: string
  description: string
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

  useEffect(() => {
    fetchPools()
  }, [])

  const fetchPools = async () => {
    try {
      const response = await fetch('/api/pools')
      if (response.ok) {
        const data = await response.json()
        setPools(data)
      }
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
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-gray-900">
                Samadiyyah Pools
              </h1>
            </div>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Join a community of contributors working together to reach collective goals. Create pools, invite others, and build impact together.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link href="/auth/login">
                <Button size="lg" variant="default">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-b py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <CardTitle>Create a Pool</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Sign in and create a new Samadiyyah pool with a goal of 100,000</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                <CardTitle>Share & Invite</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Get a shareable link and invite anyone to contribute to your pool</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Heart className="h-8 w-8 text-rose-500 mb-2" />
                <CardTitle>Reach Your Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Track contributions in real-time and celebrate when you reach 100,000</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Active Pools Section */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Active Pools</h2>
          <p className="text-gray-600 mb-8">Join an existing pool or create your own</p>
          
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Loading pools...</p>
            </div>
          ) : pools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">No active pools yet. Be the first to create one!</p>
              <Link href="/auth/register">
                <Button>Create Pool</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pools.map((pool) => (
                <Link key={pool.id} href={`/pool/${pool.share_token}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{pool.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {pool.description || 'No description'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
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
                            {parseFloat(pool.remaining_amount).toLocaleString()} remaining
                          </p>
                        </div>
                        <p className="text-xs text-gray-500">
                          Created {new Date(pool.created_at).toLocaleDateString()}
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
