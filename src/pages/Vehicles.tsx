import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ConfirmDialog, EntityForm, RowActions, type Errors, type Field } from '../components/crud'
import { DataTable, type Col } from '../components/DataTable'
import { FilterBar } from '../components/FilterBar'
import { Badge, HistoryList, Modal, Page } from '../components/ui'
import { maintenanceHistory, vehicleActivity } from '../utils/history'
import { useLoad } from '../hooks/useLoad'
import { useDrivers, useVehicles } from '../store'
import { useToast } from '../store/ui'
import type { Vehicle, VehicleStatus } from '../types'
const statuses = ['Active', 'In Transit', 'Maintenance', 'Idle']
type FormState = { v: Vehicle | null } | null
export default function Vehicles() {
  const { items, loading, error, load, add, patch, remove } = useVehicles(); useLoad(load, items.length > 0)
  const drv = useDrivers(); useLoad(drv.load, drv.items.length > 0); const toast = useToast((t) => t.show)
  const [sp] = useSearchParams(); const [q, setQ] = useState(sp.get('q') ?? ''); const [st, setSt] = useState(''); const [loc, setLoc] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const [form, setForm] = useState<FormState>(null); const [sel, setSel] = useState<Vehicle | null>(null); const [del, setDel] = useState<Vehicle | null>(null)
  const locs = useMemo(() => [...new Set(items.map((v) => v.location))].sort(), [items])
  const rows = useMemo(() => items.filter((v) => (!st || v.status === st) && (!loc || v.location === loc) && (!from || v.maintenance >= from) && (!to || v.maintenance <= to) && `${v.number} ${v.driver}`.toLowerCase().includes(q.toLowerCase())), [items, q, st, loc, from, to])
  const cols: Col<Vehicle>[] = [
    { key: 'number', label: 'Vehicle', render: (r) => <b>{r.number}</b>, sort: (a, b) => a.number.localeCompare(b.number) }, { key: 'type', label: 'Type', render: (r) => r.type }, { key: 'driver', label: 'Driver', render: (r) => r.driver },
    { key: 'fuel', label: 'Fuel', render: (r) => `${r.fuel}%`, sort: (a, b) => a.fuel - b.fuel }, { key: 'location', label: 'Location', render: (r) => r.location }, { key: 'status', label: 'Status', render: (r) => <Badge label={r.status} /> },
    { key: 'act', label: '', render: (r) => <RowActions onEdit={() => setForm({ v: r })} onDelete={() => setDel(r)} /> }]
  const fields: Field[] = [{ name: 'number', label: 'Vehicle number', pattern: /^[A-Za-z0-9 -]{4,}$/, hint: 'Use at least 4 letters or digits.' }, { name: 'type', label: 'Vehicle type', type: 'select', options: ['Truck', 'Van', 'Trailer', 'Mini Truck'] },
    { name: 'driver', label: 'Driver', type: 'select', options: ['Unassigned', ...drv.items.map((d) => d.name)] }, { name: 'fuel', label: 'Fuel level (%)', type: 'number', min: 0, max: 100 }, { name: 'status', label: 'Status', type: 'select', options: statuses }]
  const editing = form?.v ?? null
  const save = async (x: Record<string, string>) => { const data = { number: x.number.trim(), type: x.type, driver: x.driver, fuel: Number(x.fuel), status: x.status as VehicleStatus }
    if (editing) { await patch(editing.id, data); toast('Vehicle updated') } else { await add({ ...data, capacity: '5 t', maintenance: '2026-12-01', location: 'Depot' }); toast('Vehicle added') } setForm(null) }
  return <Page title="Vehicles" action={<button onClick={() => setForm({ v: null })} className="h-11 rounded-xl bg-amber px-4 font-semibold shadow-sm">Add vehicle</button>}>
    <FilterBar q={q} setQ={setQ} placeholder="Search by number or driver" selects={[{ label: 'Status', value: st, set: setSt, options: statuses }, { label: 'Location', value: loc, set: setLoc, options: locs }]} dates={{ label: 'Service date', from, to, setFrom, setTo }} />
    <DataTable rows={rows} cols={cols} loading={loading} error={error} onRetry={() => void load()} onRowClick={setSel} />
    {form && <EntityForm key={editing?.id ?? 'new'} title={editing ? 'Edit vehicle' : 'Add vehicle'} submitLabel={editing ? 'Save changes' : 'Add vehicle'} fields={fields.map(({ name, label, type, options, min, max, pattern, hint }) => ({ name, label, type, options, min, max, pattern, hint }))}
      initial={editing ? { number: editing.number, type: editing.type, driver: editing.driver, fuel: String(editing.fuel), status: editing.status } : { number: '', type: 'Truck', driver: 'Unassigned', fuel: '100', status: 'Idle' }}
      validate={(x): Errors => (items.some((i) => i.id !== editing?.id && i.number.toLowerCase() === x.number.trim().toLowerCase()) ? { number: 'This vehicle number already exists.' } : {})} onClose={() => setForm(null)} onSubmit={save} />}
    <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.number ?? ''}>{sel && <div className="space-y-3 text-sm"><div className="flex items-center justify-between"><Badge label={sel.status} /><span className="text-slate-500">{sel.type} · {sel.capacity}</span></div>
      <p>Driver: <b>{sel.driver}</b></p><div><div className="mb-1 flex justify-between text-xs text-slate-500"><span>Fuel level</span><span>{sel.fuel}%</span></div><div className="h-2 rounded-full bg-slate-200"><div className={`h-2 rounded-full transition-all duration-500 ${sel.fuel < 30 ? 'bg-rose-500' : 'bg-teal'}`} style={{ width: `${sel.fuel}%` }} /></div></div>
      <p>Next service: {sel.maintenance}</p><p>Location: {sel.location}</p><HistoryList title="Activity history" rows={vehicleActivity(sel)} /><HistoryList title="Maintenance history" rows={maintenanceHistory(sel)} />
      <div className="flex gap-2 pt-2"><button onClick={() => { setForm({ v: sel }); setSel(null) }} className="h-11 flex-1 rounded-xl border border-slate-300">Edit</button><button onClick={() => { setDel(sel); setSel(null) }} className="h-11 flex-1 rounded-xl bg-rose-600 text-white">Delete</button></div></div>}</Modal>
    <ConfirmDialog open={!!del} title="Delete vehicle?" message={`${del?.number ?? ''} will be permanently removed from the fleet.`} onCancel={() => setDel(null)} onConfirm={() => { if (del) { void remove(del.id).then(() => toast('Vehicle deleted')) } setDel(null) }} /></Page>
}
