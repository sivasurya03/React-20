import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ConfirmDialog, EntityForm, RowActions, type Errors, type Field } from '../components/crud'
import { DataTable, type Col } from '../components/DataTable'
import { Drawer } from '../components/Drawer'
import { FilterBar } from '../components/FilterBar'
import { Badge, HistoryList, Page } from '../components/ui'
import { shipmentHistory } from '../utils/history'
import { useLoad } from '../hooks/useLoad'
import { useDrivers, useShipments, useVehicles } from '../store'
import { useToast } from '../store/ui'
import type { Shipment, ShipmentStatus } from '../types'
const steps: ShipmentStatus[] = ['Pending', 'Assigned', 'In Transit', 'Delivered']
const all = [...steps, 'Delayed']
function Timeline({ status }: { status: ShipmentStatus }) {
  const i = status === 'Delayed' ? 2 : steps.indexOf(status)
  return <div><div className="h-2 rounded-full bg-slate-200"><motion.div initial={{ width: 0 }} animate={{ width: `${i / 3 * 100}%` }} transition={{ duration: .5 }} className={`h-2 rounded-full ${status === 'Delayed' ? 'bg-rose-500' : 'bg-teal'}`} /></div>
    <ol className="mt-3 grid grid-cols-4 text-center text-xs">{steps.map((s, k) => <li key={s} className={k <= i ? 'font-semibold' : 'text-slate-400'}>{s}</li>)}</ol>{status === 'Delayed' && <p className="mt-2 rounded-lg bg-rose-50 p-2 text-sm text-rose-800">Running late. Contact the driver for a new ETA.</p>}</div>
}
type FormState = { s: Shipment | null } | null
export default function Shipments() {
  const { items, loading, error, load, add, patch, remove } = useShipments(); useLoad(load, items.length > 0)
  const drv = useDrivers(); useLoad(drv.load, drv.items.length > 0); const veh = useVehicles(); useLoad(veh.load, veh.items.length > 0); const toast = useToast((t) => t.show)
  const [sp] = useSearchParams(); const [q, setQ] = useState(sp.get('q') ?? ''); const [st, setSt] = useState(''); const [loc, setLoc] = useState(''); const [dn, setDn] = useState(''); const [vn, setVn] = useState(''); const [from, setFrom] = useState(''); const [to, setTo] = useState('')
  const [form, setForm] = useState<FormState>(null); const [sel, setSel] = useState<Shipment | null>(null); const [del, setDel] = useState<Shipment | null>(null)
  const locs = useMemo(() => [...new Set(items.flatMap((s) => [s.pickup, s.delivery]))].sort(), [items])
  const rows = useMemo(() => items.filter((s) => (!st || s.status === st) && (!loc || s.pickup === loc || s.delivery === loc) && (!dn || s.driver === dn) && (!vn || s.vehicle === vn) && (!from || s.eta.slice(0, 10) >= from) && (!to || s.eta.slice(0, 10) <= to) && `${s.id} ${s.driver} ${s.vehicle}`.toLowerCase().includes(q.toLowerCase())), [items, q, st, loc, dn, vn, from, to])
  const cols: Col<Shipment>[] = [{ key: 'id', label: 'Shipment', render: (r) => <b>{r.id}</b>, sort: (a, b) => a.id.localeCompare(b.id) }, { key: 'c', label: 'Customer', render: (r) => r.customer }, { key: 'r', label: 'Route', render: (r) => `${r.pickup} → ${r.delivery}` },
    { key: 'd', label: 'Driver', render: (r) => r.driver }, { key: 'e', label: 'ETA', render: (r) => r.eta, sort: (a, b) => a.eta.localeCompare(b.eta) }, { key: 's', label: 'Status', render: (r) => <Badge label={r.status} /> },
    { key: 'act', label: '', render: (r) => <RowActions onEdit={() => setForm({ s: r })} onDelete={() => setDel(r)} /> }]
  const fields: Field[] = [{ name: 'customer', label: 'Customer name', pattern: /^.{2,}$/, hint: 'Enter the customer name.' }, { name: 'pickup', label: 'Pickup location' }, { name: 'delivery', label: 'Delivery location' },
    { name: 'driver', label: 'Driver', type: 'select', options: ['Unassigned', ...drv.items.map((d) => d.name)] }, { name: 'vehicle', label: 'Vehicle', type: 'select', options: ['-', ...veh.items.map((v) => v.number)] }, { name: 'eta', label: 'ETA', type: 'datetime-local' }, { name: 'status', label: 'Status', type: 'select', options: all }]
  const editing = form?.s ?? null
  const save = async (x: Record<string, string>) => { const data = { customer: x.customer.trim(), pickup: x.pickup.trim(), delivery: x.delivery.trim(), driver: x.driver, vehicle: x.vehicle, eta: x.eta.replace('T', ' '), status: x.status as ShipmentStatus }
    if (editing) { await patch(editing.id, data); toast('Shipment updated') } else { await add(data); toast('Shipment created') } setForm(null) }
  return <Page title="Shipments" action={<button onClick={() => setForm({ s: null })} className="h-11 rounded-xl bg-amber px-4 font-semibold shadow-sm">Create shipment</button>}>
    <FilterBar q={q} setQ={setQ} placeholder="Shipment ID, driver or vehicle" selects={[{ label: 'Status', value: st, set: setSt, options: all }, { label: 'Location', value: loc, set: setLoc, options: locs }, { label: 'Driver', value: dn, set: setDn, options: drv.items.map((d) => d.name) }, { label: 'Vehicle', value: vn, set: setVn, options: veh.items.map((v) => v.number) }]} dates={{ label: 'ETA', from, to, setFrom, setTo }} />
    <DataTable rows={rows} cols={cols} loading={loading} error={error} onRetry={() => void load()} onRowClick={setSel} />
    {form && <EntityForm key={editing?.id ?? 'new'} title={editing ? 'Edit shipment' : 'Create shipment'} submitLabel={editing ? 'Save changes' : 'Create shipment'} fields={fields}
      initial={editing ? { customer: editing.customer, pickup: editing.pickup, delivery: editing.delivery, driver: editing.driver, vehicle: editing.vehicle, eta: editing.eta.replace(' ', 'T'), status: editing.status } : { customer: '', pickup: '', delivery: '', driver: 'Unassigned', vehicle: '-', eta: '', status: 'Pending' }}
      validate={(x): Errors => (x.pickup.trim().toLowerCase() === x.delivery.trim().toLowerCase() ? { delivery: 'Pickup and delivery must be different.' } : {})} onClose={() => setForm(null)} onSubmit={save} />}
    <Drawer open={!!sel} onClose={() => setSel(null)} title={sel?.id ?? 'Shipment'}>{sel && <div className="space-y-5 text-sm"><Timeline status={sel.status} />
      <div><p className="text-slate-500">Customer</p><p className="font-medium">{sel.customer}</p></div><div><p className="text-slate-500">Route</p><p className="font-medium">{sel.pickup} → {sel.delivery}</p></div>
      <div><p className="text-slate-500">Driver and vehicle</p><p className="font-medium">{sel.driver} · {sel.vehicle}</p></div><div><p className="text-slate-500">ETA</p><p className="font-medium">{sel.eta}</p></div>
      <HistoryList title="Delivery history" rows={shipmentHistory(sel)} /><div className="flex gap-2"><button onClick={() => { setForm({ s: sel }); setSel(null) }} className="h-11 flex-1 rounded-xl border border-slate-300">Edit</button><button onClick={() => { setDel(sel); setSel(null) }} className="h-11 flex-1 rounded-xl bg-rose-600 text-white">Delete</button></div></div>}</Drawer>
    <ConfirmDialog open={!!del} title="Delete shipment?" message={`${del?.id ?? ''} will be permanently removed.`} onCancel={() => setDel(null)} onConfirm={() => { if (del) { void remove(del.id).then(() => toast('Shipment deleted')) } setDel(null) }} /></Page>
}
