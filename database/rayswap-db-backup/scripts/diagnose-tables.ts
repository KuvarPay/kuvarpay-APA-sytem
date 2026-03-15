import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL_PROD || process.env.DATABASE_URL,
});

async function diagnoseTables() {
  const client = await pool.connect();
  
  try {
    console.log("🔍 Checking existing tables in database...\n");
    
    // Get all tables
    const tablesResult = await client.query(`
      SELECT table_name, table_schema
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    
    console.log("📋 All tables in database:");
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Check for specific problematic tables
    const problematicTables = [
      'Transaction', 'transaction', 'transactions',
      'User', 'user', 'users',
      'Currency', 'currency', 'currencies',
      'Bank', 'bank', 'banks',
      'ExchangeRate', 'exchangerate', 'exchange_rates',
      'DepositAddress', 'depositaddress', 'deposit_addresses',
      'Notification', 'notification', 'notifications'
    ];
    
    console.log("\n🎯 Checking for case-sensitive duplicates:");
    
    for (const tableName of problematicTables) {
      const exists = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = $1 
          AND table_schema = 'public'
        ) as exists;
      `, [tableName]);
      
      if (exists.rows[0].exists) {
        console.log(`  ✓ Found: ${tableName}`);
        
        // Check column names for this table
        const columns = await client.query(`
          SELECT column_name
          FROM information_schema.columns
          WHERE table_name = $1 AND table_schema = 'public'
          AND column_name LIKE '%USDT%' OR column_name LIKE '%usdt%'
          ORDER BY ordinal_position;
        `, [tableName]);
        
        if (columns.rows.length > 0) {
          console.log(`    Columns with USDT:`, columns.rows.map(r => r.column_name).join(', '));
        }
      }
    }
    
    // Check for the specific column that's causing issues
    console.log("\n🔍 Looking for receivedUSDTAmountTo column:");
    const columnCheck = await client.query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE column_name IN ('receivedUSDTAmountTo', 'receivedUsdtAmountTo')
      AND table_schema = 'public';
    `);
    
    if (columnCheck.rows.length > 0) {
      columnCheck.rows.forEach(row => {
        console.log(`  Found "${row.column_name}" in table "${row.table_name}"`);
      });
    } else {
      console.log("  Column not found in any table");
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.release();
  }
}

// Function to generate migration SQL based on what exists
async function generateMigrationFix() {
  const client = await pool.connect();
  
  try {
    console.log("\n📝 Generating migration fix...\n");
    
    // Check which Transaction table exists
    const transactionCheck = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE LOWER(table_name) = 'transaction'
      AND table_schema = 'public';
    `);
    
    if (transactionCheck.rows.length > 0) {
      const actualTableName = transactionCheck.rows[0].table_name;
      console.log(`Found table: "${actualTableName}"`);
      
      // Check if the column exists
      const columnCheck = await client.query(`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = $1
        AND column_name = 'receivedUSDTAmountTo'
        AND table_schema = 'public';
      `, [actualTableName]);
      
      if (columnCheck.rows.length > 0) {
        const migrationSQL = `
-- Fix for case-sensitive table name issue
ALTER TABLE ${actualTableName === 'Transaction' ? '"Transaction"' : actualTableName}
RENAME COLUMN "receivedUSDTAmountTo" TO "receivedUsdtAmountTo";
        `.trim();
        
        console.log("Migration SQL to run:");
        console.log("```sql");
        console.log(migrationSQL);
        console.log("```");
      } else {
        console.log("Column 'receivedUSDTAmountTo' not found - it may have already been renamed or doesn't exist.");
      }
    } else {
      console.log("No Transaction table found (in any case variation)");
      
      // Check if transactions (plural) exists instead
      const transactionsCheck = await client.query(`
        SELECT EXISTS (
          SELECT 1 FROM information_schema.tables 
          WHERE table_name = 'transactions' 
          AND table_schema = 'public'
        ) as exists;
      `);
      
      if (transactionsCheck.rows[0].exists) {
        console.log("Found 'transactions' table (plural) - this appears to be the new schema");
        console.log("The old 'Transaction' table may have been dropped or renamed.");
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    client.release();
  }
}

// Run diagnostics
(async () => {
  try {
    await diagnoseTables();
    await generateMigrationFix();
  } finally {
    await pool.end();
  }
})();