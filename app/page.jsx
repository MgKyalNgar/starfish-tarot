// app/page.jsx
"use client";
import Link from 'next/link';
import AuthButton from '@/components/AuthButton';
import { useAppContext } from '@/context/AppContext'; // <-- Import our custom hook

export default function HomePage() {
  const { currentUser, isGuest, loginAsGuest, isLoading } = useAppContext();
  // Show a loading state while session is being determined
  if (isLoading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gray-900">
        <p className="text-white text-xl">Loading...</p>
      </main>
    );
  }

  // User is either logged in or is a guest
  const isUserActive = currentUser || isGuest;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">
      <div className="absolute top-5 right-5">
        <AuthButton />
      </div>
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-2">Starfish Tarot</h1>
        <p className="text-lg text-indigo-300">
          Your mystical journey begins here.
        </p>
      </div>
      <div className="my-8 h-px w-1/3 bg-gray-600"></div>
      {/* Conditional Buttons */}
      <div className="flex flex-col items-center gap-4">
        {isUserActive ? (
          // If user is logged in OR is a guest, show the main button
          <Link
            href="/cards"
            className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-500 transition-colors"
          >
            View the Deck
          </Link>
        ) : (
          // If no one is logged in, show the guest option
          <button
            onClick={loginAsGuest}
            className="px-8 py-4 bg-gray-700 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-600 transition-colors"
          >
            Continue as Guest
          </button>
        )}
      </div>
    </main>
  );
}
