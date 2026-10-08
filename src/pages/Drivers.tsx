import { useMemo, useState } from 'react'
import { ConfirmDialog, EntityForm, RowActions, type Field } from '../components/crud'
import { DataTable, type Col } from '../components/DataTable'
import { FilterBar } from '../components/FilterBar'
import { Avatar, Badge, HistoryList, Modal, Page, Stars } from '../components/ui'
import { deliveryHistory } from '../utils/history'
import { useLoad } from '../hooks/useLoad'
import { useDrivers, useVehicles } from '../store'
import { useToast } from '../store/ui'
import type { Driver } from '../types'
type FormState = { d: Driver | null } | null
export default function Drivers() {
  const { items, loading, error, load, add, patch, remove } = useDrivers(); useLoad(load, items.length > 0)
  const veh = useVehicles(); useLoad(veh.load, veh.items.length > 0); const toast = useToast((t) => t.show)
  const [q, setQ] = useState(''); const [av, setAv] = useState(''); const [form, setForm] = useState<FormState>(null); const [sel, setSel] = useState<Driver | null>(null); const [del, setDel] = useState<Driver | null>(null)
  const rows = useMemo(() => items.filter((d) => (!av || (av === 'Available') === d.available) && `${d.name} ${d.vehicle}`.toLowerCase().includes(q.toLowerCase())), [items, q, av])
  const cols: Col<Driver>[] = [{ key: 'name', label: 'Driver', render: (r) => <span className="flex items-center gap-3"><Avatar name={r.name} /><b>{r.name}</b></span>, sort: (a, b) => a.name.localeCompare(b.name) }, { key: 'vehicle', label: 'Vehicle', render: (r) => r.vehicle },
    { key: 'rating', label: 'Rating', render: (r) => <Stars value={r.rating} />, sort: (a, b) => a.rating - b.rating }, { key: 'av', label: 'Availability', render: (r) => <Badge label={r.available ? 'Active' : 'Idle'} /> },
    { key: 'act', label: '', render: (r) => <RowActions onEdit={() => setForm({ d: r })} onDelete={() => setDel(r)} /> }]
  const fields: Field[] = [{ name: 'name', label: 'Full name', pattern: /^[A-Za-z .'-]{3,}$/, hint: 'Enter a valid full name.' }, { name: 'phone', label: 'Phone', pattern: /^\+?[\d\s-]{10,15}$/, hint: 'Enter a valid phone number.' },
    { name: 'email', label: 'Email', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, hint: 'Enter a valid email address.' }, { name: 'license', label: 'License number' }, { name: 'experience', label: 'Experience (years)', type: 'number', min: 0, max: 50 },
    { name: 'vehicle', label: 'Assigned vehicle', type: 'select', options: ['Unassigned', ...veh.items.map((v) => v.number)] }, { name: 'available', label: 'Availability', type: 'select', options: ['Available', 'Unavailable'] }]
  const editing = form?.d ?? null
  const save = async (x: Record<string, string>) => { const data = { name: x.name.trim(), phone: x.phone.trim(), email: x.email.trim(), license: x.license.trim(), experience: Number(x.experience), vehicle: x.vehicle, available: x.available === 'Available' }
    if (editing) { await patch(editing.id, data); toast('Driver updated') } else { await add({ ...data, deliveries: 0, successRate: 100, rating: 4 }); toast('Driver added') } setForm(null) }
  return <Page title="Drivers" action={<button onClick={() => setForm({ d: null })} className="h-11 rounded-xl bg-amber px-4 font-semibold shadow-sm">Add driver</button>}>
    <FilterBar q={q} setQ={setQ} placeholder="Search by name or vehicle" selects={[{ label: 'Availability', value: av, set: setAv, options: ['Available', 'Unavailable'] }]} />
    <DataTable rows={rows} cols={cols} loading={loading} error={error} onRetry={() => void load()} onRowClick={setSel} />
    {form && <EntityForm key={editing?.id ?? 'new'} title={editing ? 'Edit driver' : 'Add driver'} submitLabel={editing ? 'Save changes' : 'Add driver'} fields={fields}
      initial={editing ? { name: editing.name, phone: editing.phone, email: editing.email, license: editing.license, experience: String(editing.experience), vehicle: editing.vehicle, available: editing.available ? 'Available' : 'Unavailable' } : { name: '', phone: '', email: '', license: '', experience: '', vehicle: 'Unassigned', available: 'Available' }}
      onClose={() => setForm(null)} onSubmit={save} />}
    <Modal open={!!sel} onClose={() => setSel(null)} title="Driver profile">{sel && <div className="space-y-3 text-sm"><div className="flex items-center gap-3"><Avatar name={sel.name} size="h-14 w-14" /><div><p className="text-lg font-semibold">{sel.name}</p><Stars value={sel.rating} /></div></div>
      <p>{sel.phone}<br />{sel.email}</p><p>License {sel.license} · {sel.experience} yrs experience<br />Vehicle: {sel.vehicle}</p><HistoryList title="Delivery history" rows={deliveryHistory(sel)} />
      <div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-slate-100 p-3"><b className="block text-lg">{sel.deliveries}</b>Deliveries</div><div className="rounded-xl bg-slate-100 p-3"><b className="block text-lg">{sel.successRate}%</b>Success</div><div className="rounded-xl bg-slate-100 p-3"><b className="block text-lg">{sel.rating.toFixed(1)}</b>Rating</div></div>
      <div className="flex gap-2 pt-2"><button onClick={() => { setForm({ d: sel }); setSel(null) }} className="h-11 flex-1 rounded-xl border border-slate-300">Edit</button><button onClick={() => { setDel(sel); setSel(null) }} className="h-11 flex-1 rounded-xl bg-rose-600 text-white">Delete</button></div></div>}</Modal>
    <ConfirmDialog open={!!del} title="Delete driver?" message={`${del?.name ?? ''} will be permanently removed.`} onCancel={() => setDel(null)} onConfirm={() => { if (del) { void remove(del.id).then(() => toast('Driver deleted')) } setDel(null) }} /></Page>
}
