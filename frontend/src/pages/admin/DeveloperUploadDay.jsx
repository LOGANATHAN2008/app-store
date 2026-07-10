import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Link as LinkIcon, Plus, Copy, Share2, Trash2, QrCode, Shield, CheckCircle2, RefreshCw, XCircle, Clock } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { eventsApi } from '../../services/api'
import toast from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'

export default function DeveloperUploadDay() {
  const queryClient = useQueryClient()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(null)
  const [formData, setFormData] = useState({
    name: 'Today Special Developer Upload Event',
    description: 'Developers can submit apps for review during this limited-time event.',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
    limit: 100,
    categories: ['games', 'productivity', 'health', 'finance', 'social'],
    requireApproval: true,
  })

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['admin-events'],
    queryFn: () => eventsApi.getAll().then(res => res.events || [])
  })

  const createEventMutation = useMutation({
    mutationFn: (data) => eventsApi.create(data),
    onSuccess: () => {
      toast.success("Event created successfully!")
      queryClient.invalidateQueries(['admin-events'])
      setShowCreateModal(false)
    },
    onError: (err) => toast.error(err.message || "Failed to create event")
  })

  const generateLinkMutation = useMutation({
    mutationFn: (eventId) => eventsApi.generateLink(eventId),
    onSuccess: () => {
      toast.success("Unique Link Generated!")
      queryClient.invalidateQueries(['admin-events'])
    },
    onError: (err) => toast.error(err.message || "Failed to generate link")
  })

  const disableLinkMutation = useMutation({
    mutationFn: ({ eventId, linkId }) => eventsApi.disableLink(eventId, linkId),
    onSuccess: () => {
      toast.success("Link disabled successfully!")
      queryClient.invalidateQueries(['admin-events'])
    }
  })

  const handleCreateEvent = (e) => {
    e.preventDefault()
    createEventMutation.mutate(formData)
  }

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url)
    toast.success("Event link copied successfully", { icon: '✅' })
  }

  const handleShare = (url) => {
    if (navigator.share) {
      navigator.share({
        title: 'Developer Upload Event',
        text: '🚀 You are invited to participate in the Developer Upload Event. Upload your application for review and approval.\n\nEvent Link:',
        url: url
      }).catch(console.error)
    } else {
      handleCopy(url)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto text-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Calendar className="w-8 h-8 text-[#0A84FF]" /> 
            Developer Upload Day
          </h1>
          <p className="text-white/50 mt-1">Manage exclusive app submission events and generated links.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-[#0A84FF] hover:bg-[#0070E0] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-[#0A84FF]/20"
        >
          <Plus className="w-5 h-5" /> Create Event
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {isLoading ? (
          <div className="flex justify-center py-20"><RefreshCw className="w-10 h-10 animate-spin text-[#0A84FF]" /></div>
        ) : eventsData?.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
            <Calendar className="w-20 h-20 text-white/20 mb-6" />
            <h2 className="text-2xl font-bold mb-2">No Active Events</h2>
            <p className="text-white/50 max-w-md mb-8">Create a Developer Upload Day event to allow temporary submissions of unverified applications into the review queue.</p>
            <button onClick={() => setShowCreateModal(true)} className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-xl font-bold transition-all">Create First Event</button>
          </div>
        ) : (
          eventsData?.map(event => (
            <motion.div key={event.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 overflow-hidden relative">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-black text-[#FFD700]">{event.name}</h2>
                    {new Date(event.endTime) > new Date() ? (
                      <span className="bg-[#30D158]/20 text-[#30D158] text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Active</span>
                    ) : (
                      <span className="bg-[#FF453A]/20 text-[#FF453A] text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1"><XCircle className="w-3 h-3"/> Expired</span>
                    )}
                  </div>
                  <p className="text-white/60 mb-2">{event.description}</p>
                  <div className="flex items-center gap-4 text-sm text-white/40 font-mono">
                    <div className="flex items-center gap-1"><Clock className="w-4 h-4"/> Ends: {new Date(event.endTime).toLocaleString()}</div>
                    <div className="flex items-center gap-1"><Shield className="w-4 h-4"/> Limit: {event.limit || 'Unlimited'}</div>
                  </div>
                </div>
                
                <button 
                  onClick={() => generateLinkMutation.mutate(event.id)}
                  disabled={generateLinkMutation.isLoading || new Date(event.endTime) < new Date()}
                  className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                >
                  <LinkIcon className="w-4 h-4" /> Generate Link
                </button>
              </div>

              {/* Links Table */}
              <div className="bg-black/30 rounded-2xl border border-white/5 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-white/50 border-b border-white/5">
                    <tr>
                      <th className="p-4 font-semibold">Generated Link</th>
                      <th className="p-4 font-semibold text-center">Clicks</th>
                      <th className="p-4 font-semibold text-center">Submissions</th>
                      <th className="p-4 font-semibold text-center">Status</th>
                      <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {event.links?.length === 0 && (
                      <tr><td colSpan="5" className="p-8 text-center text-white/30 italic">No links generated yet.</td></tr>
                    )}
                    {event.links?.map(link => (
                      <tr key={link.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <div className="font-mono text-[#0A84FF] truncate max-w-[250px]" title={link.url}>{link.url}</div>
                          <div className="text-xs text-white/30 mt-1">Generated: {new Date(link.createdAt).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4 text-center font-bold">{link.clicks}</td>
                        <td className="p-4 text-center font-bold text-[#FFD700]">{link.submissions}</td>
                        <td className="p-4 text-center">
                          {link.status === 'active' && new Date(event.endTime) > new Date() ? (
                            <span className="inline-block w-2 h-2 rounded-full bg-[#30D158] shadow-[0_0_8px_#30D158]" title="Active"></span>
                          ) : (
                            <span className="inline-block w-2 h-2 rounded-full bg-[#FF453A]" title="Expired"></span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleCopy(link.url)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Copy Link"><Copy className="w-4 h-4" /></button>
                            <button onClick={() => handleShare(link.url)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="Share Link"><Share2 className="w-4 h-4" /></button>
                            <button onClick={() => setShowQRModal(link.url)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-colors" title="QR Code"><QrCode className="w-4 h-4" /></button>
                            {link.status === 'active' && (
                              <button onClick={() => disableLinkMutation.mutate({ eventId: event.id, linkId: link.id })} className="p-2 bg-white/5 hover:bg-[#FF453A]/20 rounded-lg text-[#FF453A] transition-colors" title="Disable Link"><Trash2 className="w-4 h-4" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1C1C1E] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                <h2 className="text-xl font-bold flex items-center gap-2"><Calendar className="w-5 h-5 text-[#0A84FF]"/> Create Upload Event</h2>
                <button onClick={() => setShowCreateModal(false)} className="text-white/50 hover:text-white"><XCircle className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Event Name</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none" placeholder="e.g. Weekend Developer Sprint" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-1">Description</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none min-h-[80px]" placeholder="Brief rules or description..."></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">Start Time</label>
                    <input required type="datetime-local" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">End Time</label>
                    <input required type="datetime-local" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-1">Submission Limit (0 = Unlimited)</label>
                    <input type="number" min="0" value={formData.limit} onChange={e => setFormData({...formData, limit: parseInt(e.target.value)})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none" />
                  </div>
                  <div className="flex flex-col justify-center mt-6">
                    <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                      <input type="checkbox" checked={formData.requireApproval} onChange={e => setFormData({...formData, requireApproval: e.target.checked})} className="w-5 h-5 accent-[#0A84FF]" />
                      <span className="font-medium">Require Admin Approval</span>
                    </label>
                  </div>
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="px-6 py-3 rounded-xl font-bold bg-white/10 hover:bg-white/20 transition-colors">Cancel</button>
                  <button type="submit" disabled={createEventMutation.isLoading} className="px-6 py-3 rounded-xl font-bold bg-[#0A84FF] hover:bg-[#0070E0] text-white transition-colors flex items-center gap-2">
                    {createEventMutation.isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                    Create Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowQRModal(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-6"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-black">Scan to Upload</h3>
              <div className="p-4 bg-white border-4 border-black rounded-xl">
                <QRCodeSVG value={showQRModal} size={256} fgColor="#000000" />
              </div>
              <button onClick={() => setShowQRModal(null)} className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-colors">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
