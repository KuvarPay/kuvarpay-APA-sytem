/**
 * WdkSecretManager handles the lifecycle of the Master Seed in memory.
 */
export class WdkSecretManager {
    private static _inMemorySeed: string | null = null;

    /**
     * Get the master seed phrase from the environment.
     * In a production environment, this might be decrypted from a secure vault or session.
     */
    static async getSeed(): Promise<string> {
        if (!this._inMemorySeed) {
            this._inMemorySeed = process.env.WDK_SEED || "";
            if (!this._inMemorySeed) {
                console.warn("[SecretManager] WARNING: WDK_SEED is not set in environment.");
            }
        }
        return this._inMemorySeed;
    }

    /**
     * Clear the seed from memory when no longer needed.
     */
    static dispose() {
        this._inMemorySeed = null;
    }
}
