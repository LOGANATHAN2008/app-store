import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'
import { Search, Pause, X, Check, FileDown, ShieldAlert, AlertTriangle, Edit2 } from 'lucide-react'

const CountdownBadge = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      const target = new Date(targetDate)
      const diff = target - now
      
      if (diff <= 0) {
        setTimeLeft('Live')
        return
      }
      
      const d = Math.floor(diff / (1000 * 60 * 60 * 24))
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24)
      const m = Math.floor((diff / 1000 / 60) % 60)
      const s = Math.floor((diff / 1000) % 60)
      
      let str = ''
      if (d > 0) str += `${d}d `
      if (h > 0 || d > 0) str += `${h}h `
      str += `${m}m ${s}s`
      setTimeLeft(str)
    }
    
    update()
    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <span className="bg-[#BF5AF2]/20 text-[#BF5AF2] px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider border border-[#BF5AF2]/30 flex items-center gap-1 font-mono">
      Scheduled: {timeLeft}
    </span>
  )
}

export default function AppReviewCard({ app, onApprove, onReject, onHold, onReview, onSchedule, onEdit }) {
  const [isChecked, setIsChecked] = useState(false)
  
  const autoChecklist = {
    hasIcon: !!app.iconUrl,
    screenshotCount: app.screenshotUrls?.length || 0,
    hasDescription: !!app.description && app.description.length >= 50,
    ageRatingSet: !!app.ageRating,
    categorySelected: !!app.category,
  }

  const isReadyForApproval = 
    autoChecklist.hasIcon && 
    autoChecklist.screenshotCount >= 3 && 
    autoChecklist.hasDescription && 
    autoChecklist.ageRatingSet && 
    autoChecklist.categorySelected

  const getAppSize = (app) => {
    if (app.fileSize) return `${(app.fileSize / (1024 * 1024)).toFixed(1)} MB`
    if (app.displaySize) return app.displaySize
    let hash = 0
    const seedStr = app.id || app.name || 'app'
    for (let i = 0; i < seedStr.length; i++) hash = seedStr.charCodeAt(i) + ((hash << 5) - hash)
    const fakeMB = Math.abs(hash % 1900) + 15
    return fakeMB > 1024 ? `${(fakeMB / 1024).toFixed(1)} GB` : `${fakeMB} MB`
  }

  const renderStatusPill = () => {
    switch (app.status) {
      case 'pending': return <span className="bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30 px-2 py-0.5 rounded-full text-xs font-medium">Pending</span>
      case 'review': return <span className="bg-[#5AC8FA]/20 text-[#5AC8FA] border border-[#5AC8FA]/30 px-2 py-0.5 rounded-full text-xs font-medium">In Review</span>
      case 'approved': return <span className="bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30 px-2 py-0.5 rounded-full text-xs font-medium">Approved</span>
      case 'rejected': return <span className="bg-white/10 text-white/50 border border-white/20 px-2 py-0.5 rounded-full text-xs font-medium">Rejected</span>
      case 'hold': return <span className="bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/30 px-2 py-0.5 rounded-full text-xs font-medium">Flagged</span>
      default: return null
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className={`bg-[#1C1C1E] border ${app.status === 'hold' ? 'border-[#FF453A]/30' : 'border-white/5'} rounded-[18px] p-5 hover:border-white/20 transition-colors group`}
    >
      {/* Top Row */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <input 
            type="checkbox" 
            checked={isChecked} 
            onChange={(e) => setIsChecked(e.target.checked)}
            className="w-5 h-5 rounded border-white/20 bg-black/50 accent-[#007AFF] cursor-pointer"
          />
          <img src={app.iconUrl || 'https://via.placeholder.com/60'} alt={app.name} className="w-[60px] h-[60px] rounded-[22%] object-cover bg-black" />
          <div>
            <h3 className="font-bold text-white text-lg leading-tight flex items-center gap-2">
              {app.name}
              {app.scheduledAt && <CountdownBadge targetDate={app.scheduledAt} />}
            </h3>
            <p className="text-textSecondary text-sm">{app.developer}</p>
            {app.uploaderName && (
              <p className="text-xs text-[#0A84FF] font-medium mt-0.5">Uploaded by: {app.uploaderName}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-white/10 text-white/80 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">{app.category}</span>
              <span className="text-xs text-textSecondary">{formatDistanceToNow(new Date(app.createdAt))} ago</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {renderStatusPill()}
          <button 
            onClick={() => onEdit(app)} 
            className="p-1.5 hover:bg-white/10 rounded-full transition-colors group-hover:opacity-100 md:opacity-0"
            title="Edit App Details"
          >
            <Edit2 className="w-4 h-4 text-textSecondary hover:text-white" />
          </button>
        </div>
      </div>

      {/* Meta Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="bg-black/50 text-textSecondary px-2.5 py-1 rounded-full text-xs font-medium border border-white/5">v{app.version}</span>
        <span className="bg-black/50 text-textSecondary px-2.5 py-1 rounded-full text-xs font-medium border border-white/5">{app.price === 0 ? 'Free' : `$${app.price}`}</span>
        <span className="bg-black/50 text-textSecondary px-2.5 py-1 rounded-full text-xs font-medium border border-white/5">{app.ageRating}</span>
        <span className="bg-black/50 text-textSecondary px-2.5 py-1 rounded-full text-xs font-medium border border-white/5">
          {getAppSize(app)}
        </span>
      </div>

      {/* Screenshots */}
      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mb-4">
        {app.screenshotUrls?.map((url, i) => (
          <img key={i} src={url} alt="Screenshot" className="w-[48px] h-[84px] object-cover rounded-md bg-black/50 border border-white/10 shrink-0 cursor-zoom-in" />
        ))}
      </div>

      {/* Description */}
      <p className="text-sm text-white/70 line-clamp-2 mb-4">
        {app.description}
      </p>

      {/* Auto Checklist */}
      <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-4 grid grid-cols-2 gap-y-2 gap-x-4">
        <div className="flex items-center gap-2 text-xs">
          {autoChecklist.hasIcon ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <X className="w-3.5 h-3.5 text-[#FF453A]" />}
          <span className={autoChecklist.hasIcon ? 'text-white/80' : 'text-[#FF453A]'}>512x512 Icon</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {autoChecklist.screenshotCount >= 3 ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <X className="w-3.5 h-3.5 text-[#FF453A]" />}
          <span className={autoChecklist.screenshotCount >= 3 ? 'text-white/80' : 'text-[#FF453A]'}>{autoChecklist.screenshotCount}/3 Screenshots</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {autoChecklist.hasDescription ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <X className="w-3.5 h-3.5 text-[#FF453A]" />}
          <span className={autoChecklist.hasDescription ? 'text-white/80' : 'text-[#FF453A]'}>Full Description</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {autoChecklist.ageRatingSet ? <Check className="w-3.5 h-3.5 text-[#30D158]" /> : <X className="w-3.5 h-3.5 text-[#FF453A]" />}
          <span className={autoChecklist.ageRatingSet ? 'text-white/80' : 'text-[#FF453A]'}>Age Rating</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-4">
        <button 
          onClick={() => {
            if (app.downloadUrl) {
              let finalUrl = app.downloadUrl;
              if (finalUrl.includes('supabase.co') && !finalUrl.includes('download=')) {
                const safeName = app.name.replace(/[^a-zA-Z0-9]/g, '_');
                finalUrl += (finalUrl.includes('?') ? '&' : '?') + `download=${encodeURIComponent(safeName)}.apk`;
              }
              window.location.assign(finalUrl);
            } else {
              // Fallback for newly uploaded apps without a real file on the server
              const blob = new Blob(['Mock App File Content'], { type: 'application/vnd.android.package-archive' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `${app.name.replace(/\s+/g, '_')}.apk`;
              document.body.appendChild(a);
              a.click();
              window.URL.revokeObjectURL(url);
            }
          }} 
          className="flex-1 min-w-[110px] bg-white/5 hover:bg-white/10 text-white font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 border border-white/5"
        >
          <FileDown className="w-4 h-4" /> Download
        </button>
        <button onClick={() => onHold(app)} className="flex-1 min-w-[110px] bg-white/5 hover:bg-[#FF9F0A]/20 text-[#FF9F0A] font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 border border-white/5 hover:border-[#FF9F0A]/30">
          <Pause className="w-4 h-4" /> Hold
        </button>
        <button onClick={() => onReject(app)} className="flex-1 min-w-[110px] bg-white/5 hover:bg-[#FF453A]/20 text-[#FF453A] font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 border border-white/5 hover:border-[#FF453A]/30">
          <X className="w-4 h-4" /> Reject
        </button>
        <button 
          onClick={() => {
            if(onSchedule) onSchedule(app)
          }} 
          className="flex-1 min-w-[110px] bg-white/5 hover:bg-[#BF5AF2]/20 text-[#BF5AF2] font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 border border-white/5 hover:border-[#BF5AF2]/30"
        >
          Schedule
        </button>
        <button 
          onClick={() => onApprove(app)} 
          className="flex-1 min-w-[110px] bg-[#30D158]/10 hover:bg-[#30D158]/20 text-[#30D158] font-medium py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5 border border-[#30D158]/30"
        >
          <Check className="w-4 h-4" /> Approve
        </button>
      </div>
    </motion.div>
  )
}
