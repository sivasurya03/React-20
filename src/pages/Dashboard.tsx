import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Icon } from '../components/Icon'
import { ErrorState, Kpi, Page, Skeleton } from '../components/ui'
import { useLoad } from '../hooks/useLoad'
import { useDrivers, useNotices, useShipments, useVehicles } from '../store'
const weekly = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => ({ d, created: [38, 52, 47, 63, 58, 74, 69][i], delivered: [30, 44, 45, 55, 52, 66, 61][i] }))
const colors: Record<string, string> = { Pending: '#94A3B8', Assigned: '#6366F1', 'In Transit': '#0EA5E9', Delivered: '#0F9D8A', Delayed: '#F43F5E' }
export default function Dashboard() {
  const v = useVehicles(), d = useDrivers(), s = useShipments(), n = useNotices()
  useLoad(v.load, v.loaded); useLoad(d.load, d.loaded); useLoad(s.load, s.loaded)
  const err = v.error ?? d.error ?? s.error
  if (err) return <Page title="Operations overview"><div className="card"><ErrorState message={err} onRetry={() => { void v.load(); void d.load(); void s.load() }} /></div></Page>
  if (!v.loaded || !d.loaded || !s.loaded) return <Page title="Operations overview"><Skeleton rows={6} /></Page>
  const c = (st: string) => s.items.filter((x) => x.status === st).length
  const busy = v.items.filter((x) => x.status === 'In Transit' || x.status === 'Active').length
  const healthy = v.items.filter((x) => x.status !== 'Maintenance').length
  const split = Object.keys(colors).map((k) => ({ name: k, value: c(k) }))
  const perf = d.items.map((x) => ({ name: x.name.split(' ')[0], rate: x.successRate }))
  return <Page title="Operations overview"><div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
    <Kpi label="Total vehicles" value={v.items.length} icon={<Icon name="truck" />} trend={4} /><Kpi label="Total drivers" value={d.items.length} icon={<Icon name="users" />} trend={2} />
    <Kpi label="Active shipments" value={c('In Transit') + c('Assigned')} icon={<Icon name="box" />} trend={9} /><Kpi label="Delivered" value={c('Delivered')} icon={<Icon name="check" />} trend={12} />
    <Kpi label="Delayed" value={c('Delayed')} icon={<Icon name="alert" />} trend={-6} /><Kpi label="Fleet utilization" value={Math.round(busy / Math.max(v.items.length, 1) * 100)} suffix="%" icon={<Icon name="gauge" />} trend={3} /></div>
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="card min-w-0 p-5 lg:col-span-2"><h2 className="font-semibold">Shipment trends</h2><div className="mt-3 h-60"><ResponsiveContainer width="100%" height="100%"><AreaChart data={weekly}><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="d" tickLine={false} axisLine={false} fontSize={12} /><YAxis tickLine={false} axisLine={false} fontSize={12} width={30} /><Tooltip />
        <Area type="monotone" dataKey="created" stroke="#F5A524" fill="#F5A52433" animationDuration={900} /><Area type="monotone" dataKey="delivered" stroke="#0F9D8A" fill="#0F9D8A22" animationDuration={900} /></AreaChart></ResponsiveContainer></div></section>
      <section className="card min-w-0 p-5"><h2 className="font-semibold">Delivery status</h2><div className="h-44"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={split} dataKey="value" innerRadius={42} outerRadius={70} paddingAngle={2}>{split.map((x) => <Cell key={x.name} fill={colors[x.name]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
        <ul className="grid grid-cols-2 gap-1 text-xs">{split.map((x) => <li key={x.name} className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: colors[x.name] }} />{x.name} {x.value}</li>)}</ul></section></div>
    <div className="grid gap-4 lg:grid-cols-3">
      <section className="card min-w-0 p-5"><h2 className="font-semibold">Driver success rate (%)</h2><div className="mt-3 h-48"><ResponsiveContainer width="100%" height="100%"><BarChart data={perf}><XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={11} /><YAxis domain={[80, 100]} hide /><Tooltip /><Bar dataKey="rate" fill="#0E1B2C" radius={[6, 6, 0, 0]} animationDuration={900} /></BarChart></ResponsiveContainer></div></section>
      <section className="card p-5"><h2 className="font-semibold">Fleet health</h2><p className="mt-3 text-3xl font-semibold">{Math.round(healthy / Math.max(v.items.length, 1) * 100)}%</p><p className="text-sm text-slate-500">{healthy} of {v.items.length} vehicles are road-ready</p>
        <div className="mt-3 h-2 rounded-full bg-slate-200"><div className="h-2 rounded-full bg-teal transition-all duration-700" style={{ width: `${healthy / Math.max(v.items.length, 1) * 100}%` }} /></div>
        <h3 className="mt-5 text-sm font-semibold">Critical alerts</h3><ul className="mt-2 space-y-2 text-sm">{s.items.filter((x) => x.status === 'Delayed').slice(0, 2).map((x) => <li key={x.id} className="rounded-lg bg-rose-50 p-2"><b>{x.id}</b> to {x.delivery} is delayed.</li>)}</ul></section>
      <section className="card p-5"><h2 className="font-semibold">Recent activity</h2><ol className="mt-3 space-y-4 border-l border-slate-200 pl-4">{n.items.slice(0, 5).map((x) => <li key={x.id} className="relative text-sm"><span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-amber" />{x.text}<span className="block text-xs text-slate-400">{x.time}</span></li>)}</ol></section></div></Page>
}
