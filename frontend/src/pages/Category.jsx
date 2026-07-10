import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { categoriesApi } from '../services/api'
import { useUIStore } from '../store'
import { ChevronRight } from 'lucide-react'
import AppCard from '../components/app/AppCard'
import GenericHeroCard from '../components/today/GenericHeroCard'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'
import PageLoader from '../components/ui/PageLoader'

const CATEGORY_META = {
  games: { name: 'Games', emoji: '🎮', from: '#FF453A', to: '#FF9F0A' },
  productivity: { name: 'Productivity', emoji: '⚡', from: '#0A84FF', to: '#30D158' },
  social: { name: 'Social', emoji: '💬', from: '#BF5AF2', to: '#0A84FF' },
  health: { name: 'Health & Fitness', emoji: '❤️', from: '#30D158', to: '#32ADE6' },
  education: { name: 'Education', emoji: '📚', from: '#FF9F0A', to: '#FF453A' },
  finance: { name: 'Finance', emoji: '💰', from: '#30D158', to: '#0A84FF' },
  entertainment: { name: 'Entertainment', emoji: '🎬', from: '#FF453A', to: '#BF5AF2' },
  'photo-video': { name: 'Photo & Video', emoji: '📸', from: '#BF5AF2', to: '#FF453A' },
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  exit: { opacity: 0 },
}

// Helper to split array into chunks of 3
const chunkArray = (arr, size = 3) => {
  const result = []
  for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size))
  return result
}

