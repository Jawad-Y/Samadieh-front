'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Share2, TrendingUp, Users, Edit } from 'lucide-react'
import { contributeToPool, getPool, getPoolContributions, getCurrentUser, updatePool } from '@/lib/api'

interface Pool {
  id: string
  owner_id: string
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

interface Contribution {
  id: string
  pool_id: string
  submitted_by: string | null
  contributor_label: string
  amount: string
  note: string
  created_at: string
}

export default function PoolPage() {
  const params = useParams()
  const shareToken = params.shareToken as string

  const [pool, setPool] = useState<Pool | null>(null)
  const [contributions, setContributions] = useState<Contribution[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingCurrentAmount, setEditingCurrentAmount] = useState('')
  const [editingSubmitting, setEditingSubmitting] = useState(false)

  // Form state
  const [amount, setAmount] = useState('')
  const [label, setLabel] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    fetchPoolData()
    loadCurrentUser()
  }, [shareToken])

  useEffect(() => {
    if (pool) {
      setEditingCurrentAmount(String(parseFloat(pool.total_amount)))
    }
  }, [pool])

  const loadCurrentUser = async () => {
    const user = await getCurrentUser()
    setCurrentUser(user)
  }

  const fetchPoolData = async () => {
    try {
      const poolData = await getPool(shareToken)
      setPool(poolData)

      try {
        const contributionData = await getPoolContributions(shareToken)
        setContributions(contributionData)
      } catch (contributionError) {
        console.error('Failed to fetch contributions:', contributionError)
        setContributions([])
      }
    } catch (error) {
      console.error('Failed to fetch pool:', error)
      toast.error(error instanceof Error ? error.message : 'تعذر تحميل المجمع')
    } finally {
      setLoading(false)
    }
  }

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('أدخل مبلغًا صحيحًا')
      return
    }

    setSubmitting(true)

    try {
      const data = await contributeToPool(shareToken, {
        amount: parseFloat(amount),
        contributor_label: label || 'مجهول',
        note: note || '',
      })
      toast.success('تم إرسال المساهمة بنجاح')
      setPool(data.pool)
      setContributions([data.contribution, ...contributions])
      setAmount('')
      setLabel('')
      setNote('')
    } catch (error) {
      console.error('Contribution error:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ. حاول مرة أخرى.')
    } finally {
      setSubmitting(false)
    }
  }

  const sharePool = () => {
    const shareUrl = `${window.location.origin}/pool/${shareToken}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('تم نسخ رابط المشاركة')
  }

  const handleEditCurrentAmount = async () => {
    if (!editingCurrentAmount || parseFloat(editingCurrentAmount) < 0) {
      toast.error('أدخل قيمة صحيحة')
      return
    }

    setEditingSubmitting(true)

    try {
      if (!pool) return
      const updated = await updatePool(pool.id, {
        total_amount: parseFloat(editingCurrentAmount)
      })
      setPool(updated)
      setEditDialogOpen(false)
      toast.success('تم تحديث القيمة الحالية بنجاح')
    } catch (error) {
      console.error('Error updating current amount:', error)
      toast.error(error instanceof Error ? error.message : 'حدث خطأ. حاول مرة أخرى.')
    } finally {
      setEditingSubmitting(false)
    }
  }

  const canEditPool = Boolean(currentUser && pool && currentUser.id === pool.owner_id)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">جارٍ تحميل المجمع...</div>
        </div>
      </div>
    )
  }

  if (!pool) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">المجمع غير موجود</h1>
            <p className="text-gray-600">المجمع الذي تبحث عنه غير موجود أو لم يعد متاحًا.</p>
          </div>
        </div>
      </div>
    )
  }

  const progressPercent = parseFloat(pool.progress_percent)
  const totalAmount = parseFloat(pool.total_amount)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 sm:text-4xl">{pool.title}</h1>
          <p className="text-lg text-gray-600">{pool.description || 'مجمع من مجمعات صمدية'}</p>
          {pool.photo_url ? (
            <img
              src={pool.photo_url}
              alt={`${pool.title} photo`}
              className="mt-6 h-48 w-full rounded-lg object-cover sm:h-64"
            />
          ) : null}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  تقدم المجمع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
            {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">التقدم نحو الهدف</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {progressPercent.toFixed(2)}%
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">الإجمالي الحالي</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">القيمة الحالية</p>
                        <p className="text-2xl font-bold text-green-600">
                          {totalAmount.toLocaleString()}
                        </p>
                      </div>
                      {canEditPool && (
                        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={() => setEditingCurrentAmount(String(totalAmount))}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>تحديث القيمة الحالية</DialogTitle>
                              <DialogDescription>
                                قم بتغيير القيمة الحالية للمجمع
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="currentAmount">القيمة الحالية الجديدة</Label>
                                <Input
                                  id="currentAmount"
                                  type="number"
                                  placeholder="0.00"
                                  value={editingCurrentAmount}
                                  onChange={(e) => setEditingCurrentAmount(e.target.value)}
                                  step="0.01"
                                  min="0"
                                  disabled={editingSubmitting}
                                />
                              </div>
                              <Button
                                onClick={handleEditCurrentAmount}
                                disabled={editingSubmitting}
                                className="w-full"
                              >
                                {editingSubmitting ? 'جارٍ التحديث...' : 'تحديث'}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">المتبقي</p>
                    <p className="text-2xl font-bold text-rose-600">
                      {parseFloat(pool.remaining_amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Share Button */}
                <Button 
                  onClick={sharePool}
                  variant="outline"
                  className="w-full"
                >
                  <Share2 className="h-4 w-4 ml-2" />
                  نسخ رابط المشاركة
                </Button>
              </CardContent>
            </Card>

            {/* All Contributions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                    سجل المساهمات
                </CardTitle>
                <CardDescription>
                    {contributions.length} مساهمة
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contributions.length === 0 ? (
                  <div className="text-center py-8">
                      <p className="text-gray-600">لا توجد مساهمات بعد. كن أول المساهمين!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {contributions.map((contribution) => (
                      <div key={contribution.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {contribution.contributor_label}
                            </p>
                            {contribution.note && (
                              <p className="text-sm text-gray-600 mt-1">{contribution.note}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(contribution.created_at).toLocaleDateString('ar')}
                            </p>
                          </div>
                          <span className="font-bold text-blue-600">
                            +{parseFloat(contribution.amount).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contribution Form */}
          <div>
            <Card className="lg:sticky lg:top-4">
              <CardHeader>
                <CardTitle>إضافة مساهمة</CardTitle>
                <CardDescription>انضم إلى هذا المجمع</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContribute} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">المبلغ</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="label">اسمك (اختياري)</Label>
                    <Input
                      id="label"
                      type="text"
                      placeholder="مجهول"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">رسالة (اختياري)</Label>
                    <Textarea
                      id="note"
                      placeholder="اكتب رسالة..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      disabled={submitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? 'جارٍ الإرسال...' : 'ساهم الآن'}
                  </Button>
                </form>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">المساهمات المجهولة</span> مرحب بها. يمكنك المساهمة دون تسجيل الدخول.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
