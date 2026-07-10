import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { appsApi } from '../services/api'
import FeaturedBanner from '../components/home/FeaturedBanner'
import AppRow from '../components/home/AppRow'
import CategoryGrid from '../components/home/CategoryGrid'
import InlineAdBanner from '../components/promotions/InlineAdBanner'

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, transition: { duration: 0.2 } },
}

export default function Home() {
  const { data: featuredData, isLoading: loadingFeatured } = useQuery({
    queryKey: ['apps', 'featured'],
    queryFn: appsApi.getFeatured,
  })

  const { data: topFreeData, isLoading: loadingFree } = useQuery({
    queryKey: ['apps', 'top', 'free'],
    queryFn: () => appsApi.getTop({ type: 'free', limit: 10 }),
  })

  const { data: topPaidData, isLoading: loadingPaid } = useQuery({
    queryKey: ['apps', 'top', 'paid'],
    queryFn: () => appsApi.getTop({ type: 'paid', limit: 10 }),
  })

  const { data: allAppsData, isLoading: loadingAll } = useQuery({
    queryKey: ['apps', 'all'],
    queryFn: () => appsApi.getAll({ limit: 30, sort: 'installCount' }),
  })

  const featuredApps = featuredData?.apps ?? []
  const freeApps     = topFreeData?.apps ?? []
  const paidApps     = topPaidData?.apps ?? []
  const allApps      = allAppsData?.apps ?? []

  // Slice sections
  const newAppsWeLove   = allApps.slice(0, 8)
  const recentlyUpdated = allApps.slice(8, 14)
  const editorsChoice   = allApps.filter(a => a.averageRating >= 4.7).slice(0, 8)

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-container"
    >
      {/* ── Hero Banner ── */}
      <FeaturedBanner apps={loadingFeatured ? [] : featuredApps} />

      {/* ── Top Free Apps ── */}
      <AppRow
        title="Top Free Apps"
        subtitle="Most downloaded right now"
        apps={freeApps}
        seeAllPath="/top-charts?type=free"
        layout="card"
        loading={loadingFree}
      />

      <hr className="divider mb-11" />



      {/* ── New Apps We Love ── */}
      <AppRow
        title="New Apps We Love"
        subtitle="Fresh picks from our editors"
        apps={newAppsWeLove}
        seeAllPath="/category/productivity"
        layout="featured"
        loading={loadingAll}
      />

      <hr className="divider mb-11" />

      {/* ── Editor's Choice ── */}
      <AppRow
        title="Editor's Choice"
        subtitle="Highest rated across all categories"
        apps={editorsChoice}
        layout="grid"
        seeAllPath="/top-charts"
        loading={loadingAll}
      />

      <hr className="divider mb-11" />

      {/* ── Top Paid Apps ── */}
      <AppRow
        title="Top Paid Apps"
        subtitle="Worth every penny"
        apps={paidApps}
        seeAllPath="/top-charts?type=paid"
        layout="card"
        loading={loadingPaid}
      />

      <hr className="divider mb-11" />

      {/* ── Recently Updated ── */}
      <AppRow
        title="Recently Updated"
        subtitle="Fresh updates in the store"
        apps={recentlyUpdated}
        layout="row"
        seeAllPath="/top-charts"
        loading={loadingAll}
      />

      <hr className="divider mb-11" />

      {/* ── Explore by Category ── */}
      <CategoryGrid />

      <hr className="divider mt-11 mb-11" />

      {/* ── Advertisement Banner (Bottom) ── */}
      <div className="mb-11">
        <InlineAdBanner />
      </div>
    </motion.div>
  )
}
