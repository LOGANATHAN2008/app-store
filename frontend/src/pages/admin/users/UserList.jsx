import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'
import { Search, MoreVertical, ShieldAlert, ShieldCheck, UserX, UserCheck, Trash2, Mail } from 'lucide-react'
import { usersApi } from '../../../services/api'

export default function UserList({ title = "All Users", defaultRole = 'all', defaultStatus = 'all' }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)

  const { data = { users: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['admin-users', defaultRole, defaultStatus],
    queryFn: () => usersApi.getAll({ role: defaultRole, status: defaultStatus })
  })

  // Mutations
  const updateStatus = useMutation({
    mutationFn: ({ id, status }) => usersApi.updateStatus(id, status),
    onSuccess: () => {
      toast.success('User status updated')
      queryClient.invalidateQueries(['admin-users'])
      setActiveDropdown(null)
    }
  })

  const updateRole = useMutation({
    mutationFn: ({ id, role }) => usersApi.updateRole(id, role),
    onSuccess: () => {
      toast.success('User role updated')
      queryClient.invalidateQueries(['admin-users'])
      setActiveDropdown(null)
    }
  })

  const deleteUser = useMutation({
    mutationFn: (id) => usersApi.delete(id),
    onSuccess: () => {
      toast.success('User deleted forever')
      queryClient.invalidateQueries(['admin-users'])
      setActiveDropdown(null)
    }
  })

  const filteredUsers = (data?.users || []).filter(u => {
    const nameMatch = (u.name || '').toLowerCase().includes((search || '').toLowerCase())
    const emailMatch = (u.email || '').toLowerCase().includes((search || '').toLowerCase())
    return nameMatch || emailMatch
  })

  return (
    <div className="max-w-7xl mx-auto pb-24 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-textSecondary text-sm mt-1">Manage platform access and permissions.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..." 
            className="w-full bg-[#1C1C1E] border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-[#007AFF] transition-colors"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/20 border-b border-white/5 text-textSecondary text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Last Active</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-textSecondary animate-pulse">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-textSecondary">
                    <UserX className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* User Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {(user.picture || user.avatar) ? (
                          <img 
                            src={user.picture || user.avatar} 
                            alt={user.name} 
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 rounded-full bg-black/50 border border-white/10 object-cover" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0A84FF] to-[#005bb5] border border-white/20 flex items-center justify-center text-lg font-bold text-white shadow-lg">
                            {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white">{user.name || 'Unknown User'}</p>
                          <p className="text-sm text-textSecondary flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email || 'No email provided'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {user.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#30D158]/10 text-[#30D158] border border-[#30D158]/20 px-2.5 py-1 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#30D158]" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-[#FF453A]/10 text-[#FF453A] border border-[#FF453A]/20 px-2.5 py-1 rounded-full text-xs font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF453A]" /> Banned
                        </span>
                      )}
                    </td>

                    {/* Role Badge */}
                    <td className="px-6 py-4">
                      {user.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#007AFF]/10 text-[#007AFF] border border-[#007AFF]/20 px-2.5 py-1 rounded-full text-xs font-medium">
                          <ShieldCheck className="w-3.5 h-3.5" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-white/5 text-textSecondary border border-white/10 px-2.5 py-1 rounded-full text-xs font-medium">
                          User
                        </span>
                      )}
                    </td>

                    {/* Last Active */}
                    <td className="px-6 py-4 text-sm text-textSecondary">
                      {user.lastLogin ? formatDistanceToNow(new Date(user.lastLogin)) + ' ago' : 'Never'}
                    </td>

                    {/* Actions Menu */}
                    <td className="px-6 py-4 text-right relative">
                      <button 
                        onClick={() => setActiveDropdown(activeDropdown === user.id ? null : user.id)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-textSecondary hover:text-white"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {activeDropdown === user.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            className="absolute right-12 top-2 w-48 bg-[#2C2C2E] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 origin-top-right text-left"
                          >
                            <div className="p-1">
                              {user.status === 'active' ? (
                                <button onClick={() => updateStatus.mutate({ id: user.id, status: 'banned' })} className="w-full text-left px-3 py-2 text-sm text-[#FF453A] hover:bg-[#FF453A]/10 rounded-lg transition-colors flex items-center gap-2">
                                  <ShieldAlert className="w-4 h-4" /> Ban User
                                </button>
                              ) : (
                                <button onClick={() => updateStatus.mutate({ id: user.id, status: 'active' })} className="w-full text-left px-3 py-2 text-sm text-[#30D158] hover:bg-[#30D158]/10 rounded-lg transition-colors flex items-center gap-2">
                                  <UserCheck className="w-4 h-4" /> Unban User
                                </button>
                              )}

                              {user.role === 'admin' ? (
                                <button onClick={() => updateRole.mutate({ id: user.id, role: 'user' })} className="w-full text-left px-3 py-2 text-sm text-white/80 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2 mt-1">
                                  <UserX className="w-4 h-4" /> Revoke Admin
                                </button>
                              ) : (
                                <button onClick={() => updateRole.mutate({ id: user.id, role: 'admin' })} className="w-full text-left px-3 py-2 text-sm text-[#007AFF] hover:bg-[#007AFF]/10 rounded-lg transition-colors flex items-center gap-2 mt-1">
                                  <ShieldCheck className="w-4 h-4" /> Make Admin
                                </button>
                              )}

                              <div className="h-px bg-white/10 my-1 mx-2" />
                              
                              <button onClick={() => window.confirm('Permanently delete this user?') && deleteUser.mutate(user.id)} className="w-full text-left px-3 py-2 text-sm text-textSecondary hover:text-[#FF453A] hover:bg-[#FF453A]/10 rounded-lg transition-colors flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Delete Account
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
