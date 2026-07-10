export const formatInstalls = (n) => {
  if (!n) return '0'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}

export const formatRating = (r) => (r || 0).toFixed(1)

export const formatPrice = (p) => {
  if (!p || p === 0) return 'Free'
  return `$${Number(p).toFixed(2)}`
}

export const formatDate = (d) => {
  if (!d) return ''
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d))
  } catch { return '' }
}

export const formatRelative = (d) => {
  if (!d) return ''
  const diff = Date.now() - new Date(d).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

export const starArray = (rating) => {
  return [1, 2, 3, 4, 5].map((i) => {
    if (rating >= i) return 'full'
    if (rating >= i - 0.5) return 'half'
    return 'empty'
  })
}

export const getCategoryColor = (cat) => {
  const map = {
    games: '#FF453A',
    productivity: '#0A84FF',
    social: '#BF5AF2',
    health: '#30D158',
    education: '#FF9F0A',
    finance: '#30D158',
    entertainment: '#FF453A',
    photography: '#BF5AF2',
  }
  return map[cat] || '#0A84FF'
}
