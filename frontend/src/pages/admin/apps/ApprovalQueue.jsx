import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { io } from 'socket.io-client'
import CountUp from 'react-countup'
import { ArrowLeft, Search, Check, X, ShieldAlert, Pause } from 'lucide-react'
import { queueApi, appsApi } from '../../../services/api'
import AppReviewCard from './queue/AppReviewCard'
import RejectModal from './queue/RejectModal'
import EditModal from './queue/EditModal'
// Assuming a ReviewModal exists or will be implemented shortly
// import ReviewModal from './queue/ReviewModal'

export default function ApprovalQueue() {
  const queryClient = useQueryClient()
  
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  const [selectedApp, setSelectedApp] = useState(null)
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const [iosConfirm, setIosConfirm] = useState({ isOpen: false, app: null })
  const [iosPrompt, setIosPrompt] = useState({ isOpen: false, app: null, reason: '' })
  const [iosSchedule, setIosSchedule] = useState({ isOpen: false, app: null, date: '' })
  
  const tabs = ['All', 'Pending', 'In Review', 'Flagged', 'Approved', 'Rejected']

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  }, [search])

  // Socket setup
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001')
    
    socket.on('app:approved', () => {
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] })
      queryClient.invalidateQueries({ queryKey: ['admin-queue-stats'] })
    })
    
    socket.on('app:rejected', () => {
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] })
      queryClient.invalidateQueries({ queryKey: ['admin-queue-stats'] })
    })
    
    return () => socket.disconnect()
  }, [queryClient])

  // Fetch data
  const { data: queue = [], isLoading } = useQuery({
    queryKey: ['admin-queue'],
    queryFn: () => queueApi.getQueue().then(res => res)
  })

  const { data: stats = { pending: 0, approved: 0, rejected: 0 } } = useQuery({
    queryKey: ['admin-queue-stats'],
    queryFn: () => queueApi.getStats().then(res => res)
  })

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id) => queueApi.approve(id),
    onSuccess: () => {
      toast.success('App approved and published!', { icon: '✅' })
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] })
      queryClient.invalidateQueries({ queryKey: ['admin-queue-stats'] })
    }
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => queueApi.reject(id, reason),
    onSuccess: () => {
      toast.success('App rejected. Developer notified.')
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] })
      queryClient.invalidateQueries({ queryKey: ['admin-queue-stats'] })
      setIsRejectModalOpen(false)
    }
  })

  const holdMutation = useMutation({
    mutationFn: ({ id, reason }) => queueApi.hold(id, reason),
    onSuccess: () => {
      toast.success('App put on hold.')
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] })
      queryClient.invalidateQueries({ queryKey: ['admin-queue-stats'] })
    }
  })

  const scheduleMutation = useMutation({
    mutationFn: ({ id, date }) => queueApi.schedule(id, date),
    onSuccess: () => {
      toast.success('App scheduled successfully.')
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] })
      queryClient.invalidateQueries({ queryKey: ['admin-queue-stats'] })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => appsApi.update(id, data),
    onSuccess: () => {
      toast.success('App updated successfully.')
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] })
      setIsEditModalOpen(false)
    }
  })

  // Handlers
  const handleApprove = (app) => {
    setIosConfirm({ isOpen: true, app })
  }

  const confirmApprove = () => {
    if (iosConfirm.app) {
      approveMutation.mutate(iosConfirm.app.id)
      setIosConfirm({ isOpen: false, app: null })
    }
  }

  const handleRejectClick = (app) => {
    setSelectedApp(app)
    setIsRejectModalOpen(true)
  }

  const handleEditClick = (app) => {
    setSelectedApp(app)
    setIsEditModalOpen(true)
  }

  const handleHoldClick = (app) => {
    setIosPrompt({ isOpen: true, app, reason: '' })
  }

  const confirmHold = () => {
    if (iosPrompt.app) {
      holdMutation.mutate({ id: iosPrompt.app.id, reason: iosPrompt.reason })
      setIosPrompt({ isOpen: false, app: null, reason: '' })
    }
  }

  const handleScheduleClick = (app) => {
    setIosSchedule({ isOpen: true, app, date: '' })
  }

  const confirmSchedule = () => {
    if (iosSchedule.app && iosSchedule.date) {
      scheduleMutation.mutate({ id: iosSchedule.app.id, date: new Date(iosSchedule.date).toISOString() })
      setIosSchedule({ isOpen: false, app: null, date: '' })
    }
  }

  // Filtering
  const filteredQueue = queue.filter(app => {
    if (activeTab !== 'All') {
      if (activeTab === 'In Review' && app.status !== 'review') return false
      if (activeTab !== 'In Review' && app.status !== activeTab.toLowerCase()) return false
    }
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase()
      if (!app.name.toLowerCase().includes(s) && !app.developer.toLowerCase().includes(s)) return false
    }
    return true
  })

  return (
    <div className="max-w-6xl mx-auto pb-24 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold tracking-tight">Approval Queue</h1>
          {stats.pending > 0 && (
            <motion.span 
              key={stats.pending}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#FF453A] text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg shadow-[#FF453A]/20"
            >
              {stats.pending} Pending
            </motion.span>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
          <p className="text-textSecondary text-sm font-medium uppercase tracking-wider mb-2">Pending</p>
          <div className="text-4xl font-bold text-[#FF9F0A]">
            <CountUp end={stats.pending} duration={1} />
          </div>
        </div>
        <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
          <p className="text-textSecondary text-sm font-medium uppercase tracking-wider mb-2">Approved</p>
          <div className="text-4xl font-bold text-[#30D158]">
            <CountUp end={stats.approved} duration={1} />
          </div>
        </div>
        <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
          <p className="text-textSecondary text-sm font-medium uppercase tracking-wider mb-2">Rejected</p>
          <div className="text-4xl font-bold text-[#FF453A]">
            <CountUp end={stats.rejected} duration={1} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto custom-scrollbar pb-2 md:pb-0">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
                activeTab === tab 
                  ? 'bg-[#007AFF]/20 border-[#007AFF] text-[#007AFF]' 
                  : 'bg-[#1C1C1E] border-white/5 text-textSecondary hover:text-white hover:border-white/20'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by app or developer..." 
            className="w-full bg-[#1C1C1E] border border-white/10 rounded-full pl-10 pr-10 py-2.5 text-sm text-white outline-none focus:border-[#007AFF] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-textSecondary hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-20 text-textSecondary animate-pulse">Loading queue...</div>
        ) : filteredQueue.length === 0 ? (
          <div className="text-center py-20 text-textSecondary">
            <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
            No apps found for this filter.
          </div>
        ) : (
          <AnimatePresence>
            {filteredQueue.map((app, i) => (
              <AppReviewCard 
                key={app.id} 
                app={app} 
                onApprove={handleApprove}
                onReject={handleRejectClick}
                onHold={handleHoldClick}
                onSchedule={handleScheduleClick}
                onEdit={handleEditClick}
                onReview={(a) => { setSelectedApp(a); setIsReviewModalOpen(true); }}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      <RejectModal 
        isOpen={isRejectModalOpen} 
        onClose={() => setIsRejectModalOpen(false)} 
        app={selectedApp}
        onConfirm={(reason) => rejectMutation.mutate({ id: selectedApp?.id, reason })}
      />

      <EditModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        app={selectedApp}
        onConfirm={(data) => updateMutation.mutate({ id: selectedApp?.id, data })}
      />

      {/* ── iOS Style Confirm Modal ── */}
      <AnimatePresence>
        {iosConfirm.isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-[#2C2C2E] w-[270px] rounded-[14px] flex flex-col items-center overflow-hidden"
            >
              <div className="p-4 text-center">
                <h3 className="text-[17px] font-semibold text-white tracking-tight leading-tight mb-1">
                  Approve {iosConfirm.app?.name}?
                </h3>
                <p className="text-[13px] text-[#EBEBF5]/60 leading-tight">
                  It will go live immediately.
                </p>
              </div>
              <div className="w-full flex border-t border-white/10">
                <button
                  onClick={() => setIosConfirm({ isOpen: false, app: null })}
                  className="flex-1 py-[11px] text-[17px] font-normal text-[#0A84FF] border-r border-white/10 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApprove}
                  className="flex-1 py-[11px] text-[17px] font-semibold text-[#0A84FF] hover:bg-white/5 transition-colors"
                >
                  Approve
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── iOS Style Prompt Modal ── */}
      <AnimatePresence>
        {iosPrompt.isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-[#2C2C2E] w-[270px] rounded-[14px] flex flex-col items-center overflow-hidden"
            >
              <div className="p-4 w-full text-center">
                <h3 className="text-[17px] font-semibold text-white tracking-tight leading-tight mb-1">
                  Hold App
                </h3>
                <p className="text-[13px] text-[#EBEBF5]/60 leading-tight mb-4">
                  Reason for hold (optional):
                </p>
                <input
                  autoFocus
                  type="text"
                  value={iosPrompt.reason}
                  onChange={(e) => setIosPrompt({ ...iosPrompt, reason: e.target.value })}
                  className="w-full bg-[#1C1C1E] border border-white/10 rounded-[6px] px-2 py-1.5 text-[13px] text-white outline-none focus:border-[#0A84FF]"
                />
              </div>
              <div className="w-full flex border-t border-white/10">
                <button
                  onClick={() => setIosPrompt({ isOpen: false, app: null, reason: '' })}
                  className="flex-1 py-[11px] text-[17px] font-normal text-[#0A84FF] border-r border-white/10 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmHold}
                  className="flex-1 py-[11px] text-[17px] font-semibold text-[#0A84FF] hover:bg-white/5 transition-colors"
                >
                  OK
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── iOS Style Schedule Modal ── */}
      <AnimatePresence>
        {iosSchedule.isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="bg-[#2C2C2E] w-[300px] rounded-[14px] flex flex-col items-center overflow-hidden"
            >
              <div className="p-4 w-full text-center">
                <h3 className="text-[17px] font-semibold text-white tracking-tight leading-tight mb-1">
                  Schedule App
                </h3>
                <p className="text-[13px] text-[#EBEBF5]/60 leading-tight mb-4">
                  Select a date and time for {iosSchedule.app?.name} to go live:
                </p>
                <input
                  autoFocus
                  type="datetime-local"
                  value={iosSchedule.date}
                  onChange={(e) => setIosSchedule({ ...iosSchedule, date: e.target.value })}
                  className="w-full bg-[#1C1C1E] border border-white/10 rounded-[6px] px-2 py-1.5 text-[13px] text-white outline-none focus:border-[#0A84FF]"
                />
              </div>
              <div className="w-full flex border-t border-white/10">
                <button
                  onClick={() => setIosSchedule({ isOpen: false, app: null, date: '' })}
                  className="flex-1 py-[11px] text-[17px] font-normal text-[#0A84FF] border-r border-white/10 hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSchedule}
                  disabled={!iosSchedule.date}
                  className="flex-1 py-[11px] text-[17px] font-semibold text-[#0A84FF] hover:bg-white/5 transition-colors disabled:opacity-50"
                >
                  Schedule
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
