import { realpathSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
export class ProjectRootError extends Error {
    code;
    constructor(code, message, options) {
        super(message, options);
        this.code = code;
        this.name = "ProjectRootError";
    }
}
export function findProjectRoot(startPath = process.cwd()) {
    let workingDirectory;
    try {
        const resolvedStart = resolve(startPath);
        workingDirectory = statSync(resolvedStart).isDirectory()
            ? resolvedStart
            : dirname(resolvedStart);
    }
    catch (error) {
        throw new ProjectRootError("INVALID_START_PATH", `Cannot inspect '${startPath}' because it does not exist or is inaccessible.`, { cause: error });
    }
    const result = spawnSync("git", ["-C", workingDirectory, "rev-parse", "--show-toplevel"], {
        encoding: "utf8",
        windowsHide: true,
        stdio: ["ignore", "pipe", "pipe"],
    });
    if (result.error) {
        const nodeError = result.error;
        if (nodeError.code === "ENOENT") {
            throw new ProjectRootError("GIT_UNAVAILABLE", "Git is required to initialize HARIKOS but was not found on PATH.", { cause: result.error });
        }
        throw new ProjectRootError("NOT_GIT_REPOSITORY", `Git could not inspect '${workingDirectory}'.`, { cause: result.error });
    }
    if (result.status !== 0) {
        throw new ProjectRootError("NOT_GIT_REPOSITORY", `'${workingDirectory}' is not inside a Git repository.`);
    }
    const reportedRoot = result.stdout.trim();
    if (!reportedRoot) {
        throw new ProjectRootError("INVALID_GIT_ROOT", "Git returned an empty repository root.");
    }
    try {
        return realpathSync.native(reportedRoot);
    }
    catch (error) {
        throw new ProjectRootError("INVALID_GIT_ROOT", `Git reported an inaccessible repository root: '${reportedRoot}'.`, { cause: error });
    }
}
//# sourceMappingURL=project-root.js.map