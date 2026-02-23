// app/daily-draw/page.jsx
"use client";

import { useState, useTransition } from 'react';
import TarotCard from '@/components/TarotCard';
import ReadingBox from '@/components/ReadingBox';
import { drawAndInterpretCard } from '@/actions/tarotActions'; // <-- Import our new Server Action

export default function DailyDrawPage() {
  const [drawnCard, setDrawnCard] = useState(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [aiReading, setAiReading] = useState('');
  const [error, setError] = useState('');
  
  // useTransition hook is the modern way to handle pending states for Server Actions
  const [isPending, startTransition] = useTransition();

  const handleDrawCard = () => {
    startTransition(async () => {
      setDrawnCard(null);
      setIsCardFlipped(false);
      setAiReading('');
      setError('');

      const { card, reading, error: actionError } = await drawAndInterpretCard();

      if (actionError) {
        setError(actionError);
        return;
      }

      setDrawnCard(card);
      setAiReading(reading);
      
      // Flip the card after it has been set in state
      setTimeout(() => setIsCardFlipped(true), 100);
    });
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-8 pt-24">
      <h1 className="text-4xl font-bold text-indigo-300 mb-4">Your Daily Guidance</h1>
      
      <div className="h-96 flex items-center justify-center">
        {!drawnCard && !isPending && (
           <button
            onClick={handleDrawCard}
            disabled={isPending}
            className="px-10 py-5 bg-purple-700 text-white font-bold text-xl rounded-full shadow-lg hover:bg-purple-600 transition-transform hover:scale-105 duration-300 disabled:bg-gray-500 disabled:scale-100"
          >
            Draw Your Card
          </button>
        )}

        {isPending && (
          <p className="text-2xl animate-pulse">Consulting the cosmos...</p>
        )}
        
        {drawnCard && (
          <div className="w-64">
            <TarotCard card={drawnCard} isFlipped={isCardFlipped} />
          </div>
        )}
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {/* ReadingBox doesn't need its own loading state anymore, it just depends on aiReading */}
      <ReadingBox reading={aiReading} isLoading={false} />
    </main>
  );
}
