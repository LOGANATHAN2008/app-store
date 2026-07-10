import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'
import AppIcon from '../ui/AppIcon'
import InstallButton from '../ui/InstallButton'

const CATEGORY_LABELS = {
  games: 'Game',
  productivity: 'App',
  social: 'Social',
  health: 'Health & Fitness',
  education: 'Education',
  finance: 'Finance',
  entertainment: 'Entertainment',
  photography: 'Photo & Video',
}

/** @param {{ apps: object[] }} */
export default function FeaturedBanner({ apps }) {
  const navigate = useNavigate()

  if (!apps?.length) {
    return (
      <div className="mb-10 -mx-4 sm:mx-0">
        <div className="skeleton rounded-none sm:rounded-[18px] overflow-hidden" style={{ height: 460 }} />
      </div>
    )
  }

  return (
    <div className="mb-10 -mx-4 sm:mx-0">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        loop
        speed={800}
        className="overflow-hidden"
        style={{
          height: 460,
          borderRadius: window.innerWidth >= 640 ? 18 : 0,
        }}
      >
        {apps.map((app, idx) => (
          <SwiperSlide key={app.id}>
            {({ isActive }) => (
              <div
                className="relative w-full h-full cursor-pointer select-none"
                onClick={() => navigate(`/app/${app.id}`)}
              >
                {/* Background image */}
                <img
                  src={app.bannerUrl || app.iconUrl}
                  alt=""
                  aria-hidden
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: isActive ? 'scale(1)' : 'scale(1.04)', transition: 'transform 5s ease-out' }}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                />

                {/* Gradient overlays */}
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 40%, rgba(0,0,0,0.1) 70%, transparent 100%)'
                }} />

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 pb-14">
                  {/* Category label */}
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-[11px] font-semibold uppercase tracking-[2px] mb-2"
                    style={{ color: 'rgba(255,255,255,0.55)' }}
                  >
                    {CATEGORY_LABELS[app.category] ?? app.category} of the Day
                  </motion.p>

                  <div className="flex items-end justify-between gap-4">
                    {/* Left: icon + text */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.45, delay: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                        className="flex-shrink-0"
                      >
                        <AppIcon src={app.iconUrl} alt={app.name} size={76} />
                      </motion.div>

                      <motion.div
                        className="min-w-0 flex-1"
                        initial={{ opacity: 0, x: -12 }}
                        animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -12 }}
                        transition={{ duration: 0.45, delay: 0.2 }}
                      >
                        <h2
                          className="text-white font-bold leading-tight line-clamp-2 whitespace-normal break-words"
                          style={{ fontSize: 'clamp(22px, 4vw, 32px)', letterSpacing: '-0.6px' }}
                        >
                          {app.name}
                        </h2>
                        <p className="text-[15px] mt-1 line-clamp-2 whitespace-normal break-words" style={{ color: 'rgba(255,255,255,0.6)' }}>
                          {app.shortDescription}
                        </p>
                      </motion.div>
                    </div>

                    {/* Right: install button */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={isActive ? { opacity: 1 } : { opacity: 0 }}
                      transition={{ duration: 0.35, delay: 0.3 }}
                      className="flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <InstallButton app={app} size="lg" />
                    </motion.div>
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
