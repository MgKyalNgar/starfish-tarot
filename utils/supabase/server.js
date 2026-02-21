// utils/supabase/server.js
import { createServerClient } from '@supabase/ssr'
// cookies function ကို ဒီ file ထဲမှာ တိုက်ရိုက် import လုပ်ပြီး သုံးပါမယ်။
import { cookies } from 'next/headers'

export function createClient() {
  // page.jsx ကနေ cookieStore object ကြီးကို လက်ခံမယ့်အစား၊
  // ဒီ function အခေါ်ခံရတဲ့အခါတိုင်း cookies() ကို ဒီထဲမှာပဲ တိုက်ရိုက်ခေါ်သုံးလိုက်ပါမယ်။
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
