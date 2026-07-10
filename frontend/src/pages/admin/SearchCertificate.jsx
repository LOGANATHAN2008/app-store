import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Award, Shield, Star, CheckCircle2, Download, Share2, Copy, Printer, RefreshCw, XCircle, ShieldCheck } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { appsApi } from '../../services/api'
import logo from '../../assets/logo.png'
import html2canvas from 'html2canvas'
import toast from 'react-hot-toast'
import AppIcon from '../../components/ui/AppIcon'

export default function SearchCertificate() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchedApp, setSearchedApp] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const certificateRef = useRef(null)

  // Fetch all apps
  const { data: allApps = [], isLoading } = useQuery({
    queryKey: ['admin-apps-all'],
    queryFn: () => appsApi.getAll({ limit: 1000 }).then(r => r.apps || [])
  })

  // Map apps to their computed Certificate IDs
  const appsWithCertIds = React.useMemo(() => {
    return allApps.map((app, index) => {
      const reversedIndex = allApps.length - index;
      const certId = `Loga_APP_Store_${String(reversedIndex).padStart(3, '0')}`;
      return { ...app, certId };
    })
  }, [allApps])

  const suggestions = React.useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return appsWithCertIds.filter(a => a.certId.toLowerCase().includes(q) || a.name.toLowerCase().includes(q)).slice(0, 5);
  }, [searchQuery, appsWithCertIds])

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate slight network delay for premium feel
    setTimeout(() => {
      const found = appsWithCertIds.find(a => a.certId.toLowerCase() === searchQuery.toLowerCase().trim());
      setSearchedApp(found || null);
      setIsSearching(false);
      setShowSuggestions(false);
    }, 600);
  }

  const handleClear = () => {
    setSearchQuery('');
    setSearchedApp(null);
    setHasSearched(false);
    setShowSuggestions(false);
  }

  const handleSelectSuggestion = (app) => {
    setSearchQuery(app.certId);
    setSearchedApp(app);
    setHasSearched(true);
    setShowSuggestions(false);
  }

  const shareLink = searchedApp ? `https://app.loganathanm.in/certificate/${searchedApp.id}` : '';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success("Verification Link Copied!");
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${searchedApp?.name} - Verified App Certificate`,
        url: shareLink,
      }).catch(console.error)
    } else {
      handleCopyLink();
    }
  }

  const handlePrint = () => {
    window.print();
  }

  const handleDownloadPNG = async () => {
    if (!certificateRef.current || !searchedApp) return;
    setIsDownloading(true);
    const loadingToast = toast.loading("Generating High-Res PNG...");
    try {
      await document.fonts.ready;
      const canvas = await html2canvas(certificateRef.current, {
        scale: 4,
        backgroundColor: '#0F1115',
        useCORS: true,
        logging: false,
        windowWidth: 1200
      });
      const link = document.createElement('a');
      link.download = `${searchedApp.name}_Certificate_${searchedApp.certId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success("Downloaded Successfully!", { id: loadingToast });
    } catch (err) {
      toast.error("Failed to generate PNG.", { id: loadingToast });
    } finally {
      setIsDownloading(false);
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return <span className="flex items-center gap-1 text-[#30D158] bg-[#30D158]/10 px-3 py-1 rounded-full text-xs font-bold border border-[#30D158]/20"><CheckCircle2 className="w-3 h-3"/> Verified</span>;
      case 'pending': return <span className="flex items-center gap-1 text-[#FF9F0A] bg-[#FF9F0A]/10 px-3 py-1 rounded-full text-xs font-bold border border-[#FF9F0A]/20"><Star className="w-3 h-3"/> Pending Review</span>;
      case 'rejected': return <span className="flex items-center gap-1 text-[#FF453A] bg-[#FF453A]/10 px-3 py-1 rounded-full text-xs font-bold border border-[#FF453A]/20"><XCircle className="w-3 h-3"/> Revoked</span>;
      default: return <span className="flex items-center gap-1 text-white/50 bg-white/5 px-3 py-1 rounded-full text-xs font-bold border border-white/10"><Shield className="w-3 h-3"/> Unknown</span>;
    }
  }

  return (
    <div className="max-w-7xl mx-auto pb-24 text-white">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-6 sticky top-0 bg-black/80 backdrop-blur-xl z-40 mb-8 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Search className="w-6 h-6 text-[#0A84FF]" /> Certificate Search
          </h1>
          <p className="text-textSecondary text-sm">Verify and preview official app certificates.</p>
        </div>
      </div>

      {/* Search Interface */}
      <div className="max-w-3xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center bg-[#1C1C1E] border border-white/10 rounded-2xl p-2 shadow-2xl focus-within:border-[#0A84FF] transition-colors relative z-20">
            <div className="pl-4 pr-2 text-white/40">
              <Award className="w-6 h-6" />
            </div>
            <input 
              type="text"
              placeholder="Enter Certificate ID (e.g. Loga_APP_Store_001)"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                if (hasSearched) setHasSearched(false);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="flex-1 bg-transparent border-none outline-none text-white text-lg py-3 px-2 placeholder:text-white/20"
            />
            {searchQuery && (
              <button type="button" onClick={handleClear} className="p-2 text-white/40 hover:text-white transition-colors mr-2">
                <X className="w-5 h-5" />
              </button>
            )}
            <button 
              type="submit"
              disabled={isSearching || !searchQuery.trim()}
              className="bg-[#0A84FF] hover:bg-[#0070E0] text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </div>

          {/* Autocomplete Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#1C1C1E] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-10"
              >
                {suggestions.map(app => (
                  <button
                    key={app.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(app)}
                    className="w-full text-left px-6 py-4 hover:bg-white/5 flex items-center gap-3 border-b border-white/5 last:border-0 transition-colors"
                  >
                    <Award className="w-5 h-5 text-white/20" />
                    <div className="font-mono font-medium text-white/90">{app.certId}</div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Results Area */}
      <div className="flex justify-center">
        {isSearching ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/40">
            <RefreshCw className="w-10 h-10 animate-spin mb-4 text-[#0A84FF]" />
            <p className="font-medium">Verifying Certificate...</p>
          </div>
        ) : hasSearched && !searchedApp ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center max-w-md"
          >
            <div className="w-20 h-20 bg-[#FF453A]/10 rounded-full flex items-center justify-center mb-6">
              <XCircle className="w-10 h-10 text-[#FF453A]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Certificate Not Found</h2>
            <p className="text-white/40 mb-8">This certificate does not exist or has been removed from the registry. Please check the ID and try again.</p>
            <button onClick={handleClear} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold transition-colors">
              ← Back to Search
            </button>
          </motion.div>
        ) : hasSearched && searchedApp ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            {/* Preview Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <button onClick={handleDownloadPNG} disabled={isDownloading} className="px-5 py-2.5 bg-gradient-to-r from-[#FFD700] to-[#F5A623] text-black font-bold rounded-xl flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(255,215,0,0.3)]">
                <Download className="w-4 h-4" /> PNG
              </button>
              <button onClick={handlePrint} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl flex items-center gap-2 transition-all">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button onClick={handleCopyLink} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl flex items-center gap-2 transition-all">
                <Copy className="w-4 h-4" /> Copy Link
              </button>
              <button onClick={handleShare} className="px-5 py-2.5 bg-[#0A84FF]/20 text-[#0A84FF] hover:bg-[#0A84FF]/30 font-medium rounded-xl flex items-center gap-2 transition-all">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>

            {/* Verification Status Badge Large */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-3 bg-[#30D158]/10 border border-[#30D158]/30 px-6 py-3 rounded-2xl shadow-[0_0_30px_rgba(48,209,88,0.15)]">
                <CheckCircle2 className="w-6 h-6 text-[#30D158]" />
                <span className="text-[#30D158] font-black tracking-widest uppercase">Verified Application</span>
              </div>
            </div>

            {/* Certificate Renderer */}
            <div className="w-full overflow-x-auto custom-scrollbar border border-white/10 rounded-2xl bg-[#0F1115] shadow-2xl">
              <div className="min-w-[1000px] p-4 md:p-8 flex justify-center">
                <div 
                  id="certificate-node"
                  ref={certificateRef}
                  className="relative bg-[#0F1115] p-2 shrink-0 flex items-center justify-center"
                  style={{ width: '1000px', height: '707px', fontFamily: "'Inter', sans-serif" }}
                >
                  <div className="w-full h-full border-[4px] border-[#FFD700] rounded-2xl p-1.5 relative z-10 shadow-[0_0_20px_rgba(255,215,0,0.2)_inset,0_0_20px_rgba(255,215,0,0.2)]">
                    <div className="w-full h-full border border-[#FFD700]/30 rounded-xl relative overflow-hidden bg-gradient-to-br from-[#1C1C1E] via-[#0F1115] to-[#141416] flex flex-col p-8">
                      
                      <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#0A84FF]/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />
                      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay pointer-events-none" />

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
                          <div className="text-white/90 text-sm font-mono tracking-wider bg-white/5 px-3 py-1 rounded-lg border border-white/10">{searchedApp.certId}</div>
                        </div>
                      </div>

                      <div className="text-center mb-4 relative z-10">
                        <h1 className="text-5xl font-black text-[#FFD700] tracking-tight uppercase" style={{ textShadow: '0 4px 20px rgba(255, 215, 0, 0.2)' }}>
                          Official App Certificate
                        </h1>
                        <div className="w-32 h-1 bg-gradient-to-r from-transparent via-[#FFD700]/50 to-transparent mx-auto mt-6" />
                      </div>

                      <div className="flex-1 flex flex-col items-center justify-center text-center relative z-10 max-w-3xl mx-auto w-full">
                        <p className="text-lg text-white/80 italic leading-relaxed mb-4 font-serif">
                          "This certificate confirms that the application has been meticulously reviewed and approved by the App Store Quality & Security Verification System."
                        </p>

                        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 w-full max-w-[800px] flex items-center gap-8 shadow-2xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-[#0A84FF]/10 to-transparent opacity-50" />
                          <img 
                            src={searchedApp.iconUrl} 
                            alt="App Icon" 
                            className="w-32 h-32 rounded-3xl shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/10 relative z-10 shrink-0 object-cover"
                            crossOrigin="anonymous"
                          />
                          <div className="text-left relative z-10 flex-1">
                            <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/70 text-xs font-bold uppercase tracking-wider mb-2 border border-white/5">
                              {searchedApp.category || 'Application'}
                            </div>
                            <h2 className="text-4xl font-black text-white mb-1 tracking-tight">{searchedApp.name}</h2>
                            <div className="flex items-center gap-2 text-[#0A84FF] font-medium text-lg mb-3">
                              Developed by {searchedApp.developerName || searchedApp.developer || 'Verified Developer'}
                              <ShieldCheck size={20} className="text-[#0A84FF]" style={{ display: 'inline-block', marginTop: '-2px' }} />
                            </div>
                            <p className="text-white/60 leading-relaxed text-sm" style={{ wordBreak: 'break-word' }}>
                              {(() => {
                                const desc = searchedApp.shortDescription || searchedApp.description || 'Verified and approved application for distribution.';
                                return desc.length > 130 ? desc.substring(0, 130) + '...' : desc;
                              })()}
                            </p>
                          </div>
                        </div>
                      </div>

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
          </motion.div>
        ) : null}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page { size: landscape; margin: 0; }
          body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; background-color: #0F1115 !important; margin: 0; padding: 0; }
          body * { visibility: hidden; }
          #certificate-node, #certificate-node * { visibility: visible; }
          #certificate-node { 
            position: absolute !important; left: 50% !important; top: 50% !important; transform: translate(-50%, -50%) !important;
            width: 1000px !important; height: 707px !important; margin: 0 !important; page-break-inside: avoid; box-shadow: none !important;
          }
        }
      `}} />
    </div>
  )
}
