/*
 * Page Transition — Sword slash / demon cut animation between pages
 * Design: A diagonal slash effect that sweeps across the screen when navigating
 */
import { motion, AnimatePresence } from 'framer-motion';
import { type ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
  locationKey: string;
}

export default function PageTransition({ children, locationKey }: PageTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={locationKey}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {/* Slash overlay */}
        <motion.div
          className="fixed inset-0 z-[100] pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          {/* Diagonal slash line */}
          <motion.div
            className="absolute inset-0"
            initial={{ clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' }}
            exit={{
              clipPath: [
                'polygon(0 0, 0 0, 0 100%, 0 100%)',
                'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
              ],
            }}
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-[#050510] to-[#050510]" />
            {/* Slash line */}
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: 'linear-gradient(135deg, transparent 48%, rgba(0, 212, 255, 0.6) 49%, rgba(0, 212, 255, 0.8) 50%, rgba(0, 212, 255, 0.6) 51%, transparent 52%)',
              }}
              initial={{ opacity: 0 }}
              exit={{ opacity: [0, 1, 0] }}
              transition={{ duration: 0.4, times: [0, 0.3, 1] }}
            />
          </motion.div>
        </motion.div>

        {/* Page content */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
