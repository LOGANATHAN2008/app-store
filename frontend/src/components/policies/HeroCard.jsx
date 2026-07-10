import { motion } from 'framer-motion'
import { Lock } from 'lucide-react'
import { format } from 'date-fns'

export default function HeroCard({ lastUpdated, version }) {
  const dateStr = lastUpdated ? format(new Date(lastUpdated), 'MMM d, yyyy') : 'Today'
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[24px] p-8 mb-8 border"
      style={{ 
        background: 'linear-gradient(135deg, #0a1628, #0d2137)',
        borderColor: 'rgba(0,122,255,0.2)' 
      }}
    >
      {/* Breathing Radial Glow */}
      <motion.div 
        animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[80px]"
        style={{ background: 'rgba(0,122,255,0.5)' }}
      />
      
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#0A84FF]/20 flex items-center justify-center mb-5 border border-[#0A84FF]/30">
          <Lock size={32} className="text-[#0A84FF]" />
        </div>
        <h1 className="text-[28px] md:text-[34px] font-[800] text-white tracking-tight mb-3">
          Your Privacy Matters
        </h1>
        <p className="text-[15px] leading-relaxed text-white/70 max-w-md mb-6">
          We are committed to protecting your personal data and being transparent about how we use it.
        </p>
        <div className="px-4 py-1.5 rounded-full bg-[#5AC8FA]/10 border border-[#5AC8FA]/20 text-[#5AC8FA] text-[12px] font-semibold flex items-center gap-2">
          <span>📅 Last Updated: {dateStr}</span>
          <span>·</span>
          <span>Version {version || '2.1'}</span>
        </div>
      </div>
    </motion.div>
  )
}
