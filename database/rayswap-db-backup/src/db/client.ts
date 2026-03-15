import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index";
import dotenv from "dotenv";

// Load environment variables only in Node.js environment
if (typeof window === 'undefined') {
  dotenv.config();
}
const poolSize = Number(process.env.DB_POOL_SIZE ?? 5);
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: poolSize,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,

});

export const db = drizzle(pool, { schema });
export const poolClient = pool;
