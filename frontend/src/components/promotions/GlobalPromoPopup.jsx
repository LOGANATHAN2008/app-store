import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { promoApi } from '../../services/api'
import { useLocation } from 'react-router-dom'

export default function GlobalPromoPopup() {
  const location = useLocation()
  const [showAd, setShowAd] = useState(false)
  const [selectedAd, setSelectedAd] = useState(null)
  const [hasShownThisSession, setHasShownThisSession] = useState(false)

  const { data: adsData } = useQuery({
    queryKey: ['global-promos'],
    queryFn: () => promoApi.getAds(),
    staleTime: 60000 // Cache for 1 minute
  })

  // Do not show ads inside the admin panel!
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (isAdminRoute) return
    if (hasShownThisSession) return
    if (!adsData || !adsData.popupAds || !Array.isArray(adsData.popupAds)) return

    const activeAds = adsData.popupAds.filter(ad => ad.active && ad.imageUrl)
    if (activeAds.length === 0) return // No active images to show

    // Pick a random ad
    const randomAd = activeAds[Math.floor(Math.random() * activeAds.length)]
    
    const { delaySeconds } = randomAd
    const timerId = setTimeout(() => {
      setSelectedAd(randomAd)
      setShowAd(true)
      setHasShownThisSession(true)
    }, delaySeconds * 1000)

    return () => clearTimeout(timerId)
  }, [adsData, hasShownThisSession, isAdminRoute])

  if (!showAd || !selectedAd) return null

  const ad = selectedAd

  return (
    <AnimatePresence>
      {showAd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAd(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Ad Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-[#1C1C1E] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
          >
            {/* Close Button */}
            <button 
              onClick={() => setShowAd(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/70 hover:text-white hover:bg-black/80 backdrop-blur-md transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Ad Banner (Clickable) */}
            <div 
              onClick={() => {
                if (ad.linkUrl) {
                  window.open(ad.linkUrl, '_blank', 'noopener,noreferrer')
                }
                setShowAd(false) // Optionally close ad after click
              }}
              className={`w-full relative ${ad.linkUrl ? 'cursor-pointer' : ''}`}
            >
              <img 
                src={ad.imageUrl} 
                alt="Advertisement" 
                className="w-full h-auto max-h-[70vh] object-contain bg-black"
              />
              <div className="absolute top-4 left-4 px-2 py-1 bg-black/50 backdrop-blur-md text-white/50 text-[10px] uppercase font-bold tracking-wider rounded-md">
                Advertisement
              </div>
            </div>

            {/* Optional Link Button Below */}
            {ad.linkUrl && (
              <div className="p-4 bg-[#1C1C1E] border-t border-white/10 flex justify-center">
                <a 
                  href={ad.linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the div click if it bubbles
                    setShowAd(false);
                  }}
                  className="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white px-8 py-3 rounded-full font-semibold transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
                >
                  Learn More
                </a>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
