// actions/tarotActions.js
"use server";

import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// The action now accepts `previousState` and `formData`
// We don't need formData for this action, so we can ignore it with `_`.
export async function drawAndInterpretCard(previousState, formData) {
  const supabase = createClient(); // This will now work correctly!

  try {
    const { count, error: countError } = await supabase
      .from('TarotCard')
      .select('*', { count: 'exact', head: true });

    if (countError) throw new Error("Could not connect to the deck.");
    
    const randomId = Math.floor(Math.random() * count) + 1;

    const { data: cardData, error: cardError } = await supabase
      .from('TarotCard')
      .select('*')
      .eq('id', randomId)
      .single();

    if (cardError) throw new Error("The selected card vanished from the deck!");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a wise and empathetic Tarot reader. I have drawn the card "${cardData.name}". Its traditional meaning is: "${cardData.meaning}". Based on this, provide a short, one-paragraph guidance for my day in a mystical and encouraging tone. Speak in Burmese (Myanmar Language).`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiReading = response.text();

    return { card: cardData, reading: aiReading, error: null };

  } catch (error) {
    console.error("Server Action Error:", error.message);
    return { card: null, reading: null, error: "Failed to consult the cosmos. The stars are not aligned." 
    };

  }
}
