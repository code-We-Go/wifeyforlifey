import { NextResponse } from "next/server";
import { CEREMONY_OPTIONS, FEATURES } from "@/lib/wedding-timeline-config";

// Public endpoint — no auth required.
// Returns all static wizard configuration so mobile apps and
// third-party clients can consume the same data as the web app.
export async function GET() {
  return NextResponse.json(
    {
      ceremonyOptions: CEREMONY_OPTIONS,
      features: FEATURES,
    },
    { status: 200 }
  );
}
