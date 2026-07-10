import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { appsApi } from '../services/api'
import AppCard from '../components/app/AppCard'
import { Star } from 'lucide-react'
import { formatInstalls, formatRating, formatPrice } from '../utils/formatters'
import AppIcon from '../components/ui/AppIcon'
import InstallButton from '../components/ui/InstallButton'
import { useNavigate } from 'react-router-dom'
import { useUIStore } from '../store'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
}

const TABS = [
  { key: 'free', label: 'Free' },
  { key: 'paid', label: 'Paid' },
  { key: 'grossing', label: 'Top Grossing' },
]

export default function TopCharts() {
  const [activeTab, setActiveTab] = useState('free')
  const navigate = useNavigate()

  const { data, isLoading } = useQuery({
    queryKey: ['apps', 'top', activeTab],
    queryFn: () => appsApi.getTop({ type: activeTab === 'grossing' ? 'paid' : activeTab, limit: 50 }),
  })

  const { selectedOS } = useUIStore()

  const allAppsRaw = data?.apps || []
  const filterByOS = (apps) => {
    return apps.filter(app => {
      const osStr = (app.minOS || '').toLowerCase()
      return osStr.includes(selectedOS.toLowerCase())
    })
  }
  const apps = filterByOS(allAppsRaw)

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-3xl mx-auto px-4">
      {/* Tabs */}
      <div className="flex bg-surfaceRaised rounded-xl p-1 mb-6">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key ? 'bg-surface text-white shadow' : 'text-textSecondary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-0">
          {[...Array(10)].map((_, i) => <div key={i} className="skeleton h-20 rounded-xl mb-3" />)}
        </div>
      ) : (
        <motion.div
          className="flex flex-col"
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          initial="hidden"
          animate="show"
        >
          {apps.map((app, i) => (
            <motion.div
              key={app.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            >
              <div
                className="flex items-center gap-4 py-4 cursor-pointer hover:bg-surface rounded-xl px-2 -mx-2 transition-colors"
                onClick={() => navigate(`/app/${app.id}`)}
              >
                <div className="w-10 text-center">
                  <span className="text-[22px] font-bold text-textTertiary leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <AppIcon src={app.iconUrl} alt={app.name} size={64} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[15px] truncate">{app.name}</p>
                  <p className="text-textSecondary text-xs capitalize truncate">{app.category}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={10} className="text-textSecondary" fill="currentColor" />
                    <span className="text-textSecondary text-xs">{formatRating(app.averageRating)}</span>
                  </div>
                </div>
                <div onClick={e => e.stopPropagation()}>
                  <InstallButton app={app} size="sm" />
                </div>
              </div>
              {i < apps.length - 1 && <div className="divider ml-[7.5rem]" />}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
