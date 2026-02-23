// app/api/generate-reading/route.js
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini AI model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(request) {
  try {
    const { cardName, cardMeaning } = await request.json();

    if (!cardName || !cardMeaning) {
      return new Response(JSON.stringify({ error: "Card name and meaning are required." }), { status: 400 });
    }

    const prompt = `You are a wise and empathetic Tarot reader. I have drawn the card "${cardName}". Its traditional meaning is: "${cardMeaning}". Based on this, provide a short, one-paragraph guidance for my day in a mystical and encouraging tone. Speak in Burmese (Myanmar Language).`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return new Response(JSON.stringify({ reading: text }), { status: 200 });

  } catch (error) {
    console.error("Error generating reading:", error);
    return new Response(JSON.stringify({ error: "Failed to generate reading." }), { status: 500 });
  }
}
