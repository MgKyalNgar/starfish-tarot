// actions/tarotActions.js
"use server";

import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// This is a "private" function within the file. It's not exported.
// It contains the logic that needs cookies().
async function getCardAndReadingFromDB() {
  const supabase = createClient(); // This is now safe to call here.

  const { count, error: countError } = await supabase.from('TarotCard').select('*', { count: 'exact', head: true });
  if (countError) throw countError;
  
  const randomId = Math.floor(Math.random() * count) + 1;
  const { data: cardData, error: cardError } = await supabase.from('TarotCard').select('*').eq('id', randomId).single();
  if (cardError) throw cardError;

  return cardData;
}

// This is the PUBLIC action that will be passed to useFormState.
// Notice it does NOT call cookies() directly.
export async function drawAndInterpretCard(previousState, formData) {
  try {
    // 1. Call the private function to do the database work.
    const cardData = await getCardAndReadingFromDB();

    // 2. Call the Gemini API (this doesn't need cookies).
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are a wise and empathetic Tarot reader. I have drawn the card "${cardData.name}". Its traditional meaning is: "${cardData.meaning}". Based on this, provide a short, one-paragraph guidance for my day in a mystical and encouraging tone. Speak in Burmese (Myanmar Language).`;
    
    const result = await model.generateContent(prompt);
    const aiReading = result.response.text();

    // 3. Return the final state.
    return { card: cardData, reading: aiReading, error: null };

  } catch (error) {
    console.error("Server Action Error:", error.message);
    return { card: null, reading: null, error: "Failed to consult the cosmos. The stars are not aligned." };
  }
}
