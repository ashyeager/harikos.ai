// Compatibility exports for the existing web app. The frontend uses local demo data
// when cloud persistence is not configured, so these remain inert until a real schema
// is connected.
const cloudTable = {};
export const cloudSchema = {};
export const cloudUsers = cloudTable;
export const cloudProjects = cloudTable;
export const cloudRepositories = cloudTable;
export const cloudRepositoryInstallations = cloudTable;
export const cloudScans = cloudTable;
export const cloudProjectChanges = cloudTable;
export const cloudEvidence = cloudTable;
export const cloudClaims = cloudTable;
export const cloudContradictions = cloudTable;
export const cloudResolutions = cloudTable;
export const cloudMemories = cloudTable;
export const cloudAgentConnections = cloudTable;
export const cloudAgentSessions = cloudTable;
export const cloudOutcomes = cloudTable;
export const cloudContextPacks = cloudTable;
export const cloudSubscriptions = cloudTable;
//# sourceMappingURL=cloud-schema.js.map