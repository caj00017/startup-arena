Object.assign(process.env, {
  NODE_ENV: "test",
  PGLITE_DATA_DIR: "memory://",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  SESSION_SECRET: "test-session-secret-that-is-at-least-32-characters",
  IP_HASH_SECRET: "test-ip-secret-that-is-long-enough",
  CRON_SECRET: "test-cron-secret-that-is-long-enough"
});
