'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { ImagePlus, Plus, Share2, Trash2, Lock, Unlock, TrendingUp } from 'lucide-react'
import { createPool, deletePool, getCurrentUser, getMyPools, updatePool, uploadPoolPhoto } from '@/lib/api'

interface Pool {
  id: string
  owner_id: string
  title: string
  description: string
  photo_url?: string | null
  photo_path?: string | null
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
  const [uploadingPoolId, setUploadingPoolId] = useState<string | null>(null)
  const router = useRouter()

  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState('draft')

  useEffect(() => {
    const checkAndFetch = async () => {
      const user = await getCurrentUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      fetchPools()
    }

    checkAndFetch()
  }, [router])

  const fetchPools = async () => {
    try {
      const data = await getMyPools()
      setPools(data)
    } catch (error) {
      if (error instanceof Error && error.message === 'Unauthorized') {
        localStorage.removeItem('supabase_auth_token')
        router.push('/auth/login')
      } else {
        console.error('Failed to fetch pools:', error)
        toast.error('تعذر تحميل المجمعات')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('عنوان المجمع مطلوب')
      return
    }

    setIsCreating(true)

    try {
      const data = await createPool({
        title: title.trim(),
        description: description.trim(),
        status: status as 'draft' | 'published',
      })

      toast.success('تم إنشاء المجمع بنجاح')
      setPools([data, ...pools])
      setTitle('')
      setDescription('')
      setStatus('draft')
      setIsOpen(false)
    } catch (error) {
      console.error('Create pool error:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ. حاول مرة أخرى.')
    } finally {
      setIsCreating(false)
    }
  }

  const handlePublishPool = async (poolId: string) => {
    try {
      const updatedPool = await updatePool(poolId, { status: 'published' })
      setPools(pools.map(p => p.id === poolId ? updatedPool : p))
      toast.success('تم نشر المجمع بنجاح')
    } catch (error) {
      console.error('Publish error:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ')
    }
  }

  const handleDeletePool = async (poolId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المجمع؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return
    }

    try {
      await deletePool(poolId)
      setPools(pools.filter(p => p.id !== poolId))
      toast.success('تم حذف المجمع بنجاح')
    } catch (error) {
      console.error('Delete error:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ')
    }
  }

  const copyShareLink = (shareToken: string) => {
    const shareUrl = `${window.location.origin}/pool/${shareToken}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('تم نسخ رابط المشاركة')
  }

  const handleUploadPhoto = async (poolId: string, file: File) => {
    try {
      setUploadingPoolId(poolId)
      const result = await uploadPoolPhoto(poolId, file)
      setPools((prev) => prev.map((pool) => (pool.id === poolId ? { ...pool, ...result.pool } : pool)))
      toast.success('تم رفع صورة المجمع بنجاح')
    } catch (error) {
      console.error('Upload photo error:', error)
      toast.error(error instanceof Error ? error.message : 'تعذر رفع الصورة')
    } finally {
      setUploadingPoolId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">جارٍ تحميل لوحة التحكم...</div>
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">مجمعاتك</h1>
            <p className="mt-2 text-gray-600">أنشئ وادِر مجمعات صمدية الخاصة بك</p>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full sm:w-auto">
                <Plus className="h-4 w-4 ml-2" />
                مجمع جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إنشاء مجمع جديد</DialogTitle>
                <DialogDescription>
                  أنشئ مجمعًا جديدًا لصمدية بهدف 100,000
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreatePool} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان المجمع</Label>
                  <Input
                    id="title"
                    placeholder="مثال: مجمع رمضان"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">الوصف (اختياري)</Label>
                  <Textarea
                    id="description"
                    placeholder="صف هدف هذا المجمع..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">الحالة المبدئية</Label>
                  <Select value={status} onValueChange={setStatus} disabled={isCreating}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">مسودة (خاص)</SelectItem>
                      <SelectItem value="published">منشور (عام)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? 'جارٍ الإنشاء...' : 'إنشاء المجمع'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Overview */}
        <div className="mb-12 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي المجمعات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{pools.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">المجمعات النشطة</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{publishedPools.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">المسودات</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{draftPools.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Published Pools */}
        {publishedPools.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <Unlock className="h-5 w-5 text-green-600" />
              المجمعات المنشورة
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {publishedPools.map((pool) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  onPublish={() => {}}
                  onDelete={() => handleDeletePool(pool.id)}
                  onCopyLink={() => copyShareLink(pool.share_token)}
                  onUploadPhoto={(file) => handleUploadPhoto(pool.id, file)}
                  uploading={uploadingPoolId === pool.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Draft Pools */}
        {draftPools.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <Lock className="h-5 w-5 text-yellow-600" />
              المجمعات المسودة
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {draftPools.map((pool) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  onPublish={() => handlePublishPool(pool.id)}
                  onDelete={() => handleDeletePool(pool.id)}
                  onCopyLink={() => copyShareLink(pool.share_token)}
                  onUploadPhoto={(file) => handleUploadPhoto(pool.id, file)}
                  uploading={uploadingPoolId === pool.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Archived Pools */}
        {archivedPools.length > 0 && (
          <section className="mb-12">
            <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
              <Trash2 className="h-5 w-5 text-gray-500" />
              المجمعات المؤرشفة
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              {archivedPools.map((pool) => (
                <PoolCard
                  key={pool.id}
                  pool={pool}
                  onPublish={() => {}}
                  onDelete={() => handleDeletePool(pool.id)}
                  onCopyLink={() => copyShareLink(pool.share_token)}
                  onUploadPhoto={(file) => handleUploadPhoto(pool.id, file)}
                  uploading={uploadingPoolId === pool.id}
                />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {pools.length === 0 && (
          <Card className="text-center py-12">
            <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="mb-2 text-xl font-semibold">لا توجد مجمعات بعد</h3>
            <p className="mb-6 text-gray-600">أنشئ أول مجمع لصمدية للبدء</p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء مجمع
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
  onUploadPhoto: (file: File) => void
  uploading: boolean
}

function PoolCard({ pool, onPublish, onDelete, onCopyLink, onUploadPhoto, uploading }: PoolCardProps) {
  const totalAmount = parseFloat(pool.total_amount)
  const goalAmount = parseFloat(pool.goal_amount)
  const progressPercent = (totalAmount / goalAmount) * 100

  return (
    <Card>
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
          {pool.description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">التقدم</span>
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
            المتبقي {(goalAmount - totalAmount).toLocaleString()}
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
            {pool.status === 'published'
              ? 'منشور'
              : pool.status === 'draft'
              ? 'مسودة'
              : 'مؤرشف'}
          </span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-4">
          {pool.status === 'draft' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2"
              onClick={onPublish}
            >
              <Unlock className="h-4 w-4" />
              نشر
            </Button>
          )}
          {pool.status === 'published' && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-2"
              onClick={onCopyLink}
            >
              <Share2 className="h-4 w-4" />
              مشاركة
            </Button>
          )}
          <label>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (file) {
                  onUploadPhoto(file)
                }
                event.currentTarget.value = ''
              }}
              disabled={uploading}
            />
            <Button size="sm" variant="outline" asChild disabled={uploading}>
              <span className="flex items-center gap-2">
                <ImagePlus className="h-4 w-4" />
                {uploading ? 'جارٍ الرفع...' : 'صورة'}
              </span>
            </Button>
          </label>
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
