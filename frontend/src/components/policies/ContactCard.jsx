import { motion } from 'framer-motion'
import { Mail, Globe } from 'lucide-react'

export default function ContactCard() {
  return (
    <div className="mt-4 p-5 rounded-[16px] border border-white/10" style={{ background: 'linear-gradient(135deg, rgba(10,132,255,0.1), rgba(10,132,255,0.02))' }}>
      <h4 className="font-bold text-white mb-1">Data Protection Officer</h4>
      <p className="text-[14px] text-white/60 mb-1">Email: privacy@appstore-clone.com</p>
      <p className="text-[14px] text-white/60 mb-5">Response time: within 48 hours</p>
      
      <div className="flex gap-3">
        <motion.button whileTap={{ scale: 0.97 }} className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-[14px] font-medium bg-[#0A84FF] text-white transition-opacity hover:opacity-90">
          <Mail size={16} /> Email Us
        </motion.button>
        <motion.button whileTap={{ scale: 0.97 }} className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 text-[14px] font-medium bg-white/10 text-white transition-opacity hover:bg-white/20">
          <Globe size={16} /> Website
        </motion.button>
      </div>
    </div>
  )
}
