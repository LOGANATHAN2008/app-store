import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { appsApi } from '../services/api'
import { useUIStore } from '../store'
import { ChevronRight, Gamepad2 } from 'lucide-react'
import AppCard from '../components/app/AppCard'
import GenericHeroCard from '../components/today/GenericHeroCard'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, FreeMode } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/free-mode'
import PageLoader from '../components/ui/PageLoader'

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

export default function ArcadePage() {
  const navigate = useNavigate()
  const { selectedOS } = useUIStore()

  const { data, isLoading } = useQuery({
    queryKey: ['apps', 'all'],
    queryFn: () => appsApi.getAll({ limit: 1000 }),
  })

  if (isLoading) return <PageLoader />

  // Filter for Arcade or Entertainment
  const apps = (data?.apps || []).filter(app => {
    const osStr = (app.minOS || '').toLowerCase()
    const cat = (app.category || '').toLowerCase()
    const isArcade = cat === 'arcade' || cat === 'entertainment' || cat === 'games'
    // To ensure Arcade has premium content, we might sort by rating or isFeatured later
    return osStr.includes(selectedOS.toLowerCase()) && isArcade
  })

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center py-40 text-center">
        <span className="text-6xl mb-4">🕹️</span>
        <h2 className="text-2xl font-bold mb-2">No Arcade Games</h2>
        <p className="text-white/50">Check back soon for premium Arcade titles.</p>
      </div>
    )
  }

  // Shuffle and pick top apps for the hero carousel (simulate Apple Arcade premium games)
  const heroApps = [...apps].sort((a, b) => b.averageRating - a.averageRating).slice(0, 5)
  
  // Section 1: New to Arcade
  const newArcade = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 15)
  const chunkedNewArcade = chunkArray(newArcade, 3)

  // Section 2: Action Packed
  const actionPacked = [...apps].sort(() => 0.5 - Math.random()).slice(0, 12)
  const chunkedAction = chunkArray(actionPacked, 3)

  // Section 3: Puzzle & Brain
  const puzzle = [...apps].sort(() => 0.5 - Math.random()).slice(0, 12)
  const chunkedPuzzle = chunkArray(puzzle, 3)

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="page-container pb-24" style={{ maxWidth: 1400 }}>
      {/* Category header - Arcade styling */}
      <div className="flex items-end justify-between pt-6 pb-6">
        <div>
          <h1 className="text-[38px] md:text-[46px] font-[800] tracking-tight leading-none text-white flex items-center gap-3">
            Arcade <span className="text-4xl text-[#FF453A]"><Gamepad2 size={40} className="fill-[#FF453A]" /></span>
          </h1>
          <p className="text-white/50 mt-2 font-medium">Unlimited ad-free games. One subscription.</p>
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
                    title: `Apple Arcade`, 
                    subtitle: 'PLAY TODAY', 
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

      {/* Section 1: New to Arcade */}
      {chunkedNewArcade.length > 0 && (
        <div className="mb-12 border-b border-white/10 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] font-bold text-white flex items-center gap-1 cursor-pointer group">
              New to Arcade
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
            {chunkedNewArcade.map((chunk, index) => (
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

      {/* Section 2: Action Packed */}
      {chunkedAction.length > 0 && (
        <div className="mb-12 border-b border-white/10 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] font-bold text-white flex items-center gap-1 cursor-pointer group">
              Action Packed
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
            {chunkedAction.map((chunk, index) => (
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

      {/* Section 3: Puzzle & Brain */}
      {chunkedPuzzle.length > 0 && (
        <div className="mb-12 border-b border-white/10 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[22px] font-bold text-white flex items-center gap-1 cursor-pointer group">
              Puzzle & Brain
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
            {chunkedPuzzle.map((chunk, index) => (
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
