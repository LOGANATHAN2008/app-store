import { motion } from 'framer-motion'

export default function TodayCard({ 
  bgClass, 
  onClick, 
  leftBgClass = '',
  eyebrow,
  title,
  subtitle,
  appInfo,
  rightArt
}) {
  return (
    <motion.div
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`relative w-full h-[400px] md:h-[460px] overflow-hidden rounded-[20px] cursor-pointer shadow-2xl border border-white/10 flex flex-col md:flex-row ${bgClass}`}
    >
      {/* Background layer for the entire card (right side art base) */}
      <div className="absolute inset-0 z-0">{rightArt.background}</div>

      {/* BOTTOM LEFT TEXT CONTENT */}
      {/* Positioned absolute so the background can span the full width, with a gradient fade at the bottom left for readability */}
      <div className={`absolute inset-0 z-20 p-6 md:p-10 flex flex-col justify-end bg-gradient-to-t from-[#000000]/90 via-[#000000]/40 to-transparent md:bg-gradient-to-tr md:from-[#000000]/95 md:via-[#000000]/40 pointer-events-none`}>
        <div className="w-full md:w-[50%] pointer-events-auto">
          <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-2">{eyebrow}</p>
          <h2 className="text-[32px] md:text-[40px] font-[800] leading-tight mb-2 text-white">{title}</h2>
          <p className="text-[15px] text-white/80 drop-shadow-md">{subtitle}</p>
          
          <hr className="border-t border-white/20 my-5 md:w-[80%]" />
          
          <div className="flex items-center gap-4 md:w-[80%]">
            {appInfo}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL (Art Foreground) */}
      <div className="absolute inset-0 md:relative z-10 flex-1 h-full flex items-start pt-12 md:pt-0 justify-center md:items-center overflow-hidden">
        {rightArt.foreground}
      </div>
    </motion.div>
  )
}
