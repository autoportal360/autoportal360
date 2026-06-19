import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAdminUser } from '@/lib/admin-auth'

type Filter = { col: string } & (
  | { val: unknown; in?: never }
  | { in: unknown[]; val?: never }
)

interface DbOp {
  op: 'insert' | 'update' | 'delete' | 'upsert'
  table: string
  payload?: unknown
  filter?: Filter
  conflict?: string
}

function adminSb() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyFilter(q: any, filter: Filter) {
  if (Array.isArray(filter.in)) return q.in(filter.col, filter.in)
  return q.eq(filter.col, filter.val)
}

async function execOp(
  sb: ReturnType<typeof adminSb>,
  { op, table, payload, filter, conflict }: DbOp,
) {
  switch (op) {
    case 'insert':
      return sb.from(table).insert(payload as object).select()

    case 'update': {
      if (!filter) throw new Error('filter required for update')
      const q = sb.from(table).update(payload as object).select()
      return applyFilter(q, filter)
    }

    case 'delete': {
      if (!filter) throw new Error('filter required for delete')
      const q = sb.from(table).delete()
      return applyFilter(q, filter)
    }

    case 'upsert': {
      const opts = conflict ? { onConflict: conflict } : undefined
      return sb.from(table).upsert(payload as object, opts).select()
    }

    default:
      throw new Error(`Unknown op: ${op}`)
  }
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { ops?: DbOp[] } & Partial<DbOp>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const client = adminSb()

  // Batch mode: run multiple ops, stop on first error
  if (body.ops) {
    for (const singleOp of body.ops) {
      const { error } = await execOp(client, singleOp)
      if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ ok: true })
  }

  // Single op mode
  const { op, table, payload, filter, conflict } = body
  if (!op || !table) {
    return NextResponse.json({ error: 'op and table required' }, { status: 400 })
  }

  try {
    const { data, error } = await execOp(client, { op, table, payload, filter, conflict })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true, data })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'DB error' },
      { status: 400 },
    )
  }
}
