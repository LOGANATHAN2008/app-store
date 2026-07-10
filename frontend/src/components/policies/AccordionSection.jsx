import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Download, Trash2 } from 'lucide-react'
import HighlightBox from './HighlightBox'
import ContactCard from './ContactCard'

export default function AccordionSection({ section, isExpanded, onToggle }) {
  const Icon = section.icon || (() => null)
  const [analyticsOptIn, setAnalyticsOptIn] = useState(true)

  const renderContent = () => {
    const lines = section.content?.split('\n') || []
    return (
      <div className="mt-4 text-[14px] leading-[1.7]" style={{ color: 'rgba(255,255,255,0.55)' }}>
        {lines.map((line, i) => {
          if (line.startsWith('•')) {
            return (
              <div key={i} className="flex gap-2 mb-1.5 ml-2">
                <span style={{ color: '#0A84FF' }}>•</span>
                <span>{line.substring(1).trim()}</span>
              </div>
            )
          }
          if (line.trim() === '') return <br key={i} />
          return <p key={i} className="mb-2">{line}</p>
        })}
      </div>
    )
  }

  return (
    <div id={section.id} className="bg-[#1C1C1E] border border-white/5 rounded-[16px] overflow-hidden scroll-mt-24">
      <button 
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" 
            style={{ background: `${section.color}15` }}
          >
            <Icon size={20} style={{ color: section.color }} />
          </motion.div>
          <span className="text-[16px] font-semibold text-white tracking-tight">{section.title}</span>
        </div>
        <motion.div 
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="shrink-0 ml-4 text-white/40"
        >
          <ChevronRight size={20} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-0">
              {section.content && renderContent()}
              
              {section.hasToggle && (
                <div className="mt-4 p-4 rounded-xl border border-white/5 bg-black/20 flex items-center justify-between">
                  <div>
                    <p className="text-white text-[14px] font-medium">Analytics Cookies</p>
                    <p className="text-white/50 text-[12px]">Help us improve our service</p>
                  </div>
                  <button 
                    onClick={() => setAnalyticsOptIn(!analyticsOptIn)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${analyticsOptIn ? 'bg-[#30D158]' : 'bg-white/10'}`}
                  >
                    <motion.div 
                      layout
                      className="w-5 h-5 bg-white rounded-full absolute top-[2px] shadow-sm"
                      animate={{ left: analyticsOptIn ? '26px' : '2px' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>
              )}

              {section.hasDataButtons && (
                <div className="mt-5 flex gap-3 flex-col sm:flex-row">
                  <motion.button whileTap={{ scale: 0.97 }} className="flex-1 py-3 border border-[#0A84FF] text-[#0A84FF] rounded-xl flex items-center justify-center gap-2 text-[14px] font-medium hover:bg-[#0A84FF]/10 transition-colors">
                    <Download size={16} /> Download My Data
                  </motion.button>
                  <motion.button whileTap={{ scale: 0.97 }} className="flex-1 py-3 border border-[#FF453A] text-[#FF453A] rounded-xl flex items-center justify-center gap-2 text-[14px] font-medium hover:bg-[#FF453A]/10 transition-colors">
                    <Trash2 size={16} /> Delete My Account
                  </motion.button>
                </div>
              )}

              {section.highlight && (
                <HighlightBox text={section.highlight.text} color={section.highlight.color} />
              )}
              
              {section.isContactCard && <ContactCard />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
