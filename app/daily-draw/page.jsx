// app/daily-draw/page.jsx
"use client";

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser'; // Using browser client
import TarotCard from '@/components/TarotCard';
import ReadingBox from '@/components/ReadingBox';

export default function DailyDrawPage() {
  const [drawnCard, setDrawnCard] = useState(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [aiReading, setAiReading] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const supabase = createClient();

  // Function to get a random card
  const getRandomCard = async () => {
      const { data: countData, error: countError } = await supabase
          .from('TarotCard')
          .select('id', { count: 'exact', head: true });

      if (countError) throw countError;
      
      const cardCount = countData.length;
      const randomId = Math.floor(Math.random() * cardCount) + 1;

      const { data: cardData, error: cardError } = await supabase
          .from('TarotCard')
          .select('*')
          .eq('id', randomId)
          .single();

      if (cardError) throw cardError;
      return cardData;
  };
  
  const handleDrawCard = async () => {
    setIsLoading(true);
    setDrawnCard(null);
    setIsCardFlipped(false);
    setAiReading('');
    setError('');

    try {
      // 1. Get a random card from Supabase
      const card = await getRandomCard();
      setDrawnCard(card);

      // 2. Flip the card
      setTimeout(() => setIsCardFlipped(true), 100);

      // 3. Call our API to get Gemini's reading
      const response = await fetch('/api/generate-reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardName: card.name, cardMeaning: card.meaning }),
      });

      if (!response.ok) {
        throw new Error('Failed to get a reading from the stars.');
      }

      const { reading } = await response.json();
      setAiReading(reading);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-8 pt-24">
      <h1 className="text-4xl font-bold text-indigo-300 mb-4">Your Daily Guidance</h1>
      <p className="text-lg mb-8">Click the button to draw your card for today.</p>

      <div className="h-96 flex items-center justify-center">
        {drawnCard ? (
          <div className="w-64">
            <TarotCard card={drawnCard} isFlipped={isCardFlipped} />
          </div>
        ) : (
          <button
            onClick={handleDrawCard}
            disabled={isLoading}
            className="px-10 py-5 bg-purple-700 text-white font-bold text-xl rounded-full shadow-lg hover:bg-purple-600 transition-transform hover:scale-105 duration-300 disabled:bg-gray-500 disabled:scale-100"
          >
            {isLoading ? "Drawing..." : "Draw Your Card"}
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      <ReadingBox reading={aiReading} isLoading={isLoading && drawnCard} />
    </main>
  );
}
