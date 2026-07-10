import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Link as LinkIcon, Clock, CheckCircle2, Save, Trash2, Power, Plus } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { promoApi, uploadApi } from '../../../services/api'
import toast from 'react-hot-toast'

export default function PromotionsManager() {
  const queryClient = useQueryClient()
  const [ads, setAds] = useState([])
  const [isUploading, setIsUploading] = useState(false)

  const { data: serverAds, isLoading } = useQuery({
    queryKey: ['admin-promos'],
    queryFn: () => promoApi.getAds()
  })

  useEffect(() => {
    if (serverAds && serverAds.popupAds) {
      setAds(serverAds.popupAds)
    }
  }, [serverAds])

  const saveAds = useMutation({
    mutationFn: (newAds) => promoApi.updateAds({ ...serverAds, popupAds: newAds }),
    onSuccess: () => {
      toast.success('Advertisements saved successfully!')
      queryClient.invalidateQueries({ queryKey: ['admin-promos'] })
    },
    onError: (error) => {
      toast.error('Failed to save ads: ' + error.message)
    }
  })

  const handleSave = () => {
    saveAds.mutate(ads)
  }

  const handleAddAd = () => {
    setAds([
      ...ads, 
      { id: Date.now().toString(), name: `New Ad ${ads.length + 1}`, active: false, imageUrl: '', linkUrl: '', delaySeconds: 5 }
    ])
  }

  const handleDeleteAd = (id) => {
    setAds(ads.filter(a => a.id !== id))
  }

  const handleUpdateAd = (id, updates) => {
    setAds(ads.map(a => a.id === id ? { ...a, ...updates } : a))
  }

  const handleUploadImage = async (e, id) => {
    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const toastId = toast.loading('Uploading ad image...')
    try {
      const res = await uploadApi.banner(file)
      handleUpdateAd(id, { imageUrl: res.url })
      toast.success('Image uploaded!', { id: toastId })
    } catch (err) {
      toast.error('Upload failed: ' + (err.response?.data?.error || err.message), { id: toastId })
    } finally {
      setIsUploading(false)
    }
  }

  if (isLoading) return <div className="text-white">Loading ad settings...</div>

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Advertisement Manager</h1>
          <p className="text-textSecondary text-sm">Configure multiple popup ads. The system will randomly pick one active ad to show per user session.</p>
        </div>
        <button 
          onClick={handleAddAd}
          className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" /> Add New Ad
        </button>
      </div>

      <AnimatePresence>
        {ads.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-8 text-center bg-[#1C1C1E] border border-white/10 rounded-2xl"
          >
            <p className="text-white/50 mb-4">No advertisements configured yet.</p>
            <button onClick={handleAddAd} className="text-[#007AFF] font-medium hover:underline">Create your first Ad</button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {ads.map((ad, index) => (
            <motion.div 
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`bg-[#1C1C1E] border ${ad.active ? 'border-[#007AFF]/50 shadow-[0_0_15px_rgba(0,122,255,0.1)]' : 'border-white/10'} rounded-2xl p-6 transition-all duration-300`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-6 border-b border-white/10 gap-4">
                <div className="flex-1">
                  <input 
                    type="text" 
                    value={ad.name || `Advertisement ${index + 1}`}
                    onChange={e => handleUpdateAd(ad.id, { name: e.target.value })}
                    className="bg-transparent border-none text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-[#007AFF] rounded-md px-2 py-1 -ml-2 w-full"
                    placeholder="Ad Name (e.g. Summer Sale)"
                  />
                  <p className="text-xs text-white/40 mt-1">Internal name, not visible to users.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleUpdateAd(ad.id, { active: !ad.active })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-all ${
                      ad.active ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                    {ad.active ? 'ACTIVE' : 'OFF'}
                  </button>
                  <button 
                    onClick={() => handleDeleteAd(ad.id)}
                    className="p-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                    title="Delete Ad"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Ad Banner Image</label>
                  <div className="relative h-48 rounded-xl border-2 border-dashed border-white/20 bg-black/50 overflow-hidden group flex items-center justify-center">
                    {ad.imageUrl ? (
                      <>
                        <img src={ad.imageUrl} className="w-full h-full object-cover" alt="Ad Preview" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <label className="cursor-pointer bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full backdrop-blur-md text-white font-medium text-sm flex items-center gap-2">
                            <Upload className="w-4 h-4" /> Change Image
                            <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e, ad.id)} className="hidden" disabled={isUploading} />
                          </label>
                        </div>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center text-white/50 hover:text-white transition-colors w-full h-full">
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm font-medium">Click to upload ad banner</span>
                        <input type="file" accept="image/*" onChange={(e) => handleUploadImage(e, ad.id)} className="hidden" disabled={isUploading} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Target Link */}
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Target URL (Link Button)</label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input 
                        type="text" 
                        value={ad.linkUrl || ''}
                        onChange={e => handleUpdateAd(ad.id, { linkUrl: e.target.value })}
                        placeholder="https://example.com/promo"
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-[#007AFF] outline-none"
                      />
                    </div>
                  </div>

                  {/* Delay Timer */}
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Show Delay (Seconds)</label>
                    <div className="relative w-full">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                      <input 
                        type="number" 
                        min="0"
                        value={ad.delaySeconds !== undefined ? ad.delaySeconds : 5}
                        onChange={e => handleUpdateAd(ad.id, { delaySeconds: parseInt(e.target.value) || 0 })}
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:border-[#007AFF] outline-none"
                      />
                    </div>
                    <p className="text-xs text-white/40 mt-1">Wait this long before showing.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {ads.length > 0 && (
        <div className="sticky bottom-4 z-10 pt-6 flex justify-end">
          <div className="bg-[#1C1C1E]/80 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">
            <button 
              onClick={handleSave}
              disabled={saveAds.isPending}
              className="bg-[#007AFF] hover:bg-[#007AFF]/90 text-white px-8 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {saveAds.isPending ? 'Saving...' : 'Save All Advertisements'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
