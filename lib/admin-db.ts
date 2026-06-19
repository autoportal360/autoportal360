// Client-side helper: routes all admin writes through /api/admin/db
// which uses the service role key server-side (bypasses RLS).
// Use this instead of calling Supabase directly in admin form components.

type Filter = { col: string; val?: unknown; in?: unknown[] }

export interface DbOp {
  op: 'insert' | 'update' | 'delete' | 'upsert'
  table: string
  payload?: unknown
  filter?: Filter
  conflict?: string
}

export type DbResult = { ok: true; data?: Record<string, unknown>[] }

async function call(body: { ops?: DbOp[] } | DbOp): Promise<DbResult> {
  const res = await fetch('/api/admin/db', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error ?? 'DB operation failed')
  return json as DbResult
}

export async function dbInsert(table: string, payload: unknown): Promise<DbResult> {
  return call({ op: 'insert', table, payload })
}

export async function dbUpdate(table: string, id: string, payload: unknown): Promise<DbResult> {
  return call({ op: 'update', table, payload, filter: { col: 'id', val: id } })
}

export async function dbUpdateWhere(
  table: string,
  col: string,
  val: unknown,
  payload: unknown,
): Promise<DbResult> {
  return call({ op: 'update', table, payload, filter: { col, val } })
}

export async function dbDelete(table: string, id: string): Promise<DbResult> {
  return call({ op: 'delete', table, filter: { col: 'id', val: id } })
}

export async function dbDeleteWhere(
  table: string,
  col: string,
  val: unknown,
): Promise<DbResult> {
  return call({ op: 'delete', table, filter: { col, val } })
}

export async function dbDeleteIn(
  table: string,
  col: string,
  vals: unknown[],
): Promise<DbResult> {
  return call({ op: 'delete', table, filter: { col, in: vals } })
}

export async function dbUpsert(
  table: string,
  payload: unknown,
  conflict: string,
): Promise<DbResult> {
  return call({ op: 'upsert', table, payload, conflict })
}

export async function dbBatch(ops: DbOp[]): Promise<DbResult> {
  return call({ ops })
}
