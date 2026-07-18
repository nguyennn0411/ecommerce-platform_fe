import { Outlet } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'

export default function MainLayout() {
  return (
    <div className="sz-page">
      <SiteHeader />
      <main className="sz-main">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  )
}
