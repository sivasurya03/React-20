import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useCountUp } from '../hooks/useCountUp'
const tone: Record<string, string> = { Active: 'bg-emerald-100 text-emerald-800', 'In Transit': 'bg-sky-100 text-sky-800', Maintenance: 'bg-amber-soft text-amber-900', Idle: 'bg-slate-200 text-slate-700',
  Pending: 'bg-slate-200 text-slate-700', Assigned: 'bg-indigo-100 text-indigo-800', Delivered: 'bg-emerald-100 text-emerald-800', Delayed: 'bg-rose-100 text-rose-800' }
export const Badge = ({ label }: { label: string }) => <motion.span initial={{ scale: .85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: .25 }} className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone[label] ?? 'bg-slate-200'}`}>{label}</motion.span>
export function Stat({ label, value, suffix = '', accent = false }: { label: string; value: number; suffix?: string; accent?: boolean }) {
  const n = useCountUp(value)
  return <motion.div whileHover={{ y: -3 }} className={`card p-4 ${accent ? 'ring-2 ring-amber' : ''}`}><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-semibold tabular-nums">{n}{suffix}</p></motion.div>
}
export const Skeleton = ({ rows = 5 }: { rows?: number }) => <div className="space-y-3 p-4" aria-busy>{Array.from({ length: rows }, (_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-200" />)}</div>
export const Empty = ({ title, hint }: { title: string; hint: string }) => <div className="p-10 text-center"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-500">{hint}</p></div>
export const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => <div className="p-10 text-center"><p className="font-semibold text-rose-700">Something went wrong</p><p className="mt-1 text-sm text-slate-500">{message}</p><button onClick={onRetry} className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm text-white">Retry</button></div>
export const Page = ({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) => <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-semibold">{title}</h1>{action}</div>{children}</div>
export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4" onClick={onClose}>
    <motion.div initial={{ scale: .96, y: 12 }} animate={{ scale: 1, y: 0 }} role="dialog" aria-label={title} className="card max-h-[90vh] w-full max-w-md overflow-y-auto bg-white p-5" onClick={(e) => e.stopPropagation()}>
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>{children}</motion.div></motion.div>
}
export function Kpi({ label, value, suffix = '', icon, trend }: { label: string; value: number; suffix?: string; icon: ReactNode; trend: number }) {
  const n = useCountUp(value); const up = trend >= 0
  return <motion.div whileHover={{ y: -4 }} className="card p-4"><div className="flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-amber to-orange-400 text-ink shadow-md shadow-amber/30">{icon}</span>
    <span className={`text-xs font-medium ${up ? 'text-emerald-700' : 'text-rose-700'}`}>{up ? '▲' : '▼'} {Math.abs(trend)}%</span></div><p className="mt-3 text-sm text-slate-500">{label}</p><p className="text-3xl font-semibold tabular-nums">{n}{suffix}</p></motion.div>
}
const hues = ['bg-indigo-500', 'bg-teal', 'bg-rose-500', 'bg-sky-500', 'bg-amber', 'bg-violet-500']
export const Avatar = ({ name, size = 'h-9 w-9' }: { name: string; size?: string }) => <span aria-hidden className={`grid ${size} shrink-0 place-items-center rounded-full text-xs font-semibold text-white ${hues[name.length % hues.length]}`}>{name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</span>
export const Stars = ({ value }: { value: number }) => <span className="whitespace-nowrap" aria-label={`Rating ${value.toFixed(1)} out of 5`}><span className="text-amber">{'★'.repeat(Math.round(value))}</span><span className="text-slate-300">{'★'.repeat(5 - Math.round(value))}</span> <span className="text-xs text-slate-500">{value.toFixed(1)}</span></span>
export const HistoryList = ({ title, rows }: { title: string; rows: { title: string; sub: string }[] }) => <div><h3 className="mb-2 text-sm font-semibold">{title}</h3><ol className="space-y-2 border-l border-slate-200 pl-4">{rows.map((r) => <li key={r.title + r.sub} className="relative text-sm"><span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-amber" />{r.title}<span className="block text-xs text-slate-400">{r.sub}</span></li>)}</ol></div>
