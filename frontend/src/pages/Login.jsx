import { useState, useEffect } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import { Mail, Lock, UserCircle, Eye, EyeOff } from 'lucide-react'
import { auth } from '../config/firebase'
import {
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
  GoogleAuthProvider
} from 'firebase/auth'
import { authApi } from '../services/api'

export default function Login() {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', name: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { user, setAuth } = useAuthStore()
  const navigate = useNavigate()

  // If already logged in, redirect based on role
  if (user) {
    if (user.role === 'user') {
      return <Navigate to="/" replace />
    }
    return <Navigate to="/admin/dashboard" replace />
  }

  // Handle Google redirect result on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const pendingRole = sessionStorage.getItem('googleLoginRole')
        if (pendingRole) {
          sessionStorage.removeItem('googleLoginRole')
          setLoading(true)
          try {
            const res = await authApi.google({
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              picture: firebaseUser.photoURL,
              roleReq: 'user' // Google sign-in always creates/signs in as a regular user
            })
            setAuth(res.user, res.token)
            toast.success(`Welcome, ${firebaseUser.displayName || 'User'}!`)
            // Redirect based on returned role
            redirectByRole(res.user.role)
          } catch (err) {
            console.error(err)
            toast.error(err?.response?.data?.error || err.message || 'Google sign-in failed')
            setLoading(false)
          }
        }
      }
    })

    getRedirectResult(auth).catch(err => {
      console.error('Redirect Error:', err)
      toast.error(err?.message || 'Google authentication failed')
      sessionStorage.removeItem('googleLoginRole')
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const redirectByRole = (role) => {
    if (role === 'user') {
      navigate('/')
    } else {
      navigate('/admin/dashboard')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let res
      if (isRegister) {
        res = await authApi.register({
          email: form.email,
          password: form.password,
          name: form.name
        })
        toast.success('Account created successfully!')
      } else {
        res = await authApi.login({ email: form.email, password: form.password })
        toast.success(`Welcome back, ${res.user.displayName || res.user.email?.split('@')[0] || 'User'}!`)
      }

      const { token, user } = res
      setAuth(user, token)
      redirectByRole(user.role)
    } catch (err) {
      console.error(err)
      toast.error(err?.response?.data?.error || err?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    const provider = new GoogleAuthProvider()
    sessionStorage.setItem('googleLoginRole', 'user')
    signInWithRedirect(auth, provider).catch(err => {
      console.error(err)
      toast.error('Failed to initialize Google login')
    })
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#0A84FF] rounded-full blur-[120px] opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-[#BF5AF2] rounded-full blur-[120px] opacity-20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo / header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-[22px] flex items-center justify-center mx-auto mb-6 shadow-2xl backdrop-blur-xl">
            <UserCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-textSecondary text-sm">
            {isRegister
              ? 'Sign up to access the App Store'
              : 'Sign in to continue'}
          </p>
        </div>

        <div className="bg-[#1C1C1E]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 flex flex-col gap-5 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AnimatePresence mode="popLayout">
              {isRegister && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2 block ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      id="login-name"
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="John Doe"
                      className="w-full bg-black/40 rounded-2xl pl-12 pr-5 py-4 text-white outline-none border border-white/10 focus:border-[#0A84FF] transition-colors"
                      required
                    />
                    <UserCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2 block ml-1">
                Email or Phone
              </label>
              <div className="relative">
                <input
                  id="login-email"
                  type="text"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full bg-black/40 rounded-2xl pl-12 pr-5 py-4 text-white outline-none border border-white/10 focus:border-[#0A84FF] transition-colors"
                  required
                  autoComplete="username"
                />
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
              </div>
            </div>

            <div>
              <label className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2 block ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-black/40 rounded-2xl pl-12 pr-12 py-4 text-white outline-none border border-white/10 focus:border-[#0A84FF] transition-colors"
                  required
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                />
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-textSecondary" />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-textSecondary hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#0A84FF] hover:bg-[#0070E0] rounded-2xl text-white font-semibold text-[16px] disabled:opacity-60 mt-2 shadow-lg shadow-blue-500/20 transition-all"
            >
              {loading ? 'Processing…' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          {/* Toggle register/login */}
          <div className="text-center -mt-1">
            <button
              type="button"
              onClick={() => { setIsRegister(r => !r); setForm({ email: '', password: '', name: '' }) }}
              className="text-sm text-[#0A84FF] hover:text-[#5E5CE6] transition-colors"
            >
              {isRegister ? 'Already have an account? Sign In' : 'New here? Create Account'}
            </button>
          </div>

          {/* Google sign-in (regular users only) */}
          <div className="relative flex items-center gap-4 my-1">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-xs font-semibold text-textSecondary uppercase tracking-wider">OR</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <button
            id="login-google"
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-semibold text-[16px] disabled:opacity-60 transition-all flex items-center justify-center gap-3"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.81 15.7 17.59V20.34H19.27C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4" />
              <path d="M12 23C14.97 23 17.46 22.02 19.27 20.34L15.7 17.59C14.72 18.25 13.46 18.68 12 18.68C9.16 18.68 6.76 16.76 5.88 14.18H2.18V17.05C4.02 20.7 7.74 23 12 23Z" fill="#34A853" />
              <path d="M5.88 14.18C5.65 13.51 5.53 12.78 5.53 12C5.53 11.22 5.66 10.49 5.88 9.82V6.95H2.18C1.43 8.45 1 10.17 1 12C1 13.83 1.43 15.55 2.18 17.05L5.88 14.18Z" fill="#FBBC05" />
              <path d="M12 5.32C13.62 5.32 15.07 5.88 16.21 6.96L19.34 3.83C17.45 2.07 14.97 1 12 1C7.74 1 4.02 3.3 2.18 6.95L5.88 9.82C6.76 7.24 9.16 5.32 12 5.32Z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-textSecondary/60 mt-1">
            Admins are routed to the dashboard automatically after login.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
