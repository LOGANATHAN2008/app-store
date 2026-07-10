import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export default function TagInput({ tags, onChange }) {
  const [input, setInput] = useState('')

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = input.trim()
      if (val && !tags.includes(val) && tags.length < 10) {
        onChange([...tags, val])
      }
      setInput('')
    } else if (e.key === 'Backspace' && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (indexToRemove) => {
    onChange(tags.filter((_, index) => index !== indexToRemove))
  }

  return (
    <div className="w-full bg-black/20 border border-white/10 rounded-xl p-3 flex flex-wrap gap-2 focus-within:border-[#007AFF] transition-colors">
      <AnimatePresence>
        {tags.map((tag, index) => (
          <motion.div
            key={tag}
            initial={{ opacity: 0, x: 20, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-1.5 bg-[#007AFF]/20 text-[#007AFF] px-3 py-1.5 rounded-full text-sm font-medium border border-[#007AFF]/20"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(index)}
              className="hover:bg-[#007AFF]/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      
      {tags.length < 10 && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Type a tag and press Enter" : "Add tag"}
          className="flex-1 min-w-[120px] bg-transparent text-white text-sm outline-none placeholder:text-textSecondary/50 placeholder:border placeholder:border-dashed placeholder:border-white/20 placeholder:px-3 placeholder:py-1.5 placeholder:rounded-full"
        />
      )}
    </div>
  )
}
