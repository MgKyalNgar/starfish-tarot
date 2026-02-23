"use client"; // <-- Animation နဲ့ state management က client-side မှာပဲဖြစ်လို့ ဒါမဖြစ်မနေထည့်ရပါမယ်

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TarotCard({ card }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);

  // Card ကို နှိပ်လိုက်ရင် isFlipped state ကို ပြောင်းပြန်လှန်မယ်
  const handleFlip = () => {
    // Card မှောက်ထားမှပဲ လှန်လို့ရအောင်လုပ်ထားမယ်
    if (!isFlipped) {
      setIsFlipped(true);
      // 0.8 စက္ကန့်ကြာမှ စာတန်းပေါ်အောင်လုပ်ထားမယ် (လှန်ပြီးမှ စာပေါ်စေချင်လို့)
      setTimeout(() => setShowMeaning(true), 800);
    }
  };

  return (
    <div
      className="w-full aspect-[2/3.5] cursor-pointer"
      onClick={handleFlip}
      style={{ perspective: '1000px' }} // 3D effect အတွက် perspective ထည့်ပေးထားတာ
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Card Back Side (မှောက်ထားတဲ့ဘက်) */}
        <div
          className="absolute w-full h-full rounded-lg shadow-xl" // background color နဲ့ flex properties တွေ မလိုတော့ဘူး
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img
            src="/Tarot Card/tarot-card-back.png"
            alt="Tarot Card Back"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        {/* Card Front Side (ပေါ်နေတဲ့ဘက်) */}
        <div
          className="absolute w-full h-full bg-white rounded-lg shadow-xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)', // ဒီဘက်ခြမ်းကို 180 ဒီဂရီ ကြိုလှည့်ထားတယ်
          }}
        >
          <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover rounded-lg" />
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center p-1">
            <p className="font-bold text-sm">{card.name}</p>
          </div>

          {/* Card Meaning Pop-up */}
          <AnimatePresence>
            {showMeaning && (
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-80 text-white p-4 overflow-y-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h3 className="text-lg font-bold mb-2">{card.name}</h3>
                <p className="text-sm">{card.meaning}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
