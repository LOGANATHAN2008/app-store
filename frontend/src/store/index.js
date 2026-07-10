import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Helper to get current user ID
export const getCurrentUserId = () => {
  try {
    const user = useAuthStore.getState().user;
    return user?._id || user?.email || 'guest';
  } catch (e) {
    return 'guest';
  }
}

// Install state store
export const useInstallStore = create(persist(
  (set, get) => ({
    installed: {}, // { [userId]: { appId: 'installed' | 'none' } }
    setInstallState: (appId, state) => {
      const userId = getCurrentUserId();
      set(prev => ({
        installed: { 
          ...prev.installed, 
          [userId]: { ...(prev.installed[userId] || {}), [appId]: state } 
        }
      }))
    },
    getInstallState: (appId) => {
      const userId = getCurrentUserId();
      const userInstalls = get().installed[userId] || {};
      
      // Fallback for legacy global data structure
      if (get().installed[appId] === 'installed') return 'installed';
      
      return userInstalls[appId] || 'none';
    },
    toggleInstall: (appId) => {
      const userId = getCurrentUserId();
      const userInstalls = get().installed[userId] || {};
      
      // Fallback for legacy global data structure
      const legacyState = get().installed[appId];
      const current = userInstalls[appId] || (legacyState === 'installed' ? 'installed' : 'none');
      
      set(prev => ({ 
        installed: { 
          ...prev.installed, 
          [userId]: { ...(prev.installed[userId] || {}), [appId]: current === 'installed' ? 'none' : 'installed' } 
        } 
      }))
    },
  }),
  { name: 'install-store' }
))

// Auth store
export const useAuthStore = create(persist(
  (set) => ({
    user: null,
    token: null,
    setAuth: (user, token) => { set({ user, token }); localStorage.setItem('admin_token', token) },
    logout: () => { set({ user: null, token: null }); localStorage.removeItem('admin_token') },
    isAdmin: () => {
      const state = useAuthStore.getState()
      return state.user?.isAdmin === true
    },
  }),
  { name: 'auth-store' }
))

// UI store
export const useUIStore = create(persist(
  (set) => ({
    searchOpen: false,
    setSearchOpen: (v) => set({ searchOpen: v }),
    selectedOS: 'Android',
    setSelectedOS: (os) => set({ selectedOS: os }),
    activeCategory: 'all',
    setActiveCategory: (c) => set({ activeCategory: c }),
    isProfileModalOpen: false,
    setProfileModalOpen: (v) => set({ isProfileModalOpen: v }),
    sidebarOpen: false,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    setSidebarOpen: (v) => set({ sidebarOpen: v }),
    language: localStorage.getItem('prefs_lang') || 'English',
    setLanguage: (lang) => {
      localStorage.setItem('prefs_lang', lang)
      set({ language: lang })
    },
    theme: localStorage.getItem('prefs_theme') || 'dark',
    setTheme: (theme) => {
      localStorage.setItem('prefs_theme', theme)
      set({ theme })
      if (theme === 'light') {
        document.documentElement.classList.add('light-mode')
      } else {
        document.documentElement.classList.remove('light-mode')
      }
    }
  }),
  { name: 'ui-store' }
))

// Wishlist store
export const useWishlistStore = create(persist(
  (set, get) => ({
    wishlist: {}, // { [userId]: { appId: true/false } }
    toggleWishlist: (appId) => {
      const userId = getCurrentUserId();
      const userWishlist = get().wishlist[userId] || {};
      
      // Legacy fallback
      const legacyState = get().wishlist[appId];
      const current = userWishlist[appId] !== undefined ? userWishlist[appId] : (legacyState || false);
      
      set(prev => ({ 
        wishlist: { 
          ...prev.wishlist, 
          [userId]: { ...(prev.wishlist[userId] || {}), [appId]: !current } 
        } 
      }))
    },
    isInWishlist: (appId) => {
      const userId = getCurrentUserId();
      const userWishlist = get().wishlist[userId] || {};
      
      // Legacy fallback
      if (get().wishlist[appId] === true) return true;
      
      return userWishlist[appId] || false;
    },
  }),
  { name: 'wishlist-store' }
))
