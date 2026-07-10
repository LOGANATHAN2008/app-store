import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import CountUp from 'react-countup'
import { motion } from 'framer-motion'
import { io } from 'socket.io-client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar } from 'recharts'
import { appsApi, usersApi } from '../../services/api'
import { useAuthStore } from '../../store'

const COLORS = ['#0A84FF', '#30D158', '#FF9F0A', '#FF453A', '#BF5AF2', '#5E5CE6', '#FF375F', '#32ADE6']

export default function Dashboard() {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [socketConnected, setSocketConnected] = useState(false)
  const [activities, setActivities] = useState([])

  const { data } = useQuery({
    queryKey: ['admin-apps'],
    queryFn: () => appsApi.getAll({ limit: 100 })
  })

  const { data: usersData } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: () => usersApi.getAll({})
  })

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001')
    socket.on('connect', () => setSocketConnected(true))
    socket.on('disconnect', () => setSocketConnected(false))
    
    socket.on('installCountUpdated', ({ appId, installCount }) => {
      setActivities(prev => [{ id: Date.now(), text: `App installed (ID: ${appId})`, time: 'Just now' }, ...prev].slice(0, 20))
      queryClient.invalidateQueries(['admin-apps'])
    })

    socket.on('app:created', (app) => {
      setActivities(prev => [{ id: Date.now(), text: `New app published: ${app.name}`, time: 'Just now' }, ...prev].slice(0, 20))
      queryClient.invalidateQueries(['admin-apps'])
    })

    socket.on('review:added', () => {
      setActivities(prev => [{ id: Date.now(), text: 'New user review posted', time: 'Just now' }, ...prev].slice(0, 20))
      queryClient.invalidateQueries(['admin-apps'])
    })

    return () => socket.disconnect()
  }, [queryClient])

  const apps = data?.apps || []
  const totalApps = apps.length
  const totalInstalls = apps.reduce((sum, app) => sum + (app.installCount || 0), 0)
  const avgRating = apps.length ? (apps.reduce((sum, app) => sum + (app.averageRating || 0), 0) / apps.length).toFixed(1) : 0
  const totalUsers = usersData?.total || 0

  // Real data for charts based on actual apps in database
  // Sort apps by creation date to show install distribution over time of app release
  const sortedApps = [...apps].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  
  const installData = sortedApps.map((app) => ({
    name: app.name.length > 10 ? app.name.substring(0, 10) + '...' : app.name,
    installs: app.installCount || 0
  }))

  const categoryCounts = apps.reduce((acc, app) => {
    acc[app.category] = (acc[app.category] || 0) + (app.installCount || 1)
    return acc
  }, {})
  
  const pieData = Object.keys(categoryCounts).map(key => ({
    name: key,
    value: categoryCounts[key]
  }))

  const topAppsData = [...apps].sort((a, b) => (b.installCount || 0) - (a.installCount || 0)).slice(0, 10).map(a => ({
    name: a.name.length > 15 ? a.name.substring(0, 15) + '...' : a.name,
    installs: a.installCount || 0
  }))

  const StatCard = ({ title, value, prefix = '', suffix = '', trend, colorClass, gradientClass, delay }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden relative"
    >
      <div className={`h-1 w-full bg-gradient-to-r ${gradientClass}`} />
      <div className="p-5">
        <p className="text-textSecondary text-sm font-medium mb-1">{title}</p>
        <div className="flex items-end gap-3">
          <h3 className="text-3xl font-bold text-white tracking-tight">
            {prefix}<CountUp end={value} decimals={value % 1 !== 0 ? 1 : 0} duration={2} separator="," />{suffix}
          </h3>
          <span className={`text-xs font-semibold pb-1 ${trend > 0 ? 'text-[#30D158]' : 'text-[#FF453A]'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% this week
          </span>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#0A84FF] to-[#BF5AF2] p-[2px]">
            <img src={user?.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="Avatar" referrerPolicy="no-referrer" className="w-full h-full rounded-full bg-black object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome, {user?.email?.split('@')[0] || 'Admin'}</h1>
            <div className="flex items-center gap-2 text-sm text-textSecondary mt-0.5">
              <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-semibold text-white/80">Super Administrator</span>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  {socketConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#30D158] opacity-75"></span>}
                  <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${socketConnected ? 'bg-[#30D158]' : 'bg-[#FF453A]'}`}></span>
                </span>
                <span>{socketConnected ? 'Live' : 'Disconnected'}</span>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-textSecondary bg-white/5 px-4 py-2 rounded-full border border-white/5 w-max">
          Last updated: just now
        </p>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Apps" value={totalApps} trend={12.5} gradientClass="from-[#0A84FF] to-[#5E5CE6]" delay={0.05} />
        <StatCard title="Total Installs" value={totalInstalls} trend={8.2} gradientClass="from-[#30D158] to-[#0A84FF]" delay={0.1} />
        <StatCard title="Total Users" value={totalUsers} trend={-2.4} gradientClass="from-[#BF5AF2] to-[#FF375F]" delay={0.15} />
        <StatCard title="Avg Rating" value={Number(avgRating)} suffix=" ★" trend={1.2} gradientClass="from-[#FF9F0A] to-[#FF453A]" delay={0.2} />
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Main Charts Area */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 h-[350px]">
            <h3 className="text-white font-semibold mb-6">Installs per Application</h3>
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart data={installData}>
                <defs>
                  <linearGradient id="colorInstalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val >= 1000 ? `${(val/1000).toFixed(0)}k` : val} />
                <Tooltip contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#ffffff20', borderRadius: '12px' }} itemStyle={{ color: '#0A84FF' }} />
                <Area type="monotone" dataKey="installs" stroke="#0A84FF" strokeWidth={3} fillOpacity={1} fill="url(#colorInstalls)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 h-[300px]">
              <h3 className="text-white font-semibold mb-4">Installs by Category</h3>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#ffffff20', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 h-[300px]">
              <h3 className="text-white font-semibold mb-4">Top Apps This Month</h3>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={topAppsData} layout="vertical" margin={{ left: 0, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#fff', fontSize: 12}} width={100} />
                  <Tooltip cursor={{fill: '#ffffff10'}} contentStyle={{ backgroundColor: '#1C1C1E', borderColor: '#ffffff20', borderRadius: '12px' }} />
                  <Bar dataKey="installs" fill="#BF5AF2" radius={[0, 4, 4, 0]} barSize={12}>
                    {topAppsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col h-[724px]">
          <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF453A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF453A]"></span>
            </span>
            Live Activity Feed
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
            {activities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-textSecondary opacity-50">
                <p>Waiting for live events...</p>
              </div>
            ) : (
              activities.map((act, i) => (
                <motion.div 
                  key={act.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                >
                  <div className="w-8 h-8 rounded-full bg-[#0A84FF]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[#0A84FF] text-xs font-bold">{act.text.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium leading-tight">{act.text}</p>
                    <p className="text-xs text-textSecondary mt-1">{act.time}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
