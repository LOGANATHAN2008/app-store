import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './glassTabBar.css'

/* ── Framer Motion variants ──────────────────────────────────────── */
const iconVariants = {
  inactive: {
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 380, damping: 28 },
  },
  active: {
    scale: 1.12,
    y: -3,
    transition: { type: 'spring', stiffness: 520, damping: 26, velocity: 10 },
  },
}

const tapVariant = {
  scale: 0.84,
  transition: { duration: 0.08, ease: 'easeOut' },
}

/**
 * Liquid Glass Tab Bar — iPhone 17 Pro Max style
 *
 * @param {{
 *   tabs: Array<{ id: string, label: string, icon: React.ComponentType<any> }>,
 *   activeTab: string,
 *   onChange: (id: string) => void,
 *   background?: 'dark' | 'light' | 'auto',
 *   iconSize?: number,
 * }} props
 */
export default function GlassTabBar({
  tabs,
  activeTab,
  onChange,
  background = 'dark',
  iconSize = 22,
  splitLastTab = false,
  isHidden = false,
}) {
  const prevActiveRef = useRef(activeTab)

  const handleChange = (id) => {
    if (id === activeTab) return
    prevActiveRef.current = activeTab
    onChange(id)
  }

  const isLight = background === 'light'

  const mainTabs = splitLastTab ? tabs.slice(0, -1) : tabs
  const lastTab = splitLastTab ? tabs[tabs.length - 1] : null

  // Gesture handling for dragging across tabs
  const isDraggingRef = useRef(false)

  const handlePointerDown = () => {
    isDraggingRef.current = true
  }

  const handlePointerUp = () => {
    isDraggingRef.current = false
  }

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current && !e.touches) return
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    
    if (clientX && clientY) {
      const el = document.elementFromPoint(clientX, clientY)
      if (el) {
        const tabEl = el.closest('[data-tab-id]')
        if (tabEl) {
          const tabId = tabEl.getAttribute('data-tab-id')
          if (tabId && tabId !== activeTab) {
            handleChange(tabId)
          }
        }
      }
    }
  }

  return (
    <div 
      className="gtb-wrapper transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]" 
      role="navigation" 
      aria-label="App sections"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerMove={handlePointerMove}
      onTouchMove={handlePointerMove}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      style={{ 
        touchAction: 'none',
        opacity: isHidden ? 0 : 1,
        bottom: isHidden ? '-80px' : '16px',
        pointerEvents: isHidden ? 'none' : 'auto'
      }}
    >
      <div className="gtb-split-container">
        {/* ── Main Glass bar ── */}
        <div className={`gtb-bar gtb-shimmer${isLight ? ' gtb-bar--light' : ''} flex-1 overflow-visible`}>
          {mainTabs.map((tab) => {
            const Icon    = tab.icon
            const isActive = tab.id === activeTab

            return (
              <motion.button
                key={tab.id}
                data-tab-id={tab.id}
                className="gtb-tab relative z-10"
                onClick={() => handleChange(tab.id)}
                whileTap={tapVariant}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                role="tab"
                tabIndex={isActive ? 0 : -1}
              >
                {/* ── Active pill — shared layout ── */}
                {isActive && (
                  <motion.div
                    layoutId="gtb-active-pill"
                    className="gtb-pill-static shadow-[0_8px_32px_rgba(255,255,255,0.15)]"
                    style={{ 
                      borderRadius: 36,
                      top: -4,
                      bottom: -4,
                      width: 68,
                      marginLeft: -34,
                      border: '1px solid rgba(255, 255, 255, 0.45)',
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%)',
                      backdropFilter: 'blur(20px) saturate(200%)',
                      boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.7), inset 0 -2px 10px rgba(255,255,255,0.1)',
                      zIndex: -1
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 350,
                      damping: 24,
                      mass: 0.8,
                    }}
                  />
                )}

                {/* ── Icon ── */}
                <motion.div
                  className={`gtb-icon${isActive ? ' gtb-icon--active' : ''}`}
                  variants={iconVariants}
                  animate={isActive ? 'active' : 'inactive'}
                  aria-hidden="true"
                >
                  <Icon
                    size={iconSize}
                    strokeWidth={isActive ? 2.2 : 1.6}
                    absoluteStrokeWidth
                  />
                </motion.div>

                {/* ── Label ── */}
                <motion.span
                  className={`gtb-label${isActive ? ' gtb-label--active' : ''}`}
                  animate={{
                    opacity: isActive ? 1 : 0.65,
                    y: isActive ? 0 : 1,
                  }}
                  transition={{ duration: 0.18 }}
                >
                  {tab.label}
                </motion.span>
              </motion.button>
            )
          })}
        </div>

        {/* ── Separated Last Tab (Search) ── */}
        {splitLastTab && lastTab && (
          <div 
            className={`gtb-bar gtb-shimmer${isLight ? ' gtb-bar--light' : ''}`} 
            style={{ width: '60px', borderRadius: '30px', flexShrink: 0 }}
          >
            {(() => {
              const Icon = lastTab.icon
              const isActive = lastTab.id === activeTab
              return (
                <motion.button
                  key={lastTab.id}
                  data-tab-id={lastTab.id}
                  className="gtb-tab relative z-10"
                  onClick={() => handleChange(lastTab.id)}
                  whileTap={tapVariant}
                  aria-label={lastTab.label}
                  aria-current={isActive ? 'page' : undefined}
                  role="tab"
                  tabIndex={isActive ? 0 : -1}
                  style={{ width: '100%', borderRadius: '30px' }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="gtb-active-pill"
                      className="gtb-pill-static shadow-[0_8px_32px_rgba(255,255,255,0.15)]"
                      style={{ 
                        borderRadius: '30px',
                        top: -4,
                        bottom: -4,
                        width: 68,
                        marginLeft: -34,
                        border: '1px solid rgba(255, 255, 255, 0.45)',
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.05) 100%)',
                        backdropFilter: 'blur(20px) saturate(200%)',
                        boxShadow: 'inset 0 2px 10px rgba(255,255,255,0.7), inset 0 -2px 10px rgba(255,255,255,0.1)',
                        zIndex: -1
                      }}
                      transition={{ type: 'spring', stiffness: 350, damping: 24, mass: 0.8 }}
                    />
                  )}
                  <motion.div
                    className={`gtb-icon${isActive ? ' gtb-icon--active' : ''}`}
                    variants={iconVariants}
                    animate={isActive ? 'active' : 'inactive'}
                    aria-hidden="true"
                  >
                    <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} absoluteStrokeWidth />
                  </motion.div>
                </motion.button>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}
