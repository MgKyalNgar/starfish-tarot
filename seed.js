// seed.js

import { createClient } from '@supabase/supabase-js';
import { tarotCards } from './lib/tarot-data.js'; // <-- ခင်ဗျားရဲ့ card data တွေကို ဒီ file ထဲမှာထားမယ်

// .env.local file ထဲက key တွေကို ဖတ်ဖို့အတွက် dotenv library လိုအပ်တယ်
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY; // <-- Service Key ကိုသုံးမှာဖြစ်လို့ ခဏနေရင် .env.local မှာထည့်မယ်

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase URL or Service Key is missing from .env.local");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🌱 Starting to seed the database...');

  // TarotCard table ထဲက data အဟောင်းတွေ အကုန်ရှင်းပစ်မယ်
  const { error: deleteError } = await supabase.from('TarotCard').delete().gt('id', -1);
  if (deleteError) {
    console.error('Error clearing TarotCard table:', deleteError);
    return;
  }
  console.log('🧹 Cleared existing data from TarotCard table.');

  // Data အသစ်တွေ ထည့်မယ်
  const { data, error } = await supabase.from('TarotCard').insert(tarotCards);

  if (error) {
    console.error('Error inserting tarot cards:', error.message);
  } else {
    console.log(`✅ Successfully seeded ${tarotCards.length} tarot cards.`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
