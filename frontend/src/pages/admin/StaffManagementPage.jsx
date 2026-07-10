import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Shield, User, Mail, Phone, MoreVertical, X, Check, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { usersApi } from '../../services/api'

export default function StaffManagementPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Tabs for Add Staff Modal
  const [authTab, setAuthTab] = useState('email') // email, phone, google
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'staff'
  })

  // Fetch users (staff)
  const { data, isLoading } = useQuery({
    queryKey: ['staff', search],
    queryFn: async () => {
      const res = await usersApi.getAll({ search })
      // Filter only admins and staff
      const staffList = (res.users || []).filter(u => u.role === 'admin' || u.role === 'staff' || u.role === 'super_admin')
      return { users: staffList }
    }
  })

  const addStaffMutation = useMutation({
    mutationFn: async (data) => {
      const res = await usersApi.addStaff(data)
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staff'])
      setIsModalOpen(false)
      setFormData({ name: '', email: '', phone: '', password: '', confirmPassword: '', role: 'staff' })
      toast.success('Staff member added successfully')
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Failed to add staff')
    }
  })

  const removeStaffMutation = useMutation({
    mutationFn: async (id) => {
      await usersApi.delete(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['staff'])
      toast.success('Staff removed')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (authTab === 'email' && formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    addStaffMutation.mutate(formData)
  }

  const staff = data?.users || []
  const activeCount = staff.filter(s => s.status === 'active').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-textSecondary mt-1 text-sm">Manage admins and store staff members</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0A84FF] text-white rounded-xl font-medium hover:bg-[#0A84FF]/90 transition-colors"
        >
          <Plus size={18} />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-center">
          <span className="text-textSecondary text-sm font-medium">Total Staff</span>
          <span className="text-3xl font-bold mt-1">{staff.length}</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-center">
          <span className="text-textSecondary text-sm font-medium">Active</span>
          <span className="text-3xl font-bold mt-1 text-[#30D158]">{activeCount}</span>
        </div>
        <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col justify-center">
          <span className="text-textSecondary text-sm font-medium">Pending Invite</span>
          <span className="text-3xl font-bold mt-1 text-[#FF9F0A]">0</span>
        </div>
      </div>

      {/* Search and Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" size={18} />
            <input 
              type="text" 
              placeholder="Search staff..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-[#0A84FF] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black/20 text-xs uppercase tracking-wider text-textSecondary font-semibold">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan="5" className="p-6 text-center text-textSecondary">Loading staff...</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan="5" className="p-6 text-center text-textSecondary">No staff found</td></tr>
              ) : staff.map((user) => (
                <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {(user.picture || user.avatar) ? (
                        <img 
                          src={user.picture || user.avatar} 
                          alt={user.name} 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full border border-white/10 object-cover" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A84FF] to-[#005bb5] border border-white/20 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">{user.name || 'Unknown User'}</div>
                        <div className="text-xs text-textSecondary">Added {new Date(user.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-textSecondary">{user.email || user.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'admin' || user.role === 'super_admin' ? 'bg-[#FF9F0A]/20 text-[#FF9F0A]' : 'bg-[#0A84FF]/20 text-[#0A84FF]'
                    }`}>
                      <Shield size={12} />
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      user.status === 'active' ? 'text-[#30D158]' : 'text-[#FF453A]'
                    }`}>
                      {user.status === 'active' ? <Check size={14} /> : <XCircle size={14} />}
                      <span className="capitalize">{user.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => removeStaffMutation.mutate(user.id)}
                      className="p-2 hover:bg-white/10 rounded-full text-[#FF453A] transition-colors"
                      title="Remove Staff"
                    >
                      <X size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal (Bottom Sheet style on mobile, modal on desktop) */}
      {createPortal(
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                onClick={() => setIsModalOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.95, x: '-50%' }} 
                animate={{ opacity: 1, y: '-50%', scale: 1, x: '-50%' }} 
                exit={{ opacity: 0, y: 50, scale: 0.95, x: '-50%' }}
                className="fixed top-1/2 left-1/2 w-[92%] max-w-[500px] bg-[#1C1C1E] rounded-3xl border border-white/10 p-6 z-[101] max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold tracking-tight">Add New Staff Member</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                    <X size={20} />
                  </button>
                </div>

                {/* Auth Tabs */}
                <div className="flex p-1 bg-black/40 rounded-xl mb-6">
                  {[
                    { id: 'email', icon: Mail, label: 'Email' },
                    { id: 'phone', icon: Phone, label: 'Phone' },
                    { id: 'google', icon: User, label: 'Google' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setAuthTab(tab.id)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                        authTab === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-textSecondary hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <tab.icon size={16} />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1.5">Full Name *</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0A84FF]" placeholder="Steve Jobs" />
                  </div>

                  {authTab === 'email' && (
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1.5">Email Address *</label>
                      <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0A84FF]" placeholder="steve@apple.com" />
                    </div>
                  )}

                  {authTab === 'phone' && (
                    <div>
                      <label className="block text-sm font-medium text-textSecondary mb-1.5">Phone Number *</label>
                      <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0A84FF]" placeholder="+1 (555) 000-0000" />
                    </div>
                  )}

                  {(authTab === 'email' || authTab === 'phone') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1.5">Password *</label>
                        <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0A84FF]" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-textSecondary mb-1.5">Confirm Password *</label>
                        <input required type="password" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0A84FF]" placeholder="••••••••" />
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-textSecondary mb-1.5">Role *</label>
                    <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[#0A84FF] appearance-none text-white">
                      <option value="staff">Staff (Upload & Manage Apps)</option>
                      <option value="admin">Admin (Full Access & Settings)</option>
                    </select>
                  </div>

                  <div className="pt-4 mt-2 border-t border-white/10">
                    <button type="submit" disabled={addStaffMutation.isPending} className="w-full py-3.5 bg-[#0A84FF] text-white rounded-xl font-semibold hover:bg-[#0A84FF]/90 transition-all disabled:opacity-50">
                      {addStaffMutation.isPending ? 'Sending Invite...' : authTab === 'google' ? 'Send Google Invite' : 'Create Staff Account'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
