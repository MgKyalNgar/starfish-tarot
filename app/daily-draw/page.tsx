'use client';

import { useState } from "react";
import Link from "next/link";

type DailyDrawCard = {
  id: number;
  name: string;
  arcana: string;
  meaning: string;
  imageUrl: string | null;
};

type DailyDrawMeta = {
  id: string;
  cardId: number;
  drawDate: string;
  createdAt: string;
};

type DailyDrawResponse = {
  alreadyDrawn: boolean;
  draw: DailyDrawMeta;
  card: DailyDrawCard;
};

export default function DailyDrawPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DailyDrawResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDrawClick() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/daily-draw", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.error === "not_authenticated"
            ? "Daily Draw လုပ်ဖို့အတွက် အရင် Sign in ဝင်ရပါမယ်။"
            : "Daily Draw လုပ်ရာမှာ ခဏပြဿနာရှိနေပါတယ်။ နောက်တစ်ခေါက် ထပ်စမ်းကြည့်ပါ။",
        );
        return;
      }

      setResult(data);
    } catch {
      setError("Network error ဖြစ်နေပါတယ်။ နောက်တစ်ခေါက် ထပ်စမ်းကြည့်ပါ။");
    } finally {
      setLoading(false);
    }
  }

  const card = result?.card;
  const already = result?.alreadyDrawn;

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 via-indigo-950 to-black text-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-6 sm:px-8 sm:py-8">
        <header className="mb-8 flex items-center justify-between text-xs text-violet-100/80">
          <Link
            href="/"
            className="rounded-full border border-violet-400/60 bg-violet-900/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] hover:border-amber-300 hover:bg-violet-800/70"
          >
            Home
          </Link>
          <span>Daily Draw</span>
        </header>

        <main className="flex flex-1 flex-col items-center gap-8">
          <section className="flex flex-col items-center space-y-3 text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-amber-200 drop-shadow-sm sm:text-4xl">
              ဒီနေ့အတွက် တားရော့
            </h1>
            <p className="max-w-sm text-xs leading-relaxed text-violet-100/80 sm:text-sm">
              တစ်နေ့ကို တစ်ကြိမ်ပဲ ကဒ်ဆွဲနိုင်ပါတယ်။ ယနေ့အတွက် သင့်အတွက်
              လာမည့် Energy ကို နူးညံ့ညောင်းညောင်း လှောင့်ကြည့်ကြရအောင်။
            </p>
          </section>

          <section className="flex w-full flex-col items-center gap-4">
            <button
              type="button"
              onClick={handleDrawClick}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-full bg-amber-300 px-8 py-2 text-sm font-semibold text-violet-950 shadow-lg shadow-amber-500/40 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "ကဒ်ဆွဲနေပါတယ်..." : "ဒီနေ့အတွက် ကဒ်ဆွဲမယ်"}
            </button>

            {error && (
              <p className="mt-2 text-center text-xs text-rose-200/90">
                {error}
              </p>
            )}
          </section>

          {card && (
            <section className="mt-2 w-full rounded-2xl border border-violet-400/50 bg-violet-900/40 p-5 text-center shadow-lg shadow-violet-950/60 backdrop-blur">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.28em] text-violet-100/80">
                {already ? "ယနေ့ သင် ဆွဲထားပြီးသား ကဒ်" : "ယနေ့ သင် ဆွဲလိုက်သည့် ကဒ်"}
              </p>
              <h2 className="text-xl font-semibold text-amber-100 sm:text-2xl">
                {card.name}
              </h2>
              <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-violet-200/80">
                {card.arcana}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-violet-100/90">
                {card.meaning}
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

