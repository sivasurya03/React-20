import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useDrivers, useShipments, useVehicles } from '../store'
import { Icon } from './Icon'
interface Hit { id: string; label: string; sub: string; to: string }
export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const go = useNavigate(); const [q, setQ] = useState('')
  const v = useVehicles((s) => s.items), d = useDrivers((s) => s.items), s = useShipments((s2) => s2.items)
  useEffect(() => { if (!open) return; setQ('')
    if (!useVehicles.getState().items.length) void useVehicles.getState().load()
    if (!useDrivers.getState().items.length) void useDrivers.getState().load()
    if (!useShipments.getState().items.length) void useShipments.getState().load() }, [open])
  const t = q.trim().toLowerCase(); const enc = encodeURIComponent
  const hits: Hit[] = t ? [
    ...v.filter((x) => `${x.number} ${x.driver}`.toLowerCase().includes(t)).slice(0, 4).map((x) => ({ id: x.id, label: x.number, sub: `Vehicle · ${x.location}`, to: `/vehicles?q=${enc(x.number)}` })),
    ...d.filter((x) => x.name.toLowerCase().includes(t)).slice(0, 4).map((x) => ({ id: x.id, label: x.name, sub: 'Driver', to: '/drivers' })),
    ...s.filter((x) => `${x.id} ${x.customer}`.toLowerCase().includes(t)).slice(0, 4).map((x) => ({ id: x.id, label: x.id, sub: `Shipment · ${x.customer}`, to: `/shipments?q=${enc(x.id)}` }))] : []
  const pick = (h: Hit) => { go(h.to); onClose() }
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[60] bg-ink/50 p-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.div initial={{ y: -12, scale: .98 }} animate={{ y: 0, scale: 1 }} role="dialog" aria-label="Global search" onClick={(e) => e.stopPropagation()} className="card mx-auto w-full max-w-xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 border-b border-slate-100 px-4"><Icon name="search" /><input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search vehicles, drivers, shipments"
        onKeyDown={(e) => { if (e.key === 'Escape') onClose(); if (e.key === 'Enter' && hits[0]) pick(hits[0]) }} className="h-14 flex-1 bg-transparent outline-none" aria-label="Search" /></div>
      <ul className="max-h-80 overflow-y-auto p-2">{!t && <li className="p-4 text-sm text-slate-500">Type a shipment ID, driver name or vehicle number.</li>}{t && !hits.length && <li className="p-4 text-sm text-slate-500">No results for “{q}”.</li>}
        {hits.map((h) => <li key={h.id}><button onClick={() => pick(h)} className="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-amber-soft"><b className="text-sm">{h.label}</b><span className="text-xs text-slate-500">{h.sub}</span></button></li>)}</ul></motion.div></motion.div>}</AnimatePresence>
}
