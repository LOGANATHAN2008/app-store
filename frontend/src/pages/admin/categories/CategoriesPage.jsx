import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FolderTree, ImageIcon, Bell, Plus, GripVertical, Edit3, Trash2 } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { appsApi } from '../../../services/api'

export default function CategoriesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const path = location.pathname
  const activeTab = path.includes('banners') ? 'banners' : path.includes('notifications') ? 'notifications' : 'manage'

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => appsApi.getCategories().then(res => res.data)
  })

  return (
    <div className="max-w-6xl mx-auto pb-24 text-white">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
          <p className="text-textSecondary text-sm mt-1">Organize your store's categories, banners, and push notifications.</p>
        </div>
        
        {/* Tab Switcher */}
        <div className="bg-[#1C1C1E] border border-white/5 rounded-full p-1 flex shadow-lg">
          <button
            onClick={() => navigate('/admin/categories')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'manage' ? 'bg-[#2C2C2E] text-white shadow' : 'text-textSecondary hover:text-white'}`}
          >
            <FolderTree className="w-4 h-4" /> Categories
          </button>
          <button
            onClick={() => navigate('/admin/banners')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'banners' ? 'bg-[#2C2C2E] text-white shadow' : 'text-textSecondary hover:text-white'}`}
          >
            <ImageIcon className="w-4 h-4" /> Banners
          </button>
          <button
            onClick={() => navigate('/admin/notifications')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'notifications' ? 'bg-[#2C2C2E] text-white shadow' : 'text-textSecondary hover:text-white'}`}
          >
            <Bell className="w-4 h-4" /> Notifications
          </button>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6"
        >
          {activeTab === 'manage' && (
            <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2"><FolderTree className="text-[#30D158]" /> Store Categories</h2>
                <button className="px-4 py-2 rounded-xl bg-[#30D158]/20 text-[#30D158] hover:bg-[#30D158]/30 font-medium transition-colors flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> Add Category
                </button>
              </div>
              
              <div className="space-y-3">
                {categories.length === 0 ? (
                  <p className="text-center text-textSecondary py-8">Loading categories...</p>
                ) : (
                  categories.map((cat, idx) => (
                    <div key={cat.id} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex items-center justify-between group hover:border-white/20 transition-colors cursor-grab">
                      <div className="flex items-center gap-4">
                        <GripVertical className="w-5 h-5 text-white/20 group-hover:text-white/40" />
                        <div 
                          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg"
                          style={{ background: `linear-gradient(135deg, ${cat.gradient[0]}, ${cat.gradient[1]})` }}
                        >
                          {cat.emoji}
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-lg">{cat.name}</h3>
                          <p className="text-sm text-textSecondary">{cat.appCount} Apps</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:bg-white/10 rounded-full transition-colors text-textSecondary hover:text-white">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-[#FF453A]/20 rounded-full transition-colors text-textSecondary hover:text-[#FF453A]">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'banners' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-6 shadow-2xl col-span-full md:col-span-1">
                <div className="aspect-video bg-black/50 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-textSecondary hover:text-white hover:border-white/30 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8" />
                  </div>
                  <p className="font-semibold">Upload New Banner</p>
                  <p className="text-xs mt-1 opacity-70">1200x630 recommended</p>
                </div>
              </div>
              <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
                <img src="https://picsum.photos/seed/promo/800/400" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="relative z-10 h-full flex flex-col justify-end">
                  <span className="bg-[#007AFF] text-white text-xs font-bold px-2 py-1 rounded-full w-max mb-2">Active</span>
                  <h3 className="text-xl font-bold text-white mb-1">Summer Sale Promo</h3>
                  <p className="text-sm text-white/80">Running until Aug 31</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2"><Bell className="text-[#FF9F0A]" /> Push Notifications</h2>
                  <p className="text-sm text-textSecondary mt-1">Send global alerts to all app store users.</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-textSecondary mb-2">Notification Title</label>
                  <input type="text" placeholder="e.g. Big Update Available!" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-[#FF9F0A] outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-textSecondary mb-2">Message Body</label>
                  <textarea rows={4} placeholder="Type your message here..." className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-[#FF9F0A] outline-none resize-none" />
                </div>
                <div className="pt-4 flex justify-end">
                  <button className="px-8 py-3 rounded-xl bg-[#FF9F0A] text-black font-bold hover:bg-[#FF9F0A]/90 flex items-center gap-2 shadow-lg shadow-[#FF9F0A]/20 transition-colors">
                    <Bell className="w-5 h-5" /> Send Push Notification
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
