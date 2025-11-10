// Remove D1 database type since we're using Supabase now
declare global {
  interface CloudflareEnv {}
}