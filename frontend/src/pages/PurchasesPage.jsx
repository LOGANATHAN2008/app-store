import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Receipt, ExternalLink, Download } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { paymentsApi, appsApi } from '../services/api'
import { useAuthStore } from '../store'
import PageLoader from '../components/ui/PageLoader'

export default function PurchasesPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const userId = user?.id || 'guest-123'

  const { data: purchaseHistory, isLoading } = useQuery({
    queryKey: ['purchases', userId],
    queryFn: () => paymentsApi.getUserHistory(userId)
  })

  const { data: appsData } = useQuery({
    queryKey: ['apps', 'all'],
    queryFn: () => appsApi.getAll({ limit: 1000 })
  })

  if (isLoading) return <PageLoader />

  const transactions = purchaseHistory?.history || []
  const apps = appsData?.apps || []

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="page-container pb-24 text-white"
      style={{ maxWidth: 760 }}
    >
      <div className="flex items-center justify-between py-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-0.5 text-[17px] font-medium"
          style={{ color: '#0A84FF' }}
        >
          <ChevronLeft size={22} strokeWidth={2.5} />
          Back
        </button>
        <button
          onClick={() => {
            logout()
            navigate('/')
          }}
          className="text-[15px] font-medium text-[#FF453A] hover:opacity-80"
        >
          Sign Out
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Purchase History</h1>
        <p className="text-[#8E8E93] text-[15px]">View and manage your app purchases.</p>
      </div>

      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Receipt size={48} className="text-[#48484A] mb-4" />
          <h2 className="text-xl font-bold mb-2">No Purchases Yet</h2>
          <p className="text-[#8E8E93] mb-6">When you buy paid apps, they will appear here.</p>
          <button onClick={() => navigate('/')} className="px-6 py-2 bg-[#0A84FF] rounded-full font-semibold">
            Explore Store
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.slice().reverse().map((tx) => {
            const app = apps.find((a) => a.id === tx.appId)
            return (
              <div
                key={tx.id}
                className="flex items-center gap-4 p-4 rounded-2xl bg-[#1C1C1E] border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                onClick={() => app && navigate(`/app/${app.id}`)}
              >
                {app ? (
                  <img src={app.iconUrl} alt={app.name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#2C2C2E] flex items-center justify-center text-xs text-[#8E8E93]">
                    N/A
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[16px] truncate">{app ? app.name : 'Unknown App'}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[13px] text-[#8E8E93]">{new Date(tx.createdAt).toLocaleDateString()}</span>
                    <span className="text-[#48484A]">•</span>
                    <span className={`text-[12px] font-medium px-2 py-0.5 rounded-sm ${
                      tx.status === 'paid' ? 'bg-[#30D158]/10 text-[#30D158]' : 'bg-[#FF9F0A]/10 text-[#FF9F0A]'
                    }`}>
                      {tx.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="block font-semibold text-[16px]">${Number(tx.amount).toFixed(2)}</span>
                  <span className="text-[12px] text-[#0A84FF] mt-1 flex items-center justify-end gap-1">
                    Receipt <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}
