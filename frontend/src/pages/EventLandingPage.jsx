import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Rocket, Clock, ShieldCheck, UploadCloud, CheckCircle2, ChevronRight, XCircle } from 'lucide-react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { eventsApi, uploadApi } from '../services/api'
import toast from 'react-hot-toast'
import logo from '../assets/logo.png'
import Navbar from '../components/layout/Navbar'

export default function EventLandingPage() {
  const { token } = useParams()
  const [timeLeft, setTimeLeft] = useState('')
  const [isEnded, setIsEnded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionId, setSubmissionId] = useState('')
  
  const [formData, setFormData] = useState({
    name: '', developer: '', email: '', category: 'productivity',
    version: '1.0.0', shortDescription: '', description: '',
    websiteUrl: '', privacyUrl: '', termsAccepted: false
  })
  
  const [files, setFiles] = useState({
    icon: null, banner: null, screenshots: [], apk: null
  })

  // Validate Link
  const { data: eventData, isLoading, error } = useQuery({
    queryKey: ['event-link', token],
    queryFn: () => eventsApi.validateLink(token),
    retry: false
  })

  const submitMutation = useMutation({
    mutationFn: async (data) => {
      // 1. Upload files first
      let iconUrl = ''
      let bannerUrl = ''
      let screenshotUrls = []
      let downloadUrl = ''

      if (files.icon) {
        const res = await uploadApi.icon(files.icon)
        iconUrl = res.url
      }
      if (files.banner) {
        const res = await uploadApi.banner(files.banner)
        bannerUrl = res.url
      }
      if (files.screenshots.length > 0) {
        const res = await uploadApi.screenshots(files.screenshots)
        screenshotUrls = res.urls
      }
      if (files.apk) {
        const res = await uploadApi.apk(files.apk)
        downloadUrl = res.url
      }

      // 2. Submit form
      const finalData = { ...data, iconUrl, bannerUrl, screenshotUrls, downloadUrl }
      return eventsApi.submitApp(token, finalData)
    },
    onSuccess: (res) => {
      setIsSubmitted(true)
      setSubmissionId(res.submissionId)
      toast.success("Application Submitted Successfully!")
    },
    onError: (err) => {
      toast.error(err.message || "Failed to submit application")
    }
  })

  useEffect(() => {
    if (!eventData?.event?.endTime) return;
    
    const timer = setInterval(() => {
      const now = new Date().getTime()
      const end = new Date(eventData.event.endTime).getTime()
      const distance = end - now

      if (distance < 0) {
        clearInterval(timer)
        setIsEnded(true)
        setTimeLeft('00:00:00:00')
        return
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24))
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((distance % (1000 * 60)) / 1000)

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(timer)
  }, [eventData])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.termsAccepted) return toast.error("Please accept the terms & conditions.")
    if (!files.icon || !files.apk) return toast.error("App icon and APK file are required.")
    submitMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A84FF]"></div>
      </div>
    )
  }

  if (error || !eventData?.valid) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="w-20 h-20 text-[#FF453A] mb-6" />
        <h1 className="text-3xl font-bold text-white mb-4">Invalid or Expired Link</h1>
        <p className="text-white/50 max-w-md">The event link you are trying to access is invalid, has expired, or has reached its maximum upload limit.</p>
        <Link to="/" className="mt-8 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors">Return Home</Link>
      </div>
    )
  }

  if (isEnded) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FF453A]/10 rounded-full blur-[120px] pointer-events-none" />
        <Clock className="w-24 h-24 text-[#FF453A] mb-6 relative z-10" />
        <h1 className="text-5xl font-black text-white mb-4 relative z-10">Event Closed</h1>
        <p className="text-xl text-white/50 max-w-lg mb-8 relative z-10">This upload event has ended. New app submissions are no longer accepted.</p>
        <Link to="/" className="relative z-10 px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-bold transition-all shadow-xl backdrop-blur-md">Return Home</Link>
      </div>
    )
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#30D158]/10 rounded-full blur-[120px] pointer-events-none" />
        <CheckCircle2 className="w-24 h-24 text-[#30D158] mb-6 relative z-10" />
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 relative z-10">Application Submitted Successfully</h1>
        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl mb-8 relative z-10 max-w-md w-full backdrop-blur-xl">
          <div className="text-sm text-white/40 mb-1 uppercase tracking-wider font-bold">Submission ID</div>
          <div className="text-2xl font-mono font-bold text-[#FFD700] tracking-widest">{submissionId}</div>
          <div className="mt-6 p-3 bg-[#FF9F0A]/10 border border-[#FF9F0A]/20 rounded-xl flex items-center gap-3 text-left">
            <Clock className="w-6 h-6 text-[#FF9F0A] shrink-0" />
            <div>
              <div className="font-bold text-[#FF9F0A]">Status: Pending Approval</div>
              <div className="text-xs text-[#FF9F0A]/70">Your application has been submitted and is waiting for admin review.</div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 relative z-10">
          <button onClick={() => toast("Tracking system coming soon!", { icon: '🔍' })} className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-bold transition-all backdrop-blur-md">Track Submission</button>
          <button onClick={() => window.location.reload()} className="px-8 py-4 bg-[#0A84FF] hover:bg-[#0070E0] text-white rounded-2xl font-bold transition-all shadow-[0_0_20px_rgba(10,132,255,0.3)]">Submit Another App</button>
        </div>
      </div>
    )
  }

  const { event } = eventData

  return (
    <div className="min-h-screen bg-black text-white relative font-sans">
      <Navbar />
      
      {/* Dynamic Background Banner */}
      <div 
        className="absolute top-0 left-0 w-full h-[60vh] bg-cover bg-center opacity-40 z-0" 
        style={{ backgroundImage: `url(${event.bannerUrl})` }}
      />
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-black/20 via-black/80 to-black z-0" />

      <main className="relative z-10 pt-32 pb-24 px-4 max-w-5xl mx-auto">
        {!showForm ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A84FF]/20 text-[#0A84FF] border border-[#0A84FF]/30 font-bold mb-8">
              <Rocket className="w-5 h-5" /> Developer Upload Event
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
              {event.name}
            </h1>
            
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-12 leading-relaxed">
              {event.description}
            </p>

            {/* Countdown Box */}
            <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 max-w-xl mx-auto mb-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-50" />
              <h3 className="text-sm uppercase tracking-widest text-white/50 font-bold mb-4">Event Ends In</h3>
              <div className="text-4xl md:text-5xl font-mono font-black text-[#FFD700] tracking-wider mb-6">
                {timeLeft}
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <div className="text-white/40 text-xs font-bold uppercase mb-1">Limit</div>
                  <div className="text-lg font-bold">{event.limit ? `${event.limit} Uploads` : 'Unlimited'}</div>
                </div>
                <div className="bg-black/30 rounded-xl p-4 border border-white/5">
                  <div className="text-white/40 text-xs font-bold uppercase mb-1">Security</div>
                  <div className="text-lg font-bold flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[#30D158]"/> Verified</div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setShowForm(true)}
              className="group px-10 py-5 bg-white text-black hover:bg-gray-100 rounded-full font-black text-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] flex items-center gap-3 mx-auto"
            >
              Submit Your App
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <p className="mt-6 text-sm text-white/30 max-w-lg mx-auto">By participating in this event, you agree to our Developer Terms of Service and Review Guidelines.</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-xl">
            <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-6">
              <div>
                <h2 className="text-3xl font-black mb-1">Submit Application</h2>
                <p className="text-white/50">{event.name}</p>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">App Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none" placeholder="My Awesome App" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Category *</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none appearance-none">
                    {event.categories?.map(c => <option key={c} value={c} className="capitalize">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Developer Name *</label>
                  <input required type="text" value={formData.developer} onChange={e => setFormData({...formData, developer: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none" placeholder="Studio Name or Your Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Developer Email *</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none" placeholder="contact@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Developer Website</label>
                  <input type="url" value={formData.websiteUrl} onChange={e => setFormData({...formData, websiteUrl: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none" placeholder="https://yourstudio.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">App Version *</label>
                  <input required type="text" value={formData.version} onChange={e => setFormData({...formData, version: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none" placeholder="1.0.0" />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-6 border-t border-white/10 pt-6">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Short Description *</label>
                  <input required type="text" value={formData.shortDescription} onChange={e => setFormData({...formData, shortDescription: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none" placeholder="A one-line summary..." maxLength={100} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Full Description *</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none min-h-[150px]" placeholder="Detailed features, how it works..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">Privacy Policy URL (Optional)</label>
                  <input type="url" value={formData.privacyUrl} onChange={e => setFormData({...formData, privacyUrl: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#0A84FF] outline-none" placeholder="https://..." />
                </div>
              </div>

              {/* Files */}
              <div className="space-y-6 border-t border-white/10 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">App Icon (512x512 PNG) *</label>
                    <input required type="file" accept="image/*" onChange={e => setFiles({...files, icon: e.target.files[0]})} className="w-full text-sm text-white/50 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">App Banner *</label>
                    <input required type="file" accept="image/*" onChange={e => setFiles({...files, banner: e.target.files[0]})} className="w-full text-sm text-white/50 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">App File (APK) *</label>
                    <input required type="file" accept=".apk" onChange={e => setFiles({...files, apk: e.target.files[0]})} className="w-full text-sm text-white/50 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[#0A84FF]/20 file:text-[#0A84FF] hover:file:bg-[#0A84FF]/30" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Screenshots (Up to 5)</label>
                    <input type="file" accept="image/*" multiple onChange={e => setFiles({...files, screenshots: Array.from(e.target.files)})} className="w-full text-sm text-white/50 file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-white/10 file:text-white hover:file:bg-white/20" />
                  </div>
                </div>
              </div>

              {/* Legal */}
              <div className="border-t border-white/10 pt-6">
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-black/30 rounded-xl border border-white/10 hover:bg-black/50 transition-colors">
                  <input type="checkbox" required checked={formData.termsAccepted} onChange={e => setFormData({...formData, termsAccepted: e.target.checked})} className="mt-1 w-5 h-5 accent-[#0A84FF]" />
                  <span className="text-sm text-white/70">
                    I confirm that I have the rights to distribute this application and it complies with the App Store's content policies. I understand that all submissions are subject to administrative review.
                  </span>
                </label>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={submitMutation.isLoading} className="w-full md:w-auto px-10 py-4 bg-[#0A84FF] hover:bg-[#0070E0] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-3 disabled:opacity-50">
                  {submitMutation.isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  ) : (
                    <UploadCloud className="w-5 h-5" />
                  )}
                  {submitMutation.isLoading ? 'Uploading & Submitting...' : 'Submit App for Review'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </main>
    </div>
  )
}
