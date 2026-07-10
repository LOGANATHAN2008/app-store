import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Award, Search, Download, Printer, Share2, ShieldCheck, Star, Shield, ArrowLeft, Copy, Check, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useQuery } from '@tanstack/react-query'
import { appsApi } from '../../services/api'
import html2canvas from 'html2canvas'
import logo from '../../assets/logo.png'

export default function AppCertificate() {
  const navigate = useNavigate()
  const certificateRef = useRef(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const [copied, setCopied] = useState(false)
  
  // Fetch real apps
  const { data: allApps = [], isLoading } = useQuery({
    queryKey: ['admin-apps-certificate'],
    queryFn: () => appsApi.getAll({ limit: 1000 }).then(r => r.apps || [])
  })

  const [selectedAppId, setSelectedAppId] = useState('')
  const [selectedApp, setSelectedApp] = useState(null)

  // Default selection
  useEffect(() => {
    if (allApps.length > 0 && !selectedAppId) {
      setSelectedAppId(allApps[0].id)
    }
  }, [allApps, selectedAppId])

  useEffect(() => {
    if (selectedAppId && allApps.length > 0) {
      setSelectedApp(allApps.find(a => a.id === selectedAppId))
    }
  }, [selectedAppId, allApps])

  const getCertId = (app) => {
    if (!app || allApps.length === 0) return '';
    // Reverse the array so oldest app gets 001, or just use index.
    // Let's use the index of the app from the back so it's stable if list is sorted newest first.
    // Assuming allApps is newest first, the oldest is at the end.
    const reversedIndex = allApps.length - allApps.findIndex(a => a.id === app.id);
    return `Loga_APP_Store_${String(reversedIndex).padStart(3, '0')}`;
  }

  const certId = selectedApp ? getCertId(selectedApp) : '';
  const shareLink = selectedApp ? `https://app.loganathanm.in/certificate/${selectedApp.id}` : '';

  const handleDownloadPNG = async () => {
    if (!certificateRef.current || !selectedApp) return;
    setIsDownloading(true)
    const loadingToast = toast.loading("Generating 4K Certificate...")
    try {
      // Ensure fonts are fully loaded before rendering to canvas
      await document.fonts.ready;
      
      const canvas = await html2canvas(certificateRef.current, {
        scale: 4, // 4K quality
        backgroundColor: '#0F1115',
        useCORS: true,
        logging: false,
        windowWidth: 1200
      })
      const imgData = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${selectedApp.name}_Certificate_${certId}.png`
      link.href = imgData
      link.click()
      toast.success("Certificate Downloaded Successfully!", { id: loadingToast })
    } catch (error) {
      toast.error("Failed to generate certificate.", { id: loadingToast })
    } finally {
      setIsDownloading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    toast.success("Certificate Link Copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${selectedApp?.name} - Verified App Certificate`,
        text: `Check out the official verification certificate for ${selectedApp?.name} by ${selectedApp?.developer || 'Verified Developer'}.`,
        url: shareLink,
      }).catch((err) => console.log('Error sharing', err))
    } else {
      handleCopyLink()
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 text-white">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6 sticky top-0 bg-black/80 backdrop-blur-xl z-40 mb-8 border-b border-white/10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Award className="w-6 h-6 text-[#FFD700]" /> App Certification Center
            </h1>
            <p className="text-textSecondary text-sm">Generate official, high-resolution certificates for verified apps.</p>
          </div>
        </div>

        {selectedApp && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleCopyLink} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium flex items-center gap-2 transition-colors">
              {copied ? <Check className="w-4 h-4 text-[#30D158]" /> : <Copy className="w-4 h-4" />} Copy Link
            </button>
            <button onClick={handleShare} className="px-4 py-2 rounded-xl bg-[#0A84FF]/10 text-[#0A84FF] hover:bg-[#0A84FF]/20 font-medium flex items-center gap-2 transition-colors border border-[#0A84FF]/20">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={handlePrint} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium flex items-center gap-2 transition-colors">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button 
              onClick={handleDownloadPNG} 
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#F5A623] text-black font-bold flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> {isDownloading ? 'Generating...' : 'Download PNG'}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start">
        {/* Left Column: Selection */}
        <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-6 sticky top-32">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Search className="w-5 h-5 text-[#0A84FF]" /> Select Application</h2>
          
          <select 
            value={selectedAppId}
            onChange={(e) => setSelectedAppId(e.target.value)}
            disabled={isLoading || allApps.length === 0}
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#0A84FF] transition-colors disabled:opacity-50 mb-6"
          >
            {isLoading ? (
              <option value="">Loading apps...</option>
            ) : allApps.length === 0 ? (
              <option value="">No apps available</option>
            ) : (
              allApps.map(app => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))
            )}
          </select>

          {selectedApp && (
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-3 items-center">
                <img src={selectedApp.iconUrl} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                <div className="overflow-hidden">
                  <div className="font-bold text-sm text-white/90 truncate">{selectedApp.name}</div>
                  <div className="text-xs text-[#0A84FF] font-medium truncate">{selectedApp.developerName || selectedApp.developer || 'Unknown Developer'}</div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <div className="text-xs text-textSecondary uppercase tracking-wider mb-2 font-bold">Certificate Details</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/50">ID</span>
                    <span className="font-mono text-white/90">{certId.substring(0, 15)}...</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/50">Status</span>
                    <span className="text-[#30D158] flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Certificate Preview */}
        <div className="flex-1 overflow-x-auto custom-scrollbar pb-8">
          {selectedApp ? (
              <div className="w-full overflow-x-auto custom-scrollbar border border-white/10 rounded-2xl bg-[#0F1115] shadow-2xl">
                <div className="min-w-[1000px] p-4 md:p-8 flex justify-center">
                  <div 
                    id="certificate-node"
                    ref={certificateRef}
                    className="relative bg-[#0F1115] p-1 shrink-0"
                    style={{ 
                      width: '1000px',
                      height: '707px', // A4 aspect ratio
                      fontFamily: "'Inter', sans-serif"
                    }}
                  >
                    {/* Gold Border Wrapper */}
                    <div className="w-full h-full border-[4px] border-[#FFD700] rounded-2xl p-1.5 relative z-10 shadow-[0_0_20px_rgba(255,215,0,0.2)_inset,0_0_20px_rgba(255,215,0,0.2)]">
                      <div className="w-full h-full border border-[#FFD700]/30 rounded-xl relative overflow-hidden bg-gradient-to-br from-[#1C1C1E] via-[#0F1115] to-[#141416] flex flex-col p-8">
                    
                    {/* Background decorative elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0A84FF]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none" />

                    {/* Header */}
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="w-12 h-12 rounded-xl border border-white/10" crossOrigin="anonymous" />
                        <div>
                          <div className="text-white font-black text-xl tracking-tight">App Store</div>
                          <div className="text-[#FFD700] text-[10px] font-bold uppercase tracking-[0.2em]">Certification Authority</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/40 text-xs font-mono mb-1">CERTIFICATE ID</div>
                        <div className="text-white/90 text-sm font-mono tracking-wider bg-white/5 px-3 py-1 rounded-lg border border-white/10">{certId}</div>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-4 relative z-10">
                      <h1 className="text-5xl font-black text-[#FFD700] uppercase tracking-widest mb-4" style={{ textShadow: '0 0 40px rgba(255,215,0,0.4)' }}>
                        Official App Certificate
                      </h1>
                      <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent mx-auto rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 max-w-3xl mx-auto w-full">
                      <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light italic mb-4">
                        "This certificate confirms that the application has been meticulously reviewed and approved by the App Store Quality & Security Verification System."
                      </p>

                      {/* App Info Card */}
                      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 w-full max-w-[800px] flex items-center gap-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0A84FF]/10 to-transparent opacity-50" />
                        
                        <img 
                          src={selectedApp.iconUrl} 
                          alt="App Icon" 
                          className="w-32 h-32 rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative z-10 shrink-0 object-cover"
                          crossOrigin="anonymous"
                        />
                        
                        <div className="text-left relative z-10 flex-1">
                          <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wider mb-2 border border-white/5">
                            {selectedApp.category}
                          </div>
                          <h2 className="text-4xl font-black text-white mb-2 leading-tight">{selectedApp.name}</h2>
                          <div className="flex items-center gap-2 text-[#0A84FF] font-medium text-lg mb-3">
                            Developed by {selectedApp.developerName || selectedApp.developer || 'Verified Developer'}
                            <ShieldCheck size={20} className="text-[#0A84FF]" style={{ display: 'inline-block', marginTop: '-2px' }} />
                          </div>
                          <p className="text-white/50 text-sm leading-relaxed" style={{ wordBreak: 'break-word' }}>
                            {(() => {
                              const desc = selectedApp.shortDescription || selectedApp.description || 'This application meets platform standards for quality, performance, usability, and security.';
                              return desc.length > 130 ? desc.substring(0, 130) + '...' : desc;
                            })()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Footer / Stats */}
                    <div className="mt-auto flex items-end justify-between relative z-10 border-t border-white/10 pt-4 pb-0">
                      <div className="flex items-center gap-8">
                         <div>
                           <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Issue Date</div>
                           <div className="text-white font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                         </div>
                         <div>
                           <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Security Score</div>
                           <div className="text-[#30D158] font-bold flex items-center gap-1">100/100 <Shield size={16} className="text-[#30D158]" style={{ display: 'inline-block', marginTop: '-2px' }} /></div>
                         </div>
                         <div>
                           <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold mb-1">Quality Score</div>
                           <div className="text-[#0A84FF] font-bold flex items-center gap-1">100/100 <Star size={16} fill="currentColor" className="text-[#0A84FF]" style={{ display: 'inline-block', marginTop: '-2px' }} /></div>
                         </div>
                      </div>

                      {/* Gold Seal */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-white font-bold text-lg text-[#FFD700]">Verified & Approved</div>
                          <div className="text-white/40 text-xs font-mono mt-1">app.loganathanm.in</div>
                        </div>
                        <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                          <Award size={64} className="text-[#FFD700] absolute" style={{ opacity: 0.9 }} />
                          <div className="absolute inset-0 rounded-full border-2 border-[#FFD700] border-dashed animate-[spin_10s_linear_infinite] opacity-50" />
                          <CheckCircle2 size={24} className="text-[#141416] bg-[#FFD700] rounded-full relative z-10" />
                        </div>
                        
                        {/* QR Code Placeholder (Using Google Chart API) */}
                        <div className="ml-4 p-2 bg-white rounded-xl shadow-lg border border-white/20">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(shareLink)}`}
                            alt="QR Code"
                            className="w-16 h-16"
                            crossOrigin="anonymous"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-white/40 border border-white/5 rounded-3xl bg-white/[0.02]">
              <Award className="w-16 h-16 mb-4 opacity-50" />
              <p>Select an app to preview its certificate.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: #0F1115 !important;
            margin: 0;
            padding: 0;
          }
          body * { 
            visibility: hidden; 
          }
          #certificate-node, #certificate-node * { 
            visibility: visible; 
          }
          #certificate-node { 
            position: absolute !important; 
            left: 50% !important; 
            top: 50% !important; 
            transform: translate(-50%, -50%) !important;
            width: 1000px !important;
            height: 707px !important;
            margin: 0 !important;
            page-break-inside: avoid;
            box-shadow: none !important;
          }
        }
      `}} />
    </div>
  )
}
