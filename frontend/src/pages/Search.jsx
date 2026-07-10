import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, X, TrendingUp } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { searchApi } from '../services/api'
import { useUIStore } from '../store'
import AppCard from '../components/app/AppCard'
import AppIcon from '../components/ui/AppIcon'
import InstallButton from '../components/ui/InstallButton'
import { Crown, Star } from 'lucide-react'

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0 },
}

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t) }, [value, delay])
  return debounced
}

function SearchResultCard({ app, onClick }) {
  // Try to use app screenshots if available, otherwise use picsum fallbacks
  const getScreenshot = (index) => {
    if (app.screenshotUrls && app.screenshotUrls[index]) return app.screenshotUrls[index];
    return `https://picsum.photos/seed/${app.id}-${index}/200/400`;
  }

  const rating = app.averageRating || 4.5;
  const ratingCount = app.totalRatings ? (app.totalRatings > 1000000 ? (app.totalRatings/1000000).toFixed(1)+'m' : (app.totalRatings/1000).toFixed(1)+'k') : '7.7m';

  return (
    <div 
      onClick={onClick}
      className="bg-[#1C1C1E] rounded-[20px] p-4 shadow-sm border border-white/5 flex flex-col gap-4 cursor-pointer hover:bg-white/5 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <AppIcon src={app.iconUrl} alt={app.name} size={64} className="rounded-xl border border-white/5 shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[16px] text-white truncate">{app.name}</h3>
          <p className="text-[13px] text-[#8E8E93] truncate">{app.shortDescription || app.developer}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s, i) => (
                <Star key={i} size={10} fill={i < Math.round(rating) ? "#8E8E93" : "transparent"} stroke={i < Math.round(rating) ? "none" : "#8E8E93"} />
              ))}
            </div>
            <span className="text-[11px] text-[#8E8E93] ml-1">{ratingCount}</span>
          </div>
        </div>
        <div onClick={(e) => e.stopPropagation()} className="shrink-0">
          <InstallButton app={app} size="sm" />
        </div>
      </div>
      
      <div className="flex gap-2 h-[220px]">
        {[0, 1, 2].map(i => (
          <img 
            key={i}
            src={getScreenshot(i)} 
            className="flex-1 w-0 h-full object-cover rounded-xl border border-white/5" 
            alt={`${app.name} screenshot ${i+1}`}
          />
        ))}
      </div>
    </div>
  )
}

export default function Search() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { selectedOS } = useUIStore()
  const debouncedQuery = useDebounce(query, 300)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 100) }, [])

  const { data: trendingData } = useQuery({
    queryKey: ['search', 'trending'],
    queryFn: () => searchApi.trending(),
  })

  const { data: searchData, isFetching } = useQuery({
    queryKey: ['search', debouncedQuery, activeFilter],
    queryFn: () => searchApi.search(debouncedQuery, { category: activeFilter }),
    enabled: debouncedQuery.length > 0,
  })

  const FILTERS = ['all', 'games', 'productivity', 'social', 'health', 'education', 'entertainment']

  const BROWSE_CATEGORIES = [
    { id: 'photo-video', label: 'Photo & Video', from: '#30D158', to: '#1c913a', icon: '📸' },
    { id: 'games', label: 'Games', from: '#FF375F', to: '#c9143c', icon: '🎮' },
    { id: 'productivity', label: 'Productivity', from: '#5E5CE6', to: '#403eb3', icon: '💼' },
    { id: 'social', label: 'Social', from: '#0A84FF', to: '#005bb5', icon: '💬' },
    { id: 'health', label: 'Health', from: '#FF9F0A', to: '#b36b00', icon: '👟' },
    { id: 'education', label: 'Education', from: '#BF5AF2', to: '#8d2abf', icon: '📚' },
    { id: 'entertainment', label: 'Entertainment', from: '#FF453A', to: '#c92a20', icon: '🎬' },
    { id: 'finance', label: 'Finance', from: '#32ADE6', to: '#1b80ad', icon: '📈' },
  ]

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit" className="max-w-3xl mx-auto px-4 py-4">
      {/* Search bar */}
      <div className="flex items-center gap-3 bg-surfaceRaised rounded-2xl px-4 py-3 mb-6 border border-white/10 focus-within:border-accent transition-colors">
        <SearchIcon size={18} className="text-textSecondary flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Games, Apps, Stories and More"
          className="flex-1 bg-transparent text-white placeholder-textSecondary text-[17px] outline-none"
          aria-label="Search apps"
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-textSecondary" aria-label="Clear search">
            <X size={18} />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!debouncedQuery ? (
          <motion.div key="trending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 className="section-title mb-4">Top Searches</h2>
            <div className="flex flex-col mb-10">
              {(trendingData?.trendingApps || []).filter(app => {
                const osStr = (app.minOS || '').toLowerCase()
                return osStr.includes(selectedOS.toLowerCase())
              }).map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-4 py-4 cursor-pointer hover:bg-surface rounded-xl px-2 -mx-2 transition-colors"
                  onClick={() => navigate(`/app/${app.id}`)}
                >
                  <TrendingUp size={18} className="text-accent flex-shrink-0" />
                  <AppIcon src={app.iconUrl} alt={app.name} size={48} />
                  <span className="text-white font-medium text-[15px]">{app.name}</span>
                </motion.div>
              ))}
            </div>

            <h2 className="section-title mb-4">Browse Categories</h2>
            <div className="grid grid-cols-2 gap-3 pb-24">
              {BROWSE_CATEGORIES.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => navigate(`/category/${cat.id}`)}
                  style={{ background: `linear-gradient(135deg, ${cat.from} 0%, ${cat.to} 100%)` }}
                  className="relative overflow-hidden rounded-[20px] h-[110px] cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <div className="absolute top-3 left-4 right-4 z-10 flex justify-between items-start">
                    <span className="text-white font-[800] text-[17px] leading-tight drop-shadow-md max-w-[70%]">{cat.label}</span>
                    <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-md border border-white/10">
                      <Crown size={12} className="text-yellow-400" />
                    </div>
                  </div>
                  
                  <div className="absolute -bottom-4 right-2 text-[70px] drop-shadow-2xl group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500 ease-out">
                    {cat.icon}
                  </div>
                  
                  {/* Premium Glass highlight overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full">
            {/* Filter chips */}
            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1 w-full max-w-[100vw]">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-pill text-sm font-medium capitalize transition-all ${
                    activeFilter === f ? 'bg-accent text-white' : 'bg-surfaceRaised text-textSecondary'
                  }`}
                >
                  {f === 'all' ? 'All' : f}
                </button>
              ))}
            </div>

            {isFetching ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-card" />)}
              </div>
            ) : searchData?.apps?.length > 0 ? (
              <>
                <p className="text-textSecondary text-sm mb-4">{searchData.total} results for "{debouncedQuery}"</p>
                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20"
                  variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                  initial="hidden"
                  animate="show"
                >
                  {(() => {
                    const filteredApps = (searchData.apps || []).filter(app => {
                      const osStr = (app.minOS || '').toLowerCase()
                      return osStr.includes(selectedOS.toLowerCase())
                    });

                    return filteredApps.map((app) => (
                      <motion.div key={app.id} variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                        <SearchResultCard app={app} onClick={() => navigate(`/app/${app.id}`)} />
                      </motion.div>
                    ));
                  })()}
                </motion.div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center w-full px-4">
                <span className="text-6xl mb-4">🔍</span>
                <h3 className="text-xl font-bold mb-2">No Results</h3>
                <p className="text-textSecondary break-words w-full">No apps found for "{debouncedQuery}"</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
