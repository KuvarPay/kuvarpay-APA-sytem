import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const PREFIX = 'kp1:';

/**
 * Encrypts a plain text string using AES-256-GCM.
 * Prepends 'kp1:' to the resulting cipher text.
 */
export function encryptField(text: string | null | undefined): string | null | undefined {
    if (text === null || text === undefined) return text;

    const key = process.env.DB_ENCRYPTION_KEY;
    if (!key) {
        throw new Error('DB_ENCRYPTION_KEY is required for encryption but was not found in environment variables.');
    }

    // Ensure key is 32 bytes
    const derivedKey = crypto.createHash('sha256').update(key).digest();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag().toString('hex');

    // Format: kp1:iv:tag:encrypted
    return `${PREFIX}${iv.toString('hex')}:${tag}:${encrypted}`;
}

/**
 * Decrypts a cipher text string using AES-256-GCM if it has the 'kp1:' prefix.
 * If the prefix is missing, returns the input string as-is (backward compatibility).
 */
export function decryptField(cipherText: string | null | undefined): string | null | undefined {
    if (cipherText === null || cipherText === undefined) return cipherText;

    if (!cipherText.startsWith(PREFIX)) {
        return cipherText;
    }

    const key = process.env.DB_ENCRYPTION_KEY;
    if (!key) {
        throw new Error('DB_ENCRYPTION_KEY is required for decryption but was not found in environment variables.');
    }

    const derivedKey = crypto.createHash('sha256').update(key).digest();

    try {
        const content = cipherText.slice(PREFIX.length);
        const [ivHex, tagHex, encryptedHex] = content.split(':');

        if (!ivHex || !tagHex || !encryptedHex) {
            // If format is invalid despite prefix, return as-is or throw? 
            // Falling back to as-is to avoid breaking data.
            return cipherText;
        }

        const iv = Buffer.from(ivHex, 'hex');
        const tag = Buffer.from(tagHex, 'hex');
        const encrypted = Buffer.from(encryptedHex, 'hex');

        const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encrypted, undefined, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption failed:', error);
        // Return as-is if decryption fails to maintain backward compatibility for potentially mis-prefixed data
        return cipherText;
    }
}
