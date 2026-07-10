import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle } from 'lucide-react'
import { toast } from 'react-hot-toast'

const REASONS = [
  "Incomplete screenshots",
  "Missing privacy policy",
  "Suspicious APK permissions",
  "Low quality content",
  "Duplicate app",
  "Policy violation",
  "Incorrect age rating",
  "Missing description"
]

export default function RejectModal({ isOpen, onClose, onConfirm, app }) {
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!isOpen) setReason('')
  }, [isOpen])

  const handleSubmit = () => {
    if (reason.length < 10) {
      toast.error('Rejection reason must be at least 10 characters')
      return
    }
    onConfirm(reason)
  }

  return (
    <AnimatePresence>
      {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center"
            onClick={onClose}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xl bg-[#1C1C1E] border border-white/10 rounded-t-3xl md:rounded-3xl p-6 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl"
            >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF453A]/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-[#FF453A]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Reject App</h2>
                  <p className="text-sm text-textSecondary">Developer will be notified with this reason</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-textSecondary" />
              </button>
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {REASONS.map(r => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-white/30 text-sm text-white/80 transition-colors active:scale-95"
                  >
                    {r}
                  </button>
                ))}
              </div>
              
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Detailed rejection reason..."
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder:text-textSecondary outline-none focus:border-[#FF453A] transition-colors resize-y min-h-[120px]"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSubmit}
                className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#FF453A] hover:bg-[#FF453A]/90 transition-colors shadow-lg shadow-[#FF453A]/20"
              >
                Confirm Reject
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
