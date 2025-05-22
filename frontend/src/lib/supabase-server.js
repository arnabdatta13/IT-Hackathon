import { createClient } from "@supabase/supabase-js"

export const createServerSupabase = () => {
  return createClient(import.meta.env.VITE_PUBLIC_SUPABASE_URL, import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY)
}
