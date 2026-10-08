interface Sel { label: string; value: string; set: (v: string) => void; options: string[] }
interface Dates { label: string; from: string; to: string; setFrom: (v: string) => void; setTo: (v: string) => void }
const ctl = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/30'
export function FilterBar({ q, setQ, placeholder, selects = [], dates }: { q: string; setQ: (v: string) => void; placeholder: string; selects?: Sel[]; dates?: Dates }) {
  const dirty = !!q || selects.some((s) => s.value) || !!dates?.from || !!dates?.to
  const clear = () => { setQ(''); selects.forEach((s) => s.set('')); dates?.setFrom(''); dates?.setTo('') }
  return <div className="card flex flex-wrap items-end gap-3 p-3">
    <label className="min-w-[200px] flex-1 text-xs text-slate-500"><span className="mb-1 block">Search</span><input aria-label="Search" placeholder={placeholder} value={q} onChange={(e) => setQ(e.target.value)} className={ctl} /></label>
    {selects.map((s) => <label key={s.label} className="min-w-[140px] flex-1 text-xs text-slate-500 sm:flex-none"><span className="mb-1 block">{s.label}</span><select value={s.value} onChange={(e) => s.set(e.target.value)} className={ctl}><option value="">All</option>{s.options.map((o) => <option key={o}>{o}</option>)}</select></label>)}
    {dates && <><label className="min-w-[140px] flex-1 text-xs text-slate-500 sm:flex-none"><span className="mb-1 block">{dates.label} from</span><input type="date" value={dates.from} onChange={(e) => dates.setFrom(e.target.value)} className={ctl} /></label>
      <label className="min-w-[140px] flex-1 text-xs text-slate-500 sm:flex-none"><span className="mb-1 block">to</span><input type="date" value={dates.to} onChange={(e) => dates.setTo(e.target.value)} className={ctl} /></label></>}
    {dirty && <button onClick={clear} className="h-11 rounded-xl px-3 text-sm text-slate-500 hover:bg-slate-100">Clear filters</button>}</div>
}
