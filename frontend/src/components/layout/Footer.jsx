import { Link } from 'react-router-dom'
import { Instagram, Linkedin, Github, Mail, Globe } from 'lucide-react'
import logoUrl from '../../assets/logo.png'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="hidden md:block w-full bg-[#1C1C1E]/50 border-t border-white/10 mt-20 pt-16 pb-24 md:pb-12 text-[#8E8E93]">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
        
        {/* Top Section: Brand & Description */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-16">
          <div className="max-w-sm">
            <div className="flex items-center gap-3 text-white mb-4">
              <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-semibold tracking-tight">LM Store</span>
            </div>
            <p className="text-sm leading-relaxed mb-6">
              The App Store is a digital distribution platform, providing free and open access to a vast catalog of premium applications. Discover, download, and enjoy the best apps safely and securely.
            </p>
            <div className="flex flex-wrap items-center gap-5 text-white/50">
              <a href="https://www.instagram.com/loganathanm.in?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" title="Instagram (Official)" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="https://www.instagram.com/kutty_loga_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" title="Instagram (Personal)" className="hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="https://www.linkedin.com/in/loganathanm-in/" target="_blank" rel="noreferrer" title="LinkedIn" className="hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
              <a href="https://github.com/LOGANATHAN2008" target="_blank" rel="noreferrer" title="GitHub" className="hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
              <a href="mailto:support.loga@gmail.com" title="Email Support" className="hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
              <a href="https://loganathanm.in" target="_blank" rel="noreferrer" title="Official Website" className="hover:text-white transition-colors"><Globe className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 md:gap-16 w-full md:w-auto">
            {/* Column 1 */}
            <div className="flex flex-col gap-3">
              <h3 className="text-white text-[11px] font-bold uppercase tracking-widest mb-2">Discover</h3>
              <Link to="/" className="text-xs hover:text-white transition-colors">Home</Link>
              <Link to="/category/productivity" className="text-xs hover:text-white transition-colors">Apps</Link>
              <Link to="/category/games" className="text-xs hover:text-white transition-colors">Games</Link>
              <Link to="/top-charts" className="text-xs hover:text-white transition-colors">Top Charts</Link>
              <Link to="/search" className="text-xs hover:text-white transition-colors">Search</Link>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col gap-3">
              <h3 className="text-white text-[11px] font-bold uppercase tracking-widest mb-2">Legal</h3>
              <Link to="/terms" className="text-xs hover:text-white transition-colors">Terms of Service</Link>
              <Link to="/privacy" className="text-xs hover:text-white transition-colors">Privacy Policy</Link>
              <Link to="/cookies" className="text-xs hover:text-white transition-colors">Cookie Settings</Link>
              <Link to="/terms" className="text-xs hover:text-white transition-colors">Terms for Developers</Link>
              <Link to="/privacy" className="text-xs hover:text-white transition-colors">DMCA</Link>
            </div>
          </div>
        </div>

        {/* Bottom Section: Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/40">
            Copyright © {currentYear} Loganathan M. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <span>India</span>
            <div className="w-[1px] h-3 bg-white/20"></div>
            <span>English (UK)</span>
          </div>
        </div>
        
      </div>
    </footer>
  )
}
