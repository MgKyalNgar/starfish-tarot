import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // 1) Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "not_authenticated" },
        { status: 401 },
      );
    }

    // Calendar-based: one draw per calendar day (server date)
    const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

    // 2) Check if today's draw already exists
    const { data: existingRows, error: existingError } = await supabase
      .from("DailyDraw")
      .select("id, cardId, drawDate, createdAt")
      .eq("userId", user.id)
      .eq("drawDate", today)
      .limit(1);

    if (existingError) {
      return NextResponse.json(
        { error: "failed_to_check_existing_draw" },
        { status: 500 },
      );
    }

    const existing = existingRows?.[0];

    if (existing) {
      // Fetch the associated card and return the same result
      const { data: card, error: cardError } = await supabase
        .from("TarotCard")
        .select("id, name, arcana, meaning, imageUrl")
        .eq("id", existing.cardId)
        .single();

      if (cardError) {
        return NextResponse.json(
          { error: "failed_to_load_card_for_existing_draw" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        alreadyDrawn: true,
        draw: existing,
        card,
      });
    }

    // 3) No draw yet for today → pick a random card
    const { data: cards, error: cardsError } = await supabase
      .from("TarotCard")
      .select("id, name, arcana, meaning, imageUrl");

    if (cardsError || !cards || cards.length === 0) {
      return NextResponse.json(
        { error: "no_cards_available" },
        { status: 500 },
      );
    }

    const randomIndex = Math.floor(Math.random() * cards.length);
    const randomCard = cards[randomIndex];

    // 4) Insert DailyDraw row for today
    const { data: insertRows, error: insertError } = await supabase
      .from("DailyDraw")
      .insert({
        userId: user.id,
        cardId: randomCard.id,
        drawDate: today,
      })
      .select("id, cardId, drawDate, createdAt")
      .limit(1);

    if (insertError || !insertRows || insertRows.length === 0) {
      return NextResponse.json(
        { error: "failed_to_create_daily_draw" },
        { status: 500 },
      );
    }

    const draw = insertRows[0];

    // 5) Optionally sync lastDrawDate on User table (non-blocking)
    await supabase
      .from("User")
      .update({ lastDrawDate: new Date().toISOString() })
      .eq("id", user.id);

    return NextResponse.json({
      alreadyDrawn: false,
      draw,
      card: randomCard,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "unexpected_error" },
      { status: 500 },
    );
  }
}

