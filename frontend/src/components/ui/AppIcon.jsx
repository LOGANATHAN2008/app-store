import { useState } from 'react'

/** @param {{ src: string, alt: string, className?: string, size?: number }} props */
export default function AppIcon({ src, alt, className = '', size = 60 }) {
  const [error, setError] = useState(false)

  const initials = alt ? alt.slice(0, 2).toUpperCase() : 'AP'
  const colors = ['#0A84FF', '#30D158', '#FF453A', '#BF5AF2', '#FF9F0A', '#32ADE6']
  const color = colors[initials.charCodeAt(0) % colors.length]

  return (
    <div
      className={`app-icon flex-shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, borderRadius: '22%' }}
    >
      {!error && src ? (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-full flex items-center justify-center text-white font-bold"
          style={{ background: color, fontSize: size * 0.3 }}
        >
          {initials}
        </div>
      )}
    </div>
  )
}
