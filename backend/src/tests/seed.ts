import { db, schema } from '../../../database/rayswap-db/src/index';
import { v4 as uuidv4 } from 'uuid';

const { users, businesses, exchangeRates } = schema;

async function seed() {
    console.log('Seeding test data for E2E...');

    // These MUST match what's in e2e.ts or the database setup
    const businessId = '34c708f8-2ca8-48e9-9ea5-ee7ddfe88e63';
    const userId = uuidv4();

    try {
        // 1. Create User (Owner)
        console.log('Creating user...');
        await db.insert(users).values({
            id: userId,
            email: 'test@raycreatives.io',
            firstName: 'Test',
            lastName: 'User',
            password: 'hashed_password',
            updatedAt: new Date().toISOString()
        }).onConflictDoNothing();

        // 2. Create Business
        console.log('Creating business...');
        await db.insert(businesses).values({
            id: businessId,
            name: 'Test Business',
            ownerId: userId,
            isSandboxMode: true,
            updatedAt: new Date().toISOString()
        }).onConflictDoNothing();

        // 3. Create Exchange Rates (settlement_snapshot)
        console.log('Inserting exchange rates...');
        // Delete old rates to avoid duplicates/confusion
        // await db.delete(exchangeRates); 

        const ratesData = [
            { base: 'USD', target: 'NGN', rate: '1500', source: 'settlement_snapshot' },
            { base: 'NGN', target: 'GHS', rate: '0.01', source: 'settlement_snapshot' },
            { base: 'NGN', target: 'RWF', rate: '0.8', source: 'settlement_snapshot' }
        ];

        for (const r of ratesData) {
            await db.insert(exchangeRates).values({
                id: uuidv4(),
                baseCurrency: r.base,
                targetCurrency: r.target,
                rate: r.rate,
                source: r.source,
                fetchedAt: new Date().toISOString(),
                validUntil: new Date(Date.now() + 86400000).toISOString(), // 24h
                updatedAt: new Date().toISOString()
            });
        }

        console.log('✅ Seeding complete!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
}

seed();
