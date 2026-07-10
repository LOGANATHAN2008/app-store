import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ExternalLink, Mail, Github, Linkedin, Globe, Code2, X, Instagram } from 'lucide-react';
import { useUIStore } from '../store';
import packageJson from '../../package.json'

function SectionHeader({ title }) {
  return <div className="text-[13px] font-semibold text-[#8E8E93] uppercase tracking-wider mb-2 ml-4 mt-6">{title}</div>
}

function ListItem({ icon: Icon, title, value, onClick, hideArrow }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white/5 border-b border-white/5 last:border-none hover:bg-white/10 transition-colors active:bg-white/20 text-left"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#2C2C2E] flex items-center justify-center shrink-0">
            <Icon size={16} className="text-[#0A84FF]" />
          </div>
        )}
        <span className="text-[16px] font-medium text-white flex-1">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[15px] text-[#8E8E93]">{value}</span>}
        {!hideArrow && <ChevronRight size={18} className="text-[#8E8E93]" />}
      </div>
    </button>
  )
}

function ListLinkRow({ icon: Icon, title, subtitle, value, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      aria-label={`${title}, opens in browser`}
      className="w-full flex items-center justify-between p-4 bg-white/5 border-b border-white/5 last:border-none hover:bg-white/10 transition-colors active:bg-white/20 text-left"
    >
      <div className="flex items-center gap-3 w-full pr-4">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[#2C2C2E] flex items-center justify-center shrink-0">
            <Icon size={16} className="text-[#0A84FF]" />
          </div>
        )}
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-[16px] font-medium text-white truncate">{title}</span>
          {subtitle && <span className="text-[13px] text-[#8E8E93] truncate">{subtitle}</span>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-[15px] text-[#8E8E93] truncate max-w-[120px] sm:max-w-none">{value}</span>}
        <ChevronRight size={18} className="text-[#8E8E93] shrink-0" />
      </div>
    </a>
  )
}

export default function AboutDeveloper() {
  const version = packageJson?.version || '1.0.0';
  const [isImageOpen, setIsImageOpen] = useState(false);
  const profileImageUrl = "https://res.cloudinary.com/droiridf3/image/upload/v1781689156/portfolio/hero/gghxibxamwfehukac7tp.jpg";

  return (
    <div className="min-h-screen bg-black pb-24 text-white">
      {/* iOS style sticky header */}
      <div className="flex items-center justify-center p-4 border-b border-white/10 shrink-0 bg-[#1C1C1E]/80 backdrop-blur-xl z-10 sticky top-0 w-full">
        <h2 className="text-[17px] font-bold">About the Developer</h2>
      </div>

      <div className="max-w-2xl mx-auto w-full px-4 pt-6">

        {/* Profile Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            onClick={() => setIsImageOpen(true)}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#0A84FF] to-[#5AC8FA] p-0.5 mb-4 shadow-lg shadow-[#0A84FF]/20 relative cursor-pointer hover:scale-105 transition-transform"
          >
            <div className="w-full h-full bg-[#2C2C2E] rounded-full flex items-center justify-center overflow-hidden border-2 border-[#1C1C1E]">
              <img
                src={profileImageUrl}
                alt="Loganathan M"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <h2 className="text-[28px] font-bold leading-tight mb-1 text-center">Loganathan M</h2>
          <p className="text-[16px] text-[#0A84FF] font-semibold mb-1 text-center">AI & Web Developer</p>
          <p className="text-[14px] text-[#8E8E93] text-center max-w-sm">
            BCA Student, Dayananda Sagar University (DSU), Bengaluru<br />
            Bengaluru, Karnataka, India
          </p>
        </div>

        {/* Section: About */}
        <SectionHeader title="About" />
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm p-4">
          <p className="text-[15px] text-white/90 leading-relaxed">
            Building modern, user-friendly web and mobile applications — blending clean design with real functionality. Work spans AI-powered tools, full-stack platforms, and interactive learning systems.
          </p>
        </div>

        {/* Section: Featured Projects */}
        <SectionHeader title="Featured Projects" />
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm">
          <ListLinkRow
            icon={Code2}
            title="ExamPro DSU"
            subtitle="Online examination platform with real-time data via Firebase"
            url="https://github.com/LOGANATHAN2008"
          />
          <ListLinkRow
            icon={Code2}
            title="Learning Platform"
            subtitle="Interactive e-learning system with course & progress tracking"
            url="https://github.com/LOGANATHAN2008"
          />
          <ListLinkRow
            icon={Code2}
            title="Language Learning App"
            subtitle="Gamified vocabulary tool with smart content delivery"
            url="https://github.com/LOGANATHAN2008"
          />
          <ListLinkRow
            icon={Code2}
            title="AI Proctor"
            subtitle="Facial recognition-based exam monitoring system"
            url="https://github.com/LOGANATHAN2008"
          />
          <ListLinkRow
            icon={Code2}
            title="AI Chat & AI Meme Generator"
            subtitle="NLP and AI-powered creative tools"
            url="https://github.com/LOGANATHAN2008"
          />
          <ListLinkRow
            icon={Code2}
            title="Healthcare Portal"
            subtitle="Secure doctor-patient dashboard"
            url="https://github.com/LOGANATHAN2008"
          />
        </div>

        {/* Section: Skills */}
        <SectionHeader title="Skills" />
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm p-4 flex flex-wrap gap-2">
          {['HTML5', 'CSS3', 'JavaScript', 'Python', 'PHP', 'React', 'Firebase', 'MySQL', 'Cloudinary', 'Git/GitHub', 'Google Cloud Platform', 'UI/UX Design (Figma)'].map(skill => (
            <motion.button 
              key={skill} 
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(10, 132, 255, 0.1)', borderColor: 'rgba(10, 132, 255, 0.5)', color: '#0A84FF' }}
              whileTap={{ scale: 0.9, backgroundColor: 'rgba(10, 132, 255, 1)', borderColor: 'rgba(10, 132, 255, 1)', color: '#FFFFFF' }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-[14px] text-white/90 font-medium cursor-pointer"
            >
              {skill}
            </motion.button>
          ))}
        </div>

        {/* Section: Certifications */}
        <SectionHeader title="Certifications" />
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <a href="https://www.loganathanm.in/#certifications" target="_blank" rel="noreferrer" className="p-4 border-b border-white/5 hover:bg-white/10 transition-colors active:bg-white/20 block">
            <span className="text-[15px] font-medium text-white block">Infosys Springboard</span>
            <span className="text-[13px] text-[#8E8E93]">Front End Web Developer</span>
          </a>
          <a href="https://www.loganathanm.in/#certifications" target="_blank" rel="noreferrer" className="p-4 border-b border-white/5 hover:bg-white/10 transition-colors active:bg-white/20 block">
            <span className="text-[15px] font-medium text-white block">Infosys Springboard</span>
            <span className="text-[13px] text-[#8E8E93]">HTML5, CSS3, JavaScript</span>
          </a>
          <a href="https://www.loganathanm.in/#certifications" target="_blank" rel="noreferrer" className="p-4 border-b border-white/5 hover:bg-white/10 transition-colors active:bg-white/20 block">
            <span className="text-[15px] font-medium text-white block">Infosys Springboard</span>
            <span className="text-[13px] text-[#8E8E93]">Cybersecurity Fundamentals</span>
          </a>
          <a href="https://www.loganathanm.in/#certifications" target="_blank" rel="noreferrer" className="p-4 hover:bg-white/10 transition-colors active:bg-white/20 block">
            <span className="text-[15px] font-medium text-white block">Infosys Springboard</span>
            <span className="text-[13px] text-[#8E8E93]">Probability & Statistics</span>
          </a>
        </div>

        {/* Section: Connect */}
        <SectionHeader title="Connect" />
        <div className="bg-[#1C1C1E] rounded-2xl overflow-hidden shadow-sm">
          <ListLinkRow
            icon={Mail}
            title="Email"
            value="loganathan082008@gmail.com"
            url="mailto:loganathan082008@gmail.com"
          />
          <ListLinkRow
            icon={Github}
            title="GitHub"
            url="https://github.com/LOGANATHAN2008"
          />
          <ListLinkRow
            icon={Linkedin}
            title="LinkedIn"
            url="https://linkedin.com/in/loganathan-m-2008l"
          />
          <ListLinkRow
            icon={Globe}
            title="Portfolio Website"
            url="https://www.loganathanm.in/"
          />
          <ListLinkRow
            icon={Instagram}
            title="Instagram (Official)"
            subtitle="Updates & Projects"
            url="https://www.instagram.com/loganathanm.in?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          />
          <ListLinkRow
            icon={Instagram}
            title="Instagram (Personal)"
            subtitle="Life & Behind the scenes"
            url="https://www.instagram.com/kutty_loga_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pb-8">
          <p className="text-[13px] text-[#8E8E93] mb-1">Version {version}</p>
          <p className="text-[13px] text-[#8E8E93]">Made with ❤️ by Loganathan M</p>
        </div>
      </div>

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {isImageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsImageOpen(false)}
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button
              onClick={() => setIsImageOpen(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
            >
              <X size={24} />
            </button>
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={profileImageUrl}
              alt="Loganathan M Full Screen"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing immediately if they click the image
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
