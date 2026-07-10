import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, LayoutGrid, Rocket, Copy, Gamepad2, Layers, Image, Activity, Send, Clapperboard, Globe, TrendingUp, Apple, Smartphone, Code2 } from 'lucide-react'
import { useUIStore } from '../../store'
import { useQuery } from '@tanstack/react-query'
import { developerWebsitesApi } from '../../services/api'
import logoImg from '../../assets/logo.png'

const MAIN_NAV = [
  { label: 'Search', icon: Search, path: '/search' },
  { label: 'Today', icon: LayoutGrid, path: '/' },
  { label: 'Launchpad', icon: TrendingUp, path: '/launchpad' },
  { label: 'Games', icon: Rocket, path: '/category/games' },
  { label: 'Apps', icon: Copy, path: '/apps' },
  { label: 'Arcade', icon: Gamepad2, path: '/arcade' }
]

const CATEGORIES = [
  { label: 'Developer Websites', icon: Globe, path: '/developer-websites' },
  { label: 'About the Developer', icon: Code2, path: '/about' },
  { label: 'Photo & Video', icon: Image, path: '/category/photo-video' },
  { label: 'Health & Fitness', icon: Activity, path: '/category/health-fitness' },
  { label: 'Productivity', icon: Send, path: '/category/productivity' },
  { label: 'Entertainment', icon: Clapperboard, path: '/category/entertainment' }
]

export default function Sidebar() {
  const location = useLocation()
  const { sidebarOpen, setSidebarOpen, selectedOS, setSelectedOS } = useUIStore()

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[45]"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside 
        className={`flex flex-col w-[260px] h-[100dvh] fixed left-0 top-0 border-r border-white/10 bg-[#1e1e1e]/60 backdrop-blur-2xl z-[50] transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
      
      {/* Brand Header */}
      <div className="h-[76px] pl-[72px] pr-4 flex items-center gap-3">
        <img src={logoImg} alt="Logo" className="w-[28px] h-[28px] object-contain" />
        <span className="text-[19px] font-bold tracking-tight text-white/95">LM Store</span>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-24 custom-scrollbar overscroll-contain touch-pan-y">
        
        {/* OS Selector Pills (Apple Style) */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center p-1 rounded-[20px] bg-[#1C1C1E]/80 border border-white/5 w-full max-w-[220px]">
            <button 
              onClick={() => setSelectedOS('iOS')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[16px] transition-all duration-200 ${
                selectedOS === 'iOS' 
                  ? 'bg-[#2C2C2E] text-white shadow-sm border border-white/10' 
                  : 'bg-transparent text-white/40 hover:text-white/80 border border-transparent'
              }`}
            >
              <Apple className="w-3.5 h-3.5 mb-[1px]" />
              <span className="text-[12px] font-semibold tracking-wide">iOS</span>
            </button>
            <button 
              onClick={() => setSelectedOS('Android')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-[16px] transition-all duration-200 ${
                selectedOS === 'Android' 
                  ? 'bg-[#2C2C2E] text-white shadow-sm border border-white/10' 
                  : 'bg-transparent text-white/40 hover:text-white/80 border border-transparent'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="text-[12px] font-semibold tracking-wide">Android</span>
            </button>
          </div>
        </div>
        
        {/* Main Navigation */}
        <nav className="space-y-1 mb-8">
          {MAIN_NAV.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
                  isActive ? 'bg-[#007AFF] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#007AFF] group-hover:text-white transition-colors'}`} />
                <span className="text-[15px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Categories Header */}
        <div className="px-3 mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-white/40">
            Categories
          </span>
        </div>

        {/* Categories List */}
        <nav className="space-y-1">
          <Link 
            to="/top-charts" 
            onClick={() => setSidebarOpen(false)}
            className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
              location.pathname === '/top-charts' ? 'bg-[#007AFF] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="w-5 h-5 rounded-md bg-[#007AFF] flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[15px] font-medium">Top Charts</span>
          </Link>

          {CATEGORIES.map((cat) => {
            const isActive = location.pathname === cat.path
            return (
              <Link
                key={cat.label}
                to={cat.path}
                onClick={() => setSidebarOpen(false)}
                className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 group ${
                  isActive ? 'bg-[#007AFF] text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <cat.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#007AFF] group-hover:text-white transition-colors'}`} />
                <span className="text-[15px] font-medium">{cat.label}</span>
              </Link>
            )
          })}
        </nav>

      </div>
      </aside>
    </>
  )
}
