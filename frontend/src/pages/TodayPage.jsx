import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { appsApi, featuredApi } from '../services/api'
import { useAuthStore, useUIStore } from '../store'
import { UserCircle, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

import RadioCard from '../components/today/RadioCard'
import ResumeCard from '../components/today/ResumeCard'
import GenericHeroCard from '../components/today/GenericHeroCard'
import PageLoader from '../components/ui/PageLoader'
import AppCard from '../components/app/AppCard'
import InlineAdBanner from '../components/promotions/InlineAdBanner'

export default function TodayPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { setProfileModalOpen, selectedOS } = useUIStore()
  
  const { data, isLoading } = useQuery({
    queryKey: ['apps', 'all'],
    queryFn: () => appsApi.getAll({ limit: 1000 })
  })

  const { data: featuredData, isLoading: featuredLoading } = useQuery({
    queryKey: ['featured'],
    queryFn: () => featuredApi.getFeatured()
  })

  if (isLoading || featuredLoading) return <PageLoader />

  // Filter apps globally based on the selected platform (iOS or Android)
  const allAppsRaw = data?.apps || []
  const allApps = allAppsRaw.filter(app => {
    const osStr = (app.minOS || '').toLowerCase()
    return osStr.includes(selectedOS.toLowerCase())
  })

  // Select the correct Hero Banners based on OS from the flat heroCards array
  const activeHeroCards = (featuredData?.heroCards || []).filter(hCard => {
    const app = allAppsRaw.find(a => a.id === hCard.id);
    if (!app) return false;
    const osStr = (app.minOS || '').toLowerCase();
    
    if (selectedOS.toLowerCase() === 'android') {
      return osStr.includes('android') && !osStr.includes('ios');
    } else {
      return !osStr.includes('android') || osStr.includes('ios');
    }
  });

  const radioApp = allApps.find(a => a.name.toLowerCase().includes('radio'))
  const resumeApp = allApps.find(a => a.name.toLowerCase().includes('resume'))

  // Chunk all apps into groups of 3 for the Top Apps list
  const chunkedApps = []
  for (let i = 0; i < allApps.length; i += 3) {
    chunkedApps.push(allApps.slice(i, i + 3))
  }

  const todayDate = format(new Date(), 'EEEE d MMMM')

  return (
    <div className="page-container pb-24" style={{ maxWidth: 1400 }}>
      {/* Today Header */}
      <div className="flex items-end justify-between pt-6 pb-6">
        <div>
          <p className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-widest mb-1">
            {todayDate}
          </p>
          <h1 className="text-[38px] md:text-[46px] font-[800] tracking-tight leading-none text-white">
            Today
          </h1>
        </div>
        <button 
          onClick={() => setProfileModalOpen(true)}
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#1C1C1E] flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors cursor-pointer active:scale-95"
          aria-label="Account"
        >
          <UserCircle size={28} className="text-[#0A84FF]" />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true, dynamicBullets: true }}
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          observer={true}
          observeParents={true}
          resizeObserver={true}
          className="w-full rounded-[20px] glass-pagination-swiper"
          style={{
            '--swiper-navigation-color': '#fff',
            '--swiper-navigation-size': '22px',
            '--swiper-pagination-color': '#fff',
          }}
        >
          {activeHeroCards.length > 0 ? (
            activeHeroCards.map(hCard => {
              const app = allAppsRaw.find(a => a.id === hCard.id)
              if (!app) return null;
              
              if (app.name.toLowerCase().includes('radio')) {
                return (
                  <SwiperSlide key={app.id}>
                    <RadioCard app={app} hCard={hCard} onClick={() => navigate(`/app/${app.id}`)} />
                  </SwiperSlide>
                )
              }
              if (app.name.toLowerCase().includes('resume')) {
                return (
                  <SwiperSlide key={app.id}>
                    <ResumeCard app={app} hCard={hCard} onClick={() => navigate(`/app/${app.id}`)} />
                  </SwiperSlide>
                )
              }
              
              return (
                <SwiperSlide key={app.id}>
                  <GenericHeroCard app={app} hCard={hCard} onClick={() => navigate(`/app/${app.id}`)} />
                </SwiperSlide>
              )
            })
          ) : (
            <>
              {radioApp && (
                <SwiperSlide>
                  <RadioCard 
                    app={radioApp} 
                    onClick={() => navigate(`/app/${radioApp.id}`)} 
                  />
                </SwiperSlide>
              )}
              
              {resumeApp && (
                <SwiperSlide>
                  <ResumeCard 
                    app={resumeApp} 
                    onClick={() => navigate(`/app/${resumeApp.id}`)} 
                  />
                </SwiperSlide>
              )}
            </>
          )}
        </Swiper>
      </motion.div>



      {/* Top Apps This Week Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="mt-12"
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-[22px] font-bold text-white flex items-center gap-1 cursor-pointer group">
            Top Apps This Week
            <ChevronRight size={20} className="text-[#8E8E93] group-hover:text-white transition-colors" />
          </h2>
        </div>

        <Swiper
          modules={[Navigation]}
          spaceBetween={20}
          slidesPerView={1.1} // Show peek of next slide on mobile
          breakpoints={{
            640: { slidesPerView: 2.1 },
            1024: { slidesPerView: 3.1 }
          }}
          navigation
          className="w-full"
          style={{
            '--swiper-navigation-color': '#fff',
            '--swiper-navigation-size': '20px',
          }}
        >
          {chunkedApps.map((chunk, index) => (
            <SwiperSlide key={index}>
              <div className="flex flex-col">
                {chunk.map((app, appIdx) => (
                  <div key={app.id}>
                    <AppCard app={app} layout="row" />
                    {/* Add divider except for last item in chunk */}
                    {appIdx !== chunk.length - 1 && (
                      <div className="h-[1px] bg-white/10 ml-[80px]" />
                    )}
                  </div>
                ))}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      {/* Inline Advertisement (Bottom) */}
      <div className="mt-12 mb-4">
        <InlineAdBanner />
      </div>
    </div>
  )
}
