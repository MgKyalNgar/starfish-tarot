'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@supabase/ssr';
import { tarotCards } from '../utils/tarot-data';
import Login from './components/Login';
import { User } from '@supabase/supabase-js';

// Define the DailyTarot component
const DailyTarot = ({ user, isGuest, handleLogout, setGuestMode }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentCard, setCurrentCard] = useState(tarotCards[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    drawNewCard(false);
  }, []);

  const drawNewCard = (animate = true) => {
    const randomIndex = Math.floor(Math.random() * tarotCards.length);
    const newCard = tarotCards[randomIndex];
    
    if (animate) {
      setIsFlipped(false);
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentCard(newCard);
        setIsAnimating(false);
      }, 600);
    } else {
      setCurrentCard(newCard);
    }
  };

  const handleCardClick = () => {
    if (isAnimating) return;
    if (!isFlipped) {
      setIsFlipped(true);
    }
  };

  const handleReset = () => {
    if (isAnimating) return;
    setIsFlipped(false);
    setTimeout(() => {
      drawNewCard(false);
    }, 600);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="absolute top-4 right-4 z-20">
        {user && (
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-300">Welcome, {user.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full font-semibold text-sm"
            >
              Logout
            </button>
          </div>
        )}
        {isGuest && (
            <button
                onClick={() => setGuestMode(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-full font-semibold text-sm"
            >
                Go Back
            </button>
        )}
      </div>

      <div className="text-center mb-8 z-10">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500 mb-2 drop-shadow-lg">
          Daily Tarot Draw
        </h1>
        <p className="text-slate-300 text-sm md:text-base">
          သင့်အတွက် ယနေ့ကံကြမ္မာကို မေးမြန်းကြည့်ပါ
        </p>
      </div>

      <div className="relative w-64 h-96 md:w-80 md:h-[480px] perspective-1000 cursor-pointer group" onClick={handleCardClick}>
        <div
          className={`relative w-full h-full transition-all duration-700 transform-style-3d shadow-2xl ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          <div className="absolute w-full h-full backface-hidden rounded-xl overflow-hidden border-4 border-slate-700/50 shadow-inner">
            <Image
              src="/Tarot Card/tarot-card-back.jpg"
              alt="Tarot Card Back"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          <div className="absolute w-full h-full backface-hidden [transform:rotateY(180deg)] rounded-xl overflow-hidden border-4 border-amber-500/50 bg-slate-800">
            <Image
              src={currentCard.imageUrl}
              alt={currentCard.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent"></div>
            
            <div className="absolute bottom-4 left-0 right-0 text-center px-2">
              <h2 className="text-xl font-bold text-amber-100 drop-shadow-md">{currentCard.name}</h2>
              <span className="text-xs text-amber-300 uppercase tracking-widest">{currentCard.arcana} Arcana</span>
            </div>
          </div>
        </div>
      </div>

      <div className={`mt-8 max-w-md text-center transition-all duration-700 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl">
          <h3 className="text-lg font-semibold text-amber-400 mb-2">အဓိပ္ပာယ်ဖွင့်ဆိုချက်</h3>
          <p className="text-slate-200 leading-relaxed">
            {currentCard.meaning}
          </p>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleReset();
          }}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-full font-semibold shadow-lg shadow-purple-900/50 transition-all transform hover:scale-105 active:scale-95"
        >
          နောက်တစ်ကဒ် ထပ်ရွေးမယ်
        </button>
      </div>

      <style jsx global>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </main>
  );
};


export default function Page() {
  const [user, setUser] = useState<User | null>(null);
  const [isGuestMode, setGuestMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check for initial session
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    };

    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-purple-900 to-slate-900 text-white">
        Loading...
      </div>
    );
  }

  if (user || isGuestMode) {
    return <DailyTarot user={user} isGuest={isGuestMode} handleLogout={handleLogout} setGuestMode={setGuestMode} />;
  }

  return <Login setGuestMode={setGuestMode} />;
}