import { motion } from 'framer-motion'

export default function ToggleSwitch({ checked, onChange, label, subLabel }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-black/20 border border-white/5 transition-colors hover:bg-black/30">
      <div>
        <p className="font-medium text-white">{label}</p>
        {subLabel && <p className="text-xs text-textSecondary mt-0.5">{subLabel}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
          checked ? 'bg-[#30D158]' : 'bg-white/10'
        }`}
      >
        <motion.span
          layout
          initial={false}
          animate={{ x: checked ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="inline-block h-7 w-7 rounded-full bg-white shadow ring-0"
        />
      </button>
    </div>
  )
}
