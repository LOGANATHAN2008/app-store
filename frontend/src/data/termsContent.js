import { FileText, Shield, Scale, Activity, Mail } from 'lucide-react'

export const TERMS_SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    icon: FileText,
    color: '#007AFF',
    content: `By accessing or using our App Store, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
• You must be at least 13 years old to use the platform.
• You are responsible for maintaining the confidentiality of your account.`,
    highlight: { text: "These terms constitute a legally binding agreement.", color: "blue" }
  },
  {
    id: 'user-conduct',
    title: 'User Conduct',
    icon: Activity,
    color: '#FF9F0A',
    content: `You agree not to engage in any of the following prohibited activities:
• Distributing malware or malicious software
• Attempting to hack or disrupt the service
• Posting fake reviews or manipulating ratings
• Harassing other users or developers`,
    highlight: { text: "Violation of these rules will result in immediate account termination.", color: "orange" }
  },
  {
    id: 'ip-rights',
    title: 'Intellectual Property',
    icon: Shield,
    color: '#AF52DE',
    content: `• All apps remain the property of their respective developers.
• The App Store branding and platform code are our intellectual property.
• You may not scrape, copy, or reverse engineer our platform.`,
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    icon: Scale,
    color: '#FF2D55',
    content: `We provide the service "as is" without warranties of any kind.
We are not responsible for:
• Data loss or device damage from third-party apps
• Unauthorized access to your account if you shared your password
• Downtime or service interruptions`,
  },
  {
    id: 'contact-terms',
    title: 'Contact Legal',
    icon: Mail,
    color: '#007AFF',
    isContactCard: true
  }
]
