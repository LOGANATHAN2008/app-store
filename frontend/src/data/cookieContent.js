import { Cookie, Lock, Shield, Settings } from 'lucide-react'

export const COOKIE_SECTIONS = [
  {
    id: 'what-are-cookies',
    title: 'What are Cookies?',
    icon: Cookie,
    color: '#FF9F0A',
    content: `Cookies are small text files stored on your device when you visit our app or website.
They help us remember your preferences, keep your session secure, and understand how you interact with our platform.`,
    highlight: { text: "Cookies are completely safe and cannot read data off your hard drive.", color: "blue" }
  },
  {
    id: 'essential-cookies',
    title: 'Essential Cookies',
    icon: Lock,
    color: '#30D158',
    content: `These cookies are strictly necessary for the platform to function.
• Authentication tokens (keeping you logged in)
• Security verification
• Load balancing and routing`,
    highlight: { text: "Essential cookies cannot be disabled as the app will not function without them.", color: "green" }
  },
  {
    id: 'analytics-cookies',
    title: 'Analytics & Performance',
    icon: Settings,
    color: '#5AC8FA',
    content: `We use these to measure how users interact with the store.
• Tracking page load times
• Counting active users and app views
• Identifying crash reports and bugs`,
    hasToggle: true
  }
]
