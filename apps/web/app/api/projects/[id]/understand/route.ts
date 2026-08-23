import { explainProjectTruth } from "@harikos/core";
import { NextResponse } from "next/server";
import { z } from "zod";

import { projectSnapshot } from "../../../../../lib/project-data";

export const runtime = "nodejs";

const requestSchema = z.object({
  question: z.string().trim().min(3).max(500),
  mode: z.enum(["simple", "technical", "evidence"]).default("simple"),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const input = requestSchema.parse(await request.json());
    const snapshot = await projectSnapshot(id);
    if (!snapshot) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({
      answer: explainProjectTruth(snapshot, input.question, input.mode),
    });
  } catch (error) {
    const invalidInput = error instanceof Error && error.name === "ZodError";
    return NextResponse.json(
      { error: invalidInput ? "A valid question and answer mode are required." : "Question could not be answered." },
      { status: invalidInput ? 400 : 500 },
    );
  }
}
