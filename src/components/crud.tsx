import { useState, type FormEvent } from 'react'
import { Modal } from './ui'
export interface Field { name: string; label: string; type?: 'text' | 'number' | 'select' | 'datetime-local'; options?: string[]; min?: number; max?: number; pattern?: RegExp; hint?: string }
export type Vals = Record<string, string>
export type Errors = Partial<Record<string, string>>
const onlyErrors = (e: Errors): Errors => Object.fromEntries(Object.entries(e).filter(([, m]) => !!m))
interface FormProps { title: string; fields: Field[]; initial: Vals; submitLabel: string; validate?: (v: Vals) => Errors; onClose: () => void; onSubmit: (v: Vals) => Promise<void> }
const inp = 'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 outline-none transition focus:border-amber focus:ring-2 focus:ring-amber/30'
export function EntityForm({ title, fields, initial, submitLabel, validate, onClose, onSubmit }: FormProps) {
  const [v, setV] = useState<Vals>(initial); const [errs, setErrs] = useState<Errors>({}); const [busy, setBusy] = useState(false)
  const check = (): Errors => { const e: Errors = {}
    for (const f of fields) { const val = (v[f.name] ?? '').trim()
      if (!val) e[f.name] = `${f.label} is required.`
      else if (f.type === 'number' && (Number.isNaN(Number(val)) || Number(val) < (f.min ?? 0) || Number(val) > (f.max ?? 100))) e[f.name] = `${f.label} must be between ${f.min ?? 0} and ${f.max ?? 100}.`
      else if (f.pattern && !f.pattern.test(val)) e[f.name] = f.hint ?? `${f.label} is invalid.` }
    return Object.keys(e).length ? e : onlyErrors(validate?.(v) ?? {}) }
  const submit = async (ev: FormEvent) => { ev.preventDefault(); const e = check(); setErrs(e); if (Object.keys(e).length) return
    setBusy(true); try { await onSubmit(v) } catch { setErrs({ _form: 'Something went wrong. Please try again.' }); setBusy(false) } }
  return <Modal open onClose={onClose} title={title}><form onSubmit={(e) => void submit(e)} noValidate className="space-y-3">
    {fields.map((f) => <div key={f.name}><label htmlFor={f.name} className="mb-1 block text-sm font-medium">{f.label}</label>
      {f.type === 'select' ? <select id={f.name} value={v[f.name] ?? ''} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} className={inp}>{f.options?.map((o) => <option key={o}>{o}</option>)}</select>
        : <input id={f.name} type={f.type ?? 'text'} value={v[f.name] ?? ''} aria-invalid={!!errs[f.name]} onChange={(e) => setV({ ...v, [f.name]: e.target.value })} className={`${inp} ${errs[f.name] ? 'border-rose-400' : ''}`} />}
      {errs[f.name] && <p role="alert" className="mt-1 text-xs text-rose-700">{errs[f.name]}</p>}</div>)}
    {errs._form && <p role="alert" className="text-sm text-rose-700">{errs._form}</p>}
    <div className="flex gap-2 pt-1"><button type="button" onClick={onClose} className="h-11 flex-1 rounded-xl border border-slate-300">Cancel</button><button disabled={busy} className="h-11 flex-1 rounded-xl bg-ink text-white">{busy ? 'Saving…' : submitLabel}</button></div></form></Modal>
}
export const ConfirmDialog = ({ open, title, message, onConfirm, onCancel }: { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void }) =>
  <Modal open={open} onClose={onCancel} title={title}><p className="text-sm text-slate-600">{message}</p><div className="mt-4 flex gap-2"><button onClick={onCancel} className="h-11 flex-1 rounded-xl border border-slate-300">Cancel</button><button onClick={onConfirm} className="h-11 flex-1 rounded-xl bg-rose-600 text-white">Delete</button></div></Modal>
export const RowActions = ({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) => <span className="flex gap-2" onClick={(e) => e.stopPropagation()}>
  <button onClick={onEdit} aria-label="Edit" className="h-9 rounded-lg border border-slate-200 px-3 text-xs hover:bg-slate-50">Edit</button><button onClick={onDelete} aria-label="Delete" className="h-9 rounded-lg border border-rose-200 px-3 text-xs text-rose-700 hover:bg-rose-50">Delete</button></span>
