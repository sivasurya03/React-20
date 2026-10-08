import type { Driver, Shipment, Vehicle } from '../types'
export interface Entry { title: string; sub: string }
export const vehicleActivity = (v: Vehicle): Entry[] => [{ title: `Arrived at ${v.location}`, sub: 'Today, 09:40' }, { title: `Status set to ${v.status}`, sub: 'Today, 08:15' }, { title: 'Fuel level checked', sub: 'Yesterday, 18:20' }]
export const maintenanceHistory = (v: Vehicle): Entry[] => { const y = Number(v.maintenance.slice(0, 4)); return [{ title: 'Oil and filter change', sub: `${y}-04-12` }, { title: 'Brake inspection', sub: `${y - 1}-10-03` }, { title: 'Tyre rotation', sub: `${y - 1}-03-21` }] }
export const deliveryHistory = (d: Driver): Entry[] => [0, 1, 2].map((i) => ({ title: `Delivered SHP-${2380 - i * 7 - (d.deliveries % 9)}`, sub: `${i + 1} day${i ? 's' : ''} ago · on time` }))
const log = ['Shipment created', 'Driver and vehicle assigned', 'Departed pickup', 'Delivered to customer']
export const shipmentHistory = (s: Shipment): Entry[] => { const n = s.status === 'Delayed' ? 3 : ['Pending', 'Assigned', 'In Transit', 'Delivered'].indexOf(s.status) + 1; return log.slice(0, n).map((t, i) => ({ title: t, sub: `${s.eta.slice(0, 10)} · ${8 + i * 2}:00` })) }
