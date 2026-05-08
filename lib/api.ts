// API utility functions for the Samadiyyah application
import { supabase } from './supabase'

type PoolRow = {
  id: string
  owner_id: string
  title: string
  description: string | null
  photo_url?: string | null
  photo_path?: string | null
  share_token: string
  status: 'draft' | 'published' | 'archived'
  goal_amount: number | string
  total_amount: number | string
  created_at: string
  updated_at: string
  published_at: string | null
}

type ContributionView = {
  id: string
  pool_id: string
  submitted_by: string | null
  contributor_label: string
  amount: string
  note: string
  created_at: string
}

function toNumber(value: number | string | null | undefined): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return 0
}

function withComputed(pool: PoolRow) {
  const goal = toNumber(pool.goal_amount)
  const total = toNumber(pool.total_amount)
  const progress = goal > 0 ? (total / goal) * 100 : 0
  const remaining = Math.max(goal - total, 0)

  return {
    ...pool,
    description: pool.description ?? '',
    goal_amount: String(goal),
    total_amount: String(total),
    progress_percent: String(progress),
    remaining_amount: String(remaining),
  }
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '-')
}

function stripExtension(name: string): string {
  const lastDot = name.lastIndexOf('.')
  if (lastDot <= 0) return name
  return name.slice(0, lastDot)
}

// Pools
export async function getPools() {
  const { data, error } = await supabase
    .from('pools')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((pool) => withComputed(pool as PoolRow))
}

export async function getPool(shareToken: string) {
  const { data, error } = await supabase
    .from('pools')
    .select('*')
    .eq('share_token', shareToken)
    .single()

  if (error) throw new Error(error.message)
  return withComputed(data as PoolRow)
}

export async function getPoolContributions(shareToken: string): Promise<ContributionView[]> {
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const apiUrl = `${siteUrl}/api/pools/${shareToken}/contributions`

  try {
    const response = await fetch(apiUrl)

    if (!response.ok) {
      if (response.status === 404) {
        return []
      }
      throw new Error('Failed to fetch contributions')
    }

    const result = await response.json()
    return result.contributions as ContributionView[]
  } catch (error) {
    console.error('Error fetching contributions:', error)
    return []
  }
}

export async function getMyPools() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data, error } = await supabase
    .from('pools')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((pool) => withComputed(pool as PoolRow))
}

export async function createPool(data: {
  title: string
  description?: string
  status?: 'draft' | 'published'
}) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const now = new Date().toISOString()
  const payload = {
    owner_id: user.id,
    title: data.title,
    description: data.description || '',
    status: data.status || 'draft',
    goal_amount: 100000,
    total_amount: 0,
    published_at: (data.status || 'draft') === 'published' ? now : null,
  }

  const { data: created, error } = await supabase
    .from('pools')
    .insert(payload)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return withComputed(created as PoolRow)
}

export async function updatePool(
  poolId: string,
  data: {
    title?: string
    description?: string
    status?: 'draft' | 'published' | 'archived'
    goal_amount?: number | string
    total_amount?: number | string
  }
) {
  const updates: {
    title?: string
    description?: string
    status?: 'draft' | 'published' | 'archived'
    goal_amount?: number | string
    total_amount?: number | string
    published_at?: string | null
  } = {
    ...data,
  }

  if (data.status === 'published') {
    updates.published_at = new Date().toISOString()
  }

  const { data: updated, error } = await supabase
    .from('pools')
    .update(updates)
    .eq('id', poolId)
    .select('*')
    .single()

  if (error) throw new Error(error.message)
  return withComputed(updated as PoolRow)
}

export async function deletePool(poolId: string) {
  const { error } = await supabase
    .from('pools')
    .delete()
    .eq('id', poolId)

  if (error) throw new Error(error.message)
}

