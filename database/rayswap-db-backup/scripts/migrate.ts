import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

// pgBouncer-compatible configuration
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
});

(async () => {
  try {
    const db = drizzle(pool);
    
    // Direct migration without advisory locks for pgBouncer compatibility
    // Drizzle ORM handles migration state internally via __drizzle_migrations table
    await migrate(db, { migrationsFolder: "./drizzle/migrations" });
    
    console.log("✅ Migrations applied");
  } catch (e) {
    console.error("❌ Migration failed", e);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
