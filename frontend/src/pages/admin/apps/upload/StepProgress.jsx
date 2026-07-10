import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

export default function StepProgress({ currentStep }) {
  const steps = [
    'Basic Info',
    'Media',
    'Category & Details',
    'Pricing',
    'Review'
  ]

  return (
    <div className="w-full py-4 border-b border-white/5 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-medium">Step {currentStep} of {steps.length}</h2>
        <span className="text-sm text-textSecondary">{steps[currentStep - 1]}</span>
      </div>
      
      <div className="flex gap-2 w-full h-1.5">
        {steps.map((_, index) => {
          const stepNum = index + 1
          let bgColor = 'bg-white/10'
          if (stepNum < currentStep) bgColor = 'bg-[#007AFF]' // Done
          else if (stepNum === currentStep) bgColor = 'bg-[#5AC8FA]' // Active

          return (
            <div key={index} className="flex-1 relative rounded-full overflow-hidden bg-white/10">
              <motion.div
                initial={false}
                animate={{ width: stepNum <= currentStep ? '100%' : '0%' }}
                className={`absolute inset-0 rounded-full ${stepNum === currentStep ? 'bg-[#5AC8FA]' : 'bg-[#007AFF]'}`}
                transition={{ duration: 0.4 }}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
