import { contextPackSchema, } from "./domain.js";
const importantSubjects = new Set([
    "framework",
    "language",
    "authentication",
    "database",
    "orm",
    "deployment",
]);
function taskWords(task) {
    return new Set(task
        .toLowerCase()
        .split(/[^a-z0-9]+/u)
        .filter((word) => word.length > 2));
}
function relevance(claim, words) {
    const haystack = `${claim.category} ${claim.subject} ${claim.predicate} ${claim.value}`.toLowerCase();
    const matches = [...words].filter((word) => haystack.includes(word)).length;
    return matches * 10 + (importantSubjects.has(claim.subject) ? 3 : 0) + claim.confidence;
}
function formatContextText(snapshot, task, truths, constraints) {
    const lines = [
        "CURRENT PROJECT CONTEXT",
        "",
        `Project: ${snapshot.repository.name}`,
        `Task: ${task}`,
        `Verified against: ${snapshot.repository.headSha.slice(0, 12)}`,
        "",
        "CURRENT TRUTH",
        ...truths.flatMap((claim) => [
            `${claim.category} / ${claim.subject}`,
            `${claim.value} (${claim.status.toUpperCase()}, ${Math.round(claim.confidence * 100)}%)`,
            `Evidence: ${claim.evidence.slice(0, 3).map((item) => item.path).join(", ")}`,
            "",
        ]),
    ];
    if (constraints.length > 0) {
        lines.push("CONSTRAINTS", ...constraints.map((constraint) => `- ${constraint}`), "");
    }
    const recentChange = snapshot.changes.at(-1);
    if (recentChange) {
        lines.push("RECENT CHANGE", recentChange.summary, "");
    }
    return lines.join("\n").trim();
}
export function composeContextPack(snapshot, task, clock = () => new Date(), memories = []) {
    const normalizedTask = task.trim();
    if (!normalizedTask) {
        throw new Error("A task is required to prepare agent context.");
    }
    const words = taskWords(normalizedTask);
    const truths = snapshot.truths
        .filter((claim) => claim.status === "verified" || claim.status === "likely")
        .sort((left, right) => relevance(right, words) - relevance(left, words))
        .slice(0, 8);
    const constraints = [];
    if (truths.some((claim) => claim.value === "Supabase Auth") &&
        /auth|oauth|session|login|user/iu.test(normalizedTask)) {
        constraints.push("Keep service-role credentials on the server.");
    }
    const relevantFiles = [
        ...new Set(truths.flatMap((claim) => claim.evidence.map((item) => item.path))),
    ].slice(0, 12);
    const text = formatContextText(snapshot, normalizedTask, truths, constraints);
    const taskMemoryWords = taskWords(normalizedTask);
    const relevantMemories = memories
        .filter((memory) => memory.status !== "archived" && memory.status !== "superseded")
        .filter((memory) => {
        const haystack = `${memory.type} ${memory.content}`.toLowerCase();
        return [...taskMemoryWords].some((word) => haystack.includes(word)) || ["constraint", "decision", "failed_attempt", "outcome"].includes(memory.type);
    })
        .slice(0, 8);
    const memoryText = relevantMemories.length
        ? `\n\nMEMORY\n${relevantMemories.map((memory) => `- ${memory.type}: ${memory.content}`).join("\n")}`
        : "";
    return contextPackSchema.parse({
        task: normalizedTask,
        generatedAt: clock().toISOString(),
        projectName: snapshot.repository.name,
        truths,
        recentChanges: snapshot.changes.slice(-3),
        constraints,
        relevantFiles,
        tokenEstimate: Math.ceil(text.length / 4),
        text: `${text}${memoryText}`,
    });
}
export function explainProjectTruth(snapshot, question, mode = "simple") {
    const words = taskWords(question);
    const matches = snapshot.truths
        .filter((claim) => claim.status === "verified" || claim.status === "likely")
        .sort((left, right) => relevance(right, words) - relevance(left, words))
        .slice(0, mode === "simple" ? 3 : 6);
    if (matches.length === 0) {
        return "HARIKOS does not have enough verified evidence to answer that yet.";
    }
    if (mode === "evidence") {
        return matches
            .map((claim) => `${claim.subject}: ${claim.value}\n${claim.evidence
            .map((item) => `- ${item.path}${item.lineStart ? `:${item.lineStart}` : ""}`)
            .join("\n")}`)
            .join("\n\n");
    }
    if (mode === "technical") {
        return matches
            .map((claim) => `${claim.subject} uses ${claim.value} in ${claim.scope ?? "the project"} (${Math.round(claim.confidence * 100)}% confidence, ${claim.evidence.length} evidence sources).`)
            .join(" ");
    }
    return matches.map((claim) => `${claim.subject}: ${claim.value}.`).join(" ");
}
//# sourceMappingURL=context-pack.js.map