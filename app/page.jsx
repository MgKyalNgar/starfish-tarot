// app/page.jsx
import Link from 'next/link'; // Next.js ရဲ့ built-in Link component ကိုသုံးပြီး စာမျက်နှာတွေကူးပြောင်းပါမယ်

export default function HomePage() {
  return (
    // Main container ကို screen အပြည့်ဖြစ်အောင်လုပ်ပြီး အလယ်မှာစုထားမယ်
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-8">

      {/* Title Section */}
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-2">
          Starfish Tarot
        </h1>
        <p className="text-lg text-indigo-300">
          Your mystical journey begins here.
        </p>
      </div>

      {/* Separator */}
      <div className="my-8 h-px w-1/3 bg-gray-600"></div>

      {/* Call to Action Button */}
      <Link
        href="/cards" // '/cards' page ကိုသွားမယ့် လမ်းကြောင်း
        className="px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-500 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-opacity-75"
      >
        View the Deck
      </Link>

    </main>
  );
}
