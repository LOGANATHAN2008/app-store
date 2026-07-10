import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

export default function TableOfContents({ sections, activeId }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <div className="bg-[#1C1C1E] rounded-[16px] border border-white/5 p-2 sticky top-24 z-30 hidden lg:block h-fit shadow-2xl">
      <div className="px-3 py-2 mb-1">
        <h3 className="text-[11px] font-semibold text-white/40 uppercase tracking-widest">Table of Contents</h3>
      </div>
      <div className="flex flex-col gap-1">
        {sections.map((section, idx) => {
          const isActive = activeId === section.id
          return (
            <button
              key={section.id}
              onClick={() => scrollTo(section.id)}
              className="relative w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-colors group overflow-hidden"
            >
              {isActive && (
                <motion.div 
                  layoutId="toc-highlight"
                  className="absolute inset-0 bg-white/10 rounded-lg"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center gap-3 pr-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors" style={{ background: isActive ? '#0A84FF' : 'rgba(255,255,255,0.05)', color: isActive ? '#fff' : '#8E8E93' }}>
                  {idx + 1}
                </div>
                <span className={`text-[13px] font-medium leading-tight transition-colors truncate ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                  {section.title}
                </span>
              </div>
              <ChevronRight size={14} className={`relative z-10 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-white/20'}`} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
