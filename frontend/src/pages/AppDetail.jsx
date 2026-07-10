import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { useWishlistStore, useUIStore } from '../store'
import { ChevronLeft, Share2, Star, Users, ChevronDown, ChevronUp, Monitor, Smartphone, Tablet, ExternalLink, MapPin, Contact, Clock, Activity, Box, Heart, X, BadgeCheck } from 'lucide-react'
import { appsApi } from '../services/api'
import { joinApp, leaveApp, getSocket } from '../services/socket'
import AppIcon from '../components/ui/AppIcon'
import InstallButton from '../components/ui/InstallButton'
import AppRow from '../components/home/AppRow'
import { formatInstalls, formatRating, formatRelative, formatPrice } from '../utils/formatters'
import { useInView } from 'react-intersection-observer'
import toast from 'react-hot-toast'

/* ── All Reviews Modal ─────────────────────────────────────────────── */
function AllReviewsModal({ isOpen, onClose, appId, appName, averageRating, reviewCount }) {
  const { data, isLoading } = useQuery({
    queryKey: ['app-reviews', appId],
    queryFn: () => appsApi.getReviews(appId),
    enabled: isOpen
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-end md:justify-center p-0 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            onClick={e => e.stopPropagation()}
            className="w-full h-full md:h-[85vh] md:max-w-3xl bg-[#1C1C1E] md:rounded-[30px] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 shrink-0 bg-[#1C1C1E]/80 backdrop-blur-xl z-10 sticky top-0">
              <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
                  <X size={24} />
                </button>
                <div>
                  <h2 className="text-xl font-bold leading-tight">Ratings & Reviews</h2>
                  <p className="text-[13px] text-textSecondary">{appName}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-xl font-bold text-[#FF9F0A]">{formatRating(averageRating)}</span>
                <span className="text-xs text-textSecondary">{reviewCount} Ratings</span>
              </div>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <span className="animate-pulse text-[#8E8E93]">Loading reviews...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {data?.reviews?.length > 0 ? (
                    data.reviews.map(r => (
                      <div key={r.id} className="p-5 rounded-[18px] bg-white/5 border border-white/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex gap-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} size={14} fill={r.rating >= i ? '#FF9F0A' : 'none'} stroke="#FF9F0A" strokeWidth={1.5} />
                            ))}
                          </div>
                          <span className="text-[12px] text-[#8E8E93]">{formatRelative(r.createdAt)}</span>
                        </div>
                        {r.title && <p className="font-bold text-[15px] mt-1 mb-2">{r.title}</p>}
                        <p className="text-[14px] leading-relaxed text-[#d1d1d6]">{r.body}</p>
                        <p className="text-[12px] mt-3 font-medium text-[#0A84FF]">{r.userName || 'App Store User'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-[#8E8E93] py-10">No reviews found.</p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Write Review Modal ────────────────────────────────────────────── */
function WriteReviewModal({ isOpen, onClose, appId, appName, appIcon }) {
  const [review, setReview] = useState({ rating: 5, title: '', body: '' })
  const qc = useQueryClient()

  const reviewMutation = useMutation({
    mutationFn: (data) => appsApi.postReview(appId, data),
    onSuccess: () => {
      toast.success('Review posted! 🎉')
      onClose()
      setReview({ rating: 5, title: '', body: '' })
      qc.invalidateQueries({ queryKey: ['app', appId] })
      qc.invalidateQueries({ queryKey: ['app-reviews', appId] })
    },
    onError: () => toast.error('Failed to post review'),
  })

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex flex-col items-center justify-end md:justify-center p-0 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            onClick={e => e.stopPropagation()}
            className="w-full h-full md:h-auto md:max-h-[85vh] md:max-w-2xl bg-[#1C1C1E] md:rounded-[30px] flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-[#1C1C1E]/80 backdrop-blur-xl z-10 sticky top-0">
              <button 
                onClick={onClose} 
                className="text-[15px] text-[#0A84FF] px-2 py-1"
              >
                Cancel
              </button>
              <h2 className="text-[16px] font-bold">Write a Review</h2>
              <button 
                onClick={() => reviewMutation.mutate({ ...review, userName: 'App Store User', appId })}
                disabled={!review.body.trim() || reviewMutation.isPending}
                className="text-[15px] font-semibold text-[#0A84FF] px-2 py-1 disabled:opacity-50"
              >
                {reviewMutation.isPending ? 'Sending...' : 'Send'}
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col items-center">
              <AppIcon src={appIcon} alt={appName} size={64} className="mb-4 shadow-lg rounded-[14px]" />
              <h3 className="text-[17px] font-semibold mb-6">{appName}</h3>
              
              <div className="flex gap-2 mb-8">
                {[1,2,3,4,5].map(i => (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setReview(r => ({ ...r, rating: i }))}
                  >
                    <Star
                      size={36}
                      fill={review.rating >= i ? '#0A84FF' : 'none'}
                      stroke="#0A84FF"
                      strokeWidth={1.5}
                    />
                  </motion.button>
                ))}
              </div>

              <div className="w-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <input
                  className="w-full bg-transparent px-4 py-3 border-b border-white/10 text-white placeholder-[#8E8E93] outline-none text-[15px]"
                  placeholder="Title"
                  value={review.title}
                  onChange={e => setReview(r => ({ ...r, title: e.target.value }))}
                />
                <textarea
                  className="w-full bg-transparent px-4 py-3 text-white placeholder-[#8E8E93] outline-none resize-none text-[15px]"
                  placeholder="Review (Optional)"
                  rows={6}
                  value={review.body}
                  onChange={e => setReview(r => ({ ...r, body: e.target.value }))}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const pageVariants = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, x: -20, transition: { duration: 0.2 } },
}

/* ── Rating breakdown bars ─────────────────────────────────────────── */
function RatingBars({ app }) {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 })
  const dist = { 5: 0.72, 4: 0.18, 3: 0.06, 2: 0.02, 1: 0.02 }

  return (
    <div ref={ref} className="flex gap-6 items-start">
      {/* Big number */}
      <div className="flex flex-col items-center flex-shrink-0">
        <span style={{ fontSize: 64, fontWeight: 800, lineHeight: 1, letterSpacing: -3 }}>
          {formatRating(app.averageRating)}
        </span>
        <div className="flex gap-0.5 mt-2">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={11}
              fill={app.averageRating >= i ? '#FF9F0A' : 'none'}
              stroke="#FF9F0A" strokeWidth={1.5}
            />
          ))}
        </div>
        <p className="text-[12px] mt-1" style={{ color: '#8E8E93' }}>
          {formatInstalls(app.reviewCount)} Ratings
        </p>
      </div>

      {/* Bars */}
      <div className="flex-1 flex flex-col gap-2 justify-center pt-1">
        {[5,4,3,2,1].map(star => (
          <div key={star} className="flex items-center gap-2">
            <span className="text-[11px] w-2 text-right flex-shrink-0" style={{ color: '#8E8E93' }}>{star}</span>
            <div className="star-bar flex-1">
              <div
                className="star-bar-fill"
                style={{ width: inView ? `${(dist[star] ?? 0) * 100}%` : '0%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Info row ──────────────────────────────────────────────────────── */
function InfoRow({ label, value, hasChevron }) {
  return (
    <div className="flex flex-col py-1">
      <span className="text-[12px] font-medium mb-1" style={{ color: '#8E8E93' }}>{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-[13px] text-white font-medium">{value}</span>
        {hasChevron && <ChevronDown size={14} style={{ color: '#8E8E93' }} />}
      </div>
    </div>
  )
}

/* ── Review card ───────────────────────────────────────────────────── */
function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div
      className="flex-shrink-0 w-[300px] p-5 rounded-[18px]"
      style={{ background: '#1C1C1E', border: '0.5px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex gap-0.5">
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={11}
              fill={review.rating >= i ? '#FF9F0A' : 'none'}
              stroke="#FF9F0A" strokeWidth={1.5}
            />
          ))}
        </div>
        <span className="text-[11px]" style={{ color: '#636366' }}>{formatRelative(review.createdAt)}</span>
      </div>
      {review.title && (
        <p className="font-semibold text-[14px] mt-2 mb-1 truncate">{review.title}</p>
      )}
      <p
        className="text-[13px] leading-relaxed"
        style={{
          color: '#8E8E93',
          display: '-webkit-box',
          WebkitLineClamp: expanded ? 'unset' : 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {review.body}
      </p>
      {review.body?.length > 120 && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="text-[13px] mt-1.5"
          style={{ color: '#0A84FF' }}
        >
          {expanded ? 'less' : 'more'}
        </button>
      )}
      <p className="text-[11px] mt-3" style={{ color: '#48484A' }}>{review.userName || 'App Store User'}</p>
    </div>
  )
}

/* ── Zoomable Image Component ──────────────────────────────────────── */
function ZoomableImage({ src, alt }) {
  const [isZoomed, setIsZoomed] = useState(false)
  const containerRef = useRef(null)

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      onClick={(e) => {
        e.stopPropagation()
        setIsZoomed(!isZoomed)
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl relative z-0 cursor-zoom-in"
        style={{ cursor: isZoomed ? 'grab' : 'zoom-in' }}
        animate={{ scale: isZoomed ? 2.5 : 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        drag={isZoomed}
        dragConstraints={containerRef}
        dragElastic={0.2}
        whileDrag={{ cursor: 'grabbing' }}
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => {
          e.stopPropagation()
          setIsZoomed(!isZoomed)
        }}
      />
    </div>
  )
}

/* ── Main component ────────────────────────────────────────────────── */
export default function AppDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const { selectedOS } = useUIStore()

  const [descExpanded,    setDescExpanded]    = useState(false)
  const [viewerCount,     setViewerCount]     = useState(1)
  const [liveInstalls,    setLiveInstalls]    = useState(null)
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false)
  const [isAllReviewsOpen, setIsAllReviewsOpen] = useState(false)
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState(null)
  const [isIconZoomed, setIsIconZoomed] = useState(false)

  /* Data fetching */
  const { data, isLoading, isError } = useQuery({
    queryKey: ['app', id],
    queryFn: () => appsApi.getById(id),
    enabled: !!id,
  })

  const { data: moreData } = useQuery({
    queryKey: ['apps', 'all'],
    queryFn: () => appsApi.getAll({ limit: 100 }),
  })

  // Recently Viewed Logic
  const [history, setHistory] = useState(() => {
    return JSON.parse(localStorage.getItem('viewHistory') || '[]')
  })

  // Wishlist Logic
  const { wishlist, toggleWishlist } = useWishlistStore()
  const isWishlisted = wishlist[id] || false

  useEffect(() => {
    if (id && data?.app) {
      window.scrollTo(0, 0)
      const updated = [id, ...history.filter(h => h !== id)].slice(0, 10)
      localStorage.setItem('viewHistory', JSON.stringify(updated))
      setHistory(updated)
    }
  }, [id, data])

  const handleToggleWishlist = () => {
    toggleWishlist(id)
    if (isWishlisted) {
      toast('Removed from Wishlist')
    } else {
      toast.success('Added to Wishlist')
    }
  }

  /* Socket.io */
  useEffect(() => {
    if (!id) return
    joinApp(id)
    const socket = getSocket()
    const onViewers   = ({ appId, count })  => { if (appId === id) setViewerCount(count) }
    const onInstalls  = ({ appId, count })  => { if (appId === id) setLiveInstalls(count) }
    const onReview    = ({ appId })          => { if (appId === id) qc.invalidateQueries({ queryKey: ['app', id] }) }
    socket.on('viewer_count',           onViewers)
    socket.on('install_count_updated',  onInstalls)
    socket.on('new_review',             onReview)
    return () => {
      leaveApp(id)
      socket.off('viewer_count',          onViewers)
      socket.off('install_count_updated', onInstalls)
      socket.off('new_review',            onReview)
    }
  }, [id, qc])



  /* Loading state */
  if (isLoading) return (
    <div className="page-container pt-4 pb-10">
      <div className="flex gap-5 mb-6">
        <div className="skeleton w-[120px] h-[120px] rounded-[22%] flex-shrink-0" />
        <div className="flex-1">
          <div className="skeleton h-8 w-3/4 mb-3 rounded-xl" />
          <div className="skeleton h-5 w-1/2 mb-2 rounded-xl" />
          <div className="skeleton h-4 w-2/5 mb-4 rounded-xl" />
          <div className="skeleton h-10 w-24 rounded-full" />
        </div>
      </div>
      {[...Array(4)].map((_,i) => <div key={i} className="skeleton h-40 rounded-[18px] mb-4" />)}
    </div>
  )

  /* Error / not found */
  if (isError || !data?.app) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <span className="text-6xl mb-4">😞</span>
      <h2 className="text-xl font-bold mb-2">App Not Found</h2>
      <p className="mb-6" style={{ color: '#8E8E93' }}>This app may have been removed from the store.</p>
      <button onClick={() => navigate('/')} className="btn-get px-6 py-3 text-base">Go Home</button>
    </div>
  )

  const { app, reviews = [] } = data
  const installCount   = liveInstalls ?? app.installCount
  
  const allAppsRaw = moreData?.apps || []
  const allApps = allAppsRaw.filter(a => {
    const osStr = (a.minOS || '').toLowerCase()
    return osStr.includes(selectedOS.toLowerCase())
  })

  const relatedApps = allApps.filter(a => a.id !== id && a.category === app.category).slice(0, 8)
  const devApps = allApps.filter(a => a.id !== id && a.developer === app.developer).slice(0, 8)
  const historyApps = history.filter(hId => hId !== id).map(hId => allApps.find(a => a.id === hId)).filter(Boolean).slice(0, 8)
  const trendingApps = [...allApps].filter(a => a.id !== id && a.category === app.category).sort((a,b) => (b.installCount||0) - (a.installCount||0)).slice(0, 8)

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="page-container pb-16 w-full"
    >
      {/* ── New Rich Hero Banner ── */}
      <div className="relative w-full overflow-hidden mb-6 -mx-4 md:-mx-8 md:-mt-8 -mt-4">
        {/* Blurred Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-80 dark:opacity-60 scale-[1.2]"
          style={{ backgroundImage: `url(${app.iconUrl})` }}
        />
        {/* Gradient Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent dark:from-black/80 dark:via-black/60 dark:to-black/80" />

        <div className="relative z-10 px-4 pt-16 pb-8 md:pt-24 md:pb-12 max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
          
          {/* Floating Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-1 pl-1.5 pr-4 py-1.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md text-white/90 hover:text-white transition-colors border border-white/10 shadow-lg"
            aria-label="Go back"
          >
            <ChevronLeft size={22} strokeWidth={2.5} />
            <span className="text-[15px] font-medium tracking-wide">Back</span>
          </button>

          {/* App Icon */}
          <motion.div 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            onClick={() => setIsIconZoomed(true)}
            className="cursor-pointer mt-8 md:mt-0"
          >
            <AppIcon src={app.iconUrl} alt={app.name} size={160} className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] shadow-2xl rounded-[32px] md:rounded-[40px] border-4 border-white/20" />
          </motion.div>

          {/* App Info */}
          <div className="flex-1 text-center md:text-left flex flex-col justify-center mt-2 md:mt-4">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-1">{app.name}</h1>
              {app.isDeveloperVerified && (
                <BadgeCheck className="w-[24px] h-[24px] text-white/90 ml-1" />
              )}
            </div>
            
            <h2 className="text-lg md:text-xl font-medium text-white/90 mb-2">
              {app.shortDescription || app.category}
            </h2>
            
            <p className="text-[13px] md:text-[14px] text-white/80 mb-6 font-medium">
              {app.price === 0 ? 'Free' : formatPrice(app.price)} · {app.price === 0 ? 'In-App Purchases' : ''}
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-3">
              <InstallButton app={app} size="lg" className="px-10" />
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: app.name, url: window.location.href })
                  } else {
                    navigator.clipboard?.writeText(window.location.href)
                    toast.success('Link copied!')
                  }
                }}
                className="flex items-center gap-2 px-5 py-[14px] rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md font-bold text-sm transition-colors shadow-sm"
              >
                <Share2 size={18} strokeWidth={2.5} /> Share
              </button>
              
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleToggleWishlist}
                className="p-[14px] rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-md transition-colors shadow-sm"
                aria-label="Wishlist"
              >
                <Heart size={20} fill={isWishlisted ? '#FF2D55' : 'none'} strokeWidth={isWishlisted ? 0 : 2} color={isWishlisted ? '#FF2D55' : 'white'} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Strip ── */}
      <div className="w-[100vw] relative left-[50%] right-[50%] -ml-[50vw] -mr-[50vw] bg-transparent border-y border-white/5 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex items-start justify-between overflow-x-auto hide-scrollbar px-4 md:px-8">
          
          {/* RATINGS */}
          <div className="flex flex-col items-center flex-1 px-4 min-w-[110px] border-r border-white/10">
            <span className="text-[10px] font-bold text-[#8E8E93] tracking-widest uppercase mb-1">
              {formatInstalls(app.reviewCount)} Ratings
            </span>
            <span className="text-2xl font-bold text-white mb-1">{formatRating(app.averageRating)}</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <Star key={i} size={11} fill={app.averageRating >= i ? '#8E8E93' : 'none'} stroke="#8E8E93" strokeWidth={1.5} />
              ))}
            </div>
          </div>

          {/* AGE RATING */}
          <div className="flex flex-col items-center flex-1 px-4 min-w-[110px] border-r border-white/10">
            <span className="text-[10px] font-bold text-[#8E8E93] tracking-widest uppercase mb-1">Age Rating</span>
            <span className="text-2xl font-bold text-white mb-1">{app.ageRating || '4+'}</span>
            <span className="text-[11px] text-[#8E8E93] font-medium text-center">Years Old</span>
          </div>

          {/* CHART */}
          <div className="flex flex-col items-center flex-1 px-4 min-w-[110px] border-r border-white/10">
            <span className="text-[10px] font-bold text-[#8E8E93] tracking-widest uppercase mb-1">Chart</span>
            <span className="text-2xl font-bold text-white mb-1">No. {Math.floor(Math.random() * 50) + 1}</span>
            <span className="text-[11px] text-[#8E8E93] font-medium text-center capitalize">{app.category}</span>
          </div>

          {/* DEVELOPER */}
          <div className="flex flex-col items-center flex-1 px-4 min-w-[110px] border-r border-white/10">
            <span className="text-[10px] font-bold text-[#8E8E93] tracking-widest uppercase mb-1">Developer</span>
            <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center mb-1.5 text-[#8E8E93]">
              <Contact size={16} />
            </div>
            <span className="text-[11px] text-[#8E8E93] font-medium text-center line-clamp-1 px-1 w-full">{app.developer}</span>
          </div>

          {/* LANGUAGE */}
          <div className="flex flex-col items-center flex-1 px-4 min-w-[110px] border-r border-white/10">
            <span className="text-[10px] font-bold text-[#8E8E93] tracking-widest uppercase mb-1">Language</span>
            <span className="text-2xl font-bold text-white mb-1">EN</span>
            <span className="text-[11px] text-[#8E8E93] font-medium text-center">+ 72 More</span>
          </div>

          {/* SIZE */}
          <div className="flex flex-col items-center flex-1 px-4 min-w-[110px]">
            <span className="text-[10px] font-bold text-[#8E8E93] tracking-widest uppercase mb-1">Size</span>
            <span className="text-2xl font-bold text-white mb-1">{app.size || (Math.random() * 200 + 50).toFixed(1)}</span>
            <span className="text-[11px] text-[#8E8E93] font-medium text-center">MB</span>
          </div>

        </div>
      </div>

      {/* ── Screenshots ── */}
      {app.screenshotUrls?.length > 0 && (
        <>
          <h2 className="section-title mb-4">Screenshots</h2>
          <div className="scroll-row mb-7" style={{ paddingBottom: 8 }}>
            {app.screenshotUrls.map((url, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedScreenshotIndex(i)}
                className="flex-shrink-0 overflow-hidden rounded-[14px] cursor-pointer"
                style={{ 
                  height: app.screenshotOrientation === 'landscape' ? 240 : 420, 
                  aspectRatio: app.screenshotOrientation === 'landscape' ? '16/9' : '9/16', 
                  background: '#111' 
                }}
              >
                {url.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i) ? (
                  <video src={url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                ) : (
                  <img
                    src={url}
                    alt={`Screenshot ${i + 1} of ${app.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
              </motion.div>
            ))}
          </div>
          <hr className="divider mb-7" />
        </>
      )}

      {/* ── Description ── */}
      <section className="mb-7 max-w-4xl">
        <h2 className="section-title mb-3">Description</h2>
        <div
          className="text-[15px] leading-relaxed md:text-[16px]"
          style={{
            color: '#d1d1d6',
            display: '-webkit-box',
            WebkitLineClamp: descExpanded ? 'unset' : 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {app.description}
        </div>
        <button
          onClick={() => setDescExpanded(p => !p)}
          className="flex items-center gap-1 text-[14px] mt-2"
          style={{ color: '#0A84FF' }}
        >
          {descExpanded ? <><ChevronUp size={14} /> less</> : <><ChevronDown size={14} /> more</>}
        </button>
      </section>

      <hr className="divider mb-7" />

      {/* ── What's New ── */}
      <section className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">What's New</h2>
          <span className="text-[13px]" style={{ color: '#636366' }}>Version {app.version}</span>
        </div>
        <p className="text-[15px] leading-relaxed line-clamp-3" style={{ color: '#d1d1d6' }}>
          Bug fixes and performance improvements. We've improved stability across all devices and optimized startup time by 40%.
        </p>
      </section>

      <hr className="divider mb-7" />

      {/* ── Ratings & Reviews ── */}
      <section className="mb-7">
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">Ratings &amp; Reviews</h2>
          <button className="see-all text-[15px]" onClick={() => setIsAllReviewsOpen(true)}>See All</button>
        </div>

        <RatingBars app={app} />

        {reviews.length > 0 && (
          <div className="scroll-row mt-6">
            {reviews.map(r => <ReviewCard key={r.id} review={r} />)}
          </div>
        )}

        {reviews.length === 0 && (
          <p className="text-[14px] mt-4" style={{ color: '#636366' }}>No reviews yet. Be the first!</p>
        )}

        {/* Write review button */}
        <button
          onClick={() => setIsWriteReviewOpen(true)}
          className="w-full mt-5 py-3 rounded-xl text-[15px] font-medium transition-colors flex justify-center items-center gap-2"
          style={{ background: '#1C1C1E', color: '#0A84FF', border: '0.5px solid rgba(255,255,255,0.08)' }}
        >
          ✏️ Write a Review
        </button>

        <WriteReviewModal
          isOpen={isWriteReviewOpen}
          onClose={() => setIsWriteReviewOpen(false)}
          appId={id}
          appName={app.name}
          appIcon={app.iconUrl}
        />
        
        <AllReviewsModal 
          isOpen={isAllReviewsOpen}
          onClose={() => setIsAllReviewsOpen(false)}
          appId={id}
          appName={app.name}
          averageRating={app.averageRating}
          reviewCount={app.reviewCount}
        />
      </section>

      <hr className="divider mb-7" />

      {/* ── App Privacy ── */}
      <section className="mb-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="section-title">App Privacy</h2>
        </div>
        <p className="text-[14px] leading-relaxed mb-6" style={{ color: '#8E8E93' }}>
          The developer, <span className="uppercase text-white font-medium">{app.developer}</span>, indicated that the app's privacy practices may include handling of data as described below. For more information, see the <button onClick={() => navigate('/privacy')} style={{ color: '#0A84FF' }}>developer's privacy policy</button>.
        </p>
        
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2 hide-scroll">
          {/* Box 1 */}
          <div className="flex-1 min-w-[280px] p-6 rounded-[22px]" style={{ background: '#1C1C1E' }}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-3 text-[#0A84FF]">
                <Box size={32} />
              </div>
              <h3 className="font-bold text-[15px] text-white mb-1">Data Used to Track You</h3>
              <p className="text-[13px] leading-snug" style={{ color: '#8E8E93' }}>The following data may be used to track you across apps and websites owned by other companies:</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[13px] font-medium" style={{ color: '#d1d1d6' }}>
              <span className="flex items-center gap-2"><Box size={16} /> Purchases</span>
              <span className="flex items-center gap-2"><MapPin size={16} /> Location</span>
              <span className="flex items-center gap-2"><Monitor size={16} /> Identifiers</span>
              <span className="flex items-center gap-2"><Activity size={16} /> Usage Data</span>
            </div>
          </div>
          
          {/* Box 2 */}
          <div className="flex-1 min-w-[280px] p-6 rounded-[22px]" style={{ background: '#1C1C1E' }}>
            <div className="flex flex-col items-center text-center mb-6">
              <div className="mb-3 text-[#0A84FF]">
                <Users size={32} />
              </div>
              <h3 className="font-bold text-[15px] text-white mb-1">Data Linked to You</h3>
              <p className="text-[13px] leading-snug" style={{ color: '#8E8E93' }}>The following data may be collected and linked to your identity:</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-[13px] font-medium" style={{ color: '#d1d1d6' }}>
              <span className="flex items-center gap-2"><Box size={16} /> Purchases</span>
              <span className="flex items-center gap-2"><MapPin size={16} /> Location</span>
              <span className="flex items-center gap-2"><Contact size={16} /> Contact Info</span>
              <span className="flex items-center gap-2"><Users size={16} /> Contacts</span>
              <span className="flex items-center gap-2"><Monitor size={16} /> Identifiers</span>
              <span className="flex items-center gap-2"><Activity size={16} /> Usage Data</span>
            </div>
          </div>
        </div>
        
        <p className="text-[12px] mt-4" style={{ color: '#8E8E93' }}>
          Privacy practices may vary, for example, based on the features you use or your age. <button onClick={() => navigate('/privacy')} style={{ color: '#0A84FF' }}>Learn More</button>
        </p>
      </section>

      <hr className="divider mb-7" />

      {/* ── Accessibility ── */}
      <section className="mb-7">
        <h2 className="section-title mb-2">Accessibility</h2>
        <p className="text-[13px]" style={{ color: '#8E8E93' }}>
          The developer has not yet indicated which accessibility features this app supports. <button onClick={(e) => { e.preventDefault(); toast.success('Opening Accessibility Info') }} style={{ color: '#0A84FF' }}>Learn More</button>
        </p>
      </section>

      <hr className="divider mb-7" />

      {/* ── Information ── */}
      <section className="mb-7">
        <h2 className="section-title mb-5">Information</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
          <InfoRow label="Seller" value={<span className="uppercase">{app.developer}</span>} />
          <InfoRow label="Size" value={app.displaySize || '45.2 MB'} />
          <InfoRow label="Category" value={app.category.charAt(0).toUpperCase() + app.category.slice(1)} />
          <InfoRow label="Compatibility" value={app.minOS ?? 'Requires iOS 13.0 or later.'} hasChevron />
          <InfoRow label="Languages" value="English and 16 more" hasChevron />
          <InfoRow label="Age Rating" value={app.ageRating} hasChevron />
          <InfoRow label="In-App Purchases" value="Yes" hasChevron />
          <InfoRow label="Copyright" value={`© ${new Date().getFullYear()} ${app.developer}`} />
        </div>
        <div className="mt-8 text-left">
          <button onClick={() => navigate('/privacy')} className="text-[14px] font-medium flex items-center gap-1" style={{ color: '#0A84FF' }}>Privacy Policy <ExternalLink size={14} /></button>
        </div>
      </section>

      <hr className="divider mb-7" />

      {/* ── Supports ── */}
      <section className="mb-7">
        <h2 className="section-title mb-4">Supports</h2>
        <div className="flex items-center gap-4">
          <div className="w-[42px] h-[42px] rounded-full flex-shrink-0 grid grid-cols-2 grid-rows-2 p-1.5 overflow-hidden shadow-sm" style={{ background: '#fff' }}>
             <div className="bg-[#FF2D55] rounded-tl-full"></div>
             <div className="bg-[#30D158] rounded-tr-full"></div>
             <div className="bg-[#0A84FF] rounded-bl-full"></div>
             <div className="bg-[#FF9F0A] rounded-br-full"></div>
          </div>
          <div>
            <h3 className="text-[14px] font-semibold text-white">Game Center</h3>
            <p className="text-[13px] mt-0.5" style={{ color: '#8E8E93' }}>Discover new games and play with friends.</p>
          </div>
        </div>
      </section>

      <hr className="divider mb-7" />

      {/* ── More by Developer ── */}
      {devApps.length > 0 && (
        <section className="mb-7 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">More by <span className="uppercase">{app.developer}</span> <ChevronLeft size={16} className="inline rotate-180 text-[#8E8E93]" /></h2>
          </div>
          <AppRow apps={devApps} layout="card" />
        </section>
      )}

      {/* ── You Might Also Like ── */}
      {relatedApps.length > 0 && (
        <section className="mb-7 -mx-4 px-4 sm:mx-0 sm:px-0">
          <hr className="divider mb-7 mx-4 sm:mx-0" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">You Might Also Like <ChevronLeft size={16} className="inline rotate-180 text-[#8E8E93]" /></h2>
          </div>
          <AppRow apps={relatedApps} layout="card" />
        </section>
      )}

      {/* ── Recently Viewed ── */}
      {historyApps.length > 0 && (
        <section className="mb-7 -mx-4 px-4 sm:mx-0 sm:px-0">
          <hr className="divider mb-7 mx-4 sm:mx-0" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recently Viewed <ChevronLeft size={16} className="inline rotate-180 text-[#8E8E93]" /></h2>
          </div>
          <AppRow apps={historyApps} layout="card" />
        </section>
      )}

      {/* ── Trending in Category ── */}
      {trendingApps.length > 0 && (
        <section className="mb-7 -mx-4 px-4 sm:mx-0 sm:px-0">
          <hr className="divider mb-7 mx-4 sm:mx-0" />
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Trending in {app.category} <ChevronLeft size={16} className="inline rotate-180 text-[#8E8E93]" /></h2>
          </div>
          <AppRow apps={trendingApps} layout="card" />
        </section>
      )}
      {/* ── Lightbox for Screenshots ── */}
      <AnimatePresence>
        {selectedScreenshotIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedScreenshotIndex(null)}
          >
            <button
              onClick={() => setSelectedScreenshotIndex(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-colors z-10 backdrop-blur-md"
            >
              <X size={24} />
            </button>

            {/* Previous Button */}
            {selectedScreenshotIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedScreenshotIndex(selectedScreenshotIndex - 1) }}
                className="absolute left-4 md:left-12 p-3 rounded-full bg-white hover:bg-gray-200 text-black transition-colors z-10 shadow-lg"
              >
                <ChevronLeft size={32} />
              </button>
            )}

            <motion.div
              key={selectedScreenshotIndex}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-0 flex items-center justify-center p-4 md:p-16"
            >
              <ZoomableImage 
                src={app.screenshotUrls[selectedScreenshotIndex]} 
                alt="Screenshot Fullscreen" 
              />
            </motion.div>

            {/* Next Button */}
            {selectedScreenshotIndex < app.screenshotUrls.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedScreenshotIndex(selectedScreenshotIndex + 1) }}
                className="absolute right-4 md:right-12 p-3 rounded-full bg-white hover:bg-gray-200 text-black transition-colors z-10 shadow-lg"
              >
                <ChevronLeft size={32} className="rotate-180" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Lightbox for App Icon ── */}
      <AnimatePresence>
        {isIconZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setIsIconZoomed(false)}
          >
            <button
              onClick={() => setIsIconZoomed(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-colors z-10 backdrop-blur-md"
            >
              <X size={24} />
            </button>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-0 flex items-center justify-center p-4 md:p-16"
            >
              <ZoomableImage 
                src={app.iconUrl} 
                alt={`${app.name} Icon Fullscreen`} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  )
}
