import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Rocket, Bell, TrendingUp, Calendar, ChevronUp, Clock, CheckCircle2, Search, XCircle } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { launchpadApi } from '../services/api'
import toast from 'react-hot-toast'
import Navbar from '../components/layout/Navbar'
import AppIcon from '../components/ui/AppIcon'

// Countdown Component
const CountdownTimer = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('')
  const [isLaunched, setIsLaunched] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const distance = new Date(targetDate).getTime() - new Date().getTime()
      if (distance < 0) {
        clearInterval(timer)
        setIsLaunched(true)
        setTimeLeft('Launched!')
        return
      }
      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  if (isLaunched) {
    return <div className="text-[#30D158] font-bold flex items-center gap-1 text-sm"><CheckCircle2 className="w-4 h-4"/> Launched</div>
  }

  return <div className="font-mono text-[#FFD700] text-sm font-bold flex items-center gap-1"><Clock className="w-4 h-4 text-white/50" /> {timeLeft}</div>
}

export default function LaunchpadPage() {
  const queryClient = useQueryClient()
  const [sortMethod, setSortMethod] = useState('date') // 'date' or 'votes'
  const [notifyModal, setNotifyModal] = useState(null) // holds app id
  const [email, setEmail] = useState('')

  const { data: appsData, isLoading } = useQuery({
    queryKey: ['launchpad', sortMethod],
    queryFn: () => launchpadApi.getUpcoming(sortMethod).then(res => res.apps || [])
  })

  const voteMutation = useMutation({
    mutationFn: (id) => launchpadApi.vote(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['launchpad'])
      // Don't show toast for every upvote to make it feel seamless
    }
  })

  const notifyMutation = useMutation({
    mutationFn: ({ id, email }) => launchpadApi.notify(id, email),
    onSuccess: (res) => {
      toast.success(res.message || "You're on the list!", { icon: '📬' })
      setNotifyModal(null)
      setEmail('')
      queryClient.invalidateQueries(['launchpad'])
    },
    onError: (err) => toast.error(err.message || "Failed to subscribe")
  })

  const handleNotifySubmit = (e) => {
    e.preventDefault()
    notifyMutation.mutate({ id: notifyModal, email })
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-[#0A84FF] selection:text-white pb-24">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-32 pb-16 px-4 overflow-hidden border-b border-white/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-[#0A84FF]/20 to-transparent blur-[100px] pointer-events-none" />
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 text-white/70 border border-white/10 font-bold mb-6 backdrop-blur-md">
            <Rocket className="w-4 h-4 text-[#FF9F0A]" /> App Store Launchpad
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
            Discover What's Next.
          </h1>
          <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10">
            Be the first to know about upcoming startup apps. Upvote your favorites, get notified on launch day, and help shape the future of the App Store.
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setSortMethod('date')}
              className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${sortMethod === 'date' ? 'bg-white text-black' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
            >
              <Calendar className="w-5 h-5" /> Launch Date
            </button>
            <button 
              onClick={() => setSortMethod('votes')}
              className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all ${sortMethod === 'votes' ? 'bg-[#FF9F0A] text-black' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
            >
              <TrendingUp className="w-5 h-5" /> Most Upvoted
            </button>
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-white/5 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : appsData?.length === 0 ? (
          <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
            <Rocket className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Upcoming Launches</h2>
            <p className="text-white/50">Check back later for new startup apps coming to the store.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {appsData?.map((app, index) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  key={app.id} 
                  className="group relative bg-[#1C1C1E] hover:bg-[#2C2C2E] border border-white/5 hover:border-white/20 rounded-3xl p-6 transition-all shadow-xl hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-6 items-start md:items-center"
                >
                  {/* Upvote Button (Product Hunt Style) */}
                  <button 
                    onClick={() => voteMutation.mutate(app.id)}
                    className="absolute md:static top-6 right-6 shrink-0 flex flex-col items-center justify-center w-14 h-16 bg-white/5 hover:bg-[#FF9F0A]/20 border border-white/10 hover:border-[#FF9F0A]/50 rounded-2xl transition-all group/btn"
                  >
                    <ChevronUp className="w-6 h-6 text-white/50 group-hover/btn:text-[#FF9F0A] group-hover/btn:-translate-y-1 transition-all" />
                    <span className="font-bold text-white group-hover/btn:text-[#FF9F0A] leading-none mt-1">{app.votes}</span>
                  </button>

                  <AppIcon src={app.iconUrl} alt={app.name} size="w-20 h-20 md:w-24 md:h-24" className="rounded-2xl shadow-lg border border-white/10" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h2 className="text-2xl font-black truncate">{app.name}</h2>
                      <span className="px-2 py-1 bg-white/10 rounded-md text-xs font-bold uppercase tracking-wider text-white/50">{app.category}</span>
                    </div>
                    <p className="text-white/60 mb-3 text-sm md:text-base line-clamp-2">{app.shortDescription}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-white/40">by</span>
                      <span className="font-semibold text-white/80">{app.developer}</span>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end gap-4 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-0 border-white/10">
                    <CountdownTimer targetDate={app.launchDate} />
                    <button 
                      onClick={() => setNotifyModal(app.id)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#0A84FF]/10 hover:bg-[#0A84FF] text-[#0A84FF] hover:text-white border border-[#0A84FF]/30 rounded-xl font-bold transition-all"
                    >
                      <Bell className="w-4 h-4" /> Notify Me
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Notify Me Modal */}
      <AnimatePresence>
        {notifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setNotifyModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setNotifyModal(null)} className="absolute top-4 right-4 text-white/50 hover:text-white"><XCircle className="w-6 h-6" /></button>
              
              <div className="w-16 h-16 bg-[#0A84FF]/20 rounded-full flex items-center justify-center mb-6">
                <Bell className="w-8 h-8 text-[#0A84FF]" />
              </div>
              <h3 className="text-2xl font-black mb-2">Get Notified</h3>
              <p className="text-white/60 mb-8">We'll send you an email the exact moment this app launches on the store.</p>
              
              <form onSubmit={handleNotifySubmit} className="space-y-4">
                <input 
                  type="email" 
                  required 
                  autoFocus
                  placeholder="name@example.com" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-white placeholder-white/30 outline-none focus:border-[#0A84FF]"
                />
                <button 
                  type="submit" 
                  disabled={notifyMutation.isLoading}
                  className="w-full py-4 bg-[#0A84FF] hover:bg-[#0070E0] text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                >
                  {notifyMutation.isLoading ? 'Subscribing...' : 'Subscribe to Launch'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
