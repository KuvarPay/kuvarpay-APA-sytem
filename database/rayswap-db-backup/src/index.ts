export * as schema from "./db/schema/index"; // your schema barrel
export { db, poolClient } from "./db/client"; // your singleton client
// or export a factory if you prefer: export { createDb } from "./db/createDb";
export { decryptField, encryptField } from "./lib/crypto";
