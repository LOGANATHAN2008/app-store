import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Edit3, Trash2, Smartphone, Download, Star, X, Link, Upload, CheckCircle } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { appsApi, uploadApi } from '../../../services/api'
import { useAuthStore } from '../../../store'
import toast from 'react-hot-toast'
import PageLoader from '../../../components/ui/PageLoader'

export default function AppHistory() {
  const { user } = useAuthStore()
  const qc = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [editingApp, setEditingApp] = useState(null)
  const [bannerUrl, setBannerUrl] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [iconUrl, setIconUrl] = useState('')
  const [averageRating, setAverageRating] = useState(0)
  const [reviewCount, setReviewCount] = useState(0)
  const [ageRating, setAgeRating] = useState('4+')
  const [installCount, setInstallCount] = useState(0)
  const [isSaving, setIsSaving] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-apps-history'],
    queryFn: () => appsApi.getAll({ limit: 1000, includeUnapproved: true })
  })

  if (isLoading) return <PageLoader />

  // Only show apps uploaded by this staff member (we assume uploaderId is in the app object, or we just mock it for now)
  // For the sake of the demo, if they are staff, they see a filtered list. If admin, they see all?
  // The requirement says "ENNA ENNA APP UPOLODE PANAKOLO ATHU LA VARANUMM", meaning "show apps uploaded by them".
  const allApps = data?.apps || []
  
  const myApps = allApps.filter(a => user?.isAdmin || a.uploaderId === user?.id)
  
  const filteredApps = myApps.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleEditClick = (app) => {
    setEditingApp(app)
    setBannerUrl(app.bannerUrl || '')
    setWebsiteUrl(app.websiteUrl || '')
    setIconUrl(app.iconUrl || '')
    setAverageRating(app.averageRating || 0)
    setReviewCount(app.reviewCount || 0)
    setAgeRating(app.ageRating || '4+')
    setInstallCount(app.installCount || 0)
  }

  const handleSaveBanner = async () => {
    if (!editingApp) return;
    setIsSaving(true)
    try {
      await appsApi.update(editingApp.id, { 
        bannerUrl, websiteUrl, iconUrl, 
        averageRating: Number(averageRating), 
        reviewCount: Number(reviewCount), 
        ageRating, 
        installCount: Number(installCount) 
      })
      toast.success('App updated successfully!')
      setEditingApp(null)
      refetch()
      qc.invalidateQueries(['search'])
    } catch (err) {
      toast.error('Failed to update banner')
    } finally {
      setIsSaving(false)
    }
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return;
    toast.loading('Uploading banner...', { id: 'bannerUpload' })
    try {
      const res = await uploadApi.banner(file)
      if (res && res.url) {
        setBannerUrl(res.url);
        toast.success('Banner uploaded successfully!', { id: 'bannerUpload' })
      } else {
        throw new Error('No URL returned')
      }
    } catch (err) {
      toast.error('Failed to upload banner', { id: 'bannerUpload' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload History</h1>
          <p className="text-textSecondary text-sm">Apps you have submitted for publishing</p>
        </div>
        
        <div className="relative">
          <input
            type="text"
            placeholder="Search your apps..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 bg-[#1C1C1E] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#0A84FF] transition-colors"
          />
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
        </div>
      </div>

      <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-6 py-4 text-xs font-semibold text-textSecondary uppercase tracking-wider">App</th>
                <th className="px-6 py-4 text-xs font-semibold text-textSecondary uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-semibold text-textSecondary uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-textSecondary uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-textSecondary">
                    No apps found. Start uploading!
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    key={app.id} 
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={app.iconUrl} alt={app.name} className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <p className="text-sm font-medium text-white">{app.name}</p>
                          <p className="text-xs text-textSecondary">{app.version} • {app.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-white/5 rounded-md text-xs text-textSecondary capitalize">
                        {app.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-[#30D158]/10 text-[#30D158] rounded-full text-xs font-medium">
                        Published
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => handleEditClick(app)} className="p-2 hover:bg-[#007AFF]/10 rounded-lg text-textSecondary hover:text-[#007AFF] transition-colors" title="Edit App">
                        <Edit3 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Banner Modal */}
      <AnimatePresence>
        {editingApp && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1C1C1E] border border-white/10 w-full max-w-md rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-lg text-white">Edit App Details</h3>
                <button onClick={() => setEditingApp(null)} className="p-1 hover:bg-white/10 rounded-full text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center gap-3 mb-2">
                  <img src={iconUrl || editingApp.iconUrl} alt="" className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <p className="font-semibold text-white">{editingApp.name}</p>
                    <p className="text-xs text-textSecondary">{editingApp.developer}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">App Icon URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                      <input 
                        type="text" 
                        value={iconUrl} 
                        onChange={e => setIconUrl(e.target.value)}
                        placeholder="Paste Icon Image URL here..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-[#007AFF] outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Background Image URL (Banner)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                      <input 
                        type="text" 
                        value={bannerUrl} 
                        onChange={e => setBannerUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-[#007AFF] outline-none"
                      />
                    </div>
                    <label className="flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 cursor-pointer transition-colors shrink-0">
                      <Upload className="w-4 h-4 mr-2 text-[#0A84FF]" />
                      <span className="text-sm font-medium text-white">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                    </label>
                  </div>
                </div>

                {bannerUrl && (
                  <div className="mt-4 rounded-xl overflow-hidden border border-white/10 h-32 relative">
                    <img src={bannerUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2 mt-4">Official Website URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                      <input 
                        type="text" 
                        value={websiteUrl} 
                        onChange={e => setWebsiteUrl(e.target.value)}
                        placeholder="https://your-website.com"
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-[#007AFF] outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Manual Overrides */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Average Rating</label>
                    <input 
                      type="number" step="0.1" min="0" max="5"
                      value={averageRating} onChange={e => setAverageRating(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#007AFF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Review Count</label>
                    <input 
                      type="number" min="0"
                      value={reviewCount} onChange={e => setReviewCount(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#007AFF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Install Count</label>
                    <input 
                      type="number" min="0"
                      value={installCount} onChange={e => setInstallCount(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#007AFF] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Age Rating</label>
                    <input 
                      type="text" 
                      value={ageRating} onChange={e => setAgeRating(e.target.value)}
                      className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:border-[#007AFF] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-white/10 flex justify-end gap-3 bg-black/20">
                <button 
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors text-white"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveBanner}
                  disabled={isSaving}
                  className="px-6 py-2 rounded-full bg-[#007AFF] text-white text-sm font-medium hover:bg-[#007AFF]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
