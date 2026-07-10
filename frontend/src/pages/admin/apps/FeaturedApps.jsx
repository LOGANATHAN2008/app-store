import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'
import { ArrowLeft, Save, GripVertical, X, Search, Clock, Plus, Zap, Edit2, Upload, Link } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { appsApi, featuredApi, updatesApi } from '../../../services/api'
import { formatDistanceToNow } from 'date-fns'
import { io } from 'socket.io-client'
import UpdateCard from './featured/UpdateCard'

export default function FeaturedAppsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  
  // Decide active tab based on URL path or state
  const isUpdatesRoute = location.pathname.includes('updates')
  const [activeTab, setActiveTab] = useState(isUpdatesRoute ? 'updates' : 'featured')

  // ----- FEATURED TAB STATE -----
  const [featuredData, setFeaturedData] = useState({
    iosHeroCards: [],
    androidHeroCards: [],
    topFree: [],
    topPaid: [],
    editorsChoice: []
  })
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addCategoryTarget, setAddCategoryTarget] = useState(null)
  const [searchApp, setSearchApp] = useState('')
  
  // Hero Edit Modal State
  const [editingHeroIndex, setEditingHeroIndex] = useState(null)
  const [heroEditForm, setHeroEditForm] = useState({})
  
  const { data: serverFeatured, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['admin-featured'],
    queryFn: () => featuredApi.getFeatured()
  })

  // ----- UPDATES TAB STATE & ALL APPS -----
  const [updateTab, setUpdateTab] = useState('All')
  const { data: allApps = [] } = useQuery({
    queryKey: ['admin-apps'],
    queryFn: () => appsApi.getAll({ limit: 1000 }).then(r => r.apps || [])
  })

  useEffect(() => {
    if (serverFeatured && allApps.length > 0) {
      const iosHeroCards = [];
      const androidHeroCards = [];
      
      (serverFeatured.heroCards || []).forEach(h => {
        const app = allApps.find(a => a.id === h.id);
        const osStr = (app?.minOS || '').toLowerCase();
        if (osStr.includes('android') && !osStr.includes('ios')) {
          androidHeroCards.push(h);
        } else {
          iosHeroCards.push(h); // Default to iOS or 'Both'
        }
      });

      setFeaturedData({
        iosHeroCards,
        androidHeroCards,
        topFree: serverFeatured.topFree || [],
        topPaid: serverFeatured.topPaid || [],
        editorsChoice: serverFeatured.editorsChoice || []
      })
    }
  }, [serverFeatured, allApps])

  const saveFeaturedMutation = useMutation({
    mutationFn: (data) => featuredApi.saveFeatured(data),
    onSuccess: () => {
      toast.success('Featured apps saved & live!')
      queryClient.invalidateQueries(['admin-featured'])
      queryClient.invalidateQueries(['featured'])
    }
  })

  // Hero Upload Handlers
  const handleHeroBgUpload = async (e) => {
    if (!e.target.files?.[0]) return;
    const t = toast.loading('Uploading BG...');
    try {
      const { url } = await uploadApi.banner(e.target.files[0]);
      setHeroEditForm(p => ({ ...p, bgUrl: url }));
      toast.success('BG Uploaded', { id: t });
    } catch (err) {
      toast.error('Upload failed', { id: t });
    }
  }

  const handleHeroIconUpload = async (e) => {
    if (!e.target.files?.[0]) return;
    const t = toast.loading('Uploading Icon...');
    try {
      const { url } = await uploadApi.icon(e.target.files[0]);
      setHeroEditForm(p => ({ ...p, customIconUrl: url }));
      toast.success('Icon Uploaded', { id: t });
    } catch (err) {
      toast.error('Upload failed', { id: t });
    }
  }

  const saveHeroEdit = (targetSection) => {
    const n = [...featuredData[targetSection]];
    n[editingHeroIndex] = heroEditForm;
    const newData = { ...featuredData, [targetSection]: n };
    setFeaturedData(newData);
    setEditingHeroIndex(null);
    
    // Instantly save to backend
    saveFeaturedMutation.mutate({
      heroCards: [...(newData.iosHeroCards || []), ...(newData.androidHeroCards || [])],
      topFree: newData.topFree,
      topPaid: newData.topPaid,
      editorsChoice: newData.editorsChoice
    });
  }

  // Filter apps based on active updates tab
  const filteredUpdates = allApps.filter(app => {
    if (updateTab === 'All') return true;
    if (updateTab === 'Scheduled') return !!app.scheduledAt;
    if (updateTab === 'Pushed') return app.versionHistory && app.versionHistory.length > 0;
    if (updateTab === 'Pending') return !app.scheduledAt && (!app.versionHistory || app.versionHistory.length === 0);
    return true;
  });

  // Handle Drag & Drop
  const onDragEnd = (result) => {
    const { source, destination, type } = result
    if (!destination) return
    
    const section = type // heroCards, topFree, etc.
    const items = Array.from(featuredData[section] || [])
    const [reorderedItem] = items.splice(source.index, 1)
    items.splice(destination.index, 0, reorderedItem)
    
    setFeaturedData(prev => ({
      ...prev,
      [section]: items
    }))
  }

  // Handle Auto-Fill
  const handleAutoFill = () => {
    if (!allApps || allApps.length === 0) {
      toast.error('No apps in database to import!');
      return;
    }
    
    // Sort all apps by installs and ratings
    const sortedByInstalls = [...allApps].sort((a, b) => (b.installCount || 0) - (a.installCount || 0));
    const freeApps = sortedByInstalls.filter(a => a.price === 0);
    const paidApps = sortedByInstalls.filter(a => a.price > 0);
    const highestRated = [...allApps].sort((a, b) => (b.averageRating || b.rating || 0) - (a.averageRating || a.rating || 0));

    setFeaturedData({
      iosHeroCards: sortedByInstalls.filter(a => !(a.minOS||'').toLowerCase().includes('android') || (a.minOS||'').toLowerCase().includes('ios')).slice(0, 5).map(a => ({ id: a.id, name: a.name, iconUrl: a.iconUrl, category: a.category, type: 'iosHeroCards' })),
      androidHeroCards: sortedByInstalls.filter(a => (a.minOS||'').toLowerCase().includes('android') && !(a.minOS||'').toLowerCase().includes('ios')).slice(0, 5).map(a => ({ id: a.id, name: a.name, iconUrl: a.iconUrl, category: a.category, type: 'androidHeroCards' })),
      topFree: freeApps.slice(0, 10).map(a => ({ id: a.id, name: a.name, iconUrl: a.iconUrl, category: a.category, type: 'topFree' })),
      topPaid: paidApps.slice(0, 10).map(a => ({ id: a.id, name: a.name, iconUrl: a.iconUrl, category: a.category, type: 'topPaid' })),
      editorsChoice: highestRated.slice(0, 8).map(a => ({ id: a.id, name: a.name, iconUrl: a.iconUrl, category: a.category, type: 'editorsChoice' }))
    });
    
    toast.success('Successfully imported real-time app data!');
  }

  // Handle Save
  const handleSave = () => {
    saveFeaturedMutation.mutate({
      heroCards: [...(featuredData.iosHeroCards || []), ...(featuredData.androidHeroCards || [])],
      topFree: featuredData.topFree,
      topPaid: featuredData.topPaid,
      editorsChoice: featuredData.editorsChoice
    })
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 text-white">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 sticky top-0 bg-[#000000]/80 backdrop-blur-xl z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* Tab Switcher */}
          <div className="bg-[#1C1C1E] rounded-full p-1 flex">
            <button
              onClick={() => { setActiveTab('featured'); navigate('/admin/featured'); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === 'featured' ? 'bg-[#2C2C2E] text-white shadow' : 'text-textSecondary hover:text-white'}`}
            >
              ⭐ Featured Apps
            </button>
            <button
              onClick={() => { setActiveTab('updates'); navigate('/admin/apps/updates'); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${activeTab === 'updates' ? 'bg-[#2C2C2E] text-white shadow' : 'text-textSecondary hover:text-white'}`}
            >
              🔄 App Updates
              <span className="bg-[#FF9F0A]/20 text-[#FF9F0A] text-xs px-2 py-0.5 rounded-full">3</span>
            </button>
          </div>
        </div>
        
        {activeTab === 'featured' && (
          <div className="flex items-center gap-3">
            <button 
              onClick={handleAutoFill}
              className="px-4 py-2 rounded-full bg-[#1C1C1E] border border-white/10 text-white font-medium hover:bg-white/10 flex items-center gap-2 transition-colors"
            >
              <Zap className="w-4 h-4 text-[#0A84FF]" />
              Auto-Fill Data
            </button>
            <button 
              onClick={handleSave}
              disabled={saveFeaturedMutation.isPending}
              className="px-6 py-2 rounded-full bg-[#007AFF] text-white font-medium hover:bg-[#007AFF]/90 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {saveFeaturedMutation.isPending ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save className="w-4 h-4" />}
              Save Layout
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'featured' ? (
          <motion.div key="featured" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
            
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* SECTION: iOS Hero Cards */}
                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">iOS Hero Banners</h2>
                      <p className="text-textSecondary text-sm">Displayed on iOS devices.</p>
                    </div>
                    <span className="text-textSecondary text-sm">{featuredData.iosHeroCards.length}/5</span>
                  </div>

                  <Droppable droppableId="iosHeroCards" type="iosHeroCards">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {featuredData.iosHeroCards.map((item, index) => {
                          const itemId = item.id || item.appId || String(index);
                          return (
                          <Draggable key={`ios-${itemId}`} draggableId={`ios-${itemId}`} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-black/50 border border-white/10 rounded-xl p-4 flex items-center justify-between group ${snapshot.isDragging ? 'shadow-2xl border-[#007AFF]' : ''}`}
                              >
                                <div className="flex items-center gap-4">
                                  <div {...provided.dragHandleProps} className="text-white/20 hover:text-white cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {item.iconUrl && <img src={item.iconUrl} className="w-8 h-8 rounded-lg object-cover" />}
                                    <div>
                                      <h3 className="font-semibold text-white">{item.name || item.label || 'App'}</h3>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => {
                                      setHeroEditForm({...item, targetSection: 'iosHeroCards'})
                                      setEditingHeroIndex(index)
                                    }}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#007AFF]/20 hover:text-[#007AFF] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const n = [...featuredData.iosHeroCards];
                                      n.splice(index, 1);
                                      setFeaturedData(p => ({...p, iosHeroCards: n}))
                                    }}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FF453A]/20 hover:text-[#FF453A] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                          )}
                        )}
                        {provided.placeholder}
                        
                        {featuredData.iosHeroCards.length < 5 && (
                          <button 
                            onClick={() => { setAddCategoryTarget('iosHeroCards'); setIsAddModalOpen(true) }}
                            className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-textSecondary hover:text-white hover:border-white/30 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            Add iOS Hero
                          </button>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* SECTION: Android Hero Cards */}
                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-white">Android Hero Banners</h2>
                      <p className="text-textSecondary text-sm">Displayed on Android devices.</p>
                    </div>
                    <span className="text-textSecondary text-sm">{featuredData.androidHeroCards.length}/5</span>
                  </div>

                  <Droppable droppableId="androidHeroCards" type="androidHeroCards">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                          {featuredData.androidHeroCards.map((item, index) => {
                          const itemId = item.id || item.appId || String(index);
                          return (
                          <Draggable key={`and-${itemId}`} draggableId={`and-${itemId}`} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={`bg-black/50 border border-white/10 rounded-xl p-4 flex items-center justify-between group ${snapshot.isDragging ? 'shadow-2xl border-[#30D158]' : ''}`}
                              >
                                <div className="flex items-center gap-4">
                                  <div {...provided.dragHandleProps} className="text-white/20 hover:text-white cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-5 h-5" />
                                  </div>
                                  <div className="flex items-center gap-3">
                                    {item.iconUrl && <img src={item.iconUrl} className="w-8 h-8 rounded-lg object-cover" />}
                                    <div>
                                      <h3 className="font-semibold text-white">{item.name || item.label || 'App'}</h3>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => {
                                      setHeroEditForm({...item, targetSection: 'androidHeroCards'})
                                      setEditingHeroIndex(index)
                                    }}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#30D158]/20 hover:text-[#30D158] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const n = [...featuredData.androidHeroCards];
                                      n.splice(index, 1);
                                      setFeaturedData(p => ({...p, androidHeroCards: n}))
                                    }}
                                    className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#FF453A]/20 hover:text-[#FF453A] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </Draggable>
                          )}
                        )}
                        {provided.placeholder}
                        
                        {featuredData.androidHeroCards.length < 5 && (
                          <button 
                            onClick={() => { setAddCategoryTarget('androidHeroCards'); setIsAddModalOpen(true) }}
                            className="w-full py-4 border-2 border-dashed border-white/10 rounded-xl text-textSecondary hover:text-white hover:border-white/30 hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                          >
                            <Plus className="w-5 h-5" />
                            Add Android Hero
                          </button>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>

              {/* Add Top Free and Top Paid here similarly */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Top Free */}
                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-6">Top Free Apps</h2>
                  <Droppable droppableId="topFree" type="topFree">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {featuredData.topFree.map((item, index) => {
                          const itemId = item.id || item.appId || String(index);
                          return (
                          <Draggable key={itemId} draggableId={itemId} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps} className="text-white/20 hover:text-white"><GripVertical className="w-4 h-4" /></div>
                                  <div className="text-textSecondary font-bold text-sm w-4">{index + 1}</div>
                                  {item.iconUrl && <img src={item.iconUrl} className="w-6 h-6 rounded-md object-cover" />}
                                  <div className="font-medium text-white text-sm">{item.name}</div>
                                </div>
                                <button onClick={() => {
                                  const n = [...featuredData.topFree];
                                  n.splice(index, 1);
                                  setFeaturedData(p => ({...p, topFree: n}))
                                }} className="w-6 h-6 rounded-full bg-white/5 hover:bg-[#FF453A]/20 hover:text-[#FF453A] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </Draggable>
                          )
                        })}
                        {provided.placeholder}
                        <button onClick={() => { setAddCategoryTarget('topFree'); setIsAddModalOpen(true) }} className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-textSecondary text-sm hover:text-white hover:bg-white/5">Add App</button>
                      </div>
                    )}
                  </Droppable>
                </div>

                {/* Top Paid */}
                <div className="bg-[#1C1C1E] border border-white/5 rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-6">Top Paid Apps</h2>
                  <Droppable droppableId="topPaid" type="topPaid">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {featuredData.topPaid.map((item, index) => {
                          const itemId = item.id || item.appId || String(index);
                          return (
                          <Draggable key={itemId} draggableId={itemId} index={index}>
                            {(provided) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                  <div {...provided.dragHandleProps} className="text-white/20 hover:text-white"><GripVertical className="w-4 h-4" /></div>
                                  <div className="text-textSecondary font-bold text-sm w-4">{index + 1}</div>
                                  {item.iconUrl && <img src={item.iconUrl} className="w-6 h-6 rounded-md object-cover" />}
                                  <div className="font-medium text-white text-sm">{item.name}</div>
                                </div>
                                <button onClick={() => {
                                  const n = [...featuredData.topPaid];
                                  n.splice(index, 1);
                                  setFeaturedData(p => ({...p, topPaid: n}))
                                }} className="w-6 h-6 rounded-full bg-white/5 hover:bg-[#FF453A]/20 hover:text-[#FF453A] flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </Draggable>
                          )
                        })}
                        {provided.placeholder}
                        <button onClick={() => { setAddCategoryTarget('topPaid'); setIsAddModalOpen(true) }} className="w-full py-3 border-2 border-dashed border-white/10 rounded-xl text-textSecondary text-sm hover:text-white hover:bg-white/5">Add App</button>
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            </DragDropContext>
            
          </motion.div>
        ) : (
          <motion.div key="updates" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
            
            {/* Updates Tab Filters */}
            <div className="flex gap-2 mb-6">
              {['All', 'Pending', 'Pushed', 'Scheduled'].map(t => (
                <button key={t} onClick={() => setUpdateTab(t)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${updateTab === t ? 'bg-[#007AFF]/20 border-[#007AFF] text-[#007AFF]' : 'bg-[#1C1C1E] border-white/5 text-textSecondary hover:text-white hover:border-white/20'}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Updates List */}
            <div className="space-y-4">
              {filteredUpdates.length === 0 ? (
                <div className="text-center py-12 text-textSecondary">
                  No apps found in this category.
                </div>
              ) : (
                filteredUpdates.slice(0, 10).map(app => (
                  <UpdateCard key={app.id} app={app} />
                ))
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Add App Modal ── */}
      <AnimatePresence>
        {isAddModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1C1C1E] border border-white/10 w-full max-w-md rounded-2xl flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-lg">Add to {addCategoryTarget === 'iosHeroCards' ? 'iOS Hero' : addCategoryTarget === 'androidHeroCards' ? 'Android Hero' : addCategoryTarget === 'topFree' ? 'Top Free' : 'Top Paid'}</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                  <input 
                    autoFocus
                    type="text"
                    placeholder="Search apps..."
                    value={searchApp}
                    onChange={(e) => setSearchApp(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white outline-none focus:border-[#007AFF]"
                  />
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto max-h-[40vh] p-2 custom-scrollbar">
                {allApps
                  .filter(a => a.status === 'approved')
                  .filter(a => {
                    if (addCategoryTarget === 'iosHeroCards') return !(a.minOS||'').toLowerCase().includes('android') || (a.minOS||'').toLowerCase().includes('ios');
                    if (addCategoryTarget === 'androidHeroCards') return (a.minOS||'').toLowerCase().includes('android');
                    return true;
                  })
                  .filter(a => a.name.toLowerCase().includes(searchApp.toLowerCase()))
                  .map(app => (
                    <button
                      key={app.id}
                      onClick={() => {
                        setFeaturedData(prev => {
                          const list = prev[addCategoryTarget] || []
                          if (list.find(x => x.id === app.id)) return prev; // prevent duplicates
                          return {
                            ...prev,
                            [addCategoryTarget]: [...list, { id: app.id, name: app.name, iconUrl: app.iconUrl }]
                          }
                        })
                        setIsAddModalOpen(false)
                        setSearchApp('')
                      }}
                      className="w-full flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl text-left transition-colors"
                    >
                      <img src={app.iconUrl} className="w-10 h-10 rounded-lg object-cover bg-black" />
                      <div>
                        <div className="font-medium text-white">{app.name}</div>
                        <div className="text-xs text-textSecondary">{app.developer}</div>
                      </div>
                    </button>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit Hero Modal ── */}
      <AnimatePresence>
        {editingHeroIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#1C1C1E] border border-white/10 w-full max-w-lg rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-lg">Edit Hero Card: {heroEditForm.name}</h3>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => {
                      const ogApp = allApps.find(a => a.id === heroEditForm.id);
                      if (ogApp) {
                        setHeroEditForm(p => ({
                          ...p,
                          bgUrl: ogApp.bannerUrl || p.bgUrl,
                          customIconUrl: ogApp.iconUrl || p.customIconUrl
                        }))
                        toast.success('Imported app defaults!');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#0A84FF]/20 text-[#0A84FF] text-xs font-semibold hover:bg-[#0A84FF]/30 transition-colors"
                  >
                    Import App Defaults
                  </button>
                  <button onClick={() => setEditingHeroIndex(null)} className="p-1 hover:bg-white/10 rounded-full">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar">
                
                {/* Background URL */}
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Background Image URL (BG)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                      <input 
                        type="text" 
                        value={heroEditForm.bgUrl || ''} 
                        onChange={e => setHeroEditForm(p => ({...p, bgUrl: e.target.value}))}
                        placeholder="https://..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-[#007AFF] outline-none"
                      />
                    </div>
                    <label className="flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 cursor-pointer transition-colors shrink-0">
                      <Upload className="w-4 h-4 mr-2 text-[#0A84FF]" />
                      <span className="text-sm font-medium">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleHeroBgUpload} />
                    </label>
                  </div>
                </div>

                {/* Custom Icon URL */}
                <div>
                  <label className="block text-sm font-medium text-textSecondary mb-2">Custom Icon URL (Optional)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Link className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
                      <input 
                        type="text" 
                        value={heroEditForm.customIconUrl || ''} 
                        onChange={e => setHeroEditForm(p => ({...p, customIconUrl: e.target.value}))}
                        placeholder="https://..."
                        className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:border-[#007AFF] outline-none"
                      />
                    </div>
                    <label className="flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl px-4 cursor-pointer transition-colors shrink-0">
                      <Upload className="w-4 h-4 mr-2 text-[#0A84FF]" />
                      <span className="text-sm font-medium">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleHeroIconUpload} />
                    </label>
                  </div>
                </div>



                {/* Animation Code */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-textSecondary">Animation Code (Copy BOTH Class & Keyframes)</label>
                    <a href="https://animista.net/" target="_blank" rel="noopener noreferrer" className="text-xs text-[#0A84FF] hover:underline flex items-center gap-1">
                      Get Animista Codes <Link className="w-3 h-3" />
                    </a>
                  </div>
                  <textarea 
                    value={heroEditForm.animationCode || ''} 
                    onChange={e => setHeroEditForm(p => ({...p, animationCode: e.target.value}))}
                    placeholder="Paste both the .class { ... } AND @keyframes { ... } here..."
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[#007AFF] outline-none min-h-[120px] font-mono"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-white/10 bg-black/20 flex justify-end gap-3">
                <button onClick={() => setEditingHeroIndex(null)} className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors">
                  Cancel
                </button>
                <button onClick={() => saveHeroEdit(heroEditForm.targetSection)} className="px-4 py-2 rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/90 text-white font-medium transition-colors shadow-lg shadow-[#007AFF]/20">
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
