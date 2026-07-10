import { useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useInstallStore, useAuthStore } from '../../store'
import { appsApi, paymentsApi } from '../../services/api'
import toast from 'react-hot-toast'

import { useNavigate } from 'react-router-dom'

const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const RING_R   = 9
const RING_C   = 2 * Math.PI * RING_R  // circumference ≈ 56.5

const SIZE = {
  sm:  { px: 'px-[16px] py-[5px]',  text: 'text-[13px]', font: 600, ringW: 28, ringH: 28 },
  md:  { px: 'px-[20px] py-[6px]',  text: 'text-[14px]', font: 600, ringW: 32, ringH: 32 },
  lg:  { px: 'px-[24px] py-[8px]',  text: 'text-[15px]', font: 700, ringW: 36, ringH: 36 },
}

/**
 * @param {{ app: object, size?: 'sm'|'md'|'lg' }} props
 */
export default function InstallButton({ app, size = 'md' }) {
  const navigate = useNavigate()
  const { getInstallState, setInstallState } = useInstallStore()
  const { user } = useAuthStore()
  const state = getInstallState(app?.id)
  const [progress, setProgress]   = useState(0)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [isAppLaunched, setIsAppLaunched] = useState(false)
  const timerRef = useRef(null)
  const s = SIZE[size] ?? SIZE.md

  const label = (() => {
    if (state === 'installed') return 'OPEN'
    if (state === 'downloading') return null
    if (app?.price > 0) return `$${Number(app.price).toFixed(2)}`
    return 'GET'
  })()

  const bgColor = (() => {
    if (state === 'installed') return '#30D158'
    if (state === 'downloading') return 'transparent'
    return '#0A84FF'
  })()

  const handlePress = useCallback(async (e) => {
    e.stopPropagation()
    if (!app?.id) return

    if (!user) {
      toast('Please login first to get apps', { icon: '🔐' })
      navigate('/login')
      return
    }

    if (state === 'installed') {
      toast.success(`Opening ${app.name}…`, { icon: '🚀' })
      setTimeout(() => setIsAppLaunched(true), 400)
      return
    }
    if (state === 'downloading' || isProcessingPayment) return

    // If app is paid, handle payment first
    if (app.price > 0 && state !== 'purchased') {
      setIsProcessingPayment(true)
      try {
        const res = await loadRazorpay()
        if (!res) {
          toast.error('Failed to load Razorpay SDK')
          setIsProcessingPayment(false)
          return
        }

        const userId = user.id;
        const orderData = await paymentsApi.createOrder({ appId: app.id, userId })

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: app.name,
          description: `Purchase ${app.name}`,
          image: app.iconUrl,
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              toast.loading('Verifying payment...', { id: 'payment-verify' })
              await paymentsApi.verify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appId: app.id,
                userId
              })
              toast.success('Payment successful!', { id: 'payment-verify' })
              setInstallState(app.id, 'purchased')
              startDownload() // Automatically start download after successful payment
            } catch (err) {
              console.error(err)
              toast.error('Payment verification failed', { id: 'payment-verify' })
            }
          },
          prefill: {
            name: user?.name || 'App Store User',
            email: user?.email || 'user@example.com',
          },
          theme: { color: '#0A84FF' },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false)
            }
          }
        }
        
        const rzp = new window.Razorpay(options)
        rzp.open()
      } catch (err) {
        console.error(err)
        toast.error('Failed to initiate payment')
        setIsProcessingPayment(false)
      }
      return
    }

    startDownload()
  }, [app, state, setInstallState, user, isProcessingPayment, navigate])

  const startDownload = useCallback(() => {
    setIsProcessingPayment(false)

    // Start download simulation
    setInstallState(app.id, 'downloading')
    setProgress(0)

    let p = 0
    timerRef.current = setInterval(() => {
      p += 8 + Math.random() * 14
      const clamped = Math.min(p, 100)
      setProgress(clamped)

      if (clamped >= 100) {
        clearInterval(timerRef.current)
        setTimeout(() => {
          setInstallState(app.id, 'installed')
          toast.success(`${app.name} downloaded!`, { icon: '📲' })
          appsApi.install(app.id).catch(() => {})
          
          if (app.downloadUrl) {
            let finalUrl = app.downloadUrl;
            
            // Fix cross-origin filename issue for Supabase storage
            if (finalUrl.includes('supabase.co') && !finalUrl.includes('download=')) {
              const safeName = app.name.replace(/[^a-zA-Z0-9]/g, '_');
              finalUrl += (finalUrl.includes('?') ? '&' : '?') + `download=${encodeURIComponent(safeName)}.apk`;
            }
            
            // This is the most bulletproof way to trigger a download
            // when the server provides Content-Disposition attachment headers.
            window.location.assign(finalUrl);
          } else {
            // Simulate downloading an APK file so the user gets a real download prompt
            const content = `This is a simulated app file for ${app.name}.\nVersion: ${app.version || '1.0.0'}\nDeveloper: ${app.developer}`
            const blob = new Blob([content], { type: 'application/vnd.android.package-archive' })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${app.name.replace(/\s+/g, '_')}.apk`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            setTimeout(() => URL.revokeObjectURL(url), 1000)
          }
        }, 300)
      }
    }, 120)
  }, [app, setInstallState])

  const isDownloading = state === 'downloading' || isProcessingPayment
  const dashOffset = RING_C * (1 - progress / 100)

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handlePress}
        whileTap={!isDownloading ? { scale: 0.92 } : {}}
        transition={{ type: 'spring', stiffness: 500, damping: 25 }}
        aria-label={isDownloading ? `Downloading ${app?.name}` : state === 'installed' ? `Open ${app?.name}` : `Get ${app?.name}`}
        className={`
          relative inline-flex items-center justify-center
          rounded-full select-none cursor-pointer border-none outline-none
          transition-colors duration-300 flex-shrink-0
          ${isDownloading ? '' : s.px}
        `}
        style={{
          background: isDownloading ? 'transparent' : bgColor,
          minWidth: isDownloading ? s.ringW : undefined,
          minHeight: isDownloading ? s.ringH : undefined,
          width: isDownloading ? s.ringW : undefined,
          height: isDownloading ? s.ringH : undefined,
          fontWeight: s.font,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDownloading ? (
            /* ── Progress ring ── */
            <motion.span
              key="ring"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.2 }}
            >
              <svg width={s.ringW} height={s.ringH} viewBox="0 0 24 24">
                {/* Track */}
                <circle cx="12" cy="12" r={RING_R} fill="none"
                  stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                {/* Progress */}
                <circle cx="12" cy="12" r={RING_R} fill="none"
                  stroke="#0A84FF" strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeDasharray={RING_C}
                  strokeDashoffset={dashOffset}
                  style={{
                    transformOrigin: '12px 12px',
                    transform: 'rotate(-90deg)',
                    transition: 'stroke-dashoffset 0.12s linear',
                  }}
                />
              </svg>
            </motion.span>
          ) : state === 'installed' ? (
            /* ── Open / installed ── */
            <motion.span
              key="open"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 420, damping: 22 }}
              className={`${s.text} text-white`}
            >
              OPEN
            </motion.span>
          ) : (
            /* ── Default label ── */
            <motion.span
              key="label"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`${s.text} text-white`}
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {state === 'installed' && (
          <motion.button
            key="uninstall-btn"
            initial={{ opacity: 0, scale: 0.5, width: 0, marginLeft: -8 }}
            animate={{ opacity: 1, scale: 1, width: s.ringW, marginLeft: 0 }}
            exit={{ opacity: 0, scale: 0.5, width: 0, marginLeft: -8 }}
            onClick={(e) => {
              e.stopPropagation()
              setInstallState(app.id, null)
              toast.success(`${app.name} uninstalled`, { icon: '🗑️' })
              appsApi.uninstall(app.id).catch(() => {})
            }}
            className={`
              flex items-center justify-center rounded-full
              bg-zinc-200 hover:bg-red-100 text-zinc-500 hover:text-red-600
              dark:bg-zinc-800 dark:hover:bg-red-900/40 dark:text-zinc-400 dark:hover:text-red-500
              transition-colors flex-shrink-0 overflow-hidden
            `}
            style={{ height: s.ringH }}
            title="Uninstall"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── App Launcher Modal ── */}
      {isAppLaunched && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: '100%', scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[9999] bg-black text-white flex flex-col no-invert"
          >
            {/* iOS-style top bar */}
            <div className="flex items-center justify-between p-4 px-5 z-10 bg-black/80 backdrop-blur-md absolute top-0 left-0 right-0">
              <div className="flex items-center gap-3">
                <img src={app.iconUrl} alt={app.name} className="w-8 h-8 rounded-lg shadow-sm" />
                <span className="font-semibold">{app.name}</span>
              </div>
              <button 
                onClick={() => setIsAppLaunched(false)}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
                title="Close App"
              >
                <X size={20} />
              </button>
            </div>

            {/* App Content */}
            <div className="flex-1 w-full h-full bg-[#1C1C1E] relative pt-[72px]">
              {app.websiteUrl ? (
                <iframe 
                  src={app.websiteUrl} 
                  className="w-full h-full border-none bg-white" 
                  title={app.name}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full pb-20">
                  <motion.img 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    src={app.iconUrl} 
                    alt={app.name} 
                    className="w-32 h-32 rounded-[32px] shadow-2xl mb-6"
                  />
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-3xl font-bold"
                  >
                    Welcome to {app.name}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-gray-400 mt-2"
                  >
                    This is a simulated app experience.
                  </motion.p>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
