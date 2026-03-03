/*
 * LevelUpModal — Full-screen dramatic level up notification
 * Design: Abyss Interface — electric burst with system message
 */
import { motion, AnimatePresence } from 'framer-motion';
import { ASSETS } from '@/lib/assets';

interface LevelUpModalProps {
  show: boolean;
  level: number;
  onClose: () => void;
}

export default function LevelUpModal({ show, level, onClose }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="text-center px-8"
            onClick={e => e.stopPropagation()}
          >
            <motion.img
              src={ASSETS.levelUp}
              alt="Level Up"
              className="w-48 h-48 mx-auto mb-4 object-contain"
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="font-heading text-sm tracking-[0.3em] text-cyan-400/70 uppercase mb-2">
                System Message
              </p>
              <h2 className="font-heading text-5xl font-bold text-cyan-400 text-glow-cyan mb-2">
                LEVEL {level}
              </h2>
              <p className="text-gray-400 text-sm mb-6">
                +3 stat points have been awarded
              </p>
              <button
                onClick={onClose}
                className="px-8 py-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-heading tracking-wider text-sm hover:bg-cyan-500/30 transition-colors"
              >
                ACKNOWLEDGE
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