export default function Category() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const meta = CATEGORY_META[slug] || { name: slug.charAt(0).toUpperCase() + slug.slice(1), emoji: '📱', from: '#0A84FF', to: '#30D158' }
  const { selectedOS } = useUIStore()

  const { data, isLoading } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => categoriesApi.getApps(slug, { limit: 100 }),
  })

  if (isLoading) return <PageLoader />

  const apps = (data?.apps || []).filter(app => {
    const osStr = (app.minOS || '').toLowerCase()
    const isCategoryMatch = (app.category || '').toLowerCase() === slug.toLowerCase()
    return osStr.includes(selectedOS.toLowerCase()) && isCategoryMatch
  })

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center py-40 text-center">
        <span className="text-6xl mb-4">📭</span>
        <h2 className="text-2xl font-bold mb-2">No Apps Yet</h2>
        <p className="text-white/50">Check back soon for {meta.name} apps.</p>
      </div>
    )
  }

  // Shuffle and pick top apps for the hero carousel (simulate featured)
  const heroApps = [...apps].sort((a, b) => b.installCount - a.installCount).slice(0, 5)
  
  // Section 1: "Top Free Games/Apps" (simulate with highly rated apps)
  const topFree = [...apps].sort((a, b) => b.averageRating - a.averageRating).slice(0, 15)
  const chunkedTopFree = chunkArray(topFree, 3)

  // Section 2: "Must Play" or "Essentials"
  const essentials = [...apps].sort(() => 0.5 - Math.random()).slice(0, 12)
  const chunkedEssentials = chunkArray(essentials, 3)

  // Section 3: "New & Updated"
  const newUpdated = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 9)
  const chunkedNew = chunkArray(newUpdated, 3)

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="page-container pb-24" style={{ maxWidth: 1400 }}>
      {/* Category header */}
      <div className="flex items-end justify-between pt-6 pb-6">
        <div>
          <h1 className="text-[38px] md:text-[46px] font-[800] tracking-tight leading-none text-white flex items-center gap-3">
            {meta.name} <span className="text-4xl">{meta.emoji}</span>
          </h1>
        </div>
      </div>

      {/* Hero Carousel */}
      {heroApps.length > 0 && (
        <div className="mb-12 border-b border-white/10 pb-12">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className="w-full rounded-[20px] glass-pagination-swiper"
            style={{
              '--swiper-navigation-color': '#fff',
              '--swiper-navigation-size': '22px',
              '--swiper-pagination-color': '#fff',
            }}
          >
            {heroApps.map(app => (
              <SwiperSlide key={app.id}>
                <GenericHeroCard 
                  app={app} 
                  hCard={{ 
                    title: `Featured in ${meta.name}`, 
                    subtitle: 'MUST PLAY', 
                    description: app.shortDescription, 
                    bannerUrl: app.bannerUrl 
                  }} 
                  onClick={() => navigate(`/app/${app.id}`)} 
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Section 1: Top Charts */}
      {chunkedTopFree.length > 0 && (
        <div className="mb-12 border-b border-white/10 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] font-bold text-white flex items-center gap-1 cursor-pointer group">
              Top Free {meta.name}
              <ChevronRight size={20} className="text-[#8E8E93] group-hover:text-white transition-colors" />
            </h2>
          </div>
          <Swiper
            modules={[Navigation, FreeMode]}
            freeMode={true}
            spaceBetween={20}
            slidesPerView={1.1}
            breakpoints={{
              640: { slidesPerView: 2.1 },
              1024: { slidesPerView: 3.1 }
            }}
            navigation
            className="w-full"
            style={{ '--swiper-navigation-color': '#fff', '--swiper-navigation-size': '20px' }}
          >
            {chunkedTopFree.map((chunk, index) => (
              <SwiperSlide key={index}>
                <div className="flex flex-col">
                  {chunk.map((app, appIdx) => (
                    <div key={app.id}>
                      <AppCard app={app} layout="row" rank={index * 3 + appIdx + 1} />
                      {appIdx !== chunk.length - 1 && <div className="h-[1px] bg-white/10 ml-[80px]" />}
                    </div>
                  ))}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Section 2: Essentials */}
      {chunkedEssentials.length > 0 && (
        <div className="mb-12 border-b border-white/10 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] font-bold text-white flex items-center gap-1 cursor-pointer group">
              {meta.name} Essentials
              <ChevronRight size={20} className="text-[#8E8E93] group-hover:text-white transition-colors" />
            </h2>
          </div>
          <Swiper
            modules={[Navigation, FreeMode]}
            freeMode={true}
            spaceBetween={20}
            slidesPerView={1.1}
            breakpoints={{
              640: { slidesPerView: 2.1 },
              1024: { slidesPerView: 3.1 }
            }}
            navigation
            className="w-full"
            style={{ '--swiper-navigation-color': '#fff', '--swiper-navigation-size': '20px' }}
          >
            {chunkedEssentials.map((chunk, index) => (
              <SwiperSlide key={index}>
                <div className="flex flex-col">
                  {chunk.map((app, appIdx) => (
                    <div key={app.id}>
                      <AppCard app={app} layout="row" />
                      {appIdx !== chunk.length - 1 && <div className="h-[1px] bg-white/10 ml-[80px]" />}
                    </div>
                  ))}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

      {/* Section 3: New & Updated */}
      {chunkedNew.length > 0 && (
        <div className="mb-12 border-b border-white/10 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] font-bold text-white flex items-center gap-1 cursor-pointer group">
              New & Updated
              <ChevronRight size={20} className="text-[#8E8E93] group-hover:text-white transition-colors" />
            </h2>
          </div>
          <Swiper
            modules={[Navigation, FreeMode]}
            freeMode={true}
            spaceBetween={20}
            slidesPerView={1.1}
            breakpoints={{
              640: { slidesPerView: 2.1 },
              1024: { slidesPerView: 3.1 }
            }}
            navigation
            className="w-full"
            style={{ '--swiper-navigation-color': '#fff', '--swiper-navigation-size': '20px' }}
          >
            {chunkedNew.map((chunk, index) => (
              <SwiperSlide key={index}>
                <div className="flex flex-col">
                  {chunk.map((app, appIdx) => (
                    <div key={app.id}>
                      <AppCard app={app} layout="row" />
                      {appIdx !== chunk.length - 1 && <div className="h-[1px] bg-white/10 ml-[80px]" />}
                    </div>
                  ))}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}

    </motion.div>
  )
}
