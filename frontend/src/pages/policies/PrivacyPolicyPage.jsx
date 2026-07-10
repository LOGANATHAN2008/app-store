import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Share, Printer, CheckCircle, FileText, Lock, Shield } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'

import ReadingProgress from '../../components/policies/ReadingProgress'
import HeroCard from '../../components/policies/HeroCard'
import TableOfContents from '../../components/policies/TableOfContents'
import AccordionSection from '../../components/policies/AccordionSection'
import useScrollSpy from '../../hooks/useScrollSpy'
import { PRIVACY_SECTIONS } from '../../data/privacyContent'
import { appsApi } from '../../services/api' 

export default function PrivacyPolicyPage() {
  const navigate = useNavigate()
  
  const { data: settingsData } = useQuery({
    queryKey: ['privacy-settings'],
    queryFn: () => fetch('/api/settings/privacy').then(res => res.json()).catch(() => null)
  })

  const sections = settingsData?.sections?.length ? settingsData.sections : PRIVACY_SECTIONS
  const lastUpdated = settingsData?.lastUpdated
  const version = settingsData?.version

  const [expanded, setExpanded] = useState({})
  
  useEffect(() => {
    window.scrollTo(0, 0)
    // Collapse all by default on mount, except maybe the first one
    const initial = {}
    sections.forEach((s, i) => { initial[s.id] = i === 0 })
    setExpanded(initial)
  }, [sections])

  const activeId = useScrollSpy(sections.map(s => s.id), { rootMargin: '-10% 0px -80% 0px' })

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Privacy Policy', url: window.location.href })
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="min-h-screen bg-black pb-24 print:bg-white print:text-black">
      <ReadingProgress />
      
      {/* Top Bar */}
      <div className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[#0A84FF] font-medium text-[15px]">
            <ChevronLeft size={20} /> Back
          </button>
          <span className="text-[15px] font-semibold text-white">Privacy Policy</span>
          <div className="flex items-center gap-3">
            <button onClick={handlePrint} className="text-[#0A84FF] p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <Printer size={18} />
            </button>
            <motion.button whileTap={{ scale: 0.9 }} onClick={handleShare} className="text-[#0A84FF] p-1.5 hover:bg-white/10 rounded-full transition-colors">
              <Share size={18} />
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8">
        <HeroCard lastUpdated={lastUpdated} version={version} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 relative">
            <TableOfContents sections={sections} activeId={activeId} />
          </div>

          <div className="lg:col-span-3 space-y-4">
            {sections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
              >
                <AccordionSection 
                  section={section} 
                  isExpanded={expanded[section.id]} 
                  onToggle={() => setExpanded(prev => ({ ...prev, [section.id]: !prev[section.id] }))} 
                />
              </motion.div>
            ))}
            
            {/* Agreement Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 p-5 bg-[#1C1C1E] rounded-[16px] border border-white/5 flex flex-col sm:flex-row sm:items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#30D158]/20 flex items-center justify-center shrink-0">
                <CheckCircle size={20} className="text-[#30D158]" />
              </div>
              <p className="text-[14px] text-white/70 leading-relaxed">
                By using this app you agree to our <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="text-[#0A84FF] hover:underline">Privacy Policy</button> and <button onClick={() => navigate('/terms')} className="text-[#0A84FF] hover:underline">Terms of Service</button>.
              </p>
            </motion.div>
            
            {/* Related Links */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 bg-[#1C1C1E] rounded-[16px] border border-white/5 overflow-hidden"
            >
              <button onClick={() => navigate('/terms')} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] border-b border-white/5 transition-colors group">
                <div className="flex items-center gap-3"><FileText size={18} className="text-white/40 group-hover:text-white/60 transition-colors"/> <span className="text-[14px] text-white">Terms of Service</span></div>
                <ChevronLeft size={16} className="text-white/20 group-hover:text-white/40 rotate-180 transition-colors" />
              </button>
              <button onClick={() => navigate('/cookies')} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] border-b border-white/5 transition-colors group">
                <div className="flex items-center gap-3"><Lock size={18} className="text-white/40 group-hover:text-white/60 transition-colors"/> <span className="text-[14px] text-white">Cookie Policy</span></div>
                <ChevronLeft size={16} className="text-white/20 group-hover:text-white/40 rotate-180 transition-colors" />
              </button>
              <button onClick={() => navigate('/security')} className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-3"><Shield size={18} className="text-white/40 group-hover:text-white/60 transition-colors"/> <span className="text-[14px] text-white">Security Practices</span></div>
                <ChevronLeft size={16} className="text-white/20 group-hover:text-white/40 rotate-180 transition-colors" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
