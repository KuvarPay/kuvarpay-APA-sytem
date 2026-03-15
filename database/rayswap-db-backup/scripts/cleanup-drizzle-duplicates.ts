// scripts/cleanup-drizzle-duplicates.ts
import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL_PROD || process.env.DATABASE_URL,
});

async function cleanupDrizzleDuplicates() {
  const client = await pool.connect();
  
  console.log("🧹 Cleaning up Drizzle duplicate tables...\n");
  
  try {
    // First, let's identify all duplicate tables
    console.log("Step 1: Identifying duplicate tables...\n");
    
    const duplicatePatterns = [
      { prisma: 'Transaction', drizzle: 'transactions' },
      { prisma: 'User', drizzle: 'users' },
      { prisma: 'Currency', drizzle: 'currencies' },
      { prisma: 'Bank', drizzle: 'banks' },
      { prisma: 'ExchangeRate', drizzle: 'exchange_rates' },
      { prisma: 'DepositAddress', drizzle: 'deposit_addresses' },
      { prisma: 'Notification', drizzle: 'notifications' },
      { prisma: 'TransferFee', drizzle: 'transfer_fee' },
      { prisma: 'PasswordResetToken', drizzle: 'password_reset_tokens' },
      { prisma: 'Blog', drizzle: 'blogs' },
    ];
    
    const tablesToDrop = [];
    const tablesWithData = [];
    
    for (const pattern of duplicatePatterns) {
      // Check if Prisma table exists
      const prismaCheck = await client.query(`
        SELECT 
          table_name,
          (SELECT COUNT(*) FROM "${pattern.prisma}") as row_count
        FROM information_schema.tables
        WHERE table_name = $1
        AND table_schema = 'public'
      `, [pattern.prisma]).catch(() => ({ rows: [] }));
      
      // Check if Drizzle table exists
      const drizzleCheck = await client.query(`
        SELECT 
          table_name,
          (SELECT COUNT(*) FROM ${pattern.drizzle}) as row_count
        FROM information_schema.tables
        WHERE table_name = $1
        AND table_schema = 'public'
      `, [pattern.drizzle]).catch(() => ({ rows: [] }));
      
      if (prismaCheck.rows.length > 0 && drizzleCheck.rows.length > 0) {
        const prismaCount = prismaCheck.rows[0].row_count;
        const drizzleCount = drizzleCheck.rows[0].row_count;
        
        console.log(`📊 ${pattern.prisma} vs ${pattern.drizzle}:`);
        console.log(`   Prisma table: ${prismaCount} rows`);
        console.log(`   Drizzle table: ${drizzleCount} rows`);
        
        if (drizzleCount === '0' && prismaCount !== '0') {
          tablesToDrop.push(pattern.drizzle);
          console.log(`   ✓ Will drop empty Drizzle table: ${pattern.drizzle}\n`);
        } else if (drizzleCount !== '0') {
          tablesWithData.push(pattern.drizzle);
          console.log(`   ⚠️ Drizzle table has data! Manual review needed: ${pattern.drizzle}\n`);
        }
      } else if (drizzleCheck.rows.length > 0 && prismaCheck.rows.length === 0) {
        // Only Drizzle table exists
        console.log(`📊 ${pattern.drizzle}: Only Drizzle table exists (no Prisma equivalent)\n`);
      }
    }
    
    // Also check for Drizzle-only tables (no Prisma equivalent)
    console.log("\nStep 2: Checking for Drizzle-only tables...\n");
    
    const drizzleOnlyTables = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND (
        table_name LIKE '%_aggregates' OR
        table_name LIKE 'admin_%' OR
        table_name LIKE 'sandbox_%' OR
        table_name LIKE 'settlement_%' OR
        table_name LIKE 'webhook_%' OR
        table_name LIKE 'invoice_%' OR
        table_name LIKE 'payment_%' OR
        table_name LIKE 'checkout_%' OR
        table_name LIKE 'gas_%' OR
        table_name LIKE 'generated_%' OR
        table_name LIKE 'processed_%' OR
        table_name LIKE 'smile_id_%' OR
        table_name LIKE 'supported_%' OR
        table_name LIKE 'system_%' OR
        table_name LIKE 'whitelisted_%' OR
        table_name LIKE 'flutterwave_%' OR
        table_name LIKE 'dkim_%' OR
        table_name LIKE 'custom_%' OR
        table_name = 'businesses' OR
        table_name = 'api_keys' OR
        table_name = 'users' OR
        table_name = 'team_members' OR
        table_name = 'wallets' OR
        table_name = 'invoice_items' OR
        table_name = 'business_documents' OR
        table_name = 'admins'
      )
      ORDER BY table_name;
    `);
    
    console.log("Drizzle-specific tables found:");
    const drizzleSpecificTables = [];
    for (const row of drizzleOnlyTables.rows) {
      const countResult = await client.query(
        `SELECT COUNT(*) as count FROM ${row.table_name}`
      ).catch(() => ({ rows: [{ count: 'error' }] }));
      
      const count = countResult.rows[0].count;
      console.log(`  - ${row.table_name}: ${count} rows`);
      
      if (count === '0') {
        drizzleSpecificTables.push(row.table_name);
      }
    }
    
    // Combine all tables to drop
    const allTablesToDrop = [...new Set([...tablesToDrop, ...drizzleSpecificTables])];
    
    if (tablesWithData.length > 0) {
      console.log("\n⚠️ WARNING: These Drizzle tables have data:");
      tablesWithData.forEach(t => console.log(`  - ${t}`));
      console.log("These will NOT be dropped automatically. Review them manually.\n");
    }
    
    if (allTablesToDrop.length === 0) {
      console.log("\n✓ No duplicate empty tables to drop.");
      return;
    }
    
    console.log("\n🗑️ Tables to be dropped (all empty):");
    allTablesToDrop.forEach(t => console.log(`  - ${t}`));
    
    // Ask for confirmation
    console.log("\n⚠️ This will DROP the above tables permanently!");
    console.log("To proceed, run with: CONFIRM_DROP=true\n");
    
    if (process.env.CONFIRM_DROP !== 'true') {
      console.log("Exiting without dropping tables.");
      return;
    }
    
    // Drop the tables
    console.log("\nStep 3: Dropping empty Drizzle tables...\n");
    
    await client.query('BEGIN');
    
    try {
      for (const tableName of allTablesToDrop) {
        console.log(`Dropping ${tableName}...`);
        await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
        console.log(`  ✓ Dropped ${tableName}`);
      }
      
      await client.query('COMMIT');
      console.log("\n✅ Successfully dropped all empty Drizzle tables!");
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
    
    // Step 4: Reset Drizzle migrations
    console.log("\nStep 4: Resetting Drizzle migrations...\n");
    
    const resetMigrations = await client.query(`
      SELECT COUNT(*) as count FROM __drizzle_migrations;
    `);
    
    console.log(`Found ${resetMigrations.rows[0].count} Drizzle migration records`);
    
    if (process.env.RESET_MIGRATIONS === 'true') {
      await client.query(`TRUNCATE TABLE __drizzle_migrations;`);
      console.log("✓ Cleared Drizzle migration history");
      
      // Add baseline migration
      await client.query(`
        INSERT INTO __drizzle_migrations (hash, created_at)
        VALUES ('baseline_from_prisma', ${Date.now()});
      `);
      console.log("✓ Added baseline migration record");
    } else {
      console.log("To reset migrations, run with: RESET_MIGRATIONS=true");
    }
    
    console.log("\n✅ Cleanup complete!");
    console.log("\n📝 Next steps:");
    console.log("1. Update your Drizzle schema to use exact Prisma table names (PascalCase)");
    console.log("2. Re-introspect if needed: npx drizzle-kit introspect:pg");
    console.log("3. Generate new migrations from the clean state");
    
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Main execution
(async () => {
  console.log("===========================================");
  console.log("Drizzle Duplicate Tables Cleanup");
  console.log("===========================================\n");
  
  try {
    await cleanupDrizzleDuplicates();
  } catch (error) {
    console.error("Fatal error:", error);
    process.exit(1);
  }
})();