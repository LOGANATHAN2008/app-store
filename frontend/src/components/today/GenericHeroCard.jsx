import React from 'react'
import { motion } from 'framer-motion'
import TodayCard from './TodayCard'
import InstallButton from '../ui/InstallButton'
import AppIcon from '../ui/AppIcon'

export default function GenericHeroCard({ app, hCard = {}, onClick }) {
  if (!app) return null;

  const bgColor = hCard.bgColor || '#007AFF';
  const customBgUrl = hCard.bgUrl || app.bannerUrl;
  const customIconUrl = hCard.customIconUrl || app.iconUrl;

  let animationClass = hCard.animationCode || '';
  let rawStyle = null;

  if (animationClass.includes('{')) {
    rawStyle = animationClass;
    // Require a { after the class name to avoid matching .net in comments!
    const match = rawStyle.match(/\.([a-zA-Z0-9_-]+)\s*\{/);
    if (match) {
      animationClass = match[1];
    } else {
      animationClass = '';
    }
  }

  console.log('Hero Card:', app.name, 'Animation Class:', animationClass, 'Raw Style:', !!rawStyle);

  return (
    <TodayCard 
      onClick={onClick} 
      bgClass="bg-[#1C1C1E]"
      leftBgClass="bg-[#1C1C1E]/60"
      eyebrow="FEATURED APP"
      title={app.name}
      subtitle={app.description ? (app.description.length > 80 ? app.description.slice(0, 80) + '...' : app.description) : 'Discover this amazing app now available on the store.'}
      appInfo={
        <>
          <AppIcon src={app.iconUrl} alt={app.name} size={64} className="shadow-lg" />
          <div className="flex-1 min-w-0">
            <h3 className="text-[16px] font-bold text-white truncate leading-tight">{app.name}</h3>
            <p className="text-[13px] text-white/50 truncate">{app.developer}</p>
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
          <div 
            className="absolute inset-0 opacity-80" 
            style={{ background: `linear-gradient(135deg, ${bgColor}40 0%, ${bgColor} 100%)` }} 
          />
        ),
        foreground: (
          <div className={`relative z-20 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-3xl overflow-hidden translate-x-4 md:translate-x-12 ${animationClass}`}>
            {rawStyle && <style dangerouslySetInnerHTML={{ __html: rawStyle }} />}
            <AppIcon src={customIconUrl} alt={app.name} size={130} className="md:hidden" />
            <AppIcon src={customIconUrl} alt={app.name} size={180} className="hidden md:block" />
          </div>
        )
      }}
    />
  )
}
