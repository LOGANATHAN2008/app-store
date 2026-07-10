import { motion } from 'framer-motion'
import TodayCard from './TodayCard'
import InstallButton from '../ui/InstallButton'
import AppIcon from '../ui/AppIcon'

export default function ResumeCard({ app, hCard, onClick }) {
  if (!app) return null;

  const customBg = (hCard && hCard.bgUrl) || app.bannerUrl;

  return (
    <TodayCard 
      onClick={onClick} 
      bgClass={customBg ? "bg-black" : "bg-[#050a1f]"}
      leftBgClass={customBg ? "bg-black/60" : "bg-[#050a1f]"}
      eyebrow={(hCard && hCard.eyebrow) || "EDITOR's CHOICE"}
      title={(hCard && hCard.title) || app.name}
      subtitle={(hCard && hCard.subtitle) || "Craft a job-winning resume in minutes with AI-powered templates and tips."}
      appInfo={
        <>
          <AppIcon src={app.iconUrl} alt={app.name} size={64} className="shadow-lg" />
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-bold text-white truncate leading-tight">{app.name}</h3>
            <p className="text-[13px] text-white/50 truncate">{app.shortDescription || 'Create pro resumes in minutes'}</p>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <InstallButton app={app} size="sm" />
          </div>
        </>
      }
      rightArt={customBg ? {
        background: (
          <>
            <img src={customBg} className="absolute inset-0 w-full h-full object-cover opacity-100" />
          </>
        ),
        foreground: null
      } : {
        background: (
          <>
            <div className="absolute -bottom-1/4 right-0 w-full md:w-[150%] h-[150%] bg-[#00C878] rounded-full blur-[140px] opacity-40 mix-blend-screen" />
            <div className="absolute -top-1/4 right-1/4 w-full md:w-[150%] h-[150%] bg-[#0084FF] rounded-full blur-[140px] opacity-40 mix-blend-screen" />
          </>
        ),
        foreground: (
          <div className="relative md:translate-x-12">
            <motion.div 
              className="relative w-[180px] h-[250px] md:w-[280px] md:h-[380px] rounded-[24px] bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)] p-4 md:p-8 flex flex-col gap-3 md:gap-5"
              initial={{ rotate: -5, y: 10 }}
              animate={{ rotate: -8, y: -10 }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            >
              {/* Avatar / Header Skeleton */}
              <div className="flex items-center gap-4 border-b border-white/10 pb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/20" />
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-3 md:h-4 w-full bg-white/30 rounded" />
                  <div className="h-2.5 md:h-3 w-2/3 bg-white/15 rounded" />
                </div>
              </div>
              
              {/* Line Skeletons */}
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i} 
                  className="h-2.5 md:h-3 bg-gradient-to-r from-white/10 via-white/40 to-white/10 rounded w-full relative overflow-hidden"
                >
                  <div 
                    className="absolute inset-0 w-[200%] bg-gradient-to-r from-transparent via-white/50 to-transparent"
                    style={{ animation: 'shimmer-sweep 2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }}
                  />
                </motion.div>
              ))}
              <motion.div className="h-2.5 md:h-3 bg-white/10 rounded w-2/3 mt-2" />

              {/* Floating AI Badge */}
              <motion.div 
                className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 bg-green-500 text-white text-[13px] md:text-[15px] font-bold px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-[0_10px_30px_rgba(0,200,120,0.4)]"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                AI Powered ✨
              </motion.div>
            </motion.div>
          </div>
        )
      }}
    />
  )
}
