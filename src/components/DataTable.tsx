import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { Empty, ErrorState, Skeleton } from './ui'
export interface Col<T> { key: string; label: string; render: (r: T) => ReactNode; sort?: (a: T, b: T) => number }
interface Props<T extends { id: string }> { rows: T[]; cols: Col<T>[]; loading: boolean; error: string | null; onRetry: () => void; onRowClick?: (r: T) => void; pageSize?: number }
export function DataTable<T extends { id: string }>({ rows, cols, loading, error, onRetry, onRowClick, pageSize = 7 }: Props<T>) {
  const [page, setPage] = useState(0); const [sort, setSort] = useState<{ k: string; dir: 1 | -1 } | null>(null)
  useEffect(() => setPage(0), [rows.length])
  if (loading) return <div className="card"><Skeleton /></div>
  if (error) return <div className="card"><ErrorState message={error} onRetry={onRetry} /></div>
  if (!rows.length) return <div className="card"><Empty title="Nothing matches" hint="Clear the search or filters to see all records." /></div>
  const c = cols.find((x) => x.key === sort?.k)
  const cmp = c?.sort
  const sorted = cmp && sort ? [...rows].sort((a, b) => cmp(a, b) * sort.dir) : rows
  const pages = Math.ceil(sorted.length / pageSize), view = sorted.slice(page * pageSize, page * pageSize + pageSize)
  return <div className="card overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm">
    <thead className="bg-slate-50 text-slate-500"><tr>{cols.map((x) => <th key={x.key} className="px-4 py-3 font-medium">
      {x.sort ? <button onClick={() => setSort({ k: x.key, dir: sort?.k === x.key && sort.dir === 1 ? -1 : 1 })}>{x.label} {sort?.k === x.key ? (sort.dir === 1 ? '↑' : '↓') : ''}</button> : x.label}</th>)}</tr></thead>
    <tbody>{view.map((r, i) => <motion.tr key={r.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, delay: i * .03 }} onClick={() => onRowClick?.(r)} className="cursor-pointer border-t border-slate-100 transition hover:bg-amber-soft/60">{cols.map((x) => <td key={x.key} className="px-4 py-3">{x.render(r)}</td>)}</motion.tr>)}</tbody></table></div>
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 text-sm text-slate-500"><span>{sorted.length} records</span>
      <div className="flex items-center gap-2"><button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50 disabled:opacity-40">Prev</button><span>{page + 1}/{pages}</span><button disabled={page + 1 >= pages} onClick={() => setPage(page + 1)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50 disabled:opacity-40">Next</button></div></div></div>
}
