interface Env {
  DB: D1Database;
}

declare global {
  interface CloudflareEnv extends Env {}
}