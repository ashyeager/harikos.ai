import { type HarikosStore } from "./contracts.js";
export interface OpenHarikosDatabaseOptions {
    databasePath: string;
    migrationsFolder?: string;
    clock?: () => Date;
    idFactory?: () => string;
}
export declare class PersistenceNotFoundError extends Error {
    readonly code = "PERSISTENCE_NOT_FOUND";
    constructor(entity: string, id: string);
}
export declare function openHarikosDatabase(options: OpenHarikosDatabaseOptions): HarikosStore;
//# sourceMappingURL=database.d.ts.map