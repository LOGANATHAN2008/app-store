import { motion } from 'framer-motion'
import TodayCard from './TodayCard'
import InstallButton from '../ui/InstallButton'
import AppIcon from '../ui/AppIcon'

export default function RadioCard({ app, hCard = {}, onClick }) {
  if (!app) return null;

  const customBgUrl = hCard.bgUrl || app.bannerUrl;

  return (
    <TodayCard 
      onClick={onClick} 
      bgClass={customBgUrl ? "bg-black" : "bg-[#0f071f]"}
      leftBgClass={customBgUrl ? "bg-black/60" : "bg-[#0f071f]"}
      eyebrow={(hCard && hCard.eyebrow) || "NOW AVAILABLE"}
      title={(hCard && hCard.title) || app.name}
      subtitle={(hCard && hCard.subtitle) || "Stream your favourite Tamil FM stations live — crystal clear, zero buffering."}
      appInfo={
        <>
          <AppIcon src={app.iconUrl} alt={app.name} size={64} className="shadow-lg" />
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-bold text-white truncate leading-tight">{app.name}</h3>
            <p className="text-[13px] text-white/50 truncate">{app.shortDescription || 'Loga Apps, Entertainment...'}</p>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <InstallButton app={app} size="sm" />
          </div>
        </>
      }
      rightArt={customBgUrl ? {
        background: (
          <>
            <img src={customBgUrl} className="absolute inset-0 w-full h-full object-cover opacity-100" />
          </>
        ),
        foreground: null
      } : {
        background: (
          <>
            <div className="absolute -top-1/4 -right-1/4 w-full md:w-[150%] h-[150%] bg-[#FF3B8B] rounded-full blur-[140px] opacity-40 mix-blend-screen" />
            <div className="absolute -bottom-1/4 right-0 w-full md:w-[150%] h-[150%] bg-[#7828FF] rounded-full blur-[140px] opacity-50 mix-blend-screen" />
            <div className="absolute top-1/4 right-1/4 w-[60%] h-[60%] bg-[#FF8C00] rounded-full blur-[120px] opacity-30 mix-blend-screen" />
          </>
        ),
        foreground: (
          <div className="relative flex items-center justify-center w-[200px] h-[200px] md:w-[350px] md:h-[350px] md:translate-x-12">
            {/* Animated Rings */}
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute inset-0 rounded-full border border-pink-400/40"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 2.5, opacity: [0, 0.6, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* Glowing App Icon */}
            <div className="relative z-20 rounded-[30px] shadow-[0_0_60px_rgba(255,59,139,0.5)]">
              <AppIcon src={app.iconUrl} alt={app.name} size={110} className="rounded-[30px] md:hidden" />
              <AppIcon src={app.iconUrl} alt={app.name} size={140} className="rounded-[30px] hidden md:block" />
            </div>

            {/* Equalizer Bars */}
            <div className="absolute -bottom-20 flex gap-2 items-end justify-center h-[50px]">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-2 bg-gradient-to-t from-violet-500 to-pink-500 rounded-full"
                  animate={{ scaleY: [0.3, 1, 0.3] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                  style={{ transformOrigin: 'bottom' }}
                />
              ))}
            </div>
          </div>
        )
      }}
    />
  )
}
