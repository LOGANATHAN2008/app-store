import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const CATEGORIES = [
  { id: 'games',         name: 'Games',          emoji: '🎮', from: '#FF3B30', to: '#FF9500' },
  { id: 'productivity',  name: 'Productivity',   emoji: '⚡', from: '#0A84FF', to: '#30D158' },
  { id: 'social',        name: 'Social',         emoji: '💬', from: '#BF5AF2', to: '#0A84FF' },
  { id: 'health',        name: 'Health',         emoji: '❤️', from: '#30D158', to: '#32ADE6' },
  { id: 'education',     name: 'Education',      emoji: '📚', from: '#FF9F0A', to: '#FF3B30' },
  { id: 'finance',       name: 'Finance',        emoji: '💰', from: '#34C759', to: '#0A84FF' },
  { id: 'entertainment', name: 'Entertainment',  emoji: '🎬', from: '#FF453A', to: '#BF5AF2' },
  { id: 'photography',   name: 'Photo & Video',  emoji: '📸', from: '#BF5AF2', to: '#FF453A' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}
const cardVariant = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function CategoryGrid() {
  return (
    <section className="section">
      <div className="flex items-end justify-between mb-4">
        <h2 className="section-title">Explore by Category</h2>
      </div>

      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {CATEGORIES.map((cat) => (
          <motion.div key={cat.id} variants={cardVariant}>
            <Link
              to={`/category/${cat.id}`}
              className="relative flex items-center gap-3 p-4 rounded-[18px] overflow-hidden group transition-transform active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${cat.from} 0%, ${cat.to} 100%)`,
                minHeight: 72,
              }}
              aria-label={`Browse ${cat.name}`}
            >
              {/* Ambient glow */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
                style={{ background: '#fff' }}
              />
              <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{cat.emoji}</span>
              <span className="text-white font-semibold text-[14px] leading-tight flex-1">{cat.name}</span>
              <ChevronRight size={14} className="text-white/60 flex-shrink-0" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}
