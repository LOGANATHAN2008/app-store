import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, ArrowLeft, CheckCircle2, AlertTriangle, MessageSquare, ThumbsUp, Activity } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { appsApi } from '../../../services/api'

export default function AIReviewSummary() {
  const navigate = useNavigate()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [progress, setProgress] = useState(0)
  
  // Fetch real apps from the database
  const { data: allApps = [], isLoading } = useQuery({
    queryKey: ['admin-apps-ai'],
    queryFn: () => appsApi.getAll({ limit: 1000 }).then(r => r.apps || [])
  })

  const [selectedApp, setSelectedApp] = useState('')

  // Set default selection when apps load
  useEffect(() => {
    if (allApps.length > 0 && !selectedApp) {
      setSelectedApp(allApps[0].id)
    }
  }, [allApps, selectedApp])

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    setShowResults(false)
    setProgress(0)
    
    // Simulate AI loading process
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          setTimeout(() => {
            setIsAnalyzing(false)
            setShowResults(true)
            toast.success("AI Analysis Complete!")
          }, 500)
          return 100
        }
        return p + Math.floor(Math.random() * 15)
      })
    }, 300)
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
            <Sparkles className="w-6 h-6 text-[#bf5af2]" /> AI Review Summary
          </h1>
          <p className="text-textSecondary text-sm">Automatically extract insights from hundreds of user reviews.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4">Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-textSecondary mb-2">Select App to Analyze</label>
                <select 
                  value={selectedApp}
                  onChange={(e) => setSelectedApp(e.target.value)}
                  disabled={isLoading || allApps.length === 0}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#bf5af2] transition-colors disabled:opacity-50"
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
              
              <button 
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0A84FF] to-[#bf5af2] hover:opacity-90 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(191,90,242,0.3)] disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Analyzing ({progress}%)...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Summary</>
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6">
             <div className="flex items-center gap-3 mb-2">
                <Activity className="w-5 h-5 text-[#30D158]" />
                <h3 className="font-bold">Live Status</h3>
             </div>
             <p className="text-sm text-textSecondary">
               AI Engine is ready. <br/> Model: gpt-4-omni <br/> Reviews Indexed: 12,450
             </p>
          </div>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-2 relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {!isAnalyzing && !showResults && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#1C1C1E]/50 border border-white/5 rounded-3xl"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                  <MessageSquare className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Analysis Generated Yet</h3>
                <p className="text-textSecondary max-w-sm">Select an app and click Generate Summary to let the AI process the latest reviews.</p>
              </motion.div>
            )}

            {isAnalyzing && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-[#1C1C1E] border border-[#bf5af2]/30 rounded-3xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0A84FF]/10 to-[#bf5af2]/10 animate-pulse" />
                <Sparkles className="w-12 h-12 text-[#bf5af2] animate-bounce mb-6 relative z-10" />
                <h3 className="text-2xl font-bold mb-2 relative z-10">AI is Analyzing Reviews...</h3>
                <p className="text-[#bf5af2] font-medium relative z-10">Extracting sentiments and keywords</p>
                <div className="w-64 h-2 bg-black/50 rounded-full mt-8 overflow-hidden relative z-10">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-[#0A84FF] to-[#bf5af2]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </motion.div>
            )}

            {showResults && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Sentiment Bar */}
                <div className="bg-[#1C1C1E] border border-white/10 rounded-3xl p-6 md:p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <ThumbsUp className="text-[#0A84FF]" /> Overall Sentiment
                  </h2>
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#30D158] to-[#34C759]">
                      92%
                    </div>
                    <div className="flex-1 w-full space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1 font-medium"><span className="text-[#30D158]">Positive</span> <span>92%</span></div>
                        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden"><div className="h-full bg-[#30D158] w-[92%]" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1 font-medium"><span className="text-[#FF9F0A]">Neutral</span> <span>5%</span></div>
                        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden"><div className="h-full bg-[#FF9F0A] w-[5%]" /></div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1 font-medium"><span className="text-[#FF453A]">Negative</span> <span>3%</span></div>
                        <div className="w-full h-3 bg-black/50 rounded-full overflow-hidden"><div className="h-full bg-[#FF453A] w-[3%]" /></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pros */}
                  <div className="bg-[#1C1C1E] border border-[#30D158]/20 rounded-3xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#30D158]">
                      <CheckCircle2 className="w-5 h-5" /> What Users Like
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                         <span className="bg-[#30D158]/20 text-[#30D158] p-1 rounded-md shrink-0"><CheckCircle2 className="w-4 h-4" /></span>
                         <span className="text-sm">Fast Performance and snappy load times.</span>
                      </li>
                      <li className="flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                         <span className="bg-[#30D158]/20 text-[#30D158] p-1 rounded-md shrink-0"><CheckCircle2 className="w-4 h-4" /></span>
                         <span className="text-sm">Clean UI that is highly intuitive.</span>
                      </li>
                      <li className="flex items-start gap-3 bg-white/5 p-3 rounded-xl">
                         <span className="bg-[#30D158]/20 text-[#30D158] p-1 rounded-md shrink-0"><CheckCircle2 className="w-4 h-4" /></span>
                         <span className="text-sm">Easy Navigation between tabs.</span>
                      </li>
                    </ul>
                  </div>

                  {/* Cons */}
                  <div className="bg-[#1C1C1E] border border-[#FF453A]/20 rounded-3xl p-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-[#FF453A]">
                      <AlertTriangle className="w-5 h-5" /> Common Issues
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-[#FF453A]/30 transition-colors">
                         <span className="bg-[#FF453A]/20 text-[#FF453A] p-1 rounded-md shrink-0"><AlertTriangle className="w-4 h-4" /></span>
                         <span className="text-sm">Occasional Login Delay reported on older iOS versions.</span>
                      </li>
                      <li className="flex items-start gap-3 bg-white/5 p-3 rounded-xl border border-white/5 hover:border-[#FF453A]/30 transition-colors">
                         <span className="bg-[#FF453A]/20 text-[#FF453A] p-1 rounded-md shrink-0"><AlertTriangle className="w-4 h-4" /></span>
                         <span className="text-sm">Dark Mode Bug on some Android devices causing text to blur.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* AI Conclusion */}
                <div className="bg-gradient-to-br from-[#1C1C1E] to-[#2C2C2E] border border-[#bf5af2]/30 rounded-3xl p-6 md:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Sparkles className="w-32 h-32 text-[#bf5af2]" />
                  </div>
                  <h3 className="text-lg font-bold mb-4 text-[#bf5af2] flex items-center gap-2">
                    <Sparkles className="w-5 h-5" /> AI Conclusion
                  </h3>
                  <p className="text-lg leading-relaxed text-white/90 relative z-10">
                    Users highly recommend this app for daily productivity. Most reviews praise its speed, design, and reliability. However, addressing the authentication delays and minor dark mode glitches could push user satisfaction even higher.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
