import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, User, Apple, Smartphone, Menu } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuthStore, useUIStore } from '../../store'

import logoImg from '../../assets/logo.png'

const TABS = [
  { label: 'Today',      path: '/' },
  { label: 'Launchpad',  path: '/launchpad' },
  { label: 'Games',      path: '/category/games' },
  { label: 'Apps',       path: '/apps' },
  { label: 'Arcade',     path: '/arcade' },
  { label: 'Search',     path: '/search' },
]

export default function Navbar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { user } = useAuthStore()
  const { setProfileModalOpen, selectedOS, setSelectedOS, setSidebarOpen, sidebarOpen } = useUIStore()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const activeTab = TABS.find(t =>
    t.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(t.path)
  )?.label ?? 'Today'

  return (
    <>
    <header
      className={`fixed z-50 transition-all duration-300 ${sidebarOpen ? 'pointer-events-none' : ''}`}
      style={{
        top: sidebarOpen ? '-100px' : (scrolled ? '12px' : '20px'),
        left: '50%',
        transform: `translateX(-50%) scale(${sidebarOpen ? 0.95 : 1})`,
        opacity: sidebarOpen ? 0 : 1,
        width: 'calc(100% - 32px)',
        maxWidth: '1000px',
        borderRadius: '24px',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(40px) saturate(200%) brightness(1.1)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%) brightness(1.1)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
        boxShadow: `
          0 8px 32px rgba(0, 0, 0, 0.40),
          0 2px 8px rgba(0, 0, 0, 0.20),
          inset 0 1px 0 rgba(255, 255, 255, 0.25),
          inset 0 -1px 0 rgba(255, 255, 255, 0.05)
        `,
        overflow: 'hidden',
      }}
    >
      {/* Specular top highlight */}
      <div 
        className="absolute top-0 left-[10%] right-[10%] h-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.60) 25%, rgba(255, 255, 255, 0.95) 50%, rgba(255, 255, 255, 0.60) 75%, transparent 100%)',
          borderRadius: '50%'
        }} 
      />

      {/* Shimmer sweep animation */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.25) 50%, transparent 100%)',
          animation: 'gtb-shimmer 5s ease-in-out infinite',
        }}
      />

      <div className="relative z-10 px-6 sm:px-7">
        {/* Top bar */}
        <div className="flex items-center gap-3 h-[60px]">
          {/* Hamburger Menu (Mobile) */}
          <button 
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-[34px] h-[34px] rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors flex-shrink-0 border border-white/10"
            aria-label="Open Menu"
          >
            <Menu size={18} className="text-white" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mr-auto flex-shrink-0 group" aria-label="App Store home">
            <div className="w-[34px] h-[34px] rounded-full flex items-center justify-center transition-transform group-hover:scale-105 overflow-hidden bg-white/10">
              <img src={logoImg} alt="App Store Logo" className="w-full h-full object-cover no-reinvert" />
            </div>
            <span className="text-white font-bold text-[18px] tracking-tight hidden sm:block select-none">
              App Store
            </span>
          </Link>

          {/* Search bar */}
          <button
            onClick={() => navigate('/search')}
            className="flex items-center gap-2 rounded-full px-3.5 h-[34px] flex-1 max-w-[280px] transition-all hover:bg-white/10"
            style={{ background: 'rgba(255,255,255,0.07)', border: '0.5px solid rgba(255,255,255,0.12)' }}
            aria-label="Search the App Store"
          >
            <Search size={14} className="text-[#8E8E93] flex-shrink-0" />
            <span className="text-[#8E8E93] text-[13.5px] select-none font-medium truncate mt-[1px]">Games, Apps, Stories...</span>
          </button>

          {/* Account button */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="w-[34px] h-[34px] rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0A84FF, #005BB5)', boxShadow: '0 2px 8px rgba(10, 132, 255, 0.4)' }}
            aria-label="Account"
          >
            {user?.picture ? (
              <img src={user.picture} alt="Profile" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
            ) : user ? (
              <span className="text-white text-[15px] font-bold shadow-sm">
                {(user.name || user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </span>
            ) : (
              <User size={16} className="text-white" />
            )}
          </button>
        </div>



        {/* Tab bar - Only visible on desktop since mobile has bottom bar */}
        <nav className="hidden md:flex items-center h-[52px] gap-2 border-t border-white/10" aria-label="App Store sections">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.label
            return (
              <Link
                key={tab.label}
                to={tab.path}
                className="relative px-5 h-9 flex items-center justify-center text-[14px] transition-all duration-200 rounded-full"
                style={{ 
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  background: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  fontWeight: isActive ? 600 : 500
                }}
                aria-current={isActive ? 'page' : undefined}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-pill"
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '1px solid rgba(255,255,255,0.25)',
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
                      backdropFilter: 'blur(10px)'
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
    </>
  )
}
