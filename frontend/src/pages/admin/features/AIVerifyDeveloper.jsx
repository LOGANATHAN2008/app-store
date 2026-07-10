import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, ArrowLeft, Search, CheckCircle2, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appsApi } from '../../../services/api'

export default function AIVerifyDeveloper() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  // Fetch real apps
  const { data: allApps = [], isLoading } = useQuery({
    queryKey: ['admin-apps-verify'],
    queryFn: () => appsApi.getAll({ limit: 1000 }).then(r => r.apps || [])
  })

  const [selectedAppId, setSelectedAppId] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)

  // Default selection
  useEffect(() => {
    if (allApps.length > 0 && !selectedAppId) {
      setSelectedAppId(allApps[0].id)
    }
  }, [allApps, selectedAppId])

  useEffect(() => {
    if (selectedAppId && allApps.length > 0) {
      setSelectedApp(allApps.find(a => a.id === selectedAppId))
    }
  }, [selectedAppId, allApps])

  const verifyMutation = useMutation({
    mutationFn: ({ id, isDeveloperVerified }) => appsApi.update(id, { isDeveloperVerified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-apps-verify'] })
      toast.success("Developer Verification Updated!")
    },
    onError: () => {
      toast.error("Failed to update verification status")
    }
  })

  const handleToggleVerification = () => {
    if (!selectedApp) return;
    const newStatus = !selectedApp.isDeveloperVerified;
    verifyMutation.mutate({ id: selectedApp.id, isDeveloperVerified: newStatus })
  }

  return (
    <div className="max-w-4xl mx-auto pb-24 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-4 py-6 sticky top-0 bg-black/80 backdrop-blur-xl z-30 mb-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BadgeCheck className="w-6 h-6 text-[#0A84FF]" /> Developer Verification
            </h1>
            <p className="text-textSecondary text-sm">Grant verified developer badges to trusted apps.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls Column */}
        <div className="space-y-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Search className="w-5 h-5 text-[#0A84FF]" /> Select App</h2>
            <div className="space-y-4">
              <div>
                <select 
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  disabled={isLoading || allApps.length === 0}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#0A84FF] transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <option value="">Loading apps...</option>
                  ) : allApps.length === 0 ? (
                    <option value="">No apps available</option>
                  ) : (
                    allApps.map(app => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              {selectedApp && (
                <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-3">
                  <img src={selectedApp.iconUrl} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                  <div>
                    <div className="font-bold text-sm text-white/90">{selectedApp.name}</div>
                    <div className="text-xs text-textSecondary font-medium font-mono truncate max-w-[150px]">
                      {selectedApp.developerName || selectedApp.developer || 'Unknown Developer'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Column */}
        <div className="space-y-6">
           {selectedApp && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden"
             >
                <div className={`absolute inset-0 opacity-10 bg-gradient-to-b ${selectedApp.isDeveloperVerified ? 'from-[#0A84FF]' : 'from-transparent'} to-transparent`} />
                
                <div className="relative z-10 w-full flex flex-col items-center">
                  <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10 relative">
                     {selectedApp.isDeveloperVerified ? (
                       <BadgeCheck className="w-12 h-12 text-[#0A84FF]" />
                     ) : (
                       <BadgeCheck className="w-12 h-12 text-white/20" />
                     )}
                  </div>
                  
                  <h3 className="text-xl font-bold mb-2">Verified Status</h3>
                  
                  {selectedApp.isDeveloperVerified ? (
                     <div className="flex items-center gap-2 text-[#0A84FF] bg-[#0A84FF]/10 px-4 py-2 rounded-full font-bold mb-6 border border-[#0A84FF]/20">
                       <CheckCircle2 className="w-5 h-5" /> Officially Verified
                     </div>
                  ) : (
                     <div className="flex items-center gap-2 text-textSecondary bg-white/5 px-4 py-2 rounded-full font-bold mb-6 border border-white/10">
                       <XCircle className="w-5 h-5" /> Not Verified
                     </div>
                  )}
                  
                  <p className="text-sm text-textSecondary mb-8">
                    {selectedApp.isDeveloperVerified 
                      ? "This app and its developer currently display the blue Verified Badge across the entire store." 
                      : "Click the button below to grant this app the blue Verified Badge across the storefront."}
                  </p>
                  
                  <button 
                    onClick={handleToggleVerification}
                    disabled={verifyMutation.isPending}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                      selectedApp.isDeveloperVerified 
                        ? 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                        : 'bg-[#0A84FF] hover:bg-[#0070DF] text-white shadow-[#0A84FF]/30 border border-[#0A84FF]'
                    }`}
                  >
                    {verifyMutation.isPending ? (
                      <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Processing...</>
                    ) : selectedApp.isDeveloperVerified ? (
                      "Revoke Verification"
                    ) : (
                      <><BadgeCheck className="w-5 h-5" /> Grant Verified Badge</>
                    )}
                  </button>
                </div>
             </motion.div>
           )}
        </div>
      </div>
    </div>
  )
}
