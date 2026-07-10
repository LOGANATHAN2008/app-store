import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Layout, Rocket, Layers, Gamepad2, Search } from 'lucide-react'
import GlassTabBar from '../ui/GlassTabBar'
import { useUIStore } from '../../store'

const TABS = [
  { id: 'today',      label: 'Today',  icon: Layout,   path: '/' },
  { id: 'games',      label: 'Games',  icon: Rocket,   path: '/category/games' },
  { id: 'apps',       label: 'Apps',   icon: Layers,   path: '/category/productivity' },
  { id: 'arcade',     label: 'Arcade', icon: Gamepad2, path: '/category/entertainment' },
  { id: 'search',     label: 'Search', icon: Search,   path: '/search' },
]

export default function BottomTabBar() {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { sidebarOpen } = useUIStore()

  // Derive active tab from current pathname
  const activeTab = (() => {
    for (const tab of [...TABS].reverse()) {
      if (tab.path === '/') {
        if (location.pathname === '/') return tab.id
      } else if (location.pathname.startsWith(tab.path)) {
        return tab.id
      }
    }
    return 'today'
  })()

  const handleChange = (id) => {
    const tab = TABS.find(t => t.id === id)
    if (tab) navigate(tab.path)
  }

  // Only show on mobile
  return (
    <div className="md:hidden">
      <GlassTabBar
        tabs={TABS}
        activeTab={activeTab}
        onChange={handleChange}
        background="dark"
        iconSize={20}
        splitLastTab={true}
        isHidden={sidebarOpen}
      />
    </div>
  )
}
