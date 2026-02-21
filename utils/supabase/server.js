// utils/supabase/server.js

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Function parameter 'cookieStore' အတွက် Type ကို ထည့်သွင်းသတ်မှတ်ပေးလိုက်ပါတယ်
export function createClient(cookieStore) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // 'get' method ရဲ့ parameter 'name' အတွက်လည်း Type ကို သတ်မှတ်ပေးပါတယ်
        get(name) {
          return cookieStore.get(name)?.value
        },
        // (Optional but good practice) Action Components တွေမှာ သုံးဖို့အတွက် set နဲ့ remove function တွေကိုပါ ထည့်သွင်းပေးထားပါတယ်
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
