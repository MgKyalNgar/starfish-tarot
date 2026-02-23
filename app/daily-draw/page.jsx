// app/daily-draw/page.jsx
"use client";

import { useState } from 'react';
import TarotCard from '@/components/TarotCard';
import ReadingBox from '@/components/ReadingBox';
import { drawAndInterpretCard } from '@/actions/tarotActions';

export default function DailyDrawPage() {
  const [drawnCard, setDrawnCard] = useState(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [aiReading, setAiReading] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDrawCard = async () => {
    setIsLoading(true);
    setDrawnCard(null);
    setIsCardFlipped(false);
    setAiReading('');
    setError('');

    // Server Action ကို async function ထဲကနေ တိုက်ရိုက်ခေါ်ဆိုပါ
    const result = await drawAndInterpretCard();

    if (result.error) {
      setError(result.error);
    } else {
      setDrawnCard(result.card);
      setAiReading(result.reading);
      setTimeout(() => setIsCardFlipped(true), 100);
    }

    setIsLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-8 pt-24">
      <h1 className="text-4xl font-bold text-indigo-300 mb-4">Your Daily Guidance</h1>
      
      <div className="h-96 flex items-center justify-center">
        {isLoading ? (
          <p className="text-2xl animate-pulse">Consulting the cosmos...</p>
        ) : drawnCard ? (
          <div className="w-64">
            <TarotCard key={drawnCard.id} card={drawnCard} isFlipped={isCardFlipped} />
          </div>
        ) : (
          <button
            onClick={handleDrawCard}
            disabled={isLoading}
            className="px-10 py-5 bg-purple-700 text-white font-bold text-xl rounded-full shadow-lg hover:bg-purple-600 transition-transform hover:scale-105 duration-300 disabled:bg-gray-500 disabled:scale-100"
          >
            Draw Your Card
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <ReadingBox reading={aiReading} isLoading={false} />
    </main>
  );
}
