import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';
import * as schema from '../src/db/schema/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function createSchema() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const db = drizzle(client, { schema });

    // Use Drizzle's introspect and push to create all tables
    console.log('Creating database schema from schema.ts...');
    
    // We'll use drizzle-kit push command instead of manual SQL
    console.log('Please run: npx drizzle-kit push to create all tables from schema');
    
  } catch (error) {
    console.error('Error creating schema:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (require.main === module) {
  createSchema();
}

export default createSchema;