import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SplashScreen = ({ onDone }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-indigo-600 overflow-hidden"
        >
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
            className="text-center flex flex-col items-center relative z-10"
          >
            {/* Elegant App Icon Box */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 1, ease: "easeOut" }}
              className="w-20 h-20 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-3xl flex items-center justify-center mb-6 relative overflow-hidden"
            >
              <motion.div 
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0"
                animate={{ x: ['-150%', '150%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="text-white text-3xl font-black tracking-tighter">SB</span>
            </motion.div>

            <h1 className="text-white text-4xl md:text-5xl font-black tracking-tight mb-2">
              Shaxrixon Balon
            </h1>
            <p className="text-indigo-100 text-sm md:text-base font-semibold tracking-widest uppercase">
              CRM Tizimi
            </p>
          </motion.div>

          {/* Smooth Premium Loader */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-14 w-48 h-[3px] bg-indigo-800/30 rounded-full relative overflow-hidden z-10"
          >
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-0 bottom-0 w-1/2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
            />
          </motion.div>

          {/* NSD logo — bottom */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 flex flex-col items-center gap-3 z-10"
          >
            <img src="/circled_nsd_logo.png" alt="NSD Corporation" className="w-10 h-10 object-contain drop-shadow-md" />
            <p className="text-indigo-200 text-[10px] font-bold tracking-[0.2em] uppercase drop-shadow-sm">NSD Corporation</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
