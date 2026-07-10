import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuthStore, useUIStore } from './store'
import { PanelLeft, Wrench, Settings, Clock, Bell, Heart, RefreshCcw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { settingsApi } from './services/api'
import Navbar from './components/layout/Navbar'
import BottomTabBar from './components/layout/BottomTabBar'
import Sidebar from './components/layout/Sidebar'
import PageLoader from './components/ui/PageLoader'
import ProfileModal from './components/profile/ProfileModal'
import GlobalPromoPopup from './components/promotions/GlobalPromoPopup'
import Footer from './components/layout/Footer'
import ErrorBoundary from './components/ErrorBoundary'

// Role-Based Route Guard
// - role === 'user': redirect to '/' (not an admin/staff account)
// - role === 'staff': allowed through to dashboard/upload but blocked from admin-only sub-routes
// - role === 'admin'/'super_admin': full access
function RequireAdmin() {
  const { user } = useAuthStore()
  // Not logged in at all
  if (!user) {
    return <Navigate to="/login" replace />
  }
  // Normal user accounts have zero admin access
  if (user.role === 'user') {
    return <Navigate to="/" replace />
  }
  // Staff and admin roles pass through
  return <Outlet />
}

// RequireStrictAdmin: blocks staff from fully admin-only nested routes
function RequireStrictAdmin() {
  const { user } = useAuthStore()
  if (!user || user.role === 'user') {
    return <Navigate to="/" replace />
  }
  if (user.role === 'staff') {
    return <Navigate to="/admin/dashboard" replace />
  }
  return <Outlet />
}

const TodayPage = lazy(() => import('./pages/TodayPage'))
const AppDetail = lazy(() => import('./pages/AppDetail'))
const Category = lazy(() => import('./pages/Category'))
const DeveloperWebsitesPage = lazy(() => import('./pages/DeveloperWebsitesPage'))
const AboutDeveloper = lazy(() => import('./pages/AboutDeveloper'))
const AppsPage = lazy(() => import('./pages/AppsPage'))
const ArcadePage = lazy(() => import('./pages/ArcadePage'))
const Search = lazy(() => import('./pages/Search'))
const TopCharts = lazy(() => import('./pages/TopCharts'))
const LaunchpadPage = lazy(() => import('./pages/LaunchpadPage'))
const PurchasesPage = lazy(() => import('./pages/PurchasesPage'))
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Admin = lazy(() => import('./pages/Admin'))
const AdminDeveloperWebsites = lazy(() => import('./pages/admin/DeveloperWebsites'))
const Login = lazy(() => import('./pages/Login'))
const StaffManagementPage = lazy(() => import('./pages/admin/StaffManagementPage'))

// Admin Apps
const AppUpload = lazy(() => import('./pages/admin/apps/AppUpload'))
const AppHistory = lazy(() => import('./pages/admin/apps/AppHistory'))
const ApprovalQueue = lazy(() => import('./pages/admin/apps/ApprovalQueue'))
const FeaturedApps = lazy(() => import('./pages/admin/apps/FeaturedApps'))
const PromotionsManager = lazy(() => import('./pages/admin/promotions/PromotionsManager'))

// Events
const DeveloperUploadDay = lazy(() => import('./pages/admin/DeveloperUploadDay'))
const EventSubmissions = lazy(() => import('./pages/admin/EventSubmissions'))
const EventLandingPage = lazy(() => import('./pages/EventLandingPage'))



// Admin Users
const UserList = lazy(() => import('./pages/admin/users/UserList'))
const BannedUsers = lazy(() => import('./pages/admin/users/BannedUsers'))
const AdminRoles = lazy(() => import('./pages/admin/users/AdminRoles'))

// Admin Reviews
const ReviewsPage = lazy(() => import('./pages/admin/reviews/ReviewsPage'))

// Admin Categories
const CategoriesPage = lazy(() => import('./pages/admin/categories/CategoriesPage'))

// Admin Analytics
const AnalyticsPage = lazy(() => import('./pages/admin/analytics/AnalyticsPage'))

// Admin Settings
const SettingsPage = lazy(() => import('./pages/admin/settings/SettingsPage'))

// Policies
const PrivacyPolicyPage = lazy(() => import('./pages/policies/PrivacyPolicyPage'))
const TermsOfServicePage = lazy(() => import('./pages/policies/TermsOfServicePage'))
const CookiePolicyPage = lazy(() => import('./pages/policies/CookiePolicyPage'))

// AI Features
const AIFeaturePlaceholder = lazy(() => import('./pages/admin/features/AIFeaturePlaceholder'))
const AIReviewSummary = lazy(() => import('./pages/admin/features/AIReviewSummary'))
const AIScreenshotGen = lazy(() => import('./pages/admin/features/AIScreenshotGen'))
const AIDescriptionGen = lazy(() => import('./pages/admin/features/AIDescriptionGen'))
const AIRankingGen = lazy(() => import('./pages/admin/features/AIRankingGen'))
const AIMalwareScan = lazy(() => import('./pages/admin/features/AIMalwareScan'))
const AIVerifyDeveloper = lazy(() => import('./pages/admin/features/AIVerifyDeveloper'))
const AppCertificate = lazy(() => import('./pages/admin/AppCertificate'))
const SearchCertificate = lazy(() => import('./pages/admin/SearchCertificate'))
const PublicCertificate = lazy(() => import('./pages/PublicCertificate'))

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const { sidebarOpen, toggleSidebar } = useUIStore()

  // Compute layout padding for desktop based on sidebar state
  const desktopPadding = isAdmin ? '' : (sidebarOpen ? 'lg:pl-[260px]' : 'lg:pl-[90px]');

  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ['global-settings'],
    queryFn: () => settingsApi.getSettings()
  })

  const { user } = useAuthStore()
  const isAuthRoute = location.pathname === '/login'
  const isMaintenance = settings?.underMaintenance === true

  if (settingsLoading) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#0A84FF] border-t-transparent rounded-full animate-spin"></div></div>
  }

  // Block the storefront for EVERYONE (including admins) when in maintenance mode.
  // Only allow access to the /admin dashboard and /login page.
  if (isMaintenance && !isAdmin && !isAuthRoute) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans p-6 overflow-hidden">
        {/* Main Graphic - Abstract UI Window with Gears */}
        <div className="w-64 h-48 mb-8 relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#2979FF]/10 rounded-[30px] blur-2xl"></div>
          
          {/* Window Mockup */}
          <div className="relative w-full h-full bg-white rounded-[24px] shadow-xl shadow-[#2979FF]/5 border border-slate-100 flex items-center justify-center overflow-hidden">
             {/* Window Header */}
             <div className="absolute top-0 left-0 w-full h-10 bg-gradient-to-r from-[#7BA9FF] to-[#99BFFF] flex items-center px-4 gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-white/70"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-white/70"></div>
               <div className="w-2.5 h-2.5 rounded-full bg-white/70"></div>
             </div>
             
             {/* Abstract Construction elements */}
             <div className="mt-8 relative flex flex-col items-center justify-center">
               <Settings className="w-20 h-20 text-[#2979FF] animate-[spin_10s_linear_infinite]" strokeWidth={2} />
               <div className="absolute -bottom-6 w-48 h-8 bg-[repeating-linear-gradient(45deg,#82B1FF,#82B1FF_10px,#E0E7FF_10px,#E0E7FF_20px)] rounded-md shadow-md border border-white/50"></div>
             </div>
          </div>
        </div>

        <h1 className="text-3xl md:text-[32px] font-bold text-[#1E293B] mb-2 tracking-tight">Under Maintenance</h1>
        <h2 className="text-xl md:text-[22px] font-semibold text-[#2979FF] mb-4">We'll be back soon!</h2>
        <p className="text-[#64748B] text-center max-w-[340px] text-[15px] mb-10 leading-relaxed font-medium">
          We are currently updating our platform to bring you a better and smoother experience.
        </p>

        {/* Info Card */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 p-6 flex items-center justify-between w-full max-w-md mb-10">
          <div className="flex flex-col items-center flex-1 text-center px-1">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-3 text-[#2979FF]">
              <Clock size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] text-[#94A3B8] font-bold mb-1 uppercase tracking-wider">Expected Time</span>
            <span className="text-[13px] font-bold text-[#2979FF] leading-tight break-words max-w-full">
              {settings?.maintenanceExpectedTime || '30 - 60 Minutes'}
            </span>
          </div>

          <div className="w-[1px] h-12 bg-slate-100 mx-2 flex-shrink-0"></div>

          <div className="flex flex-col items-center flex-1 text-center px-1">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-3 text-[#2979FF]">
              <Wrench size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] text-[#94A3B8] font-bold mb-1 uppercase tracking-wider">Status</span>
            <span className="text-[13px] font-bold text-[#2979FF] leading-tight break-words max-w-full">
              {settings?.maintenanceStatus || 'In Progress'}
            </span>
          </div>

          <div className="w-[1px] h-12 bg-slate-100 mx-2 flex-shrink-0"></div>

          <div className="flex flex-col items-center flex-1 text-center px-1">
            <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center mb-3 text-[#2979FF]">
              <Bell size={20} strokeWidth={2.5} />
            </div>
            <span className="text-[11px] text-[#94A3B8] font-bold mb-1 uppercase tracking-wider">Updates</span>
            <span className="text-[13px] font-bold text-[#2979FF] leading-tight break-words max-w-full">
              {settings?.maintenanceUpdates || "We'll notify you"}
            </span>
          </div>
        </div>

        {/* Footer Text */}
        <div className="flex items-center gap-2 text-[#94A3B8] text-[13px] font-semibold mb-6">
          <Heart size={16} className="text-[#2979FF]" fill="none" strokeWidth={2.5} />
          <span>Thank you for your patience and support.</span>
        </div>

        {/* Button */}
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#2979FF] hover:bg-[#1E6BEE] active:scale-[0.98] text-white rounded-[20px] py-4 px-12 w-full max-w-md font-bold text-[15px] shadow-[0_8px_20px_rgba(41,121,255,0.3)] transition-all flex items-center justify-center gap-2"
        >
          <RefreshCcw size={18} strokeWidth={2.5} />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background flex">
        {!isAdmin && <Sidebar />}
      
      {!isAdmin && (
        <button 
          onClick={toggleSidebar} 
          className="fixed top-[20px] left-5 z-[60] hidden lg:flex p-2 rounded-[10px] bg-[#1C1C1E]/90 hover:bg-[#2C2C2E] border border-white/10 text-white/70 hover:text-white backdrop-blur-xl transition-all shadow-sm"
        >
          <PanelLeft className="w-[20px] h-[20px]" />
        </button>
      )}

      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${desktopPadding}`}>
        {/* Navbar is only visible on mobile/tablet when there's no sidebar */}
        {!isAdmin && (
          <div className="lg:hidden">
            <Navbar />
          </div>
        )}
        <main className={!isAdmin ? 'pt-[110px] md:pt-[150px] lg:pt-0 pb-24 md:pb-8 min-h-screen' : ''}>
          <div className="flex-1 overflow-x-hidden min-h-0 bg-black text-white relative flex flex-col md:pb-0">
          <GlobalPromoPopup />
          <AnimatePresence mode="wait">
            <Suspense fallback={<PageLoader />}>
            <Routes location={location} key={location.pathname}>
              {/* Public App Store Routes */}
              <Route path="/" element={<TodayPage />} />
              <Route path="/app/:id" element={<AppDetail />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/developer-websites" element={<DeveloperWebsitesPage />} />
              <Route path="/about" element={<AboutDeveloper />} />
              <Route path="/apps" element={<AppsPage />} />
              <Route path="/arcade" element={<ArcadePage />} />
              <Route path="/search" element={<Search />} />
              <Route path="/certificate/:certificateId" element={<PublicCertificate />} />
              <Route path="/event/dev-upload/:token" element={<EventLandingPage />} />
              <Route path="/launchpad" element={<LaunchpadPage />} />
              <Route path="/top-charts" element={<TopCharts />} />
              <Route path="/purchases" element={<PurchasesPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsOfServicePage />} />
              <Route path="/cookies" element={<CookiePolicyPage />} />
              <Route path="/security" element={<PrivacyPolicyPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin/login" element={<Login />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                
                {/* 🟢 Accessible by BOTH Staff and Admin */}
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="apps/new" element={<AppUpload />} />
                <Route path="apps/history" element={<AppHistory />} />

                {/* 🔴 ONLY Accessible by True Admin — staff gets redirected to /admin/dashboard */}
                <Route element={<RequireStrictAdmin />}>
                  <Route path="staff" element={<StaffManagementPage />} />
                  <Route path="apps" element={<Admin />} />
                  <Route path="apps/pending" element={<ApprovalQueue />} />
                  <Route path="featured" element={<FeaturedApps />} />
                  <Route path="promotions" element={<PromotionsManager />} />
                  <Route path="developer-websites" element={<AdminDeveloperWebsites />} />

                  <Route path="users" element={<UserList />} />
                  <Route path="users/banned" element={<BannedUsers />} />
                  <Route path="roles" element={<AdminRoles />} />

                  <Route path="reviews" element={<ReviewsPage />} />
                  <Route path="reviews/flagged" element={<ReviewsPage />} />

                  <Route path="categories" element={<CategoriesPage />} />
                  <Route path="banners" element={<CategoriesPage />} />
                  <Route path="notifications" element={<CategoriesPage />} />

                  <Route path="analytics/installs" element={<AnalyticsPage />} />
                  <Route path="analytics/charts" element={<AnalyticsPage />} />
                  <Route path="analytics/search" element={<AnalyticsPage />} />
                  <Route path="analytics/geography" element={<AnalyticsPage />} />
                  <Route path="analytics/revenue" element={<AnalyticsPage />} />

                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="settings/security" element={<SettingsPage />} />
                  <Route path="settings/maintenance" element={<SettingsPage />} />

                  {/* AI Features */}
                  <Route path="features/ai-review" element={<AIReviewSummary />} />
                  <Route path="features/ai-screenshot" element={<AIScreenshotGen />} />
                  <Route path="features/ai-description" element={<AIDescriptionGen />} />
                  <Route path="features/ai-ranking" element={<AIRankingGen />} />
                  <Route path="features/ai-malware" element={<AIMalwareScan />} />
                  <Route path="features/ai-verification" element={<AIVerifyDeveloper />} />
                  <Route path="features/certificate-generation" element={<AppCertificate />} />
                  <Route path="features/certificate-search" element={<SearchCertificate />} />

                  {/* Events */}
                  <Route path="events/developer-upload-day" element={<DeveloperUploadDay />} />
                  <Route path="events/submissions" element={<EventSubmissions />} />
                </Route>
              </Route>
            </Routes>
            <ProfileModal />
            </Suspense>
          </AnimatePresence>
          {!isAdmin && <Footer />}
        </div>
      </main>
      </div>
      
      {/* Bottom bar is only visible on small screens */}
      {!isAdmin && (
        <div className="lg:hidden">
          <BottomTabBar />
        </div>
      )}
    </div>
    </ErrorBoundary>
  )
}
