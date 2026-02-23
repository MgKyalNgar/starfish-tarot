// app/daily-draw/page.jsx
"use client";

import { useState } from 'react';
import TarotCard from '@/components/TarotCard';

export default function DailyDrawPage() {
  const [drawnCard, setDrawnCard] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDrawCard = async () => {
    setIsLoading(true);
    setDrawnCard(null);
    setError('');

    // TODO: Implement the actual logic here
    // 1. Check if user is allowed to draw (24h cooldown for real users)
    // 2. Fetch a random card from Supabase
    // 3. Set the card to state
    // 4. Update lastDrawDate for real users

    // For now, let's just simulate a delay
    setTimeout(() => {
      // This is a placeholder. We will replace this with real data.
      const fakeCard = {
        id: 0,
        name: "The Fool",
        imageUrl: "/Tarot Card/major/00.jpg",
        meaning: "This is a placeholder meaning. The real meaning will be fetched from the database."
      };
      setDrawnCard(fakeCard);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold text-indigo-300 mb-4">Your Daily Guidance</h1>
      <p className="text-lg mb-8">Click the button to draw your card for today.</p>

      <div className="h-96 flex items-center justify-center">
        {isLoading ? (
          <p className="text-2xl animate-pulse">Drawing a card for you...</p>
        ) : drawnCard ? (
          <div className="w-64">
            <TarotCard card={drawnCard} />
          </div>
        ) : (
          <button
            onClick={handleDrawCard}
            className="px-10 py-5 bg-purple-700 text-white font-bold text-xl rounded-full shadow-lg hover:bg-purple-600 transition-transform hover:scale-105 duration-300"
          >
            Draw Your Card
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </main>
  );
}
