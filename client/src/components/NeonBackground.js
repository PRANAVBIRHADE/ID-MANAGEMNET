import React from 'react';
import { motion } from 'framer-motion';

export default function NeonBackground() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      background: 'radial-gradient(circle at 60% 20%, #8f5cff44 0%, transparent 60%), radial-gradient(circle at 20% 80%, #ff4fd844 0%, transparent 60%), #1a1446',
    }}>
      {/* Blurred glowing spots */}
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 6 }} style={{
        position: 'absolute', left: '10%', top: '10%', width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, #8f5cff 0%, transparent 80%)', filter: 'blur(40px)', opacity: 0.7,
      }} />
      <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 7 }} style={{
        position: 'absolute', right: '15%', top: '60%', width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle, #ff4fd8 0%, transparent 80%)', filter: 'blur(40px)', opacity: 0.6,
      }} />
      {/* Animated geometric shapes */}
      <motion.svg width="120" height="120" style={{ position: 'absolute', left: '70%', top: '10%' }} animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 16, ease: 'linear' }}>
        <polygon points="60,10 110,110 10,110" fill="url(#grad1)" />
        <defs>
          <linearGradient id="grad1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff4fd8" />
            <stop offset="100%" stopColor="#8f5cff" />
          </linearGradient>
        </defs>
      </motion.svg>
      <motion.svg width="100" height="100" style={{ position: 'absolute', left: '20%', top: '70%' }} animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 8 }}>
        <rect x="20" y="20" width="60" height="60" rx="16" fill="url(#grad2)" />
        <defs>
          <linearGradient id="grad2" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8f5cff" />
            <stop offset="100%" stopColor="#ffb86c" />
          </linearGradient>
        </defs>
      </motion.svg>
      <motion.svg width="80" height="80" style={{ position: 'absolute', left: '50%', top: '50%' }} animate={{ x: [0, 30, 0] }} transition={{ repeat: Infinity, duration: 10 }}>
        <circle cx="40" cy="40" r="32" fill="url(#grad3)" />
        <defs>
          <linearGradient id="grad3" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4fd8ff" />
            <stop offset="100%" stopColor="#8f5cff" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
} 