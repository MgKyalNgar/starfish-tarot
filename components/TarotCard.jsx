// components/TarotCard.jsx
"use client";

import { motion } from 'framer-motion';

export default function TarotCard({ card, isFlipped, onFlip }) {
  return (
    <div
      className="w-full aspect-[2/3.5] cursor-pointer"
      onClick={onFlip}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Card Back Side */}
        <div
          className="absolute w-full h-full rounded-lg shadow-xl"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src="/Tarot Card/tarot-card-back.png"
            alt="Tarot Card Back"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Card Front Side */}
        <div
          className="absolute w-full h-full bg-white rounded-lg shadow-xl"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover rounded-lg" />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center p-1">
            <p className="font-bold text-sm">{card.name}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
