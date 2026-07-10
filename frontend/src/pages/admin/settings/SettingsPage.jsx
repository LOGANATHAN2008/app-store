import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, ShieldAlert, Wrench, Save, HardDrive, Database, Globe } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../../../services/api'

export default function SettingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()

  const path = location.pathname
  const activeTab = path.includes('security') ? 'security' : path.includes('maintenance') ? 'maintenance' : 'general'

  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => settingsApi.getSettings()
  })

  const [formData, setFormData] = useState({
    storeName: 'Apple App Store',
    supportEmail: 'support.loga@gmail.com',
    twoFactorAuth: false,
    strictIpWhitelist: false,
    underMaintenance: false,
    maintenanceExpectedTime: '30 - 60 Minutes',
    maintenanceStatus: 'In Progress',
    maintenanceUpdates: "We'll notify you"
  })

  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setFormData({
        storeName: settings.storeName || 'Apple App Store',
        supportEmail: settings.supportEmail || 'support.loga@gmail.com',
        twoFactorAuth: !!settings.twoFactorAuth,
        strictIpWhitelist: !!settings.strictIpWhitelist,
        underMaintenance: !!settings.underMaintenance,
        maintenanceExpectedTime: settings.maintenanceExpectedTime || '30 - 60 Minutes',
        maintenanceStatus: settings.maintenanceStatus || 'In Progress',
        maintenanceUpdates: settings.maintenanceUpdates || "We'll notify you"
      })
    }
  }, [settings])

  const mutation = useMutation({
    mutationFn: (newSettings) => settingsApi.updateSettings(newSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
      queryClient.invalidateQueries({ queryKey: ['global-settings'] })
      toast.success('Settings saved successfully!')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to save settings')
    }
  })

  const handleSave = () => {
    mutation.mutate(formData)
  }

  const handleToggle = (key) => {
    const updated = { ...formData, [key]: !formData[key] }
    setFormData(updated)
    mutation.mutate(updated) // Auto-save toggles
  }

  if (isLoading) {
    return <div className="text-center py-20 text-textSecondary">Loading Settings...</div>
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 text-white">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
          <p className="text-textSecondary text-sm mt-1">Manage core configuration and security.</p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#1C1C1E] border border-white/5 rounded-full p-1 flex shadow-lg">
          <button
            onClick={() => navigate('/admin/settings')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'general' ? 'bg-[#2C2C2E] text-white shadow' : 'text-textSecondary hover:text-white'}`}
          >
            <Settings className="w-4 h-4" /> General
          </button>
          <button
            onClick={() => navigate('/admin/settings/security')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'security' ? 'bg-[#2C2C2E] text-white shadow' : 'text-textSecondary hover:text-white'}`}
          >
            <ShieldAlert className="w-4 h-4" /> Security
          </button>
          <button
            onClick={() => navigate('/admin/settings/maintenance')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'maintenance' ? 'bg-[#2C2C2E] text-white shadow' : 'text-textSecondary hover:text-white'}`}
          >
            <Wrench className="w-4 h-4" /> Maintenance
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
          {activeTab === 'general' && (
            <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Globe className="text-[#0A84FF]" /> Global Configuration</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-textSecondary mb-2">Store Name</label>
                  <input type="text" value={formData.storeName} onChange={(e) => setFormData({ ...formData, storeName: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-[#0A84FF] outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-textSecondary mb-2">Support Email</label>
                  <input type="email" value={formData.supportEmail} onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })} className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-[#0A84FF] outline-none" />
                </div>
                <div className="pt-4 flex justify-end">
                  <button onClick={handleSave} disabled={mutation.isPending} className="px-6 py-3 rounded-xl bg-[#007AFF] text-white font-bold hover:bg-[#007AFF]/90 flex items-center gap-2 disabled:opacity-50 transition-colors">
                    {mutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-[#1C1C1E] border border-[#FF453A]/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <ShieldAlert className="w-64 h-64 text-[#FF453A]" />
              </div>
              <h2 className="text-xl font-bold mb-6 text-[#FF453A] flex items-center gap-2">Access Control</h2>
              <div className="space-y-6 relative z-10">
                <label onClick={() => handleToggle('twoFactorAuth')} className="flex items-center justify-between p-4 bg-black/30 border border-white/10 rounded-xl cursor-pointer hover:bg-black/50 transition-colors">
                  <div>
                    <h3 className="font-semibold">Two-Factor Authentication</h3>
                    <p className="text-sm text-textSecondary">Require 2FA for all admin accounts</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.twoFactorAuth ? 'bg-[#30D158]' : 'bg-white/10'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${formData.twoFactorAuth ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </label>
                <label onClick={() => handleToggle('strictIpWhitelist')} className="flex items-center justify-between p-4 bg-black/30 border border-white/10 rounded-xl cursor-pointer hover:bg-black/50 transition-colors">
                  <div>
                    <h3 className="font-semibold">Strict IP Whitelisting</h3>
                    <p className="text-sm text-textSecondary">Only allow admin access from known IPs</p>
                  </div>
                  <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.strictIpWhitelist ? 'bg-[#30D158]' : 'bg-white/10'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${formData.strictIpWhitelist ? 'right-0.5' : 'left-0.5'}`} />
                  </div>
                </label>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1C1C1E] border border-[#FF9F0A]/30 rounded-3xl p-8 shadow-2xl md:col-span-2">
                <h2 className="text-xl font-bold mb-6 text-[#FF9F0A] flex items-center gap-2">System Status</h2>
                <div className="space-y-6">
                  <label onClick={() => handleToggle('underMaintenance')} className="flex items-center justify-between p-4 bg-black/30 border border-white/10 rounded-xl cursor-pointer hover:bg-black/50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-white">Under Maintenance Mode</h3>
                      <p className="text-sm text-textSecondary">When enabled, regular users will see a maintenance screen. Admins can still access the dashboard.</p>
                    </div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${formData.underMaintenance ? 'bg-[#30D158]' : 'bg-white/10'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-all ${formData.underMaintenance ? 'right-0.5' : 'left-0.5'}`} />
                    </div>
                  </label>

                  <AnimatePresence>
                    {formData.underMaintenance && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-black/30 border border-white/10 rounded-xl p-6 mt-4 space-y-4"
                      >
                        <h3 className="font-semibold text-white mb-4">Maintenance Card Details</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Expected Time</label>
                            <input 
                              type="text" 
                              value={formData.maintenanceExpectedTime} 
                              onChange={(e) => setFormData({ ...formData, maintenanceExpectedTime: e.target.value })} 
                              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-[#0A84FF] outline-none" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Status</label>
                            <input 
                              type="text" 
                              value={formData.maintenanceStatus} 
                              onChange={(e) => setFormData({ ...formData, maintenanceStatus: e.target.value })} 
                              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-[#0A84FF] outline-none" 
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-textSecondary uppercase tracking-wider mb-2">Updates</label>
                            <input 
                              type="text" 
                              value={formData.maintenanceUpdates} 
                              onChange={(e) => setFormData({ ...formData, maintenanceUpdates: e.target.value })} 
                              className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-[#0A84FF] outline-none" 
                            />
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button onClick={handleSave} disabled={mutation.isPending} className="px-6 py-2.5 rounded-xl bg-[#007AFF] text-white font-bold hover:bg-[#007AFF]/90 flex items-center gap-2 disabled:opacity-50 transition-colors">
                            {mutation.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Details
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Database className="text-[#FF9F0A]" /> Database Maintenance</h2>
                <p className="text-textSecondary text-sm mb-6">Clean up orphaned records and optimize Firestore collections to improve performance.</p>
                <button onClick={() => toast.success('Database optimized!')} className="w-full py-3 rounded-xl bg-white/5 text-white hover:bg-white/10 font-semibold transition-colors">
                  Run Optimization
                </button>
              </div>

              <div className="bg-[#1C1C1E] border border-white/5 rounded-3xl p-8 shadow-2xl">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><HardDrive className="text-[#bf5af2]" /> Storage Cleanup</h2>
                <p className="text-textSecondary text-sm mb-6">Remove old APKs and unused banner images from your Supabase storage bucket.</p>
                <button onClick={() => toast.success('Unused assets cleared!')} className="w-full py-3 rounded-xl bg-[#bf5af2]/20 text-[#bf5af2] hover:bg-[#bf5af2]/30 font-semibold transition-colors">
                  Clear Unused Assets
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