export async function uploadPoolPhoto(poolId: string, file: File) {
  if (!file) {
    throw new Error('Missing photo file')
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed')
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image must be 5 MB or smaller')
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new Error('Unauthorized')
  }

  const { data: poolData, error: poolError } = await supabase
    .from('pools')
    .select('*')
    .eq('id', poolId)
    .single()

  if (poolError || !poolData) {
    throw new Error(poolError?.message || 'Pool not found')
  }

  if ((poolData as PoolRow).owner_id !== user.id) {
    throw new Error('Not pool owner')
  }

  const extension = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const safeName = sanitizeFileName(stripExtension(file.name))
  const photoPath = `pools/${poolId}/${Date.now()}-${safeName}.${extension}`

  const configuredBucket = process.env.NEXT_PUBLIC_SUPABASE_POOL_PHOTOS_BUCKET?.trim()
  const candidateBuckets = configuredBucket
    ? [configuredBucket]
    : ['pool-photos', 'pools', 'photos']

  let selectedBucket: string | null = null
  let bucketNotFoundSeen = false

  const uploadToBucket = async (bucket: string) => {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(photoPath, file, {
        contentType: file.type,
        upsert: true,
      })
    return error
  }

  const tryKnownExistingBuckets = async () => {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error || !buckets || buckets.length === 0) {
      return null
    }

    const preferred = ['pool-photos', 'pools', 'photos']
    const preferredMatch = buckets.find((b) => preferred.includes(b.name))
    const ordered = preferredMatch
      ? [preferredMatch, ...buckets.filter((b) => b.name !== preferredMatch.name)]
      : buckets

    for (const bucket of ordered) {
      const uploadError = await uploadToBucket(bucket.name)
      if (!uploadError) {
        return bucket.name
      }
    }

    return null
  }

  for (const bucket of candidateBuckets) {
    const uploadError = await uploadToBucket(bucket)

    if (!uploadError) {
      selectedBucket = bucket
      break
    }

    const lowerMessage = uploadError.message.toLowerCase()
    if (lowerMessage.includes('bucket not found')) {
      bucketNotFoundSeen = true
      continue
    }

    throw new Error(uploadError.message)
  }

  if (!selectedBucket) {
    if (bucketNotFoundSeen) {
      const createBucketName = configuredBucket || 'pool-photos'
      const { error: createBucketError } = await supabase.storage.createBucket(createBucketName, {
        public: true,
        fileSizeLimit: 5 * 1024 * 1024,
        allowedMimeTypes: ['image/*'],
      })

      const createMessage = createBucketError?.message.toLowerCase() || ''
      const canRetry = !createBucketError || createMessage.includes('already exists')

      if (canRetry) {
        const retryError = await uploadToBucket(createBucketName)
        if (!retryError) {
          selectedBucket = createBucketName
        } else {
          const discoveredBucket = await tryKnownExistingBuckets()
          if (discoveredBucket) {
            selectedBucket = discoveredBucket
          } else {
            throw new Error(retryError.message)
          }
        }
      } else {
        const discoveredBucket = await tryKnownExistingBuckets()
        if (discoveredBucket) {
          selectedBucket = discoveredBucket
        } else {
          throw new Error(
            'Bucket not found and auto-create failed. Create a Supabase Storage bucket named "' +
            `${createBucketName}` +
            '" or set NEXT_PUBLIC_SUPABASE_POOL_PHOTOS_BUCKET to an existing bucket.'
          )
        }
      }
    }
  }

  if (!selectedBucket) {
    throw new Error('Failed to upload pool photo')
  }

  const { data: publicUrlData } = supabase.storage
    .from(selectedBucket)
    .getPublicUrl(photoPath)

  const photoUrl = publicUrlData.publicUrl

  const { data: updatedData, error: updateError } = await supabase
    .from('pools')
    .update({
      photo_url: photoUrl,
      photo_path: photoPath,
    })
    .eq('id', poolId)
    .select('*')

  if (updateError || !updatedData) {
    throw new Error(updateError?.message || 'Failed to update pool photo')
  }

  const updatedPool = Array.isArray(updatedData) ? updatedData[0] : updatedData

  if (!updatedPool) {
    throw new Error('Failed to update pool photo')
  }

  return {
    pool: withComputed(updatedPool as PoolRow),
    photo_url: photoUrl,
    photo_path: photoPath,
  }
}

export async function contributeToPool(
  shareToken: string,
  data: {
    amount: number
    contributor_label?: string
    note?: string
  }
) {
  const amount = Number(data.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('Invalid amount')
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const apiUrl = `${siteUrl}/api/pools/${shareToken}/contribute`

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      contributor_label: data.contributor_label,
      note: data.note,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to contribute to pool')
  }

  const result = await response.json()
  const { contribution, pool: poolResponse } = result

  // Reconstruct a full pool object for withComputed
  const fullPool: PoolRow = {
    id: poolResponse.id || shareToken,
    owner_id: '',
    title: '',
    description: null,
    share_token: shareToken,
    status: 'published',
    goal_amount: poolResponse.goal_amount || 0,
    total_amount: poolResponse.total_amount || 0,
    created_at: new Date().toISOString(),
    updated_at: poolResponse.updated_at || new Date().toISOString(),
    published_at: null,
  }

  return {
    contribution: {
      ...contribution,
      amount: String(contribution.amount),
    },
    pool: withComputed(fullPool),
  }
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Store for compatibility with localStorage-based components
  if (data.session?.access_token) {
    localStorage.setItem('supabase_auth_token', data.session.access_token)
  }
  if (data.user) {
    localStorage.setItem('supabase_user', JSON.stringify(data.user))
  }
  
  return data
}

export async function register(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) {
    throw new Error(error.message)
  }
  
  // Store for compatibility
  if (data.session?.access_token) {
    localStorage.setItem('supabase_auth_token', data.session.access_token)
  }
  if (data.user) {
    localStorage.setItem('supabase_user', JSON.stringify(data.user))
  }
  
  return data
}

export async function getCurrentUser() {
  try {
    const { data, error } = await supabase.auth.getUser()
    
    if (error || !data.user) {
      return null
    }
    
    return data.user
  } catch {
    return null
  }
}

export async function logout() {
  await supabase.auth.signOut()
  localStorage.removeItem('supabase_auth_token')
  localStorage.removeItem('supabase_user')
}
