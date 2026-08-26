/**
 * Single source of truth for Supabase credentials in the admin panel.
 *
 * The admin previously read only NEXT_PUBLIC_SUPABASE_ANON_KEY while the public
 * website read only NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Whichever name was
 * missing in a given deployment caused that half of the system to silently fall
 * back to stale localStorage defaults. Resolving every accepted spelling in one
 * place prevents that drift.
 *
 * These are the *publishable* credentials — Next.js inlines every NEXT_PUBLIC_*
 * value into the browser bundle, so they are public by design. Row Level
 * Security protects the data. Never put the service_role key here.
 */

const FALLBACK_URL = 'https://ftnbzukwjvgxdnkrvuer.supabase.co'
const FALLBACK_KEY = 'sb_publishable_GFV9g9M3vPdFlOtFZ_dnEA_bR2Cm0HV'

function firstNonEmpty(...values: Array<string | undefined>): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim() !== '') return value.trim()
  }
  return undefined
}

export function getSupabaseUrl(): string {
  return (
    firstNonEmpty(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_URL,
      FALLBACK_URL
    ) as string
  )
}

export function getSupabaseKey(): string {
  return (
    firstNonEmpty(
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      process.env.SUPABASE_PUBLISHABLE_KEY,
      process.env.SUPABASE_ANON_KEY,
      FALLBACK_KEY
    ) as string
  )
}
