import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
export function Drawer({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-50 bg-ink/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
    <motion.aside role="dialog" aria-label={title} initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 320, damping: 34 }} onClick={(e) => e.stopPropagation()}
      className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-semibold">{title}</h2><button aria-label="Close" onClick={onClose} className="h-11 w-11 rounded-lg hover:bg-slate-100">✕</button></div>{children}</motion.aside></motion.div>}</AnimatePresence>
}
