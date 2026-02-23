// app/cards/page.jsx
import { createServerSupabaseClient } from '@/lib/supabase/server';
import TarotCard from '@/components/TarotCard'; // <-- Component အသစ်ကို import လုပ်မယ်

export default async function CardsPage() {
  const supabase = createServerSupabaseClient();
  const { data: tarotCards, error } = await supabase.from('TarotCard').select('*').order('id', { ascending: true });

  if (error) {
    return <p>Error fetching cards: {error.message}</p>;
  }

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center text-white">Starfish Tarot Deck</h1>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
        {tarotCards.map((card) => (
          // ရိုးရိုး div အစား <TarotCard> component ကို ဒီမှာသုံးမယ်
          <TarotCard key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
