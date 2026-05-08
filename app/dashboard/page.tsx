'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Copy, Share2, Trash2, Edit2, Lock, Unlock, TrendingUp } from 'lucide-react'

interface Pool {
  id: string
  owner_id: string
  title: string
  description: string
  share_token: string
  status: 'draft' | 'published' | 'archived'
  goal_amount: string
  total_amount: string
  created_at: string
  updated_at: string
  published_at: string | null
  progress_percent?: string
  remaining_amount?: string
}

export default function DashboardPage() {
  const [pools, setPools] = useState<Pool[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('draft')

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('supabase_auth_token')
    if (!token) {
      router.push('/auth/login')
      return
    }
    fetchPools()
  }, [router])

  const fetchPools = async () => {
    try {
      const token = localStorage.getItem('supabase_auth_token')
      const response = await fetch('/api/pools/mine', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPools(data)
      } else if (response.status === 401) {
        localStorage.removeItem('supabase_auth_token')
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Failed to fetch pools:', error)
      toast.error('Failed to load pools')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Pool title is required')
      return
    }

    setIsCreating(true)

    try {
      const token = localStorage.getItem('supabase_auth_token')
      const response = await fetch('/api/pools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          status,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Pool created successfully!')
        setPools([data, ...pools])
        setTitle('')
        setDescription('')
        setStatus('draft')
        setIsOpen(false)
      } else {
        toast.error(data.error || 'Failed to create pool')
      }
    } catch (error) {
      console.error('Create pool error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handlePublishPool = async (poolId: string) => {
    try {
      const token = localStorage.getItem('supabase_auth_token')
      const response = await fetch(`/api/pools/${poolId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'published' }),
      })

      if (response.ok) {
        const updatedPool = await response.json()
        setPools(pools.map(p => p.id === poolId ? updatedPool : p))
        toast.success('Pool published successfully!')
      } else {
        toast.error('Failed to publish pool')
      }
    } catch (error) {
      console.error('Publish error:', error)
      toast.error('An error occurred')
    }
  }

  const handleDeletePool = async (poolId: string) => {
    if (!confirm('Are you sure you want to delete this pool? This action cannot be undone.')) {
      return
    }

    try {
      const token = localStorage.getItem('supabase_auth_token')
      const response = await fetch(`/api/pools/${poolId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setPools(pools.filter(p => p.id !== poolId))
        toast.success('Pool deleted successfully')
      } else {
        toast.error('Failed to delete pool')
      }
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('An error occurred')
    }
  }

  const copyShareLink = (shareToken: string) => {
    const shareUrl = `${window.location.origin}/pool/${shareToken}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading dashboard...</div>
        </div>
      </div>
    )
  }

  const publishedPools = pools.filter(p => p.status === 'published')
  const draftPools = pools.filter(p => p.status === 'draft')
  const archivedPools = pools.filter(p => p.status === 'archived')

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Your Pools</h1>
            <p className="text-gray-600 mt-2">Create and manage your Samadiyyah pools</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="mt-4 sm:mt-0">
                <Plus className="h-4 w-4 mr-2" />
                New Pool
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Pool</DialogTitle>
                <DialogDescription>
                  Create a new Samadiyyah pool with a goal of 100,000
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePool} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Pool Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Ramadan Samadiyyah"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the purpose of this pool..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select value={status} onValueChange={setStatus} disabled={isCreating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft (Private)</SelectItem>
                      <SelectItem value="published">Published (Public)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? 'Creating...' : 'Create Pool'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Pools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pools.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Active Pools</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{publishedPools.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Drafts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{draftPools.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Published Pools */}
        {publishedPools.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Unlock className="h-5 w-5 text-green-600" />
              Published Pools
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {publishedPools.map((pool) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  onPublish={() => {}}
                  onDelete={() => handleDeletePool(pool.id)}
                  onCopyLink={() => copyShareLink(pool.share_token)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Draft Pools */}
        {draftPools.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-yellow-600" />
              Draft Pools
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {draftPools.map((pool) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  onPublish={() => handlePublishPool(pool.id)}
                  onDelete={() => handleDeletePool(pool.id)}
                  onCopyLink={() => copyShareLink(pool.share_token)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {pools.length === 0 && (
          <Card className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No pools yet</h3>
            <p className="text-gray-600 mb-6">Create your first Samadiyyah pool to get started</p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pool
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Pool</DialogTitle>
                  <DialogDescription>
                    Create a new Samadiyyah pool with a goal of 100,000
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreatePool} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Pool Title</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Ramadan Samadiyyah"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the purpose of this pool..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isCreating}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Initial Status</Label>
                    <Select value={status} onValueChange={setStatus} disabled={isCreating}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft (Private)</SelectItem>
                        <SelectItem value="published">Published (Public)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full" disabled={isCreating}>
                    {isCreating ? 'Creating...' : 'Create Pool'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </Card>
        )}
      </main>
    </div>
  )
}

interface PoolCardProps {
  pool: Pool
  onPublish: () => void
  onDelete: () => void
  onCopyLink: () => void
}

function PoolCard({ pool, onPublish, onDelete, onCopyLink }: PoolCardProps) {
  const totalAmount = parseFloat(pool.total_amount)
  const goalAmount = parseFloat(pool.goal_amount)
  const progressPercent = (totalAmount / goalAmount) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="line-clamp-2">{pool.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {pool.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-semibold">{progressPercent.toFixed(2)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Amount */}
        <div className="text-sm">
          <p className="font-semibold text-gray-900">
            {totalAmount.toLocaleString()} / {goalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {(goalAmount - totalAmount).toLocaleString()} remaining
          </p>
        </div>

        {/* Status Badge */}
        <div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            pool.status === 'published'
              ? 'bg-green-100 text-green-800'
              : pool.status === 'draft'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          {pool.status === 'draft' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onPublish}
            >
              <Unlock className="h-4 w-4 mr-1" />
              Publish
            </Button>
          )}
          {pool.status === 'published' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={onCopyLink}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
          )}
          <Button
            size="sm"
            variant="destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
