import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'

export default function AIFeaturePlaceholder({ title, description }) {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto min-h-[70vh] flex flex-col items-center justify-center text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-24 h-24 bg-gradient-to-br from-[#0A84FF] to-[#bf5af2] rounded-[24px] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(10,132,255,0.3)]"
      >
        <Sparkles size={48} className="text-white" />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight"
      >
        {title}
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-[#8E8E93] text-lg md:text-xl max-w-2xl mb-10"
      >
        {description}
      </motion.p>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 w-full max-w-xl flex flex-col items-center"
      >
        <p className="text-white/70 mb-6">
          This AI module is currently being fine-tuned by our ML engineers. Check back soon for the beta release!
        </p>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-[#0A84FF] animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#30D158] animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-[#FF9F0A] animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </motion.div>
    </div>
  )
}
