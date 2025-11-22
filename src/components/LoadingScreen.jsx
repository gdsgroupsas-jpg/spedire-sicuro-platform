import { motion } from 'framer-motion'
import { Package } from 'lucide-react'

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl gradient-bg mb-6"
        >
          <Package className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-2xl font-display font-bold mb-2"
        >
          <span className="gradient-text">Spedire</span>
          <span className="text-gray-700 dark:text-gray-200"> Sicuro</span>
        </motion.h2>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full max-w-xs mx-auto"
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-gray-500 dark:text-gray-400"
        >
          Caricamento in corso...
        </motion.p>
      </div>
    </div>
  )
}

export default LoadingScreen
