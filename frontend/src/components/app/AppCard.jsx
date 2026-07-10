import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import AppIcon from '../ui/AppIcon'
import InstallButton from '../ui/InstallButton'
import { formatRating } from '../../utils/formatters'
import { Star, BadgeCheck } from 'lucide-react'

/** Skeleton placeholder while loading */
export function AppCardSkeleton({ layout = 'card' }) {
  if (layout === 'row') {
    return (
      <div className="flex items-center gap-4 py-4 px-2">
        <div className="skeleton w-16 h-16 rounded-[22%] flex-shrink-0" />
        <div className="flex-1">
          <div className="skeleton h-4 w-3/4 mb-2 rounded" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
        <div className="skeleton h-7 w-14 rounded-full" />
      </div>
    )
  }
  return (
    <div className="flex-shrink-0 w-[160px]">
      <div className="skeleton w-20 h-20 rounded-[22%] mb-3" />
      <div className="skeleton h-4 w-full mb-1.5 rounded" />
      <div className="skeleton h-3 w-3/4 mb-3 rounded" />
      <div className="skeleton h-7 w-14 rounded-full" />
    </div>
  )
}

/**
 * @param {{
 *   app: object,
 *   rank?: number,
 *   layout?: 'card' | 'row' | 'featured' | 'grid'
 * }} props
 */
export default function AppCard({ app, rank, layout = 'card' }) {
  const navigate = useNavigate()

  // ── Row layout (for Top Charts & lists) ──────────────────────────────
  if (layout === 'row') {
    return (
      <motion.div
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        whileTap={{ scale: 0.99 }}
        onClick={() => navigate(`/app/${app.id}`)}
        className="flex items-center gap-4 py-4 cursor-pointer rounded-xl px-2 -mx-2 transition-colors"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/${app.id}`)}
        aria-label={`${app.name} by ${app.developer}`}
      >
        {/* Rank number */}
        {rank != null && (
          <span
            className="w-8 text-center font-bold flex-shrink-0 leading-none"
            style={{ fontSize: 22, color: '#48484A' }}
          >
            {rank}
          </span>
        )}

        <AppIcon src={app.iconUrl} alt={app.name} size={64} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-[15px] text-white truncate">{app.name}</p>
            {app.isDeveloperVerified && <BadgeCheck className="w-3.5 h-3.5 text-[#0A84FF] flex-shrink-0" />}
          </div>
          <p className="text-[13px] truncate capitalize" style={{ color: '#8E8E93' }}>{app.category}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Star size={10} fill="#8E8E93" stroke="none" />
            <span className="text-[12px]" style={{ color: '#8E8E93' }}>{formatRating(app.averageRating)}</span>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()}>
          <InstallButton app={app} size="sm" />
        </div>
      </motion.div>
    )
  }

  // ── Featured card (editorial large card) ─────────────────────────────
  if (layout === 'featured') {
    return (
      <motion.div
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.985 }}
        onClick={() => navigate(`/app/${app.id}`)}
        className="relative flex-shrink-0 cursor-pointer overflow-hidden"
        style={{ width: 320, height: 380, borderRadius: 18, scrollSnapAlign: 'start' }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/${app.id}`)}
        aria-label={app.name}
      >
        <img
          src={app.bannerUrl || `https://picsum.photos/seed/${app.id}/640/760`}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        {/* Dark gradient */}
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)'
        }} />

        {/* Bottom content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
            {app.category}
          </p>
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <AppIcon src={app.iconUrl} alt={app.name} size={48} className="flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="text-white font-bold text-[18px] leading-tight line-clamp-2 break-words">{app.name}</h3>
                  {app.isDeveloperVerified && <BadgeCheck className="w-[18px] h-[18px] text-[#0A84FF] flex-shrink-0" />}
                </div>
                <p className="text-[13px] line-clamp-2 whitespace-normal break-words" style={{ color: 'rgba(255,255,255,0.55)' }}>{app.shortDescription}</p>
              </div>
            </div>
            <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <InstallButton app={app} size="sm" />
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  // ── Grid layout (2-col grid) ──────────────────────────────────────────
  if (layout === 'grid') {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => navigate(`/app/${app.id}`)}
        className="flex items-center gap-3 p-4 cursor-pointer rounded-[18px] transition-colors"
        style={{ background: '#1C1C1E' }}
        role="button"
        tabIndex={0}
        aria-label={app.name}
      >
        <AppIcon src={app.iconUrl} alt={app.name} size={56} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="font-semibold text-[14px] text-white truncate">{app.name}</p>
            {app.isDeveloperVerified && <BadgeCheck className="w-3 h-3 text-[#0A84FF] flex-shrink-0" />}
          </div>
          <p className="text-[12px] truncate capitalize mt-0.5" style={{ color: '#8E8E93' }}>{app.category}</p>
        </div>
        <div onClick={(e) => e.stopPropagation()}>
          <InstallButton app={app} size="sm" />
        </div>
      </motion.div>
    )
  }

  // ── Default card (horizontal scroll) ─────────────────────────────────
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(`/app/${app.id}`)}
      className="flex-shrink-0 w-[156px] cursor-pointer"
      style={{ scrollSnapAlign: 'start' }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/app/${app.id}`)}
      aria-label={`${app.name} - ${app.category}`}
    >
      <div className="mb-3">
        <AppIcon src={app.iconUrl} alt={app.name} size={80} className="shadow-lg" />
      </div>
      <div className="flex items-center gap-1 mb-0.5">
        <p className="font-semibold text-[14px] text-white line-clamp-2 whitespace-normal break-words">{app.name}</p>
        {app.isDeveloperVerified && <BadgeCheck className="w-3 h-3 text-[#0A84FF] flex-shrink-0 mt-0.5" />}
      </div>
      <p className="text-[12px] line-clamp-2 mt-0.5 whitespace-normal break-words" style={{ color: '#8E8E93' }}>{app.shortDescription}</p>
      <div className="mt-2.5" onClick={(e) => e.stopPropagation()}>
        <InstallButton app={app} size="sm" />
      </div>
    </motion.div>
  )
}
