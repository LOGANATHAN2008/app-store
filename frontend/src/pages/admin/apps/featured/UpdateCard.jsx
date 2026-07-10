import { useState } from 'react'
import { Clock, Zap } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updatesApi } from '../../../../services/api'
import ScheduleModal from './ScheduleModal'

export default function UpdateCard({ app }) {
  const queryClient = useQueryClient()
  const [version, setVersion] = useState('')
  const [fileSize, setFileSize] = useState('')
  const [changelog, setChangelog] = useState('')
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)

  const pushMutation = useMutation({
    mutationFn: (data) => updatesApi.pushUpdate(app.id, data),
    onSuccess: () => {
      toast.success('Update pushed! Users notified.')
      queryClient.invalidateQueries(['admin-apps'])
      setVersion('')
      setFileSize('')
      setChangelog('')
    }
  })

  const handlePush = () => {
    if (!version) return toast.error("New Version is required")
    if (changelog.length < 10) return toast.error("What's New must be at least 10 characters")
    
    pushMutation.mutate({ version, changelog, fileSize })
  }

  const handleSchedule = (scheduledAt) => {
    if (!version) return toast.error("New Version is required")
    if (changelog.length < 10) return toast.error("What's New must be at least 10 characters")
    
    pushMutation.mutate({ version, changelog, fileSize, scheduledAt })
    setIsScheduleOpen(false)
  }

  return (
    <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
      {/* Card Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <img src={app.iconUrl} alt="" className="w-14 h-14 rounded-xl bg-black" />
          <div>
            <h3 className="font-bold text-lg">{app.name}</h3>
            <p className="text-textSecondary text-sm">{app.developer}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="bg-white/10 px-3 py-1 rounded-full text-sm border border-white/5 text-white/80">v{app.version}</span>
          {app.scheduledAt ? (
            <span className="bg-[#5AC8FA]/20 text-[#5AC8FA] border border-[#5AC8FA]/30 px-3 py-1 rounded-full text-sm font-medium">Scheduled</span>
          ) : app.versionHistory?.length > 0 ? (
            <span className="bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/30 px-3 py-1 rounded-full text-sm font-medium">Live</span>
          ) : (
            <span className="bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30 px-3 py-1 rounded-full text-sm font-medium">Pending Update</span>
          )}
        </div>
      </div>

      {/* Update Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-textSecondary mb-1.5">New Version *</label>
            <input 
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#007AFF]" 
              placeholder="e.g. 1.1.0" 
            />
          </div>
          <div>
            <label className="block text-sm text-textSecondary mb-1.5">File Size (MB)</label>
            <input 
              value={fileSize}
              onChange={(e) => setFileSize(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-[#007AFF]" 
              placeholder="45.5" 
            />
          </div>
        </div>
        <div>
          <label className="block text-sm text-textSecondary mb-1.5">What's New *</label>
          <textarea 
            rows={3} 
            value={changelog}
            onChange={(e) => setChangelog(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#007AFF] resize-none" 
            placeholder="Bug fixes and performance improvements..." 
          />
        </div>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsScheduleOpen(true)} className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium flex items-center gap-2 transition-colors">
              <Clock className="w-4 h-4" /> Schedule
            </button>
          </div>
          <button 
            onClick={handlePush}
            disabled={pushMutation.isPending}
            className="px-6 py-2.5 rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/90 text-white font-bold flex items-center gap-2 transition-colors shadow-lg shadow-[#007AFF]/20 disabled:opacity-50"
          >
            {pushMutation.isPending && !isScheduleOpen ? <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : <Zap className="w-4 h-4" />}
            Push Update Now
          </button>
        </div>
      </div>

      <ScheduleModal 
        isOpen={isScheduleOpen} 
        onClose={() => setIsScheduleOpen(false)} 
        onConfirm={handleSchedule}
        app={app} 
      />
    </div>
  )
}
