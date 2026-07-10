import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      {/* Apple-style spinner */}
      <div className="relative w-9 h-9">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: 2.5,
              height: 7,
              background: '#fff',
              top: '50%',
              left: '50%',
              transformOrigin: '50% 150%',
              transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
              opacity: (i + 1) / 8,
            }}
            animate={{ opacity: [null, 1, (i + 1) / 8] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: -(8 - i) * (0.8 / 8),
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </div>
  )
}
