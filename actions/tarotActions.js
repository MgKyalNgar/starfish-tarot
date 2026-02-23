// actions/tarotActions.js
"use server"; // <-- This marks all functions in this file as Server Actions

import { createClient } from "@/utils/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function drawAndInterpretCard() {
  try {
    const supabase = createClient();

    // 1. Get total card count from Supabase
    const { count, error: countError } = await supabase
      .from('TarotCard')
      .select('*', { count: 'exact', head: true });

    if (countError) throw new Error("Could not connect to the deck.");
    
    // 2. Pick a random card ID
    const randomId = Math.floor(Math.random() * count) + 1;

    // 3. Fetch that single random card
    const { data: cardData, error: cardError } = await supabase
      .from('TarotCard')
      .select('*')
      .eq('id', randomId)
      .single();

    if (cardError) throw new Error("The selected card vanished from the deck!");

    // 4. Call Gemini API for interpretation
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are a wise and empathetic Tarot reader. I have drawn the card "${cardData.name}". Its traditional meaning is: "${cardData.meaning}". Based on this, provide a short, one-paragraph guidance for my day in a mystical and encouraging tone. Speak in Burmese (Myanmar Language).`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiReading = response.text();

    // 5. Return both the card and the AI reading
    return { card: cardData, reading: aiReading, error: null };

  } catch (error) {
    console.error("Server Action Error:", error.message);
    return { card: null, reading: null, error: error.message };
  }
}
