import { config } from "dotenv";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

config({ path: ".env.local" });
config();

async function run() {
  const migrationUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (migrationUrl) {
    const client = postgres(migrationUrl, { max: 1 });
    const database = drizzlePostgres(client);
    await migratePostgres(database, { migrationsFolder: "drizzle" });
    await client.end();
    console.log("PostgreSQL migrations complete.");
    return;
  }

  const dataDir = process.env.PGLITE_DATA_DIR || ".data/startup-arena";
  mkdirSync(dirname(resolve(dataDir)), { recursive: true });
  const client = new PGlite(dataDir);
  const database = drizzlePglite(client);
  await migratePglite(database, { migrationsFolder: "drizzle" });
  await client.close();
  console.log("Embedded PGlite migrations complete.");
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
