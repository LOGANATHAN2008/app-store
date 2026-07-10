import { useState, useEffect } from 'react'

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const updateScroll = () => {
      const scrollPx = document.documentElement.scrollTop
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrolled = winHeightPx > 0 ? (scrollPx / winHeightPx) * 100 : 0
      setProgress(scrolled)
    }
    window.addEventListener('scroll', updateScroll)
    updateScroll()
    return () => window.removeEventListener('scroll', updateScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 w-full h-[3px] bg-black/20 z-50 print:hidden">
      <div 
        className="h-full bg-[#0A84FF] transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
