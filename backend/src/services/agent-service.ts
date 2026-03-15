import { db, schema } from '../../../database/rayswap-db/src/index';
import { eq, desc } from 'drizzle-orm';
import { WdkService } from '../integrations/wdk';
import { WdkSecretManager } from '../integrations/secret-manager';
import { FxService } from './fx-service';
import { v4 as uuidv4 } from 'uuid';

const { payrollBatches, payrollAgentDecisions, payrollLedgerEntries, payrollSchedules } = schema;

/**
 * AgentService bridges the Backend to the OpenClaw Agent.
 * It provides the agent with the "tools" it needs to satisfy its skills.
 */
export class AgentService {
    /**
     * Tool: Fetch real-time FX rates from Core (via FxService).
     */
    async getExchangeRate(corridor: string): Promise<number | null> {
        return FxService.getRate(corridor);
    }

    /**
     * Tool: Log a decision or thought process for transparency in the dashboard.
     */
    async logDecision(batchId: string, type: string, reasoning: string, plan?: any): Promise<void> {
        await db.insert(payrollAgentDecisions).values({
            id: uuidv4(),
            batchId,
            decisionType: type,
            reasoning,
            plan,
            updatedAt: new Date().toISOString()
        });
    }

    /**
     * Tool: Initialize or update a batch after parsing a file.
     */
    async updateBatch(batchId: string, data: {
        scheduleId: string;
        status: any;
        totalAmountFiat: string;
        totalAmountUsdt: string;
        currency: string;
        recipientCount: number;
        errorLog?: string;
    }): Promise<void> {
        const [existing] = await db.select().from(payrollBatches).where(eq(payrollBatches.id, batchId)).limit(1);

        if (existing) {
            await db.update(payrollBatches)
                .set({
                    ...data,
                    updatedAt: new Date().toISOString()
                })
                .where(eq(payrollBatches.id, batchId));
        } else {
            await db.insert(payrollBatches).values({
                id: batchId,
                ...data,
                updatedAt: new Date().toISOString()
            });
        }
    }

    /**
     * Handle the Agent's request for balance.
     */
    async checkWdkBalance(address: string, network: 'ethereum' | 'tron'): Promise<bigint> {
        const seed = await WdkSecretManager.getSeed();
        const wdk = new WdkService(seed);
        const balance = await wdk.getUsdtBalance(address, network);
        return balance;
    }
}
