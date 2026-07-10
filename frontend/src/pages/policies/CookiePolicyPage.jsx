import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, Share, Printer, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import ReadingProgress from '../../components/policies/ReadingProgress'
import HeroCard from '../../components/policies/HeroCard'
import TableOfContents from '../../components/policies/TableOfContents'
import AccordionSection from '../../components/policies/AccordionSection'
import useScrollSpy from '../../hooks/useScrollSpy'
import { COOKIE_SECTIONS } from '../../data/cookieContent'

export default function CookiePolicyPage() {
  const navigate = useNavigate()
  const sections = COOKIE_SECTIONS

  const [expanded, setExpanded] = useState({})
  
  useEffect(() => {
    window.scrollTo(0, 0)
    const initial = {}
    sections.forEach((s, i) => { initial[s.id] = i === 0 })
    setExpanded(initial)
  }, [sections])

  const activeId = useScrollSpy(sections.map(s => s.id), { rootMargin: '-10% 0px -80% 0px' })

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: 'Cookie Policy', url: window.location.href }) } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  const handlePrint = () => window.print()

  return (
    <div className="min-h-screen bg-black pb-24 print:bg-white print:text-black">
      <ReadingProgress />
      
      <div className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-white/10 print:hidden">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-[#0A84FF] font-medium text-[15px]">
            <ChevronLeft size={20} /> Back
          </button>
          <span className="text-[15px] font-semibold text-white">Cookie Policy</span>
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
        <HeroCard lastUpdated={null} version="1.0" />

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
          </div>
        </div>
      </div>
    </div>
  )
}
