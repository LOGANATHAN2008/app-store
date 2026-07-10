import { Inbox, Settings, Lock, Share2, Cookie, Scale, Baby, Mail } from 'lucide-react'

export const PRIVACY_SECTIONS = [
  {
    id: 'info-we-collect',
    title: 'Information We Collect',
    icon: Inbox,
    color: '#007AFF',
    content: `We collect:
• Name, email, profile picture (on registration)
• Device type, OS version, app usage data
• Apps installed, search terms, browsing history
• Reviews and ratings submitted
• Payment info (processed securely, never stored by us)
• Location (only if permission granted)`,
    highlight: {
      text: "We only collect data necessary to provide and improve our services.",
      color: 'blue'
    }
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Data',
    icon: Settings,
    color: '#30D158',
    content: `We use your data to:
• Provide and personalize your App Store experience
• Show app recommendations based on your interests
• Process app installs and purchases
• Send update notifications for installed apps
• Improve search results and app discovery
• Detect fraud and ensure platform security
• Communicate service updates and policy changes`,
    highlight: {
      text: "We never use your data for targeted advertising without your explicit consent.",
      color: 'green'
    }
  },
  {
    id: 'data-storage',
    title: 'Data Storage & Security',
    icon: Lock,
    color: '#AF52DE',
    content: `• All data encrypted in transit (TLS 1.3)
• Data at rest encrypted (AES-256)
• Stored on Firebase (Google Cloud) & Supabase
• Regular security audits and penetration testing
• Data retained for 3 years or until account deletion
• Automatic deletion of inactive accounts after 2 years`,
    highlight: {
      text: "We use industry-standard security measures to protect your information.",
      color: 'purple'
    }
  },
  {
    id: 'sharing',
    title: 'Sharing Your Information',
    icon: Share2,
    color: '#FF9F0A',
    content: `We DO share with:
• App developers (install counts only, no personal data)
• Analytics providers (anonymized data only)
• Legal authorities (only when required by law)

We NEVER share:
• Your email or personal details with advertisers
• Your data with third parties for their marketing
• Payment information with anyone`,
    highlight: {
      text: "We will notify you before sharing data in any new way not described here.",
      color: 'orange'
    }
  },
  {
    id: 'cookies',
    title: 'Cookies & Tracking',
    icon: Cookie,
    color: '#5AC8FA',
    content: `Types of cookies we use:
• Essential: login session, security tokens
• Functional: preferences, language settings
• Analytics: anonymized usage patterns (opt-out available)

We do NOT use:
• Third-party advertising cookies
• Cross-site tracking pixels
• Fingerprinting technologies`,
    hasToggle: true,
  },
  {
    id: 'your-rights',
    title: 'Your Rights & Choices',
    icon: Scale,
    color: '#FF2D55',
    content: `You have the right to:
• Access your personal data
• Correct inaccurate data
• Delete your account and all data
• Export your data (JSON format)
• Opt out of analytics tracking
• Withdraw consent at any time`,
    highlight: {
      text: "Requests processed within 30 days per GDPR.",
      color: 'green'
    },
    hasDataButtons: true,
  },
  {
    id: 'childrens-privacy',
    title: 'Children\'s Privacy',
    icon: Baby,
    color: '#FFD60A',
    content: `• Service not directed to children under 13
• We do not knowingly collect data from under-13s
• Parents: contact us to remove child's data
• Apps marked 4+ are content-rated, not data-exempt`,
    highlight: {
      text: "If you believe a child has provided us data, please contact us immediately.",
      color: 'yellow'
    }
  },
  {
    id: 'contact',
    title: 'Contact Us',
    icon: Mail,
    color: '#007AFF',
    isContactCard: true,
  }
]
