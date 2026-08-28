import { NextResponse } from "next/server";

import {
  createCloudProject,
  createCloudProjectSchema,
  listCloudProjects,
  RepositoryAuthorizationError,
} from "../../../lib/cloud-projects";
import { getAuthIdentity } from "../../../lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getAuthIdentity();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  const cloud = await listCloudProjects(session);
  return NextResponse.json({
    projects: cloud.map((project) => ({ ...project, mode: "github" })),
  });
}

export async function POST(request: Request) {
  const session = await getAuthIdentity();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  try {
    const body: unknown = await request.json();
    const project = await createCloudProject(
      session,
      createCloudProjectSchema.parse(body),
    );
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    const invalidInput = error instanceof Error && error.name === "ZodError";
    const unauthorized = error instanceof RepositoryAuthorizationError;
    return NextResponse.json(
      {
        error: invalidInput
          ? "Repository selection is invalid."
          : unauthorized
            ? error.message
            : "Project creation failed.",
      },
      { status: invalidInput ? 400 : unauthorized ? 403 : 500 },
    );
  }
}
