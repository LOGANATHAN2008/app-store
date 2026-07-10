import { NavLink, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Smartphone, Users, Star,
  FolderTree, BarChart3, Settings, LogOut,
  AppWindow, Image as ImageIcon, Bell, CheckSquare,
  TrendingUp, Search, Map, ShieldAlert,
  Edit3, Sparkles, Wand2, FileText, LineChart, ShieldCheck, BadgeCheck, Award
} from 'lucide-react'
import { useAuthStore } from '../../store'
import logoUrl from '../../assets/logo.png'
import { useQuery } from '@tanstack/react-query'
import { statsApi } from '../../services/api'

const navGroupsConfig = [
  {
    name: 'Main',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    ]
  },
  {
    name: 'Apps',
    items: [
      { name: 'Upload New App', icon: AppWindow, path: '/admin/apps/new' },
      { name: 'Upload History', icon: Star, path: '/admin/apps/history' },
      { name: 'Manage Apps', icon: Smartphone, path: '/admin/apps' },
      { name: 'Approval Queue', icon: CheckSquare, path: '/admin/apps/pending', badgeKey: 'pendingApps' },
      { name: 'Featured Apps', icon: Star, path: '/admin/featured' },
      { name: 'Advertisements', icon: ImageIcon, path: '/admin/promotions' },
      { name: 'App Updates', icon: Edit3, path: '/admin/apps/updates', badgeKey: 'updateApps' },
    ]
  },
  {
    name: 'Users',
    items: [
      { name: 'All Users', icon: Users, path: '/admin/users' },
      { name: 'Staff Management', icon: ShieldAlert, path: '/admin/staff' },
      { name: 'Banned Users', icon: ShieldAlert, path: '/admin/users/banned', badgeKey: 'bannedUsers' },
    ]
  },
  {
    name: 'Reviews',
    items: [
      { name: 'All Reviews', icon: Star, path: '/admin/reviews', badgeKey: 'totalReviews' },
      { name: 'Flagged', icon: ShieldAlert, path: '/admin/reviews/flagged', badgeKey: 'flaggedReviews' },
    ]
  },
  {
    name: 'Categories',
    items: [
      { name: 'Manage', icon: FolderTree, path: '/admin/categories' },
      { name: 'Banners', icon: ImageIcon, path: '/admin/banners' },
      { name: 'Developer Websites', icon: ImageIcon, path: '/admin/developer-websites' },
      { name: 'Notifications', icon: Bell, path: '/admin/notifications' },
    ]
  },
  {
    name: 'Analytics',
    items: [
      { name: 'Installs', icon: BarChart3, path: '/admin/analytics/installs' },
      { name: 'Top Charts', icon: TrendingUp, path: '/admin/analytics/charts' },
      { name: 'Search', icon: Search, path: '/admin/analytics/search' },
      { name: 'Geography', icon: Map, path: '/admin/analytics/geography' },
    ]
  },
  {
    name: 'Settings',
    items: [
      { name: 'General', icon: Settings, path: '/admin/settings' },
      { name: 'Security', icon: ShieldAlert, path: '/admin/settings/security' },
      { name: 'Maintenance', icon: Settings, path: '/admin/settings/maintenance' },
    ]
  },
  {
    name: 'Certificates',
    items: [
      { name: 'Generate Certificate', icon: Award, path: '/admin/features/certificate-generation' },
      { name: 'Search Certificate', icon: Search, path: '/admin/features/certificate-search' }
    ]
  },
  {
    name: 'Events',
    items: [
      { name: 'Developer Upload Day', icon: Sparkles, path: '/admin/events/developer-upload-day' },
      { name: 'Event Submissions', icon: CheckSquare, path: '/admin/events/submissions' }
    ]
  },
  {
    name: 'Unique Features',
    items: [
      { name: 'AI Review Summary', icon: Sparkles, path: '/admin/features/ai-review' },
      { name: 'AI Screenshot Gen', icon: Wand2, path: '/admin/features/ai-screenshot' },
      { name: 'AI App Description', icon: FileText, path: '/admin/features/ai-description' },
      { name: 'AI App Ranking', icon: LineChart, path: '/admin/features/ai-ranking' },
      { name: 'AI Malware Scan', icon: ShieldCheck, path: '/admin/features/ai-malware' },
      { name: 'Developer Verification', icon: BadgeCheck, path: '/admin/features/ai-verification' },
    ]
  }
]

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const { user, logout } = useAuthStore()

  const { data: badges = {} } = useQuery({
    queryKey: ['admin-badges'],
    queryFn: () => statsApi.getBadges().then(res => res.data),
    refetchInterval: 30000 // Refetch every 30 seconds
  })

  // Role-based Access Control for Sidebar
  const visibleGroups = navGroupsConfig.map(group => {
    if (user?.role === 'staff' || user?.isAdmin === false) {
      if (group.name === 'Main') return group;
      if (group.name === 'Apps') {
        return {
          ...group,
          items: group.items.filter(item => item.name === 'Upload New App' || item.name === 'Upload History')
        }
      }
      return null;
    }
    return group;
  }).filter(Boolean);

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside className={`fixed left-0 top-0 bottom-0 w-[260px] bg-black/80 md:bg-black/60 backdrop-blur-3xl border-r border-white/10 flex flex-col z-50 overflow-y-auto transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 border-b border-white/10 sticky top-0 bg-black/40 backdrop-blur-md z-10 flex items-center justify-between">
        <Link to="/admin/dashboard" onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)} className="flex items-center gap-3">
          <img src={logoUrl} alt="App Store" className="w-8 h-8 rounded-lg" />
          <span className="text-xl font-bold text-white tracking-tight">App Store</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 pb-20 space-y-6">
        {visibleGroups.map((group, idx) => (
          <div key={idx}>
            {group.name !== 'Main' && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-white/40 uppercase tracking-wider">
                {group.name}
              </h3>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-lg transition-all relative ${
                      isActive 
                        ? 'text-white bg-white/10 font-medium' 
                        : 'text-textSecondary hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute left-0 top-0 bottom-0 w-1 bg-[#0A84FF] rounded-r-full"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <div className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      {item.badgeKey && badges[item.badgeKey] > 0 && (
                        <span className="bg-[#0A84FF]/20 text-[#0A84FF] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {badges[item.badgeKey]}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 sticky bottom-0 bg-black/40 backdrop-blur-md">
        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-textSecondary hover:bg-white/5 hover:text-[#FF453A] rounded-lg transition-colors text-sm"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
    </>
  )
}
