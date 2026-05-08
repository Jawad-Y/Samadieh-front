// API utility functions for the Samadiyyah application

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('supabase_auth_token')
    : null

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || `API Error: ${response.status}`)
  }

  return data
}

// Pools
export async function getPools() {
  return apiCall('/pools')
}

export async function getPool(shareToken: string) {
  return apiCall(`/pools/share/${shareToken}`)
}

export async function getMyPools() {
  return apiCall('/pools/mine')
}

export async function createPool(data: {
  title: string
  description?: string
  status?: 'draft' | 'published'
}) {
  return apiCall('/pools', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updatePool(
  poolId: string,
  data: {
    title?: string
    description?: string
    status?: 'draft' | 'published' | 'archived'
  }
) {
  return apiCall(`/pools/${poolId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deletePool(poolId: string) {
  return apiCall(`/pools/${poolId}`, {
    method: 'DELETE',
  })
}

export async function contributeToPool(
  shareToken: string,
  data: {
    amount: number
    contributor_label?: string
    note?: string
  }
) {
  return apiCall(`/pools/share/${shareToken}/join`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

// Auth
export async function login(email: string, password: string) {
  return apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function register(email: string, password: string) {
  return apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export async function getCurrentUser() {
  try {
    return await apiCall('/auth/me')
  } catch {
    return null
  }
}

export async function logout() {
  localStorage.removeItem('supabase_auth_token')
  localStorage.removeItem('supabase_user')
}
