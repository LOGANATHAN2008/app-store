import { motion } from 'framer-motion'
import { Info, CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react'

export default function HighlightBox({ text, color }) {
  const colorMap = {
    blue:   { bg: 'rgba(10,132,255,0.1)', border: 'rgba(10,132,255,0.2)', text: '#0A84FF', icon: Info },
    green:  { bg: 'rgba(48,209,88,0.1)',  border: 'rgba(48,209,88,0.2)',  text: '#30D158', icon: CheckCircle },
    purple: { bg: 'rgba(175,82,222,0.1)', border: 'rgba(175,82,222,0.2)', text: '#AF52DE', icon: ShieldAlert },
    orange: { bg: 'rgba(255,159,10,0.1)', border: 'rgba(255,159,10,0.2)', text: '#FF9F0A', icon: AlertTriangle },
    yellow: { bg: 'rgba(255,214,10,0.1)', border: 'rgba(255,214,10,0.2)', text: '#FFD60A', icon: AlertTriangle },
  }
  
  const theme = colorMap[color] || colorMap.blue
  const Icon = theme.icon

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mt-4 p-4 rounded-[12px] flex items-start gap-3 border"
      style={{ background: theme.bg, borderColor: theme.border }}
    >
      <Icon size={18} style={{ color: theme.text }} className="shrink-0 mt-0.5" />
      <p className="text-[14px] font-medium leading-relaxed" style={{ color: theme.text }}>
        {text}
      </p>
    </motion.div>
  )
}
