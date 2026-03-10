import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-900 via-indigo-950 to-black text-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-6 sm:px-8 sm:py-8">
        <header className="mb-8 flex items-center justify-between gap-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-violet-200/70">
            Tarot for Myanmar
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/sign-in"
              className="rounded-full border border-violet-300/70 bg-violet-900/40 px-4 py-1.5 text-xs font-medium text-violet-50 shadow-sm backdrop-blur transition hover:border-amber-300 hover:bg-violet-800/70"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-amber-300 px-4 py-1.5 text-xs font-semibold text-violet-950 shadow-lg shadow-amber-500/40 transition hover:bg-amber-200"
            >
              Sign up
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center gap-8">
          <section className="flex flex-col items-center space-y-3 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-amber-200 drop-shadow-sm sm:text-5xl">
              Starfish Tarot
            </h1>
            <h2 className="text-base font-medium text-zinc-50 sm:text-lg">
              နေ့စဉ်လမ်းညွှန် Tarot App
            </h2>
            <p className="max-w-xl text-xs leading-relaxed text-violet-100/80 sm:text-sm">
              သင့်ရဲ့နေ့စဉ်မေးခွန်းတွေ၊ ဆုံးဖြတ်ချင်တဲ့အရာတွေကို Starfish Tarot
              နဲ့ နူးညံ့သက်သာ တာရော့ဖတ်ကြရအောင်။ အလိုရှိသလို
              AI နဲ့လည်း၊ လူသဘောကျ ဆရာနဲ့လည်း ရွေးချယ်ပြီး မေးနိုင်မယ်။
            </p>
          </section>

          <section className="grid w-full gap-4">
            <Link
              href="/daily-draw"
              className="group rounded-2xl border border-violet-500/50 bg-violet-900/40 px-4 py-4 shadow-lg shadow-violet-900/60 backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300/80 hover:bg-violet-800/70"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-violet-200/80">
                  ဒီနေ့အတွက် တားရော့
                </p>
                <h3 className="text-lg font-semibold text-amber-100 sm:text-xl">
                  Daily Draw
                </h3>
                <span className="text-3xl drop-shadow group-hover:scale-105 group-hover:rotate-3 transition">
                  ✨
                </span>
              </div>
            </Link>

            <Link
              href="/ai-reading"
              className="group rounded-2xl border border-indigo-400/40 bg-indigo-900/40 px-4 py-4 shadow-lg shadow-indigo-900/60 backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300/80 hover:bg-indigo-800/70"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-indigo-100/80">
                  AI နှင့် ကဒ်ကြည့်မယ်
                </p>
                <h3 className="text-lg font-semibold text-amber-100 sm:text-xl">
                  AI Tarot Reading
                </h3>
                <span className="text-3xl drop-shadow group-hover:scale-105 group-hover:-rotate-3 transition">
                  🧠
                </span>
              </div>
            </Link>

            <Link
              href="/ask-reader"
              className="group rounded-2xl border border-violet-300/50 bg-violet-900/30 px-4 py-4 shadow-lg shadow-violet-900/50 backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300/80 hover:bg-violet-800/60"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-violet-100/80">
                  ဆရာနှင့်မေးရန်
                </p>
                <h3 className="text-lg font-semibold text-amber-100 sm:text-xl">
                  Live Reader
                </h3>
                <span className="text-3xl drop-shadow group-hover:scale-105 transition">
                  📩
                </span>
              </div>
            </Link>

            <Link
              href="/about"
              className="group rounded-2xl border border-amber-300/60 bg-gradient-to-r from-violet-900/50 via-indigo-900/40 to-amber-900/40 px-4 py-4 shadow-lg shadow-amber-900/50 backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-200 hover:from-violet-800/70 hover:to-amber-800/70"
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <p className="text-[10px] font-medium uppercase tracking-[0.35em] text-amber-100/80">
                  About App
                </p>
                <h3 className="text-lg font-semibold text-amber-50 sm:text-xl">
                  App အကြောင်း သိသင့်သည်များ
                </h3>
                <span className="text-3xl drop-shadow group-hover:scale-105 group-hover:rotate-1 transition">
                  ℹ️
                </span>
              </div>
            </Link>
          </section>

          <footer className="mt-8 border-t border-violet-800/70 pt-4 text-center text-[10px] text-violet-200/70">
            © {new Date().getFullYear()} Starfish Tarot · Crafted for Myanmar
            Tarot Lovers
          </footer>
        </main>
      </div>
    </div>
  );
}
