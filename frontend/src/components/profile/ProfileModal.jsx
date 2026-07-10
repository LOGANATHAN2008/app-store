import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useUIStore, useInstallStore, useWishlistStore } from '../../store'
import { paymentsApi, appsApi } from '../../services/api'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { 
  X, ChevronRight, ChevronLeft, ShieldCheck, CreditCard, 
  Wallet, Gift, Lock, Smartphone, ShieldAlert, Bell, 
  MessageSquare, HelpCircle, HeadphonesIcon, Moon, Sun, Globe, 
  MapPin, LogOut, CheckCircle2, Box, DownloadCloud, Heart, History, User, ExternalLink, Info
} from 'lucide-react'
import { auth } from '../../config/firebase'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { authApi } from '../../services/api'

// --- Constants & UI Helpers ---

const TRANSLATIONS = {
  'English': {
    account: "Account",
    done: "Done",
    activity: "Activity",
    purchaseHistory: "Purchase History",
    downloadHistory: "Download History",
    wishlist: "Wishlist",
    accountWallet: "Account & Wallet",
    walletBalance: "Wallet Balance",
    redeemCode: "Redeem Code",
    preferences: "Preferences",
    notifications: "Notifications",
    region: "Region",
    language: "Language",
    helpSupport: "Help & Support",
    legalPolicy: "Legal & Policy",
    signOut: "Sign Out",
    signIn: "Sign in to App Store",
    signInDesc: "Access your purchase history, wishlist, and seamlessly download apps across your devices.",
    loginBtn: "Login Now",
    connecting: "Connecting...",
    editProfile: "Edit Profile",
    // SubScreens
    back: "Back",
    noDownloads: "No downloads yet.",
    emptyWishlist: "Your wishlist is empty.",
    noPurchases: "No purchases yet.",
    paid: "Paid",
    pushNotifications: "Push Notifications",
    emailNotifications: "Email Notifications",
    availableBalance: "Available Balance",
    addMoney: "Add Money",
    recentTransactions: "Recent Transactions",
    noTransactions: "No transactions yet.",
    simulatedWallet: "Simulated Wallet: Wallet balances and transactions are safely stored on your device for this demonstration.",
    displayName: "Display Name",
    emailReadOnly: "Email (Read-only)",
    saveChanges: "Save Changes",
    moreLanguages: "More Languages...",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    cookiePolicy: "Cookie Policy",
  },
  'Tamil (தமிழ்)': {
    account: "கணக்கு",
    done: "முடிந்தது",
    activity: "செயல்பாடு",
    purchaseHistory: "கொள்முதல் வரலாறு",
    downloadHistory: "பதிவிறக்க வரலாறு",
    wishlist: "விருப்பப்பட்டியல்",
    accountWallet: "கணக்கு மற்றும் வாலட்",
    walletBalance: "வாலட் இருப்பு",
    redeemCode: "குறியீட்டை மீட்டெடு",
    preferences: "விருப்பத்தேர்வுகள்",
    notifications: "அறிவிப்புகள்",
    region: "பகுதி",
    language: "மொழி",
    helpSupport: "உதவி & ஆதரவு",
    legalPolicy: "சட்டம் & கொள்கை",
    signOut: "வெளியேறு",
    signIn: "ஆப் ஸ்டோரில் உள்நுழையவும்",
    signInDesc: "உங்கள் கொள்முதல் வரலாறு, விருப்பப்பட்டியலை அணுகவும் மற்றும் உங்கள் சாதனங்களில் பயன்பாடுகளை தடையின்றி பதிவிறக்கவும்.",
    loginBtn: "இப்போது உள்நுழைக",
    connecting: "இணைக்கப்படுகிறது...",
    editProfile: "சுயவிவரத்தை திருத்து",
    // SubScreens
    back: "திரும்பிச் செல்",
    noDownloads: "பதிவிறக்கங்கள் எதுவும் இல்லை.",
    emptyWishlist: "உங்கள் விருப்பப்பட்டியல் காலியாக உள்ளது.",
    noPurchases: "இன்னும் எதுவும் வாங்கவில்லை.",
    paid: "செலுத்தப்பட்டது",
    pushNotifications: "புஷ் அறிவிப்புகள்",
    emailNotifications: "மின்னஞ்சல் அறிவிப்புகள்",
    availableBalance: "கிடைக்கும் இருப்பு",
    addMoney: "பணம் சேர்",
    recentTransactions: "சமீபத்திய பரிவர்த்தனைகள்",
    noTransactions: "பரிவர்த்தனைகள் எதுவும் இல்லை.",
    simulatedWallet: "உருவகப்படுத்தப்பட்ட வாலட்: இந்த செயல்விளக்கத்திற்காக உங்கள் சாதனத்தில் வாலட் நிலுவைகள் மற்றும் பரிவர்த்தனைகள் பாதுகாப்பாக சேமிக்கப்படும்.",
    displayName: "காட்சி பெயர்",
    emailReadOnly: "மின்னஞ்சல் (படிக்க மட்டும்)",
    saveChanges: "மாற்றங்களைச் சேமி",
    moreLanguages: "மேலும் மொழிகள்...",
    privacyPolicy: "தனியுரிமை கொள்கை",
    termsOfService: "சேவை விதிமுறைகள்",
    cookiePolicy: "குக்கீ கொள்கை",
  },
  'Hindi (हिन्दी)': {
    account: "खाता",
    done: "संपन्न",
    activity: "गतिविधि",
    purchaseHistory: "खरीद इतिहास",
    downloadHistory: "डाउनलोड इतिहास",
    wishlist: "विशलिस्ट",
    accountWallet: "खाता और वॉलेट",
    walletBalance: "वॉलेट बैलेंस",
    redeemCode: "रिडीम कोड",
    preferences: "प्राथमिकताएं",
    notifications: "सूचनाएं",
    region: "क्षेत्र",
    language: "भाषा",
    helpSupport: "सहायता और समर्थन",
    legalPolicy: "कानूनी और नीति",
    signOut: "साइन आउट",
    signIn: "ऐप स्टोर में साइन इन करें",
    signInDesc: "अपने खरीद इतिहास, विशलिस्ट तक पहुंचें और अपने उपकरणों पर ऐप्स को निर्बाध रूप से डाउनलोड करें।",
    loginBtn: "अभी लॉगिन करें",
    connecting: "कनेक्ट हो रहा है...",
    editProfile: "प्रोफ़ाइल संपादित करें",
    // SubScreens
    back: "वापस",
    noDownloads: "अभी तक कोई डाउनलोड नहीं।",
    emptyWishlist: "आपकी विशलिस्ट खाली है।",
    noPurchases: "अभी तक कोई खरीदारी नहीं।",
    paid: "भुगतान किया गया",
    pushNotifications: "पुश सूचनाएं",
    emailNotifications: "ईमेल सूचनाएं",
    availableBalance: "उपलब्ध शेष",
    addMoney: "पैसे जोड़ें",
    recentTransactions: "हाल का लेन-देन",
    noTransactions: "अभी तक कोई लेन-देन नहीं।",
    simulatedWallet: "सिम्युलेटेड वॉलेट: इस प्रदर्शन के लिए आपके डिवाइस पर वॉलेट बैलेंस और लेनदेन सुरक्षित रूप से संग्रहीत हैं।",
    displayName: "प्रदर्शन नाम",
    emailReadOnly: "ईमेल (केवल पढ़ने के लिए)",
    saveChanges: "परिवर्तन सहेजें",
    moreLanguages: "अधिक भाषाएँ...",
    privacyPolicy: "गोपनीयता नीति",
    termsOfService: "सेवा की शर्तें",
    cookiePolicy: "कुकी नीति",
  }
}

