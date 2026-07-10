import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react'
import { format, formatDistanceToNow, addDays, isPast } from 'date-fns'

export default function ScheduleModal({ isOpen, onClose, onConfirm, app }) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [scheduledDate, setScheduledDate] = useState(null)

  useEffect(() => {
    if (isOpen) {
      // Default to tomorrow at noon
      const tomorrow = addDays(new Date(), 1)
      tomorrow.setHours(12, 0, 0, 0)
      setDate(format(tomorrow, 'yyyy-MM-dd'))
      setTime('12:00')
      setScheduledDate(tomorrow)
    }
  }, [isOpen])

  useEffect(() => {
    if (date && time) {
      const parsed = new Date(`${date}T${time}`)
      setScheduledDate(parsed)
    }
  }, [date, time])

  const handleConfirm = () => {
    if (!scheduledDate || isNaN(scheduledDate.getTime())) return
    onConfirm(scheduledDate.toISOString())
  }

  const isValid = scheduledDate && !isPast(scheduledDate)

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-40%' }}
            animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, y: '-40%', x: '-50%' }}
            style={{ position: 'fixed', top: '50%', left: '50%' }}
            className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 z-50 w-[90%] max-w-md shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Schedule Update</h2>
                <p className="text-sm text-textSecondary">Set a future time for the update to go live.</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-textSecondary" />
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-textSecondary" /> Date
                </label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#007AFF] color-scheme-dark" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white/80 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-textSecondary" /> Time
                </label>
                <input 
                  type="time" 
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#007AFF] color-scheme-dark" 
                />
              </div>
            </div>

            <div className="bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-xl p-4 mb-6">
              <p className="text-[#007AFF] text-sm font-medium">
                {isValid ? (
                  <>Update will go live in {formatDistanceToNow(scheduledDate)}.</>
                ) : (
                  <span className="text-[#FF453A]">Please select a future time.</span>
                )}
              </p>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 rounded-xl font-medium text-white bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirm}
                disabled={!isValid}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-[#007AFF] hover:bg-[#007AFF]/90 transition-colors disabled:opacity-50 shadow-lg shadow-[#007AFF]/20"
              >
                Schedule Update
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
