import { defineConfig } from "drizzle-kit";

const migrationUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!migrationUrl) {
  console.warn("DATABASE_URL_UNPOOLED or DATABASE_URL is not set. `db:generate` works, but drizzle-kit database commands require PostgreSQL.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: migrationUrl || "postgres://postgres:postgres@localhost:5432/startup_arena"
  },
  strict: true,
  verbose: true
});
