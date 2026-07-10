import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inbox, CheckCircle2, XCircle, Search, Eye, Filter, RefreshCw } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '../../services/api'
import toast from 'react-hot-toast'
import AppIcon from '../../components/ui/AppIcon'

export default function EventSubmissions() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('all') // all, pending, approved, rejected
  const [rejectModal, setRejectModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ['admin-event-submissions'],
    queryFn: () => eventsApi.getSubmissions().then(res => res.submissions || [])
  })

  const approveMutation = useMutation({
    mutationFn: (id) => eventsApi.approveSubmission(id),
    onSuccess: (data) => {
      toast.success("App Approved & Published to Store!")
      queryClient.invalidateQueries(['admin-event-submissions'])
    },
    onError: (err) => toast.error(err.message || "Approval failed")
  })

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => eventsApi.rejectSubmission(id, reason),
    onSuccess: () => {
      toast.success("App Rejected successfully.")
      queryClient.invalidateQueries(['admin-event-submissions'])
      setRejectModal(null)
      setRejectReason('')
    },
    onError: (err) => toast.error(err.message || "Rejection failed")
  })

  const handleApprove = (id) => {
    if (window.confirm("Approve this application and publish it to the App Store?")) {
      approveMutation.mutate(id)
    }
  }

  const handleReject = (e) => {
    e.preventDefault()
    if (!rejectReason.trim()) {
      toast.error("Please provide a rejection reason.")
      return
    }
    rejectMutation.mutate({ id: rejectModal, reason: rejectReason })
  }

  const filteredSubmissions = submissions.filter(s => {
    if (filter === 'all') return true
    return s.status === filter
  })

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Inbox className="w-8 h-8 text-[#0A84FF]" /> 
            Event Submissions
          </h1>
          <p className="text-white/50 mt-1">Review and manage apps submitted during Developer Upload Events.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl w-fit">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button 
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-2 rounded-lg font-medium capitalize transition-colors ${filter === f ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {isLoading ? (
          <div className="flex justify-center py-20"><RefreshCw className="w-10 h-10 animate-spin text-[#0A84FF]" /></div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
            <Inbox className="w-20 h-20 text-white/20 mb-6" />
            <h2 className="text-2xl font-bold mb-2">No Submissions Found</h2>
            <p className="text-white/50 max-w-md">No applications match the current filter.</p>
          </div>
        ) : (
          filteredSubmissions.map(sub => (
            <motion.div key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden group">
              <AppIcon src={sub.appData.iconUrl} alt={sub.appData.name} size={80} className="rounded-2xl shadow-lg border border-white/10 shrink-0" />
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center gap-3 mb-1 justify-center md:justify-start">
                  <h3 className="text-xl font-bold">{sub.appData.name}</h3>
                  {sub.status === 'pending' && <span className="text-[#FF9F0A] bg-[#FF9F0A]/10 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Pending</span>}
                  {sub.status === 'approved' && <span className="text-[#30D158] bg-[#30D158]/10 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Approved</span>}
                  {sub.status === 'rejected' && <span className="text-[#FF453A] bg-[#FF453A]/10 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">Rejected</span>}
                </div>
                <div className="text-[#0A84FF] font-medium mb-2">by {sub.appData.developer}</div>
                <div className="text-sm text-white/50 flex flex-wrap gap-4 justify-center md:justify-start">
                  <span>Category: <strong className="text-white capitalize">{sub.appData.category}</strong></span>
                  <span>Version: <strong className="text-white">{sub.appData.version}</strong></span>
                  <span>Submitted: <strong className="text-white">{new Date(sub.createdAt).toLocaleDateString()}</strong></span>
                </div>
                {sub.status === 'rejected' && (
                  <div className="mt-2 text-sm text-[#FF453A] bg-[#FF453A]/10 p-2 rounded-lg border border-[#FF453A]/20">
                    <strong>Reason:</strong> {sub.rejectReason}
                  </div>
                )}
              </div>

              {sub.status === 'pending' && (
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button 
                    onClick={() => handleApprove(sub.id)}
                    disabled={approveMutation.isLoading}
                    className="flex-1 md:flex-none px-6 py-3 bg-[#30D158]/10 hover:bg-[#30D158]/20 text-[#30D158] border border-[#30D158]/20 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Approve
                  </button>
                  <button 
                    onClick={() => setRejectModal(sub.id)}
                    className="flex-1 md:flex-none px-6 py-3 bg-[#FF453A]/10 hover:bg-[#FF453A]/20 text-[#FF453A] border border-[#FF453A]/20 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" /> Reject
                  </button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Reject Modal */}
      <AnimatePresence>
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1C1C1E] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2 text-[#FF453A]"><XCircle className="w-5 h-5"/> Reject Application</h2>
                <button onClick={() => setRejectModal(null)} className="text-white/50 hover:text-white"><XCircle className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleReject} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Reason for Rejection</label>
                  <select 
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF453A] outline-none appearance-none mb-3"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Incomplete Information">Incomplete Information</option>
                    <option value="Security Issue">Security Issue</option>
                    <option value="Policy Violation">Policy Violation</option>
                    <option value="Low Quality Submission">Low Quality Submission</option>
                    <option value="Other">Other</option>
                  </select>
                  {rejectReason === 'Other' && (
                    <textarea 
                      placeholder="Please specify..."
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#FF453A] outline-none min-h-[100px]"
                      onChange={(e) => setRejectReason(e.target.value)}
                    ></textarea>
                  )}
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setRejectModal(null)} className="px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition-colors">Cancel</button>
                  <button type="submit" disabled={rejectMutation.isLoading} className="px-6 py-3 rounded-xl font-bold bg-[#FF453A] hover:bg-[#D70015] text-white transition-colors flex items-center gap-2">
                    {rejectMutation.isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                    Confirm Rejection
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
