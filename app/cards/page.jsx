// app/cards/page.jsx
import { createClient } from '@/supabase/server';
import { cookies } from 'next/headers';

export default async function CardsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Supabase ကနေ TarotCard table ထဲက data အားလုံးကို ဆွဲထုတ်မယ်
  const { data: tarotCards, error } = await supabase.from('TarotCard').select('*').order('id', { ascending: true });

  if (error) {
    return <p>Error fetching cards: {error.message}</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Starfish Tarot Deck ({tarotCards.length} Cards)</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        {tarotCards.map((card) => (
          <div key={card.id} className="border rounded-lg p-2 text-center shadow-lg">
            <img src={card.imageUrl} alt={card.name} className="w-full h-auto rounded-md" />
            <p className="mt-2 text-sm font-semibold">{card.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
