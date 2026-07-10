import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Image as ImageIcon, Upload, X, Box, CheckCircle } from 'lucide-react'
import { appsApi, uploadApi } from '../../../services/api'
import { useAuthStore } from '../../../store'

import StepProgress from './upload/StepProgress'
import TagInput from './upload/TagInput'
import ToggleSwitch from './upload/ToggleSwitch'

const CATEGORIES = [
  'Entertainment', 'Productivity', 'Games', 'Social',
  'Health & Fitness', 'Education', 'Finance', 'Travel',
  'Music', 'Photo & Video'
]

export default function AppUpload() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuthStore()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState({})
  
  // Form State
  const [form, setForm] = useState({
    name: '', developer: '', shortDescription: '', description: '', whatsNew: '',
    category: 'Games', version: '1.0.0', minOS: 'iOS 14+', ageRating: '4+',
    websiteUrl: '', supportUrl: '', privacyUrl: '', price: 0, isFeatured: false,
    hasInAppPurchases: false, visibleInStore: true,
    supportIPhone: true, supportIPad: true, supportMac: false, supportWatch: false,
    screenshotOrientation: 'portrait'
  })
  
  const [tags, setTags] = useState([])
  const [priceType, setPriceType] = useState('Free') // Free, Paid, Freemium
  
  // Media State
  const [iconFile, setIconFile] = useState(null)
  const [iconPreview, setIconPreview] = useState(null)
  const [screenshotFiles, setScreenshotFiles] = useState([])
  const [screenshotPreviews, setScreenshotPreviews] = useState([])
  const [bannerFile, setBannerFile] = useState(null)
  const [bannerPreview, setBannerPreview] = useState(null)
  const [apkFile, setApkFile] = useState(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  const validateStep = (step) => {
    const newErrors = {}
    if (step === 1) {
      if (!form.name || form.name.length < 2) newErrors.name = 'App Name must be at least 2 characters'
      if (!form.developer) newErrors.developer = 'Developer name is required'
      if (!form.shortDescription || form.shortDescription.length > 80) newErrors.shortDescription = 'Short description must be 1-80 characters'
      if (!form.description || form.description.length < 20) newErrors.description = 'Full description must be at least 20 characters'
    } else if (step === 2) {
      if (!iconFile) newErrors.icon = 'App icon is required'
      if (screenshotFiles.length === 0) newErrors.screenshots = 'At least 1 screenshot is required'
    } else if (step === 3) {
      if (!form.version.match(/^\d+\.\d+\.\d+$/)) newErrors.version = 'Version must be X.X.X format'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5))
      window.scrollTo(0, 0)
    } else {
      toast.error('Please fix the errors before continuing')
    }
  }
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    window.scrollTo(0, 0)
  }

  // File Handlers
  const handleIcon = (e) => {
    const file = e.target.files?.[0]
    if (file) { setIconFile(file); setIconPreview(URL.createObjectURL(file)) }
  }
  const handleScreenshots = (e) => {
    const files = Array.from(e.target.files || [])
    if (screenshotFiles.length + files.length > 10) return toast.error('Maximum 10 screenshots allowed')
    setScreenshotFiles(prev => [...prev, ...files])
    setScreenshotPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }
  const handleBanner = (e) => {
    const file = e.target.files?.[0]
    if (file) { setBannerFile(file); setBannerPreview(URL.createObjectURL(file)) }
  }

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error("Please fill all required fields")
      return
    }
    
    setIsSubmitting(true)
    setUploadProgress(5)
    
    try {
      // Mock progress for images
      const iconRes = await uploadApi.icon(iconFile)
      setUploadProgress(25)
      
      const screenshotsRes = await uploadApi.screenshots(screenshotFiles)
      setUploadProgress(60)
      
      let bannerUrl = ''
      if (bannerFile) {
        const bannerRes = await uploadApi.banner(bannerFile)
        bannerUrl = bannerRes.url
      }
      let downloadUrl = ''
      if (apkFile) {
        const apkRes = await uploadApi.apk(apkFile)
        downloadUrl = apkRes.url
      }
      setUploadProgress(80)

      const payload = {
        ...form,
        category: form.category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-'),
        price: priceType === 'Paid' ? Number(form.price) : 0,
        tags,
        iconUrl: iconRes.url,
        screenshotUrls: screenshotsRes.urls,
        bannerUrl,
        downloadUrl,
        fileSize: apkFile ? apkFile.size : 0,
        uploaderId: user?.id,
        // Using existing data structure limits for now
      }
      
      await appsApi.create(payload)
      setUploadProgress(100)
      toast.success('App published successfully!')
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['apps'] })
        queryClient.invalidateQueries({ queryKey: ['admin-apps'] })
        navigate('/admin/apps/history')
      }, 1500)
      
    } catch (err) {
      toast.error('Upload failed: ' + (err.message || 'Unknown error'))
      setIsSubmitting(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-3xl mx-auto min-h-screen pb-24 text-white">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-6 sticky top-0 bg-[#000000]/80 backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight">Upload New App</h1>
        </div>
        <button className="px-4 py-2 rounded-full border border-[#007AFF] text-[#007AFF] text-sm font-medium hover:bg-[#007AFF]/10 transition-colors">
          Save Draft
        </button>
      </div>

      <StepProgress currentStep={currentStep} />

      <div className="mt-8">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Basic Info */}
          {currentStep === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">App Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} className={`w-full bg-white/5 border ${errors.name ? 'border-[#FF453A]' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#007AFF] transition-colors outline-none`} placeholder="e.g. Loga FM Radio" />
                  {errors.name && <p className="text-[#FF453A] text-xs mt-1.5">{errors.name}</p>}
                </div>
                
                <div className="h-px w-full bg-white/5" />
                
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Developer / Publisher Name *</label>
                  <input name="developer" value={form.developer} onChange={handleChange} className={`w-full bg-white/5 border ${errors.developer ? 'border-[#FF453A]' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#007AFF] transition-colors outline-none`} placeholder="e.g. Loga Technologies" />
                  {errors.developer && <p className="text-[#FF453A] text-xs mt-1.5">{errors.developer}</p>}
                </div>
                
                <div className="h-px w-full bg-white/5" />

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Official Website URL (Optional)</label>
                  <input name="websiteUrl" value={form.websiteUrl} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#007AFF] transition-colors outline-none" placeholder="https://your-website.com" />
                </div>
                
                <div className="h-px w-full bg-white/5" />
                
                <div>
                  <div className="flex justify-between mb-2">
                    <label className="block text-sm font-medium text-textSecondary">Short Description *</label>
                    <span className={`text-xs ${form.shortDescription.length > 70 ? 'text-[#FF453A]' : 'text-textSecondary'}`}>{form.shortDescription.length} / 80</span>
                  </div>
                  <input maxLength={80} name="shortDescription" value={form.shortDescription} onChange={handleChange} className={`w-full bg-white/5 border ${errors.shortDescription ? 'border-[#FF453A]' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#007AFF] transition-colors outline-none`} placeholder="One line tagline shown on app cards" />
                  {errors.shortDescription && <p className="text-[#FF453A] text-xs mt-1.5">{errors.shortDescription}</p>}
                </div>
                
                <div className="h-px w-full bg-white/5" />
                
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Full Description *</label>
                  <textarea rows={5} name="description" value={form.description} onChange={handleChange} className={`w-full bg-white/5 border ${errors.description ? 'border-[#FF453A]' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#007AFF] transition-colors outline-none resize-y min-h-[100px]`} placeholder="Full app description shown on detail page..." />
                  {errors.description && <p className="text-[#FF453A] text-xs mt-1.5">{errors.description}</p>}
                </div>
                
                <div className="h-px w-full bg-white/5" />
                
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">What's New (Changelog)</label>
                  <textarea rows={3} name="whatsNew" value={form.whatsNew} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#007AFF] transition-colors outline-none resize-y" placeholder="New features, bug fixes in this version..." />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Media */}
          {currentStep === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              
              <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">App Icon *</h3>
                <div className="flex gap-6 items-center">
                  <label className={`w-[80px] h-[80px] rounded-[22%] shrink-0 flex items-center justify-center overflow-hidden cursor-pointer relative group ${!iconPreview ? 'border-2 border-dashed border-white/20 bg-black/30' : 'bg-black shadow-xl'}`}>
                    {iconPreview ? (
                      <motion.img initial={{scale:0}} animate={{scale:1}} src={iconPreview} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-white/40 group-hover:scale-110 transition-transform" />
                    )}
                    <input type="file" accept="image/png, image/jpeg" onChange={handleIcon} className="hidden" />
                  </label>
                  <div>
                    <p className="font-bold">Upload App Icon</p>
                    <p className="text-sm text-textSecondary mt-1">PNG or JPG · Min 512×512px</p>
                    <p className="text-sm text-textSecondary">Auto-resized & optimized</p>
                    {errors.icon && <p className="text-[#FF453A] text-xs mt-1">{errors.icon}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold">Screenshots *</h3>
                    <div className="flex gap-2 mt-2">
                      <button type="button" onClick={() => setForm(f => ({...f, screenshotOrientation: 'portrait'}))} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.screenshotOrientation === 'portrait' ? 'bg-[#007AFF]/20 border-[#007AFF] text-[#007AFF]' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>Portrait</button>
                      <button type="button" onClick={() => setForm(f => ({...f, screenshotOrientation: 'landscape'}))} className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${form.screenshotOrientation === 'landscape' ? 'bg-[#007AFF]/20 border-[#007AFF] text-[#007AFF]' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>Landscape</button>
                    </div>
                  </div>
                  <span className="text-xs text-textSecondary">{screenshotPreviews.length} / 10</span>
                </div>
                
                <div className={`grid gap-4 ${form.screenshotOrientation === 'landscape' ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {screenshotPreviews.map((preview, i) => {
                    const isVideo = screenshotFiles[i]?.type?.startsWith('video/') || preview.match(/\.(mp4|webm|mov|mkv)(\?.*)?$/i);
                    return (
                      <motion.div key={i} initial={{scale:0.8, opacity:0}} animate={{scale:1, opacity:1}} className={`${form.screenshotOrientation === 'landscape' ? 'aspect-video' : 'aspect-[9/16]'} rounded-xl overflow-hidden relative group bg-black`}>
                        {isVideo ? (
                          <video src={preview} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                        ) : (
                          <img src={preview} className="w-full h-full object-cover" />
                        )}
                        <button onClick={() => {
                        setScreenshotFiles(f => f.filter((_, idx) => idx !== i))
                        setScreenshotPreviews(p => p.filter((_, idx) => idx !== i))
                      }} className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FF453A]">
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                    );
                  })}
                  
                  {screenshotPreviews.length < 10 && (
                    <label className={`${form.screenshotOrientation === 'landscape' ? 'aspect-video' : 'aspect-[9/16]'} rounded-xl border-2 border-dashed ${errors.screenshots ? 'border-[#FF453A]' : 'border-white/20'} bg-black/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#007AFF] hover:bg-[#007AFF]/5 transition-colors`}>
                      <Upload className="w-6 h-6 text-white/40 mb-2" />
                      <span className="text-xs text-textSecondary">Add</span>
                      <input type="file" multiple accept="image/*,video/*" onChange={handleScreenshots} className="hidden" />
                    </label>
                  )}
                </div>
                {errors.screenshots && <p className="text-[#FF453A] text-xs mt-2">{errors.screenshots}</p>}
              </div>

              <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Featured Banner</h3>
                <label className="w-full h-48 rounded-xl border-2 border-dashed border-white/20 bg-black/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#007AFF] hover:bg-[#007AFF]/5 transition-colors overflow-hidden group">
                  {bannerPreview ? (
                    <img src={bannerPreview} className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <ImageIcon className="w-8 h-8 text-white/40 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="font-medium">Upload Banner</p>
                      <p className="text-xs text-textSecondary mt-1">1200 × 630px · Used on Today card</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleBanner} className="hidden" />
                </label>
              </div>

              <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">App File</h3>
                <div className="flex gap-4 items-center">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-textSecondary mb-1">Download URL</label>
                    <input type="text" value={form.downloadUrl || ''} onChange={handleChange} name="downloadUrl" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white outline-none focus:border-[#007AFF] transition-colors" placeholder="https://" />
                  </div>
                  <label className="w-1/2 py-8 rounded-xl border-2 border-dashed border-white/20 bg-black/30 flex flex-col items-center justify-center cursor-pointer hover:border-[#007AFF] hover:bg-[#007AFF]/5 transition-colors">
                    <Box className="w-8 h-8 text-white/40 mb-3" />
                    <p className="font-medium text-sm">Upload APK / IPA</p>
                    <input type="file" accept=".apk,.ipa,application/vnd.android.package-archive,application/octet-stream" onChange={e => setApkFile(e.target.files?.[0])} className="hidden" />
                  </label>
                </div>
                {apkFile && <p className="text-sm text-[#30D158] mt-3 flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> {apkFile.name} ({(apkFile.size/1024/1024).toFixed(1)}MB)</p>}
              </div>
            </motion.div>
          )}

          {/* STEP 3: Category & Details */}
          {currentStep === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Category *</label>
                  <select name="category" value={form.category} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#007AFF] outline-none appearance-none">
                    {CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1C1C1E] text-white">{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Version Number *</label>
                  <input name="version" value={form.version} onChange={handleChange} className={`w-full bg-white/5 border ${errors.version ? 'border-[#FF453A]' : 'border-white/10'} rounded-xl px-4 py-3 text-white focus:border-[#007AFF] outline-none`} placeholder="1.0.0" />
                  {errors.version && <p className="text-[#FF453A] text-xs mt-1.5">{errors.version}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Minimum OS Version</label>
                  <select name="minOS" value={form.minOS} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#007AFF] outline-none appearance-none">
                    <option className="bg-[#1C1C1E] text-white">iOS 14+</option><option className="bg-[#1C1C1E] text-white">iOS 15+</option><option className="bg-[#1C1C1E] text-white">iOS 16+</option><option className="bg-[#1C1C1E] text-white">iOS 17+</option>
                    <option className="bg-[#1C1C1E] text-white">Android 10+</option><option className="bg-[#1C1C1E] text-white">Android 12+</option><option className="bg-[#1C1C1E] text-white">Android 14+</option>
                  </select>
                </div>

                <div className="h-px w-full bg-white/5" />

                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Tags</label>
                  <TagInput tags={tags} onChange={setTags} />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Pricing & Options */}
          {currentStep === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              
              <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                <label className="block text-sm font-medium text-textSecondary mb-4">Pricing Type</label>
                <div className="flex gap-3 mb-6">
                  {['Free', 'Paid', 'Freemium'].map(type => (
                    <button key={type} onClick={() => setPriceType(type)} className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${priceType === type ? 'bg-[#007AFF]/20 border-[#007AFF] text-[#007AFF]' : 'bg-white/5 border-white/10 text-textSecondary'}`}>
                      {type}
                    </button>
                  ))}
                </div>
                
                {priceType !== 'Free' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                    <label className="block text-sm font-medium text-textSecondary mb-2">Price Amount</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary">$</span>
                      <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white focus:border-[#007AFF] outline-none" placeholder="9.99" />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                <label className="block text-sm font-medium text-textSecondary mb-4">Age Rating *</label>
                <div className="flex gap-3">
                  {['4+', '9+', '12+', '17+'].map(rating => (
                    <button key={rating} onClick={() => setForm(f => ({...f, ageRating: rating}))} className={`w-16 h-12 rounded-xl border text-sm font-bold transition-all ${form.ageRating === rating ? 'border-[#FF9F0A] text-[#FF9F0A] bg-[#FF9F0A]/10' : 'bg-white/5 border-white/10 text-white hover:border-white/30'}`}>
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <ToggleSwitch label="Featured App" subLabel="Show on Today card & hero banner" checked={form.isFeatured} onChange={(v) => setForm(f => ({...f, isFeatured: v}))} />
                <ToggleSwitch label="In-App Purchases" subLabel="App contains paid features inside" checked={form.hasInAppPurchases} onChange={(v) => setForm(f => ({...f, hasInAppPurchases: v}))} />
                <ToggleSwitch label="Visible in Store" subLabel="Publish immediately after save" checked={form.visibleInStore} onChange={(v) => setForm(f => ({...f, visibleInStore: v}))} />
              </div>
            </motion.div>
          )}

          {/* STEP 5: Review & Publish */}
          {currentStep === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
              <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-8 text-center">
                <div className="w-24 h-24 rounded-[22%] bg-black mx-auto mb-4 overflow-hidden border border-white/10">
                  {iconPreview ? <img src={iconPreview} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-white/5" />}
                </div>
                <h2 className="text-2xl font-bold">{form.name || 'App Name'}</h2>
                <p className="text-textSecondary mt-1">{form.developer || 'Developer'}</p>
                
                <div className="flex items-center justify-center gap-4 mt-6">
                  <div className="bg-white/5 px-4 py-2 rounded-lg">
                    <p className="text-xs text-textSecondary uppercase">Price</p>
                    <p className="font-semibold">{priceType === 'Free' ? 'Free' : `$${form.price}`}</p>
                  </div>
                  <div className="bg-white/5 px-4 py-2 rounded-lg">
                    <p className="text-xs text-textSecondary uppercase">Rating</p>
                    <p className="font-semibold">{form.ageRating}</p>
                  </div>
                  <div className="bg-white/5 px-4 py-2 rounded-lg">
                    <p className="text-xs text-textSecondary uppercase">Category</p>
                    <p className="font-semibold">{form.category}</p>
                  </div>
                </div>
              </div>

              {isSubmitting && (
                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white">Uploading assets & publishing...</span>
                    <span className="text-[#007AFF] font-medium">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#007AFF] transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 md:left-[260px] bg-[#1C1C1E]/90 backdrop-blur-xl border-t border-white/10 p-4 z-20">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <button 
            type="button"
            onClick={currentStep === 1 ? () => navigate(-1) : prevStep}
            disabled={isSubmitting}
            className="px-6 py-3.5 rounded-xl font-medium text-white bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
          >
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </button>
          
          {currentStep < 5 ? (
            <button 
              type="button"
              onClick={nextStep}
              className="px-8 py-3.5 rounded-xl font-medium text-white bg-[#007AFF] hover:bg-[#007AFF]/90 transition-colors"
            >
              Continue
            </button>
          ) : (
            <button 
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-xl font-bold text-white bg-[#007AFF] hover:bg-[#007AFF]/90 transition-colors shadow-lg shadow-[#007AFF]/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Publishing...
                </>
              ) : (
                <>🚀 Publish App</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
