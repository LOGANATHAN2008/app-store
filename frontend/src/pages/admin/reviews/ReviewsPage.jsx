import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ShieldAlert, CheckCircle, Trash2, Search, MessageSquare, MoreVertical } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reviewsApi } from '../../../services/api'
import { toast } from 'react-hot-toast'
import { formatDistanceToNow } from 'date-fns'

export default function ReviewsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  
  const isFlaggedTab = location.pathname.includes('flagged')
  const [search, setSearch] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null)

  const { data = { reviews: [], total: 0 }, isLoading } = useQuery({
    queryKey: ['admin-reviews', isFlaggedTab ? 'flagged' : 'all'],
    queryFn: () => reviewsApi.getAll({ status: isFlaggedTab ? 'flagged' : 'all' }).then(res => res.data)
  })

  // Mutations
  const unflagReview = useMutation({
    mutationFn: (id) => reviewsApi.unflag(id),
    onSuccess: () => {
      toast.success('Review approved and unflagged')
      queryClient.invalidateQueries(['admin-reviews'])
      setActiveDropdown(null)
    }
  })

  const deleteReview = useMutation({
    mutationFn: (id) => reviewsApi.delete(id),
    onSuccess: () => {
      toast.success('Review permanently deleted')
      queryClient.invalidateQueries(['admin-reviews'])
      setActiveDropdown(null)
    }
  })

  const filteredReviews = data.reviews.filter(r => {
    const reviewText = r.text || r.body || ''
    const appName = r.appName || ''
    return reviewText.toLowerCase().includes(search.toLowerCase()) || 
           appName.toLowerCase().includes(search.toLowerCase())
  })

  const renderStars = (rating) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < rating ? 'fill-[#FF9F0A] text-[#FF9F0A]' : 'text-white/20'}`} />
    ))
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 text-white">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Reviews</h1>
          <p className="text-textSecondary text-sm mt-1">Monitor app feedback and moderate inappropriate content.</p>
        </div>
        
        {/* Tab Switcher & Search */}
        <div className="flex items-center gap-4">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-textSecondary" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reviews..." 
              className="w-full bg-[#1C1C1E] border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-[#0A84FF] transition-colors"
            />
          </div>
          <div className="bg-[#1C1C1E] border border-white/5 rounded-full p-1 flex shadow-lg">
            <button
              onClick={() => navigate('/admin/reviews')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${!isFlaggedTab ? 'bg-[#2C2C2E] text-white shadow' : 'text-textSecondary hover:text-white'}`}
            >
              <MessageSquare className="w-4 h-4" /> All Reviews
            </button>
            <button
              onClick={() => navigate('/admin/reviews/flagged')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${isFlaggedTab ? 'bg-[#FF453A]/20 text-[#FF453A] shadow' : 'text-textSecondary hover:text-white'}`}
            >
              <ShieldAlert className="w-4 h-4" /> Flagged
            </button>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-textSecondary animate-pulse">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-[#1C1C1E] rounded-3xl border border-white/5">
            <ShieldAlert className="w-16 h-16 mx-auto mb-4 text-textSecondary opacity-20" />
            <p className="text-textSecondary">No reviews found.</p>
          </div>
        ) : (
          filteredReviews.map(review => (
            <div key={review.id} className={`bg-[#1C1C1E] rounded-2xl p-6 border transition-colors ${review.isFlagged ? 'border-[#FF453A]/30 bg-[#FF453A]/5' : 'border-white/5 hover:bg-white/[0.02]'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-lg">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{review.userName}</h3>
                    <p className="text-sm text-textSecondary">on {review.appName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {renderStars(review.rating)}
                  </div>
                  <span className="text-xs text-textSecondary">
                    {formatDistanceToNow(new Date(review.createdAt))} ago
                  </span>
                  
                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setActiveDropdown(activeDropdown === review.id ? null : review.id)}
                      className="p-1.5 hover:bg-white/10 rounded-full transition-colors text-textSecondary hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === review.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute right-0 top-8 w-48 bg-[#2C2C2E] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20 origin-top-right text-left"
                        >
                          <div className="p-1">
                            {review.isFlagged && (
                              <button onClick={() => unflagReview.mutate(review.id)} className="w-full text-left px-3 py-2 text-sm text-[#30D158] hover:bg-[#30D158]/10 rounded-lg transition-colors flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Approve & Unflag
                              </button>
                            )}
                            <button onClick={() => window.confirm('Permanently delete this review?') && deleteReview.mutate(review.id)} className="w-full text-left px-3 py-2 text-sm text-[#FF453A] hover:bg-[#FF453A]/10 rounded-lg transition-colors flex items-center gap-2">
                              <Trash2 className="w-4 h-4" /> Delete Review
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <p className="text-white/90 leading-relaxed text-sm">
                {review.text || review.body || 'No review text provided.'}
              </p>
              {review.isFlagged && (
                <div className="mt-4 bg-[#FF453A]/10 border border-[#FF453A]/20 text-[#FF453A] text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" />
                  Flagged by automated moderation filters for inappropriate content.
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
