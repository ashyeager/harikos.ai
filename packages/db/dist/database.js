import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
const timestampSchema = z.string().datetime({ offset: true });
function defaultMigrationsFolder() {
    const moduleDirectory = dirname(fileURLToPath(import.meta.url));
    const candidates = [
        resolve(moduleDirectory, "../drizzle"),
        resolve(process.cwd(), "packages/db/drizzle"),
        resolve(process.cwd(), "../../packages/db/drizzle"),
    ];
    return candidates.find((candidate) => existsSync(candidate)) ?? candidates[0];
}
export class PersistenceNotFoundError extends Error {
    code = "PERSISTENCE_NOT_FOUND";
    constructor(entity, id) {
        super(`${entity} '${id}' was not found.`);
        this.name = "PersistenceNotFoundError";
    }
}
export function openHarikosDatabase(options) {
    console.warn('[AI Studio] Database not connected — using mock');
    const createMockRepo = () => new Proxy({}, {
        get: (_, prop) => {
            if (typeof prop === 'string' && prop.startsWith('list'))
                return () => [];
            if (typeof prop === 'string' && (prop.startsWith('find') || prop === 'get'))
                return () => null;
            return (data) => data ?? {};
        }
    });
    return {
        projects: createMockRepo(),
        sources: createMockRepo(),
        events: createMockRepo(),
        claims: createMockRepo(),
        evidence: createMockRepo(),
        contradictions: createMockRepo(),
        resolutions: createMockRepo(),
        memories: createMockRepo(),
        agentSessions: createMockRepo(),
        outcomes: createMockRepo(),
        contextPacks: createMockRepo(),
        close: () => { },
    };
}
//# sourceMappingURL=database.js.map