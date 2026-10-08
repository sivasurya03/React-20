import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useNotices } from '../store'
import { useToast } from '../store/ui'
import { Icon } from '../components/Icon'
import CommandPalette from '../components/CommandPalette'
const nav = [['/', 'Dashboard', 'grid'], ['/vehicles', 'Vehicles', 'truck'], ['/drivers', 'Drivers', 'users'], ['/shipments', 'Shipments', 'box'], ['/tracking', 'Live tracking', 'pin'], ['/notifications', 'Notifications', 'bell']]
export default function AppLayout() {
  const [open, setOpen] = useState(false); const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1280); const [cmd, setCmd] = useState(false)
  const loc = useLocation(); const toast = useToast((s) => s.msg)
  const { items, load } = useNotices(); const unread = items.filter((n) => !n.read).length
  useEffect(() => { void load() }, [load]); useEffect(() => setOpen(false), [loc.pathname])
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmd((c) => !c) } }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [])
  const lbl = collapsed ? 'lg:hidden' : ''
  return <div className="min-h-screen lg:flex">
    <header className="sticky top-0 z-30 flex items-center justify-between bg-ink px-4 py-3 text-white lg:hidden"><button aria-label="Toggle menu" onClick={() => setOpen(!open)} className="h-11 w-11 rounded-lg bg-white/10">☰</button><b>FleetPulse</b>
      <button aria-label="Search" onClick={() => setCmd(true)} className="grid h-11 w-11 place-items-center rounded-lg bg-white/10"><Icon name="search" /></button></header>
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-ink p-4 text-white transition-all duration-300 lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0 ${collapsed ? 'lg:w-[76px]' : 'lg:w-64'} ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="mb-8 flex items-center gap-3 px-2 pt-1"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber text-ink"><Icon name="truck" /></span><div className={lbl}><p className="font-bold leading-none">FleetPulse</p><p className="text-xs text-slate-400">Fleet operations</p></div></div>
      <nav className="space-y-1">{nav.map(([to, label, ic]) => <NavLink key={to} to={to} end={to === '/'} className="group relative block">{({ isActive }) => <>
        {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-xl bg-amber" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
        <span className={`relative flex h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${isActive ? 'font-semibold text-ink' : 'text-slate-300 group-hover:bg-white/10'}`}><Icon name={ic} /><span className={`flex-1 ${lbl}`}>{label}</span>
          {label === 'Notifications' && unread > 0 && <span className="rounded-full bg-rose-500 px-2 text-xs text-white">{unread}</span>}</span>
        {collapsed && <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-white shadow-lg lg:group-hover:block">{label}</span>}</>}</NavLink>)}</nav>
      <button onClick={() => setCollapsed(!collapsed)} className="absolute bottom-4 left-4 hidden h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-400 hover:bg-white/10 lg:flex" aria-label="Collapse sidebar"><span>{collapsed ? '»' : '«'}</span><span className={lbl}>Collapse</span></button></aside>
    {open && <div className="fixed inset-0 z-30 bg-ink/50 lg:hidden" onClick={() => setOpen(false)} />}
    <main className="min-w-0 flex-1 p-4 md:p-8"><button onClick={() => setCmd(true)} className="mb-5 hidden h-11 w-full max-w-md items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-500 lg:flex"><Icon name="search" />Search vehicles, drivers, shipments<kbd className="ml-auto rounded bg-slate-100 px-2 py-0.5 text-xs">Ctrl K</kbd></button>
      <AnimatePresence mode="wait"><motion.div key={loc.pathname + loc.search} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: .18 }}><Outlet /></motion.div></AnimatePresence></main>
    <CommandPalette open={cmd} onClose={() => setCmd(false)} />
    <AnimatePresence>{toast && <motion.div role="status" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-ink px-5 py-3 text-sm text-white shadow-xl">{toast}</motion.div>}</AnimatePresence></div>
}
