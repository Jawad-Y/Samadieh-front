import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params

    if (!shareToken) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      )
    }

    // Get the pool by share token
    const { data: poolData, error: poolError } = await supabaseAdmin
      .from('pools')
      .select('id')
      .eq('share_token', shareToken)
      .single()

    if (poolError || !poolData) {
      return NextResponse.json(
        { error: 'Pool not found' },
        { status: 404 }
      )
    }

    // Fetch contributions
    const { data: contributions, error: contributionsError } = await supabaseAdmin
      .from('pool_contributions')
      .select('*')
      .eq('pool_id', poolData.id)
      .order('created_at', { ascending: false })

    if (contributionsError) {
      return NextResponse.json(
        { error: 'Failed to fetch contributions' },
        { status: 500 }
      )
    }

    const normalizedContributions = (contributions ?? []).map((item) => ({
      id: item.id,
      pool_id: item.pool_id,
      submitted_by: item.submitted_by,
      contributor_label: item.contributor_label || 'Anonymous',
      amount: String(item.amount),
      note: item.note || '',
      created_at: item.created_at,
    }))

    return NextResponse.json({ contributions: normalizedContributions })
  } catch (error) {
    console.error('Contributions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
