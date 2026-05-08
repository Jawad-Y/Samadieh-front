import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params
    const body = await request.json()
    const { amount, contributor_label, note } = body

    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      )
    }

    if (!shareToken) {
      return NextResponse.json(
        { error: 'Share token is required' },
        { status: 400 }
      )
    }

    // Get the pool by share token
    const { data: poolData, error: poolError } = await supabaseAdmin
      .from('pools')
      .select('id, total_amount, goal_amount')
      .eq('share_token', shareToken)
      .single()

    if (poolError || !poolData) {
      return NextResponse.json(
        { error: 'Pool not found' },
        { status: 404 }
      )
    }

    const parsedAmount = parseFloat(amount)

    // Insert the contribution
    const { data: contributionData, error: contributionError } = await supabaseAdmin
      .from('pool_contributions')
      .insert({
        pool_id: poolData.id,
        submitted_by: null,
        contributor_label: contributor_label || 'Anonymous',
        amount: parsedAmount,
        note: note || '',
      })
      .select('*')
      .single()

    if (contributionError) {
      return NextResponse.json(
        { error: 'Failed to create contribution' },
        { status: 500 }
      )
    }

    // Update the pool total
    const newTotal = (parseFloat(poolData.total_amount) || 0) + parsedAmount
    const { data: updatedPool, error: updateError } = await supabaseAdmin
      .from('pools')
      .update({ total_amount: newTotal })
      .eq('id', poolData.id)
      .select('*')
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update pool' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      contribution: {
        id: contributionData.id,
        pool_id: contributionData.pool_id,
        submitted_by: contributionData.submitted_by,
        contributor_label: contributionData.contributor_label,
        amount: String(contributionData.amount),
        note: contributionData.note,
        created_at: contributionData.created_at,
      },
      pool: {
        id: updatedPool.id,
        total_amount: String(newTotal),
        updated_at: updatedPool.updated_at,
      },
    })
  } catch (error) {
    console.error('Contribution error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
