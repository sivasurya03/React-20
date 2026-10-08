import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Empty, ErrorState, Page, Skeleton } from '../components/ui'
import { useLoad } from '../hooks/useLoad'
import { useNotices } from '../store'
import { useToast } from '../store/ui'
export default function Notifications() {
  const { items, loading, error, load, patch, remove } = useNotices(); useLoad(load, items.length > 0); const toast = useToast((t) => t.show); const [f, setF] = useState<'all' | 'unread'>('all')
  const rows = items.filter((n) => f === 'all' || !n.read); const unread = items.filter((n) => !n.read).length
  const markAll = () => { items.filter((n) => !n.read).forEach((n) => void patch(n.id, { read: true })); toast('All notifications marked as read') }
  return <Page title="Notifications" action={<div className="flex flex-wrap gap-2"><button onClick={markAll} disabled={!unread} className="h-11 rounded-xl border border-slate-300 px-4 text-sm disabled:opacity-40">Mark all as read</button>
    {(['all', 'unread'] as const).map((k) => <button key={k} onClick={() => setF(k)} className={`h-11 rounded-xl px-4 text-sm ${f === k ? 'bg-ink text-white' : 'bg-white'}`}>{k === 'all' ? 'All' : `Unread (${unread})`}</button>)}</div>}>
    <div className="card divide-y divide-slate-100">{loading ? <Skeleton /> : error ? <ErrorState message={error} onRetry={() => void load()} /> : !rows.length ? <Empty title="You're all caught up" hint="New alerts will show up here." /> :
      <AnimatePresence initial={false}>{rows.map((n, i) => <motion.div key={n.id} layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: .25, delay: i * .04 }} className={`flex items-start gap-2 p-2 sm:p-3 ${n.read ? '' : 'bg-amber-soft/40'}`}>
        <button onClick={() => void patch(n.id, { read: true })} className="flex min-h-11 flex-1 items-start gap-3 rounded-lg p-2 text-left hover:bg-amber-soft/60"><span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${n.read ? 'bg-slate-300' : 'bg-amber'}`} />
          <span><b className="block text-sm">{n.type}</b><span className="text-sm text-slate-600">{n.text}</span><span className="block text-xs text-slate-400">{n.time}</span></span></button>
        <button aria-label="Delete notification" onClick={() => void remove(n.id).then(() => toast('Notification deleted'))} className="h-11 w-11 shrink-0 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-700">✕</button></motion.div>)}</AnimatePresence>}</div></Page>
}
