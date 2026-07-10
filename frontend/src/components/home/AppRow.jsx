import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import AppCard, { AppCardSkeleton } from '../app/AppCard'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
}
const item = {
  hidden: { opacity: 0, x: 16 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const itemY = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
}

/**
 * @param {{
 *   title: string,
 *   subtitle?: string,
 *   apps: object[],
 *   seeAllPath?: string,
 *   layout?: 'card' | 'row' | 'featured' | 'grid',
 *   loading?: boolean,
 * }} props
 */
export default function AppRow({ title, subtitle, apps = [], seeAllPath, layout = 'card', loading = false }) {
  const isRow      = layout === 'row'
  const isGrid     = layout === 'grid'
  const isScroll   = layout === 'card' || layout === 'featured'

  return (
    <section className="section">
      {/* Header */}
      <div className="flex items-end justify-between mb-4 gap-3">
        <div className="min-w-0">
          <h2 className="section-title">{title}</h2>
          {subtitle && (
            <p className="text-[13px] mt-0.5" style={{ color: '#8E8E93' }}>{subtitle}</p>
          )}
        </div>
        {seeAllPath && (
          <Link to={seeAllPath} className="see-all flex-shrink-0">
            See All <ChevronRight size={15} />
          </Link>
        )}
      </div>

      {/* Skeleton state */}
      {loading && (
        isRow ? (
          <div className="flex flex-col">
            {[...Array(5)].map((_, i) => (
              <div key={i}>
                <AppCardSkeleton layout="row" />
                {i < 4 && <div className="divider ml-20" />}
              </div>
            ))}
          </div>
        ) : (
          <div className="scroll-row">
            {[...Array(6)].map((_, i) => (
              <AppCardSkeleton key={i} layout="card" />
            ))}
          </div>
        )
      )}

      {/* Horizontal scroll (card / featured) */}
      {!loading && isScroll && (
        <motion.div
          className="scroll-row"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {apps.map((app) => (
            <motion.div key={app.id} variants={item}>
              <AppCard app={app} layout={layout} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 2-column grid */}
      {!loading && isGrid && (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {apps.map((app) => (
            <motion.div key={app.id} variants={itemY}>
              <AppCard app={app} layout="grid" />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Vertical list (row) */}
      {!loading && isRow && (
        <motion.div
          className="flex flex-col"
          variants={stagger}
          initial="hidden"
          animate="show"
        >
          {apps.map((app, i) => (
            <motion.div key={app.id} variants={itemY}>
              <AppCard app={app} rank={i + 1} layout="row" />
              {i < apps.length - 1 && <div className="divider" style={{ marginLeft: 80 }} />}
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  )
}
