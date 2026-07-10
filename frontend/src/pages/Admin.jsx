import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appsApi, uploadApi } from '../services/api'
import { useAuthStore } from '../store'
import { Star, Trash2, Edit2, Plus, BarChart2, Package, Users, DollarSign, LogOut } from 'lucide-react'
import AppIcon from '../components/ui/AppIcon'
import { formatInstalls, formatRating, formatPrice } from '../utils/formatters'
import toast from 'react-hot-toast'

const CATEGORIES = ['games', 'productivity', 'social', 'health', 'education', 'finance', 'entertainment', 'photography']

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-surface rounded-card p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: color + '20' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p className="text-textSecondary text-sm">{label}</p>
        <p className="text-white text-2xl font-bold">{value}</p>
      </div>
    </div>
  )
}

function UploadForm({ onClose, editApp }) {
  const qc = useQueryClient()
  const [form, setForm] = useState(editApp || {
    name: '', developer: '', shortDescription: '', description: '', category: 'games',
    price: 0, version: '1.0.0', minOS: 'iOS 14.0+', ageRating: '4+', isFeatured: false,
    iconUrl: '', screenshotUrls: '', bannerUrl: '', downloadUrl: '', tags: '', websiteUrl: '',
  })
  const [uploading, setUploading] = useState(false)

  const mutation = useMutation({
    mutationFn: (data) => editApp ? appsApi.update(editApp.id, data) : appsApi.create(data),
    onSuccess: () => {
      toast.success(editApp ? 'App updated!' : 'App created!')
      qc.invalidateQueries(['apps'])
      qc.invalidateQueries(['search'])
      onClose()
    },
    onError: () => toast.error('Failed to save app'),
  })

  const handleIconUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadApi.icon(file)
      setForm(f => ({ ...f, iconUrl: res.url }))
      toast.success('Icon uploaded')
    } catch (err) {
      console.error(err)
      toast.error('Upload failed: ' + (err?.message || err?.error || 'Unknown error'))
    }
    finally { setUploading(false) }
  }

  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const res = await uploadApi.banner(file)
      setForm(f => ({ ...f, bannerUrl: res.url }))
      toast.success('Banner uploaded')
    } catch (err) {
      console.error(err)
      toast.error('Upload failed: ' + (err?.message || err?.error || 'Unknown error'))
    }
    finally { setUploading(false) }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      price: Number(form.price),
      tags: typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()) : form.tags,
      screenshotUrls: typeof form.screenshotUrls === 'string' ? form.screenshotUrls.split(',').map(s => s.trim()) : form.screenshotUrls
    }
    mutation.mutate(payload)
  }

  const field = (label, key, type = 'text', opts = {}) => (
    <div>
      <label className="text-textSecondary text-xs font-medium uppercase tracking-wider mb-1.5 block">{label}</label>
      {type === 'textarea' ? (
        <textarea value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-surfaceRaised rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-accent resize-none" rows={4} {...opts} />
      ) : type === 'select' ? (
        <select value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-surfaceRaised rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-accent">
          {opts.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={form[key] || ''} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-surfaceRaised rounded-xl px-4 py-3 text-white outline-none border border-white/10 focus:border-accent" {...opts} />
      )}
    </div>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative bg-[#1C1C1E]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{ boxShadow: '0 24px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)' }}
      >
        <h2 className="text-2xl font-bold mb-8 tracking-tight">{editApp ? 'Edit Application' : 'New Application'}</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="col-span-1 md:col-span-2 flex items-center gap-6 p-5 rounded-2xl bg-white/5 border border-white/5 mb-2">
            <AppIcon src={form.iconUrl} alt={form.name || 'App'} size={88} className="shadow-lg" />
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold">{form.name || 'App Name'}</h3>
              <div className="flex items-center gap-2">
                <label className="bg-[#0A84FF] hover:bg-[#0070E0] text-white px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-colors shadow-lg">
                  {uploading ? 'Uploading...' : 'Upload Icon'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                </label>
                <label className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold cursor-pointer transition-colors shadow-lg">
                  {uploading ? 'Uploading...' : 'Upload Banner'}
                  <input type="file" accept="image/*" className="hidden" onChange={handleBannerUpload} />
                </label>
              </div>
              <p className="text-[11px] text-textSecondary uppercase tracking-widest mt-1">Image Storage powered by Supabase</p>
            </div>
          </div>

          <div className="md:col-span-2 p-5 rounded-2xl bg-[#007AFF]/5 border border-[#007AFF]/20 mb-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-[#007AFF] uppercase tracking-wider">Quick Paste URLs</h4>
              <p className="text-xs text-[#007AFF]/80 hidden sm:block">Sample Image: <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded select-all cursor-pointer">https://picsum.photos/1200/600</span></p>
            </div>
            {field('Icon Image URL', 'iconUrl', 'text', { placeholder: 'Paste Icon URL here...' })}
            {field('Banner Image URL', 'bannerUrl', 'text', { placeholder: 'Paste Banner URL here...' })}
            
            {form.bannerUrl && (
              <div className="mt-2 rounded-xl overflow-hidden border border-white/10 h-32 relative bg-black/30 shadow-inner">
                <img src={form.bannerUrl} alt="Banner Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                <p className="absolute bottom-3 left-4 font-bold text-white text-sm tracking-wide shadow-black drop-shadow-md">Banner Preview Live</p>
              </div>
            )}
            
            {field('Official Website URL', 'websiteUrl', 'text', { placeholder: 'https://...' })}
          </div>

          <div className="md:col-span-2">{field('Download URL (APK/IPA link)', 'downloadUrl', 'text')}</div>
          <div className="md:col-span-2">{field('App Name', 'name', 'text', { required: true })}</div>
          <div>{field('Developer', 'developer', 'text', { required: true })}</div>
          <div>{field('Version', 'version')}</div>

          <div className="md:col-span-2">{field('Screenshots (Comma separated URLs)', 'screenshotUrls', 'textarea')}</div>

          <div className="md:col-span-2">{field('Short Description (80 chars)', 'shortDescription', 'text', { maxLength: 80 })}</div>
          <div className="md:col-span-2">{field('Full Description', 'description', 'textarea')}</div>

          <div>{field('Category', 'category', 'select', { options: CATEGORIES })}</div>
          <div>{field('Price ($0 = free)', 'price', 'number', { min: 0, step: 0.01 })}</div>

          <div>{field('Age Rating', 'ageRating', 'select', { options: ['4+', '9+', '12+', '17+'] })}</div>
          <div>{field('Min OS', 'minOS')}</div>

          <div className="md:col-span-2">{field('Tags (comma separated)', 'tags')}</div>

          <div className="md:col-span-2 flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 mt-2">
            <div>
              <p className="font-semibold text-white">Feature on Today Page</p>
              <p className="text-xs text-textSecondary">App will appear in the main hero carousel</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="sr-only peer" />
              <div className="w-14 h-8 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-[#30D158]"></div>
            </label>
          </div>

          <div className="col-span-1 md:col-span-2 flex gap-4 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white font-semibold transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={mutation.isPending} className="flex-1 py-4 bg-[#0A84FF] hover:bg-[#0070E0] rounded-2xl text-white font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-60 transition-colors">
              {mutation.isPending ? 'Saving to Database...' : editApp ? 'Save Changes' : 'Publish App'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function Admin() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editApp, setEditApp] = useState(null)

  useEffect(() => {
    if (!user?.isAdmin) navigate('/admin/login')
  }, [user, navigate])

  const { data, isLoading } = useQuery({
    queryKey: ['apps', 'all'],
    queryFn: () => appsApi.getAll({ limit: 100 }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => appsApi.delete(id),
    onSuccess: () => { toast.success('App deleted'); qc.invalidateQueries(['apps']) },
    onError: () => toast.error('Failed to delete'),
  })

  const apps = data?.apps || []
  const totalInstalls = apps.reduce((s, a) => s + (a.installCount || 0), 0)
  const avgRating = apps.length ? apps.reduce((s, a) => s + (a.averageRating || 0), 0) / apps.length : 0

  if (!user?.isAdmin) return null

  return (
    <div className="min-h-screen bg-background">
      {/* Admin Navbar */}
      <header className="glass-nav px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold"> App Store Admin</h1>
        <button onClick={() => { logout(); navigate('/admin/login') }} className="flex items-center gap-2 text-textSecondary hover:text-white">
          <LogOut size={18} /> Sign Out
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Package} label="Total Apps" value={apps.length} color="#0A84FF" />
          <StatCard icon={Users} label="Total Installs" value={formatInstalls(totalInstalls)} color="#30D158" />
          <StatCard icon={Star} label="Avg Rating" value={formatRating(avgRating)} color="#FF9F0A" />
          <StatCard icon={DollarSign} label="Paid Apps" value={apps.filter(a => a.price > 0).length} color="#BF5AF2" />
        </div>

        {/* App Table */}
        <div className="bg-surface rounded-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">App Management</h2>
            <button onClick={() => { setEditApp(null); setShowForm(true) }} className="btn-get flex items-center gap-2">
              <Plus size={16} /> Add App
            </button>
          </div>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-textSecondary text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="text-left pb-3 pl-2">App</th>
                    <th className="text-left pb-3">Category</th>
                    <th className="text-right pb-3">Installs</th>
                    <th className="text-right pb-3">Rating</th>
                    <th className="text-right pb-3">Price</th>
                    <th className="text-right pb-3 pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app) => (
                    <tr key={app.id} className="border-b border-white/5 hover:bg-surfaceRaised transition-colors">
                      <td className="py-4 pl-2">
                        <div className="flex items-center gap-3">
                          <AppIcon src={app.iconUrl} alt={app.name} size={40} />
                          <div>
                            <p className="font-medium text-sm">{app.name}</p>
                            <p className="text-textSecondary text-xs">{app.developer}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="capitalize text-textSecondary text-sm">{app.category}</span>
                      </td>
                      <td className="py-4 text-right text-sm">{formatInstalls(app.installCount)}</td>
                      <td className="py-4 text-right text-sm">
                        <span className="flex items-center justify-end gap-1">
                          <Star size={12} className="text-accentOrange" fill="currentColor" />
                          {formatRating(app.averageRating)}
                        </span>
                      </td>
                      <td className="py-4 text-right text-sm">{formatPrice(app.price)}</td>
                      <td className="py-4 pr-2">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => { setEditApp(app); setShowForm(true) }} className="p-2 hover:bg-surface rounded-lg text-accent transition-colors">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => deleteMutation.mutate(app.id)} className="p-2 hover:bg-surface rounded-lg text-accentRed transition-colors">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showForm && <UploadForm onClose={() => { setShowForm(false); setEditApp(null) }} editApp={editApp} />}
    </div>
  )
}
