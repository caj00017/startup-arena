import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const makePgliteDatabase = (client: PGlite) => drizzlePglite(client, { schema });
export type ArenaDatabase = ReturnType<typeof makePgliteDatabase>;

type DatabaseGlobals = typeof globalThis & {
  __arenaDb?: ArenaDatabase;
  __arenaPglite?: PGlite;
  __arenaPostgresClient?: ReturnType<typeof postgres>;
};

const globals = globalThis as DatabaseGlobals;

export function getDb(): ArenaDatabase {
  if (globals.__arenaDb) return globals.__arenaDb;

  if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required in production.");
  }

  if (process.env.DATABASE_URL) {
    const client = postgres(process.env.DATABASE_URL, {
      max: process.env.NODE_ENV === "production" ? 10 : 3,
      prepare: false
    });
    globals.__arenaPostgresClient = client;
    globals.__arenaDb = drizzlePostgres(client, { schema }) as unknown as ArenaDatabase;
    return globals.__arenaDb;
  }

  const dataDir = process.env.PGLITE_DATA_DIR || ".data/startup-arena";
  const client = dataDir === "memory://" ? new PGlite() : new PGlite(dataDir);
  globals.__arenaPglite = client;
  globals.__arenaDb = makePgliteDatabase(client);
  return globals.__arenaDb;
}

export const db = new Proxy({} as ArenaDatabase, {
  get(_target, property) {
    const database = getDb();
    const value = Reflect.get(database, property);
    return typeof value === "function" ? value.bind(database) : value;
  }
});
