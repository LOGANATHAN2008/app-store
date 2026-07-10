import { Navigate, Outlet, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../store'
import logoUrl from '../../assets/logo.png'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, Lock, ShieldCheck, ArrowRight } from 'lucide-react'
import { io } from 'socket.io-client'
import { toast } from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { authApi } from '../../services/api'

export default function AdminLayout() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  // By default, the admin sidebar will be hidden on all screens
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [pinVerified, setPinVerified] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [verifying, setVerifying] = useState(false)
  const pinInputRef = useRef(null)

  useEffect(() => {
    if (!user || !['super_admin', 'admin', 'staff'].includes(user.role)) return;

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001')
    
    socket.on('app:submitted', (app) => {
      queryClient.invalidateQueries({ queryKey: ['admin-queue'] })
      queryClient.invalidateQueries({ queryKey: ['admin-queue-stats'] })
      queryClient.invalidateQueries({ queryKey: ['apps'] })
      
      const uploaderName = app.uploaderName ? `by ${app.uploaderName}` : 'by Staff'
      toast(`New app submitted ${uploaderName}: ${app.name}`, { 
        icon: '🔔',
        duration: 5000,
        style: {
          background: '#1C1C1E',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)'
        }
      })
    })
    
    return () => socket.disconnect()
  }, [user, queryClient])

  // Redirect to login if not authenticated or not staff/admin
  if (!user || user.role === 'user') {
    return <Navigate to="/login" replace />
  }

  const handleVerifyPin = async (e) => {
    e.preventDefault()
    setPinError('')
    setVerifying(true)
    try {
      await authApi.verifyPin(pin)
      setPinVerified(true)
      toast.success('Access Granted')
    } catch (err) {
      setPinError(err?.response?.data?.error || 'Invalid Secure Password')
      setPin('')
      pinInputRef.current?.focus()
    } finally {
      setVerifying(false)
    }
  }

  if (!pinVerified) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden px-4">
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#0A84FF] rounded-full blur-[120px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#BF5AF2] rounded-full blur-[120px] opacity-20 pointer-events-none" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#1C1C1E]/80 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] w-full max-w-sm shadow-2xl relative z-10"
        >
          <div className="w-16 h-16 bg-[#0A84FF]/20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-[#0A84FF]/30">
            <Lock className="text-[#0A84FF] w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-center text-white mb-2">Secure Access</h2>
          <p className="text-center text-textSecondary text-sm mb-8">
            Please enter your secure administrative password to continue.
          </p>

          <form onSubmit={handleVerifyPin}>
            <div className="mb-6 relative">
              <input
                ref={pinInputRef}
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Secure Password"
                className={`w-full bg-black/50 border ${pinError ? 'border-[#FF453A]' : 'border-white/10'} rounded-2xl py-4 pl-5 pr-12 text-center text-lg tracking-[0.2em] font-bold text-white focus:border-[#0A84FF] outline-none transition-colors placeholder:tracking-normal placeholder:font-normal placeholder:text-sm`}
                autoFocus
                required
              />
              <ShieldCheck className={`absolute right-4 top-1/2 -translate-y-1/2 ${pinError ? 'text-[#FF453A]' : 'text-textSecondary'}`} size={20} />
            </div>
            
            {pinError && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#FF453A] text-xs text-center font-semibold mb-4 mt--2">
                {pinError}
              </motion.p>
            )}

            <button 
              type="submit" 
              disabled={verifying || !pin}
              className="w-full bg-[#0A84FF] hover:bg-[#0070E0] disabled:opacity-50 text-white rounded-2xl py-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
            >
              {verifying ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Unlock Dashboard <ArrowRight size={16} /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white flex">
      <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      
      <div className={`flex-1 flex flex-col min-h-screen relative overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'md:ml-[260px]' : 'md:ml-0'}`}>
        
        {/* Top bar for mobile & Desktop Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/admin/dashboard" className="flex items-center gap-2">
              <img src={logoUrl} alt="App Store" className="w-8 h-8 rounded-lg" />
              <span className="font-bold hidden sm:block">Admin</span>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-black relative">
          {/* Background decorative glow */}
          <div className="absolute top-0 left-0 w-full h-96 bg-[#0A84FF]/10 blur-[120px] rounded-full pointer-events-none -z-10 opacity-30" />
          
          <div className="p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
