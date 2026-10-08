import { Link } from 'react-router-dom'
import { Page } from '../components/ui'
export default function NotFound() {
  return <Page title="Page not found"><div className="card p-10 text-center"><p className="text-slate-500">The page you are looking for does not exist.</p><Link to="/" className="mt-4 inline-flex h-11 items-center rounded-xl bg-amber px-4 font-semibold">Back to dashboard</Link></div></Page>
}
