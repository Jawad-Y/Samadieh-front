'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { Share2, TrendingUp, Users } from 'lucide-react'

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

  // Form state
  const [amount, setAmount] = useState('')
  const [label, setLabel] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    fetchPool()
  }, [shareToken])

  const fetchPool = async () => {
    try {
      const response = await fetch(`/api/pools/share/${shareToken}`)
      if (response.ok) {
        const data = await response.json()
        setPool(data)
        // In a real app, you'd fetch contributions from the API
      } else {
        toast.error('Pool not found')
      }
    } catch (error) {
      console.error('Failed to fetch pool:', error)
      toast.error('Failed to load pool')
    } finally {
      setLoading(false)
    }
  }

  const handleContribute = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setSubmitting(true)

    try {
      const token = localStorage.getItem('supabase_auth_token')
      const response = await fetch(`/api/pools/share/${shareToken}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          contributor_label: label || 'Anonymous',
          note: note || '',
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Contribution submitted successfully!')
        // Update pool with new data
        setPool(data.pool)
        // Add new contribution to list
        setContributions([data.contribution, ...contributions])
        // Reset form
        setAmount('')
        setLabel('')
        setNote('')
      } else {
        toast.error(data.error || 'Failed to submit contribution')
      }
    } catch (error) {
      console.error('Contribution error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const sharePool = () => {
    const shareUrl = `${window.location.origin}/pool/${shareToken}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Share link copied to clipboard!')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading pool...</div>
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
            <h1 className="text-2xl font-bold mb-4">Pool Not Found</h1>
            <p className="text-gray-600">The pool you&apos;re looking for doesn&apos;t exist or is no longer available.</p>
          </div>
        </div>
      </div>
    )
  }

  const progressPercent = parseFloat(pool.progress_percent)
  const totalAmount = parseFloat(pool.total_amount)
  const goalAmount = parseFloat(pool.goal_amount)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{pool.title}</h1>
          <p className="text-gray-600 text-lg">{pool.description || 'A Samadiyyah pool'}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Pool Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-gray-700">Goal Progress</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {progressPercent.toFixed(2)}%
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                </div>

                {/* Stats Grid */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Current Total</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {totalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Goal Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {goalAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-rose-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Remaining</p>
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
                  <Share2 className="h-4 w-4 mr-2" />
                  Copy Share Link
                </Button>
              </CardContent>
            </Card>

            {/* Recent Contributions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Recent Contributions
                </CardTitle>
                <CardDescription>
                  {contributions.length} contribution{contributions.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contributions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No contributions yet. Be the first to contribute!</p>
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
                              {new Date(contribution.created_at).toLocaleDateString()}
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
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Make a Contribution</CardTitle>
                <CardDescription>Join this Samadiyyah pool</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContribute} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
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
                    <Label htmlFor="label">Your Name (Optional)</Label>
                    <Input
                      id="label"
                      type="text"
                      placeholder="Anonymous"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      disabled={submitting}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="note">Message (Optional)</Label>
                    <Textarea
                      id="note"
                      placeholder="Leave a message..."
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
                    {submitting ? 'Submitting...' : 'Contribute'}
                  </Button>
                </form>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">Anonymous contributions</span> are welcome! You can contribute without signing in.
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
