import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image as ImageIcon, Upload } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { uploadApi } from '../../../../services/api'

export default function EditModal({ isOpen, onClose, onConfirm, app }) {
  const [activeTab, setActiveTab] = useState('Details')
  const [isUploading, setIsUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    developer: '',
    category: '',
    price: 0,
    ageRating: '',
    fileSize: 0,
    description: '',
    iconUrl: '',
    screenshotUrls: [],
    websiteUrl: '',
    downloadUrl: ''
  })

  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(null)
  const [screenshotFiles, setScreenshotFiles] = useState([])
  const [screenshotPreviews, setScreenshotPreviews] = useState([])
  const [apkFile, setApkFile] = useState(null)

  useEffect(() => {
    if (isOpen && app) {
      setFormData({
        name: app.name || '',
        developer: app.developer || '',
        category: app.category || '',
        price: app.price || 0,
        ageRating: app.ageRating || '',
        fileSize: app.fileSize || 0,
        description: app.description || '',
        iconUrl: app.iconUrl || '',
        screenshotUrls: app.screenshotUrls || [],
        websiteUrl: app.websiteUrl || '',
        downloadUrl: app.downloadUrl || ''
      })
      setIconFile(null)
      setIconPreview(null)
      setScreenshotFiles([])
      setScreenshotPreviews([])
      setApkFile(null)
      setActiveTab('Details')
    }
  }, [isOpen, app])

  const handleIcon = (e) => {
    const file = e.target.files?.[0]
    if (file) { setIconFile(file); setIconPreview(URL.createObjectURL(file)) }
  }
  
  const handleScreenshots = (e) => {
    const files = Array.from(e.target.files || [])
    if (formData.screenshotUrls.length + screenshotFiles.length + files.length > 10) return toast.error('Max 10 screenshots total')
    setScreenshotFiles(prev => [...prev, ...files])
    setScreenshotPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.developer) {
      toast.error('Name and Developer are required')
      return
    }

    let finalIconUrl = formData.iconUrl
    let finalScreenshots = [...formData.screenshotUrls]
    let finalDownloadUrl = formData.downloadUrl

    if (iconFile || screenshotFiles.length > 0 || apkFile) {
      setIsUploading(true)
      try {
        if (iconFile) {
          const res = await uploadApi.icon(iconFile)
          finalIconUrl = res.url
        }
        if (screenshotFiles.length > 0) {
          const res = await uploadApi.screenshots(screenshotFiles)
          finalScreenshots = [...finalScreenshots, ...res.urls]
        }
        if (apkFile) {
          const res = await uploadApi.apk(apkFile)
          finalDownloadUrl = res.url
        }
      } catch (err) {
        toast.error('Failed to upload files')
        setIsUploading(false)
        return
      }
      setIsUploading(false)
    }

    onConfirm({
      ...formData,
      iconUrl: finalIconUrl,
      screenshotUrls: finalScreenshots,
      downloadUrl: finalDownloadUrl
    })
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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit App</h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5 text-textSecondary" />
              </button>
            </div>

            <div className="flex gap-4 mb-6 border-b border-white/10 pb-2">
              <button 
                onClick={() => setActiveTab('Details')}
                className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'Details' ? 'text-[#0A84FF] border-b-2 border-[#0A84FF]' : 'text-textSecondary hover:text-white'}`}
              >
                Details
              </button>
              <button 
                onClick={() => setActiveTab('Media')}
                className={`pb-2 text-sm font-medium transition-colors ${activeTab === 'Media' ? 'text-[#0A84FF] border-b-2 border-[#0A84FF]' : 'text-textSecondary hover:text-white'}`}
              >
                Media
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {activeTab === 'Details' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-textSecondary mb-1">App Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#0A84FF] transition-colors"
                    />
                  </div>

              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1">Developer Name</label>
                <input
                  type="text"
                  value={formData.developer}
                  onChange={e => setFormData({ ...formData, developer: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#0A84FF] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1">Official Website URL (Optional)</label>
                <input
                  type="text"
                  value={formData.websiteUrl}
                  onChange={e => setFormData({ ...formData, websiteUrl: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#0A84FF] transition-colors"
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#0A84FF] transition-colors"
                  >
                    <option value="" className="bg-[#1C1C1E] text-white">Select</option>
                    <option value="productivity" className="bg-[#1C1C1E] text-white">Productivity</option>
                    <option value="games" className="bg-[#1C1C1E] text-white">Games</option>
                    <option value="social" className="bg-[#1C1C1E] text-white">Social</option>
                    <option value="utilities" className="bg-[#1C1C1E] text-white">Utilities</option>
                    <option value="entertainment" className="bg-[#1C1C1E] text-white">Entertainment</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#0A84FF] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Age Rating</label>
                  <select
                    value={formData.ageRating}
                    onChange={e => setFormData({ ...formData, ageRating: e.target.value })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#0A84FF] transition-colors"
                  >
                    <option value="" className="bg-[#1C1C1E] text-white">Select</option>
                    <option value="4+" className="bg-[#1C1C1E] text-white">4+</option>
                    <option value="9+" className="bg-[#1C1C1E] text-white">9+</option>
                    <option value="12+" className="bg-[#1C1C1E] text-white">12+</option>
                    <option value="17+" className="bg-[#1C1C1E] text-white">17+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-textSecondary mb-1">Size (MB)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fileSize ? (formData.fileSize / (1024 * 1024)).toFixed(1) : ''}
                    onChange={e => setFormData({ ...formData, fileSize: Math.round(Number(e.target.value) * 1024 * 1024) })}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#0A84FF] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-textSecondary mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white outline-none focus:border-[#0A84FF] transition-colors resize-y min-h-[120px]"
                />
              </div>
              </motion.div>
              )}

              {activeTab === 'Media' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">App Icon</label>
                    <div className="flex gap-4 items-center mb-2">
                      <div className="w-16 h-16 rounded-[22%] bg-black overflow-hidden flex-shrink-0 border border-white/10">
                        {iconPreview || formData.iconUrl ? (
                          <img src={iconPreview || formData.iconUrl} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5"><ImageIcon className="w-6 h-6 text-white/20" /></div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-textSecondary mb-1">Image URL</label>
                        <input type="text" value={formData.iconUrl} onChange={e => setFormData({...formData, iconUrl: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white outline-none" placeholder="https://" />
                      </div>
                      <label className="flex flex-col items-center justify-center p-3 mt-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors text-xs text-white">
                        <Upload className="w-4 h-4 mb-1" />
                        Upload
                        <input type="file" accept="image/*" onChange={handleIcon} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Screenshots</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {formData.screenshotUrls.map((url, i) => (
                        <div key={`url-${i}`} className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative border border-white/10 group">
                          <img src={url} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => setFormData({...formData, screenshotUrls: formData.screenshotUrls.filter((_, idx) => idx !== i)})} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-[#FF453A]">
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                      {screenshotPreviews.map((preview, i) => (
                        <div key={`prev-${i}`} className="aspect-[9/16] bg-black rounded-lg overflow-hidden relative border border-[#0A84FF]">
                          <img src={preview} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => {
                            setScreenshotFiles(f => f.filter((_, idx) => idx !== i));
                            setScreenshotPreviews(p => p.filter((_, idx) => idx !== i));
                          }} className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-[#FF453A]">
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <input type="text" placeholder="Add Screenshot URL and press Enter" onKeyDown={e => {
                          if(e.key === 'Enter' && e.target.value) {
                            e.preventDefault();
                            setFormData({...formData, screenshotUrls: [...formData.screenshotUrls, e.target.value]});
                            e.target.value = '';
                          }
                        }} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white outline-none" />
                      </div>
                      <label className="flex items-center gap-2 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors text-sm text-white">
                        <Upload className="w-4 h-4" /> Upload
                        <input type="file" multiple accept="image/*" onChange={handleScreenshots} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-2">App File (.apk)</label>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-textSecondary mb-1">Download URL</label>
                        <input type="text" value={formData.downloadUrl} onChange={e => setFormData({...formData, downloadUrl: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-lg p-2 text-sm text-white outline-none" placeholder="https://" />
                        {apkFile && <p className="text-xs text-green-500 mt-1">File ready to upload: {apkFile.name}</p>}
                      </div>
                      <label className="flex flex-col items-center justify-center p-3 mt-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-colors text-xs text-white">
                        <Upload className="w-4 h-4 mb-1" />
                        Upload APK
                        <input type="file" accept=".apk,application/vnd.android.package-archive" onChange={e => {
                          const file = e.target.files?.[0];
                          if(file) setApkFile(file);
                        }} className="hidden" />
                      </label>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3 mt-6 pt-4 border-t border-white/10">
                <button 
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl font-medium text-white bg-white/10 hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#0A84FF] hover:bg-[#0A84FF]/90 transition-colors shadow-lg shadow-[#0A84FF]/20 disabled:opacity-50 flex items-center justify-center"
                >
                  {isUploading ? <span className="animate-pulse">Uploading...</span> : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