const SCREENS = {
  MAIN: 'main',
  EDIT_PROFILE: 'edit_profile',
  PURCHASES: 'purchases',
  REDEEM: 'redeem',
  NOTIFICATIONS: 'notifications',
  LEGAL: 'legal',
  DOWNLOADS: 'downloads',
  WISHLIST: 'wishlist',
  WALLET: 'wallet',
  REGION: 'region',
  LANGUAGE: 'language'
}

function ListItem({ icon: Icon, title, value, onClick, isDestructive, hideArrow }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white/5 border-b border-white/5 last:border-none hover:bg-white/10 transition-colors active:bg-white/20 text-left"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#2C2C2E] flex items-center justify-center shrink-0">
            <Icon size={16} className={isDestructive ? "text-[#FF453A]" : "text-[#0A84FF]"} />
          </div>
        )}
        <span className={`text-[16px] font-medium ${isDestructive ? 'text-[#FF453A]' : 'text-white'}`}>
          {title}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[15px] text-[#8E8E93]">{value}</span>}
        {!hideArrow && !isDestructive && <ChevronRight size={18} className="text-[#8E8E93]" />}
      </div>
    </button>
  )
}

function ThemeToggleListItem() {
  const { theme, setTheme } = useUIStore()
  const isDark = theme === 'dark'

  return (
    <div className="w-full flex items-center justify-between p-4 bg-white/5 border-b border-white/5 last:border-none">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#2C2C2E] flex items-center justify-center shrink-0">
          {isDark ? <Moon size={16} className="text-[#0A84FF]" /> : <Sun size={16} className="text-[#0A84FF]" />}
        </div>
        <span className="text-[16px] font-medium text-white">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      </div>
      
      {/* iOS Style Custom Toggle */}
      <button 
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className="relative w-14 h-8 rounded-full transition-colors duration-300 no-invert"
        style={{ 
          backgroundColor: isDark ? '#0A84FF' : 'transparent',
          border: isDark ? '2px solid #0A84FF' : '2px solid #8E8E93'
        }}
        aria-label="Toggle Theme"
      >
        <motion.div 
          className="absolute top-[2px] w-6 h-6 rounded-full flex items-center justify-center shadow-sm"
          initial={false}
          animate={{
            left: isDark ? 'calc(100% - 26px)' : '2px',
            backgroundColor: isDark ? '#FFFFFF' : '#8E8E93',
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          {isDark ? (
            <Sun size={14} className="text-[#0A84FF]" />
          ) : (
            <Moon size={14} className="text-white" />
          )}
        </motion.div>
      </button>
    </div>
  )
}

function SubScreen({ title, onBack, children }) {
  const { language } = useUIStore()
  const t = TRANSLATIONS[language] || TRANSLATIONS['English']
  
  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="absolute inset-0 bg-[#000000] z-10 flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-[#1C1C1E]/90 backdrop-blur-md z-20 sticky top-0 max-w-2xl mx-auto w-full">
        <button onClick={onBack} className="flex items-center gap-1 text-[16px] text-[#0A84FF] font-medium px-2 py-1 -ml-2 hover:opacity-80">
          <ChevronLeft size={22} />
          {t.back}
        </button>
        <h2 className="text-[17px] font-bold absolute left-1/2 -translate-x-1/2">{title}</h2>
        <div className="w-[70px]"></div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="max-w-2xl mx-auto w-full">
          {children}
        </div>
      </div>
    </motion.div>
  )
}

function SectionHeader({ title }) {
  return <div className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 ml-4 mt-6">{title}</div>
}

// --- Feature 1: Profile Header ---
function ProfileHeader({ user, onEdit }) {
  // Use first letter as fallback if no picture
  const displayName = user?.name || user?.displayName || user?.email || 'U'
  const initials = displayName.charAt(0).toUpperCase()
  
  return (
    <div className="p-6 flex flex-col items-center bg-[#1C1C1E] mb-2 md:rounded-3xl">
      <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0A84FF] to-[#5AC8FA] p-0.5 mb-4 shadow-lg shadow-[#0A84FF]/20 relative cursor-pointer" onClick={onEdit}>
        <div className="w-full h-full bg-[#2C2C2E] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#1C1C1E]">
          {user?.picture ? (
            <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0A84FF] to-[#005bb5] flex items-center justify-center">
              <span className="text-4xl font-bold text-white shadow-sm">{initials}</span>
            </div>
          )}
        </div>
        {/* Verified badge from OAuth (mocked check if real flag exists, normally user.email_verified) */}
        <div className="absolute bottom-0 right-0 bg-[#30D158] text-white rounded-full p-1 border-2 border-[#1C1C1E]">
          <CheckCircle2 size={14} />
        </div>
      </div>
      <h2 className="text-[22px] font-bold leading-tight flex items-center gap-1">
        {user?.name || user?.displayName || 'App Store User'}
      </h2>
      <p className="text-[15px] text-[#8E8E93] mb-4">{user?.email || 'No email provided'}</p>
      <button 
        onClick={onEdit}
        className="bg-white/10 hover:bg-white/20 text-white px-5 py-1.5 rounded-full text-[14px] font-medium transition-colors"
      >
        {TRANSLATIONS[useUIStore.getState().language || 'English']?.editProfile || 'Edit Profile'}
      </button>
    </div>
  )
}

// --- Feature 2: Purchase History ---
function PurchaseHistorySubScreen({ onBack, user }) {
  const { language } = useUIStore()
  const t = TRANSLATIONS[language] || TRANSLATIONS['English']
  
  const { data: purchases = [], isLoading, isError } = useQuery({
    queryKey: ['my-purchases', user?.id],
    // Existing endpoint in this codebase is getUserHistory(userId), matching spec requirement to use existing.
    queryFn: () => paymentsApi.getUserHistory(user?.id).then(res => res.history || []),
    enabled: !!user?.id
  })

  return (
    <SubScreen title={t.purchaseHistory} onBack={onBack}>
      {isLoading ? (
        <div className="animate-pulse space-y-4 mt-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl"></div>)}
        </div>
      ) : isError ? (
        <div className="text-center text-[#FF453A] mt-10">Failed to load purchases. Please try again.</div>
      ) : purchases.length === 0 ? (
        <div className="text-center mt-20">
          <History size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/60">{t.noPurchases}</p>
        </div>
      ) : (
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden mt-4 shadow-sm">
          {purchases.map((purchase, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 border-b border-white/5 last:border-none">
              <div>
                <h4 className="text-white font-medium">{purchase.appName || 'Unknown App'}</h4>
                <p className="text-xs text-[#8E8E93]">{new Date(purchase.createdAt || purchase.date).toLocaleDateString()}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-white font-semibold">${purchase.amount || purchase.price}</span>
                <span className="text-[10px] uppercase font-bold text-[#30D158] bg-[#30D158]/10 px-2 py-0.5 rounded-full mt-1">{t.paid}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </SubScreen>
  )
}

// --- Feature 3: Redeem Code (Stub) ---
function RedeemSubScreen({ onBack }) {
  const { language } = useUIStore()
  const t = TRANSLATIONS[language] || TRANSLATIONS['English']
  const [code, setCode] = useState('')

  const handleRedeem = (e) => {
    e.preventDefault()
    if (!code.trim()) return
    // TODO: wire to real redemption endpoint when available
    toast("Redeem codes aren't live yet — check back soon!", { icon: '🚧' })
  }

  return (
    <SubScreen title={t.redeemCode} onBack={onBack}>
      <form onSubmit={handleRedeem} className="mt-6 space-y-4">
        <p className="text-sm text-[#8E8E93] mb-4 text-center">Enter your promotional code below to redeem apps or store credit.</p>
        <input 
          type="text" 
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          placeholder="ENTER CODE" 
          className="w-full bg-[#1C1C1E] border border-white/10 rounded-xl p-4 text-center text-xl font-mono text-white outline-none focus:border-[#0A84FF]"
        />
        <button type="submit" disabled={!code.trim()} className="w-full bg-[#0A84FF] text-white py-3.5 rounded-xl font-semibold disabled:opacity-50">
          Redeem
        </button>
      </form>
      <div className="mt-8 p-4 bg-[#FF453A]/10 border border-[#FF453A]/20 rounded-xl text-sm text-[#FF453A]">
        <strong>Note:</strong> This feature is a UI stub. The backend endpoint for redemption does not exist yet.
      </div>
    </SubScreen>
  )
}

// --- Feature 4: Notifications ---
function NotificationsSubScreen({ onBack }) {
  const { language } = useUIStore()
  const t = TRANSLATIONS[language] || TRANSLATIONS['English']
  // Backed by local state (localStorage) as per stub policy since no API exists
  const [pushEnabled, setPushEnabled] = useState(() => localStorage.getItem('prefs_push') === 'true')
  const [emailEnabled, setEmailEnabled] = useState(() => localStorage.getItem('prefs_email') !== 'false')

  const togglePush = () => {
    const next = !pushEnabled
    setPushEnabled(next)
    localStorage.setItem('prefs_push', String(next))
    if (next) toast.success("Push notifications enabled (Local pref)")
  }

  const toggleEmail = () => {
    const next = !emailEnabled
    setEmailEnabled(next)
    localStorage.setItem('prefs_email', String(next))
  }

  return (
    <SubScreen title={t.notifications} onBack={onBack}>
      <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden mt-4 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          <span className="text-white font-medium">{t.pushNotifications}</span>
          <button onClick={togglePush} className={`w-12 h-6 rounded-full transition-colors relative ${pushEnabled ? 'bg-[#30D158]' : 'bg-white/20'}`}>
            <motion.div animate={{ x: pushEnabled ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm" />
          </button>
        </div>
        <div className="flex items-center justify-between p-4">
          <span className="text-white font-medium">{t.emailNotifications}</span>
          <button onClick={toggleEmail} className={`w-12 h-6 rounded-full transition-colors relative ${emailEnabled ? 'bg-[#30D158]' : 'bg-white/20'}`}>
            <motion.div animate={{ x: emailEnabled ? 24 : 2 }} className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm" />
          </button>
        </div>
      </div>
    </SubScreen>
  )
}

// --- Feature 5: Legal / Support ---
function LegalSubScreen({ onBack, handleNavigation }) {
  const { language } = useUIStore()
  const t = TRANSLATIONS[language] || TRANSLATIONS['English']
  
  return (
    <SubScreen title={t.legalPolicy} onBack={onBack}>
      <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden mt-4 shadow-sm">
        <ListItem title={t.privacyPolicy} onClick={() => handleNavigation('/privacy')} />
        <ListItem title={t.termsOfService} onClick={() => handleNavigation('/terms')} />
        <ListItem title={t.cookiePolicy} onClick={() => handleNavigation('/cookies')} hideArrow={false} />
      </div>
    </SubScreen>
  )
}

// --- Feature 6: Download History ---
function DownloadsSubScreen({ onBack, handleNavigation }) {
  const { language } = useUIStore()
  const t = TRANSLATIONS[language] || TRANSLATIONS['English']
  const { user } = useAuthStore()
  const userId = user?._id || user?.email || 'guest'
  
  const userInstalls = useInstallStore(state => state.installed[userId] || {})
  
  // Get the array of installed app IDs for this specific user
  const installedAppIds = Object.keys(userInstalls).filter(id => userInstalls[id] === 'installed')

  // Fetch all apps to get their details
  const { data: appsData, isLoading } = useQuery({
    queryKey: ['apps-all'],
    queryFn: () => appsApi.getAll().then(res => res.apps || res),
  })

  // Filter the fetched apps to only include the installed ones
  const installedApps = (appsData || []).filter(app => installedAppIds.includes(app._id || app.id))
  
  return (
    <SubScreen title={t.downloadHistory} onBack={onBack}>
      {isLoading ? (
        <div className="animate-pulse space-y-4 mt-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl"></div>)}
        </div>
      ) : installedApps.length === 0 ? (
        <div className="text-center mt-20">
          <DownloadCloud size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/60">{t.noDownloads}</p>
        </div>
      ) : (
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden mt-4 shadow-sm">
          {installedApps.map((app) => (
            <div key={app._id || app.id} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-none">
              <img src={app.iconUrl} alt={app.name} className="w-12 h-12 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="text-white font-medium">{app.name}</h4>
                <p className="text-xs text-[#8E8E93]">{app.developer || 'Developer'}</p>
              </div>
              <button 
                onClick={() => handleNavigation(`/app/${app.id || app._id}`)}
                className="bg-white/10 hover:bg-white/20 text-[#0A84FF] px-4 py-1.5 rounded-full text-[13px] font-bold uppercase tracking-wide transition-colors"
              >
                Open
              </button>
            </div>
          ))}
        </div>
      )}
    </SubScreen>
  )
}

// --- Feature 7: Edit Profile ---
function EditProfileSubScreen({ onBack, user }) {
  const { language } = useUIStore()
  const t = TRANSLATIONS[language] || TRANSLATIONS['English']
  const [name, setName] = useState(user?.name || user?.displayName || '')
  const { setAuth } = useAuthStore()

  const handleSave = () => {
    // Show success message
    toast.success("Profile updated successfully")
    
    // Update local store so UI reflects changes instantly
    setAuth({ ...user, name, displayName: name }, localStorage.getItem('admin_token'))
    onBack()
  }

  return (
    <SubScreen title={t.editProfile} onBack={onBack}>
      <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden mt-4 shadow-sm p-4">
        <label className="block text-xs font-medium text-[#8E8E93] mb-1">{t.displayName}</label>
        <input 
          type="text" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white mb-4 outline-none focus:border-[#0A84FF]" 
        />
        <label className="block text-xs font-medium text-[#8E8E93] mb-1">{t.emailReadOnly}</label>
        <input 
          type="text" 
          readOnly 
          defaultValue={user?.email} 
          className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white/50 outline-none" 
        />
      </div>
      <button 
        onClick={handleSave}
        className="w-full mt-6 bg-[#0A84FF] hover:bg-[#0A84FF]/90 transition-colors py-3 rounded-xl font-semibold text-white shadow-lg shadow-[#0A84FF]/20"
      >
        {t.saveChanges}
      </button>
    </SubScreen>
  )
}

// --- Feature 7: Wishlist ---
function WishlistSubScreen({ onBack, handleNavigation }) {
  const { language } = useUIStore()
  const t = TRANSLATIONS[language] || TRANSLATIONS['English']
  const { toggleWishlist } = useWishlistStore()
  const { user } = useAuthStore()
  const userId = user?._id || user?.email || 'guest'
  
  const userWishlist = useWishlistStore(state => state.wishlist[userId] || {})

  // Get array of wishlisted app IDs for this specific user
  const wishlistedAppIds = Object.keys(userWishlist).filter(id => userWishlist[id] === true)

  // Fetch all apps to get details
  const { data: appsData, isLoading } = useQuery({
    queryKey: ['apps-all'],
    queryFn: () => appsApi.getAll().then(res => res.apps || res),
  })

  const wishlistedApps = (appsData || []).filter(app => wishlistedAppIds.includes(app._id || app.id))

  return (
    <SubScreen title={t.wishlist} onBack={onBack}>
      {isLoading ? (
        <div className="animate-pulse space-y-4 mt-4">
          {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-xl"></div>)}
        </div>
      ) : wishlistedApps.length === 0 ? (
        <div className="text-center mt-20">
          <Heart size={48} className="mx-auto text-white/20 mb-4" />
          <p className="text-white/60 mb-2">{t.emptyWishlist}</p>
        </div>
      ) : (
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden mt-4 shadow-sm">
          {wishlistedApps.map((app) => (
            <div key={app._id || app.id} className="flex items-center gap-4 p-4 border-b border-white/5 last:border-none relative">
              <img src={app.iconUrl} alt={app.name} className="w-12 h-12 rounded-xl object-cover" />
              <div className="flex-1">
                <h4 className="text-white font-medium">{app.name}</h4>
                <p className="text-xs text-[#8E8E93]">{app.developer || 'Developer'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleNavigation(`/app/${app.id || app._id}`)}
                  className="bg-white/10 hover:bg-white/20 text-[#0A84FF] px-4 py-1.5 rounded-full text-[13px] font-bold uppercase tracking-wide transition-colors"
                >
                  View
                </button>
                <button 
                  onClick={() => {
                    toggleWishlist(app._id || app.id);
                    toast.success('Removed from wishlist');
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#FF453A]/20 text-[#8E8E93] hover:text-[#FF453A] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SubScreen>
  )
}

// --- Feature 8: Wallet Balance ---
function WalletSubScreen({ onBack }) {
  const { language } = useUIStore()
  const t = TRANSLATIONS[language] || TRANSLATIONS['English']
  const { user } = useAuthStore()
  const userId = user?._id || user?.email || 'guest'
  
  const [balance, setBalance] = useState(() => {
    return parseFloat(localStorage.getItem(`mock_wallet_balance_${userId}`)) || 0.00;
  });
  
  const [transactions, setTransactions] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`mock_wallet_tx_${userId}`)) || [];
    } catch {
      return [];
    }
  });

  const handleAddMoney = () => {
    const amount = 50.00;
    const newBalance = balance + amount;
    
    const newTx = {
      id: Date.now(),
      title: 'Wallet Top-up',
      amount: amount,
      date: new Date().toISOString()
    };
    
    const updatedTx = [newTx, ...transactions];
    
    setBalance(newBalance);
    setTransactions(updatedTx);
    
    localStorage.setItem(`mock_wallet_balance_${userId}`, newBalance.toString());
    localStorage.setItem(`mock_wallet_tx_${userId}`, JSON.stringify(updatedTx));
    
    toast.success(`Successfully added $${amount.toFixed(2)} to your wallet!`);
  };

  return (
    <SubScreen title={t.walletBalance} onBack={onBack}>
      <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden mt-4 shadow-sm border border-white/5">
        <div className="p-6 text-center border-b border-white/5">
          <p className="text-sm text-[#8E8E93] uppercase font-bold tracking-wider mb-1">{t.availableBalance}</p>
          <h2 className="text-4xl font-bold text-white">${balance.toFixed(2)}</h2>
        </div>
        <ListItem title={t.addMoney + " ($50.00)"} onClick={handleAddMoney} hideArrow />
      </div>

      <div className="mt-8 mb-3 px-2 flex justify-between items-center">
        <h3 className="text-[17px] font-bold text-white">{t.recentTransactions}</h3>
      </div>
      
      {transactions.length === 0 ? (
        <div className="text-center py-10 bg-[#1C1C1E] rounded-2xl border border-white/5">
          <History size={32} className="mx-auto text-white/20 mb-3" />
          <p className="text-[#8E8E93] text-sm">{t.noTransactions}</p>
        </div>
      ) : (
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm border border-white/5">
          {transactions.map(tx => (
            <div key={tx.id} className="flex justify-between items-center p-4 border-b border-white/5 last:border-none">
              <div>
                <p className="text-white font-medium">{tx.title}</p>
                <p className="text-xs text-[#8E8E93] mt-0.5">{new Date(tx.date).toLocaleDateString()} at {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="text-right">
                <p className="text-[#30D158] font-bold">+${tx.amount.toFixed(2)}</p>
                <p className="text-[10px] uppercase font-bold text-white/40 mt-1">Completed</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-[#0A84FF]/10 border border-[#0A84FF]/20 rounded-xl text-sm text-[#0A84FF]">
        <strong>{t.simulatedWallet.split(':')[0]}:</strong> {t.simulatedWallet.split(':')[1]}
      </div>
    </SubScreen>
  )
}

// --- Feature 9: Region ---
function RegionSubScreen({ onBack }) {
  const { language } = useUIStore()
  const t = TRANSLATIONS[language] || TRANSLATIONS['English']
  const [country, setCountry] = useState(() => localStorage.getItem('prefs_country') || 'United States')
  
  const handleSelect = (c) => {
    setCountry(c)
    localStorage.setItem('prefs_country', c)
    toast.success(`Region updated to ${c}`)
  }

  return (
    <SubScreen title={t.region} onBack={onBack}>
      <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden mt-4 shadow-sm">
        {['United States', 'India', 'United Kingdom', 'Canada', 'Australia'].map(c => (
          <button key={c} onClick={() => handleSelect(c)} className="w-full flex items-center justify-between p-4 border-b border-white/5 last:border-none hover:bg-white/5">
            <span className="text-white">{c}</span>
            {country === c && <CheckCircle2 size={18} className="text-[#0A84FF]" />}
          </button>
        ))}
      </div>
    </SubScreen>
  )
}

// --- Feature 10: Language ---
function LanguageSubScreen({ onBack }) {
  const { language, setLanguage } = useUIStore()
  const [showMore, setShowMore] = useState(false)
  
  const handleSelect = (l) => {
    setLanguage(l)
    toast.success(`Language updated to ${l}`)
  }

  const coreLangs = ['English', 'Tamil (தமிழ்)', 'Hindi (हिन्दी)']
  const moreLangs = ['Spanish (Español)', 'French (Français)', 'German (Deutsch)', 'Chinese (中文)', 'Japanese (日本語)', 'Korean (한국어)']
  
  const displayLangs = showMore ? [...coreLangs, ...moreLangs] : coreLangs

  return (
    <SubScreen title="Language" onBack={onBack}>
      <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden mt-4 shadow-sm">
        {displayLangs.map(l => (
          <button key={l} onClick={() => handleSelect(l)} className="w-full flex items-center justify-between p-4 border-b border-white/5 last:border-none hover:bg-white/5">
            <span className="text-white">{l}</span>
            {language === l && <CheckCircle2 size={18} className="text-[#0A84FF]" />}
          </button>
        ))}
        {!showMore && (
          <button onClick={() => setShowMore(true)} className="w-full text-center p-4 text-[#0A84FF] text-sm font-medium border-t border-white/5 hover:bg-white/5 transition-colors">
            {TRANSLATIONS[language]?.moreLanguages || 'More Languages...'}
          </button>
        )}
      </div>
    </SubScreen>
  )
}

// --- MAIN MODAL COMPONENT ---

export default function ProfileModal() {
  const { isProfileModalOpen, setProfileModalOpen, language } = useUIStore()
  const { user, logout, setAuth } = useAuthStore()
  const navigate = useNavigate()
  
  const t = TRANSLATIONS[language] || TRANSLATIONS['English']
  
  const [activeScreen, setActiveScreen] = useState(SCREENS.MAIN)
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setIsLoggingIn(true)
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      const res = await authApi.google({ 
        email: result.user.email, 
        displayName: result.user.displayName,
        picture: result.user.photoURL,
        roleReq: 'user' 
      })

      setAuth(res.user, res.token)
      toast.success(`Welcome, ${result.user.displayName}!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to log in. Please try again.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleClose = () => {
    setProfileModalOpen(false)
    setTimeout(() => setActiveScreen(SCREENS.MAIN), 300)
  }

  const handleNavigation = (path) => {
    handleClose()
    setTimeout(() => {
      navigate(path)
    }, 300)
  }

  const handleSignOut = () => {
    logout()
    handleClose()
    navigate('/')
  }

  return (
    <AnimatePresence>
      {isProfileModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[10000] flex flex-col items-center justify-center p-0"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            onClick={e => e.stopPropagation()}
            className="w-full h-full bg-[#000000] overflow-hidden relative flex flex-col shadow-2xl"
          >
            {/* Main Screen */}
            <div className="flex-1 flex flex-col w-full h-full">
              {/* Main Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10 shrink-0 bg-[#1C1C1E]/80 backdrop-blur-xl z-10 sticky top-0 max-w-5xl mx-auto w-full md:px-8">
                <div className="w-[60px]"></div>
                <h2 className="text-[17px] font-bold">{t.account}</h2>
                <button onClick={handleClose} className="w-[60px] text-right text-[16px] font-semibold text-[#0A84FF]">
                  {t.done}
                </button>
              </div>

              {/* Scrollable Main Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar bg-black">
                <div className="max-w-5xl mx-auto w-full h-full flex flex-col">
                  
                  {user ? (
                    <div className="md:grid md:grid-cols-[320px_1fr] md:gap-8 md:p-8">
                      {/* Left Column on Desktop */}
                      <div className="md:sticky md:top-8 md:h-fit">
                        <ProfileHeader user={user} onEdit={() => setActiveScreen(SCREENS.EDIT_PROFILE)} />
                      </div>

                      {/* Right Column on Desktop */}
                      <div className="px-4 md:px-0 pb-12 space-y-0 mt-4 md:mt-0">
                        
                        <SectionHeader title={t.activity} />
                        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm">
                          <ListItem icon={History} title={t.purchaseHistory} onClick={() => setActiveScreen(SCREENS.PURCHASES)} />
                          <ListItem icon={DownloadCloud} title={t.downloadHistory} onClick={() => setActiveScreen(SCREENS.DOWNLOADS)} />
                          <ListItem icon={Heart} title={t.wishlist} onClick={() => setActiveScreen(SCREENS.WISHLIST)} />
                        </div>

                        <SectionHeader title={t.accountWallet} />
                        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm">
                          <ListItem icon={Wallet} title={t.walletBalance} onClick={() => setActiveScreen(SCREENS.WALLET)} />
                          <ListItem icon={Gift} title={t.redeemCode} onClick={() => setActiveScreen(SCREENS.REDEEM)} />
                        </div>

                        <SectionHeader title={t.preferences} />
                        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm">
                          <ThemeToggleListItem />
                          <ListItem icon={Bell} title={t.notifications} onClick={() => setActiveScreen(SCREENS.NOTIFICATIONS)} />
                          <ListItem icon={MapPin} title={t.region} value={localStorage.getItem('prefs_country') || "United States"} onClick={() => setActiveScreen(SCREENS.REGION)} />
                          <ListItem icon={Globe} title={t.language} value={language} onClick={() => setActiveScreen(SCREENS.LANGUAGE)} />
                        </div>

                        <SectionHeader title={t.helpSupport} />
                        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm">
                          <ListItem icon={Info} title="About the Developer" onClick={() => handleNavigation('/about')} />
                          <ListItem icon={ShieldCheck} title={t.legalPolicy} onClick={() => setActiveScreen(SCREENS.LEGAL)} />
                        </div>

                        <div className="mt-8 bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm">
                          <ListItem icon={LogOut} title={t.signOut} isDestructive onClick={handleSignOut} hideArrow />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 mt-20 md:mt-32">
                      <div className="w-24 h-24 rounded-full bg-[#1C1C1E] flex items-center justify-center mb-6 border-2 border-white/10 shadow-lg">
                        <User size={48} className="text-[#8E8E93]" />
                      </div>
                      <h2 className="text-[22px] font-bold text-white mb-2">{t.signIn}</h2>
                      <p className="text-[15px] text-[#8E8E93] text-center mb-8 max-w-sm">
                        {t.signInDesc}
                      </p>
                      <button 
                        onClick={handleGoogleLogin}
                        disabled={isLoggingIn}
                        className="bg-[#0A84FF] hover:bg-[#0A84FF]/90 text-white px-8 py-3 rounded-full text-[16px] font-semibold transition-colors shadow-lg shadow-[#0A84FF]/20 disabled:opacity-70"
                      >
                        {isLoggingIn ? t.connecting : t.loginBtn}
                      </button>
                    </div>
                  )}
                  
                </div>
              </div>
            </div>

            {/* --- Nested Screens --- */}
            <AnimatePresence>
              {activeScreen === SCREENS.EDIT_PROFILE && (
                <EditProfileSubScreen onBack={() => setActiveScreen(SCREENS.MAIN)} user={user} />
              )}

              {activeScreen === SCREENS.PURCHASES && <PurchaseHistorySubScreen onBack={() => setActiveScreen(SCREENS.MAIN)} user={user} />}
              {activeScreen === SCREENS.REDEEM && <RedeemSubScreen onBack={() => setActiveScreen(SCREENS.MAIN)} />}
              {activeScreen === SCREENS.NOTIFICATIONS && <NotificationsSubScreen onBack={() => setActiveScreen(SCREENS.MAIN)} />}
              {activeScreen === SCREENS.LEGAL && <LegalSubScreen onBack={() => setActiveScreen(SCREENS.MAIN)} handleNavigation={handleNavigation} />}
              {activeScreen === SCREENS.DOWNLOADS && <DownloadsSubScreen onBack={() => setActiveScreen(SCREENS.MAIN)} handleNavigation={handleNavigation} />}
              {activeScreen === SCREENS.WISHLIST && <WishlistSubScreen onBack={() => setActiveScreen(SCREENS.MAIN)} handleNavigation={handleNavigation} />}
              {activeScreen === SCREENS.WALLET && <WalletSubScreen onBack={() => setActiveScreen(SCREENS.MAIN)} />}
              {activeScreen === SCREENS.REGION && <RegionSubScreen onBack={() => setActiveScreen(SCREENS.MAIN)} />}
              {activeScreen === SCREENS.LANGUAGE && <LanguageSubScreen onBack={() => setActiveScreen(SCREENS.MAIN)} />}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
