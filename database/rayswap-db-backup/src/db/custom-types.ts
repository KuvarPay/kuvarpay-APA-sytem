import { customType } from 'drizzle-orm/pg-core';
import { encryptField, decryptField } from '../lib/crypto';

/**
 * Custom Drizzle type for encrypted text fields.
 * Transparently encrypts on save and decrypts on read.
 */
export const encryptedText = (name: string) =>
    customType<{ data: string | null; driverData: string | null }>({
        dataType() {
            return 'text';
        },
        toDriver(value: string | null): string | null {
            if (value === null) return null;
            return encryptField(value) ?? null;
        },
        fromDriver(value: string | null): string | null {
            if (value === null) return null;
            return decryptField(value) ?? null;
        },
    })(name);

/**
 * Custom Drizzle type for encrypted JSON fields.
 * Transparently serializes to JSON, encrypts on save, 
 * and decrypts then parses JSON on read.
 */
export const encryptedJson = <TData = any>(name: string) =>
    customType<{ data: TData | null; driverData: string | null }>({
        dataType() {
            return 'text';
        },
        toDriver(value: TData | null): string | null {
            if (value === null) return null;
            return encryptField(JSON.stringify(value)) ?? null;
        },
        fromDriver(value: string | null): TData | null {
            if (value === null) return null;
            const decrypted = decryptField(value);
            if (decrypted === null || decrypted === undefined) return null;
            try {
                return JSON.parse(decrypted) as TData;
            } catch (error) {
                // Fallback for non-JSON legacy data or corrupted JSON
                return decrypted as unknown as TData;
            }
        },
    })(name);
