import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { promoApi } from '../../services/api'
import { useLocation } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectCards } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-cards'

export default function InlineAdBanner({ className = '' }) {
  const location = useLocation()
  
  const { data: adsData } = useQuery({
    queryKey: ['global-promos'],
    queryFn: () => promoApi.getAds(),
    staleTime: 60000 // Cache for 1 minute
  })

  const isAdminRoute = location.pathname.startsWith('/admin')

  // Get ALL active ads
  const activeAds = useMemo(() => {
    if (isAdminRoute) return []
    if (!adsData || !adsData.popupAds || !Array.isArray(adsData.popupAds)) return []
    return adsData.popupAds.filter(ad => ad.active && ad.imageUrl)
  }, [adsData, isAdminRoute])

  if (activeAds.length === 0) return null

  return (
    <div className={`w-full flex justify-center py-8 overflow-hidden ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="w-full max-w-[280px]"
      >
        <Swiper
          effect={'cards'}
          grabCursor={true}
          modules={[EffectCards, Autoplay]}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          className="w-full aspect-square"
        >
          {activeAds.map((ad) => (
            <SwiperSlide key={ad.id} className="rounded-[32px] overflow-hidden bg-[#1C1C1E] shadow-[0_20px_40px_rgba(0,0,0,0.5)] border border-white/10 group cursor-pointer"
              onClick={() => {
                if (ad.linkUrl) {
                  window.open(ad.linkUrl, '_blank', 'noopener,noreferrer')
                }
              }}
            >
              <img 
                src={ad.imageUrl} 
                alt="Advertisement" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              
              {/* Subtle Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/10 opacity-70 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none" />
              
              <div className="absolute top-4 left-4 px-2.5 py-1 bg-black/40 backdrop-blur-md border border-white/10 text-white/90 text-[10px] uppercase font-bold tracking-widest rounded-lg pointer-events-none">
                Ad
              </div>

              {ad.linkUrl && (
                <div className="absolute bottom-5 left-0 right-0 flex justify-center w-full px-8 pointer-events-none">
                  <div className="w-full relative flex items-center justify-center px-6 py-2.5 bg-white/20 group-hover:bg-[#007AFF] group-hover:border-[#007AFF] backdrop-blur-xl border border-white/30 text-white text-sm font-semibold rounded-full shadow-[0_8px_16px_rgba(0,0,0,0.3)] group-hover:shadow-[0_0_20px_rgba(0,122,255,0.6)] group-hover:scale-105 transition-all duration-300 overflow-hidden pointer-events-auto">
                    <span className="relative z-10 transition-transform duration-300 group-hover:-translate-x-2">Learn More</span>
                    <ArrowRight className="absolute w-4 h-4 right-4 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>
                </div>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </div>
  )
}
