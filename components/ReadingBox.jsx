// components/ReadingBox.jsx
"use client";
import { motion } from 'framer-motion';

export default function ReadingBox({ reading, isLoading }) {
  if (isLoading) {
    return (
      <div className="w-full max-w-2xl p-6 mt-8 text-center">
        <p className="text-lg text-purple-300 animate-pulse">Gemini is interpreting your card...</p>
      </div>
    )
  }

  if (!reading) return null;

  return (
    <motion.div
      className="w-full max-w-2xl p-6 mt-8 bg-purple-950/50 backdrop-blur-md border border-purple-700/50 rounded-lg shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      <p className="text-lg leading-relaxed text-gray-200" style={{ whiteSpace: 'pre-wrap' }}>
        {reading}
      </p>
    </motion.div>
  );
}
