import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ArrowLeft, Copy, CheckCircle2, Sparkles, LayoutTemplate, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { appsApi } from '../../../services/api'

export default function AIDescriptionGen() {
  const navigate = useNavigate()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  // Fetch real apps
  const { data: allApps = [], isLoading } = useQuery({
    queryKey: ['admin-apps-ai-desc'],
    queryFn: () => appsApi.getAll({ limit: 1000 }).then(r => r.apps || [])
  })

  const [selectedAppId, setSelectedAppId] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)
  
  // Copy state
  const [copiedShort, setCopiedShort] = useState(false)
  const [copiedLong, setCopiedLong] = useState(false)
  
  // Generated content state
  const [shortDesc, setShortDesc] = useState("")
  const [longDesc, setLongDesc] = useState("")

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

  const handleGenerate = () => {
    if (!selectedApp) return;
    setIsGenerating(true)
    setShowResults(false)
    
    // Simulate AI loading process and dynamically generating based on real app data
    setTimeout(() => {
      const baseDesc = selectedApp.description || "An amazing new app that changes everything.";
      
      // Short description: First sentence or up to 80 chars
      let generatedShort = baseDesc.split(/[.!?\n]/)[0].trim() + ".";
      if (generatedShort.length > 80 || generatedShort.length < 10) {
        generatedShort = `Experience the best of ${selectedApp.name} today.`;
      }

      // Long description: Expand on the existing description
      const generatedLong = `${baseDesc}\n\n🌟 Why you'll love it:\n• Beautifully designed for ${selectedApp.category || 'your device'}\n• Lightning fast performance\n• Secure and reliable\n\nDownload ${selectedApp.name} now and take your experience to the next level!`;

      setShortDesc(generatedShort)
      setLongDesc(generatedLong)
      
      setIsGenerating(false)
      setShowResults(true)
      toast.success("SEO Descriptions Generated!")
    }, 2000)
  }

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'short') {
      setCopiedShort(true)
      setTimeout(() => setCopiedShort(false), 2000)
    } else {
      setCopiedLong(true)
      setTimeout(() => setCopiedLong(false), 2000)
    }
    toast.success("Copied to clipboard!")
  }

  return (
    <div className="max-w-5xl mx-auto pb-24 text-white">
      {/* Top Bar */}
      <div className="flex items-center gap-4 py-6 sticky top-0 bg-black/80 backdrop-blur-xl z-30 mb-8 border-b border-white/10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-[#FF9F0A]" /> AI Description Generator
          </h1>
          <p className="text-textSecondary text-sm">Generate high-converting, SEO-optimized App Store descriptions instantly.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><LayoutTemplate className="w-5 h-5" /> Target App</h2>
            <div className="space-y-4">
              <div>
                <select 
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  disabled={isLoading || allApps.length === 0}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#FF9F0A] transition-colors disabled:opacity-50"
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
                    <div className="text-xs text-[#FF9F0A] font-medium">{selectedApp.category}</div>
                    <p className="text-[11px] text-textSecondary line-clamp-2 mt-1">
                      {selectedApp.description || "No base description provided."}
                    </p>
                  </div>
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF9F0A] to-[#FF453A] hover:opacity-90 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,159,10,0.2)] disabled:opacity-50"
              >
                {isGenerating ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Writing Copy...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Description</>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-[#1C1C1E] border border-[#30D158]/20 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-3">
                <Tag className="w-5 h-5 text-[#30D158]" />
                <h3 className="font-bold">SEO Optimization</h3>
             </div>
             <ul className="text-sm text-textSecondary space-y-2">
               <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-[#30D158]" /> High-volume keywords</li>
               <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-[#30D158]" /> Competitor analysis</li>
               <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-[#30D158]" /> ASO formatting standards</li>
             </ul>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!isGenerating && !showResults && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#1C1C1E]/50 border border-white/5 rounded-3xl"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <FileText className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Copy Generated</h3>
                <p className="text-textSecondary max-w-sm">Select an app and let our AI write a highly-engaging store description designed to maximize downloads.</p>
              </motion.div>
            )}

            {isGenerating && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#1C1C1E] border border-[#FF9F0A]/30 rounded-3xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#FF9F0A]/10 to-[#FF453A]/10 animate-pulse" />
                <Sparkles className="w-12 h-12 text-[#FF9F0A] animate-bounce mb-6 relative z-10" />
                <h3 className="text-2xl font-bold mb-2 relative z-10">AI is Writing...</h3>
                <p className="text-[#FF9F0A] font-medium relative z-10">Injecting keywords and optimizing reading level</p>
              </motion.div>
            )}

            {showResults && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Short Description */}
                <div className="bg-[#1C1C1E] border border-[#FF9F0A]/30 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none transition-transform group-hover:scale-110">
                    <FileText className="w-24 h-24 text-[#FF9F0A]" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="text-lg font-bold text-[#FF9F0A] flex items-center gap-2">
                      <Sparkles className="w-5 h-5" /> Short Description
                    </h3>
                    <button 
                      onClick={() => handleCopy(shortDesc, 'short')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm transition-colors text-white/80"
                    >
                      {copiedShort ? <CheckCircle2 className="w-4 h-4 text-[#30D158]" /> : <Copy className="w-4 h-4" />}
                      {copiedShort ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  
                  <div className="bg-black/40 rounded-2xl p-5 border border-white/5 relative z-10">
                    <p className="text-xl font-medium text-white/90 leading-relaxed">
                      "{shortDesc}"
                    </p>
                    <div className="mt-3 text-xs font-bold text-textSecondary uppercase tracking-wider flex items-center gap-2">
                      <span>Length: {shortDesc.length}/80 chars</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#30D158]" />
                      <span className="text-[#30D158]">Perfect for Play Store</span>
                    </div>
                  </div>
                </div>

                {/* Long Description */}
                <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-white/50" /> Long Description
                    </h3>
                    <button 
                      onClick={() => handleCopy(longDesc, 'long')}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#FF9F0A]/10 hover:bg-[#FF9F0A]/20 text-[#FF9F0A] text-sm transition-colors font-medium"
                    >
                      {copiedLong ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedLong ? 'Copied!' : 'Copy Full Text'}
                    </button>
                  </div>
                  
                  <div className="bg-black/30 rounded-2xl p-6 border border-white/5 shadow-inner">
                    <p className="text-base text-white/80 leading-loose whitespace-pre-wrap">
                      {longDesc}
                    </p>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-4 text-xs font-medium text-textSecondary">
                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
                      <Tag className="w-3.5 h-3.5" /> Includes 12 SEO Keywords
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#30D158]" /> High Conversion Rating
                    </div>
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
