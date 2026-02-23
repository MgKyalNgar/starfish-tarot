// app/daily-draw/page.jsx
"use client";

import { useFormState, useFormStatus } from 'react-dom'; 
import TarotCard from '@/components/TarotCard';
import ReadingBox from '@/components/ReadingBox';
import { drawAndInterpretCard } from '@/actions/tarotActions'; 
import { useEffect, useState } from 'react';

// A helper component to manage the button's pending state
function SubmitButton() {
  const { pending } = useFormStatus(); // This hook gets the form's pending state
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-10 py-5 bg-purple-700 text-white font-bold text-xl rounded-full shadow-lg hover:bg-purple-600 transition-transform hover:scale-105 duration-300 disabled:bg-gray-500 disabled:scale-100"
    >
      {pending ? "Consulting the cosmos..." : "Draw Your Card"}
    </button>
  );
}

const initialState = {
  card: null,
  reading: null,
  error: null,
};

export default function DailyDrawPage() {
  // useFormState hook manages the state based on the Server Action's return value
  const [state, formAction] = useFormState(drawAndInterpretCard, initialState);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  useEffect(() => {
    // When a new card is drawn by the action, flip it
    if (state.card) {
      setTimeout(() => setIsCardFlipped(true), 100);
    } else {
      // Reset flip state if there's no card (e.g., on error or initial load)
      setIsCardFlipped(false);
    }
  }, [state.card]); // Dependency array ensures this runs only when the card changes

  return (
    <main className="flex flex-col items-center justify-start min-h-screen bg-gray-900 text-white p-8 pt-24">
      <h1 className="text-4xl font-bold text-indigo-300 mb-4">Your Daily Guidance</h1>
      
      <div className="h-96 flex items-center justify-center">
        {state.card ? (
          <div className="w-64">
            <TarotCard card={state.card} isFlipped={isCardFlipped} />
          </div>
        ) : (
          <form action={formAction}>
            <SubmitButton />
          </form>
        )}
      </div>

      {state.error && <p className="text-red-500 mt-4">{state.error}</p>}

      <ReadingBox reading={state.reading} isLoading={false} />
    </main>
  );
}
