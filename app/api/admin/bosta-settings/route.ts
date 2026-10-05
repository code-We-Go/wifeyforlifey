import { NextRequest, NextResponse } from "next/server";
import BostaAuthService from "@/app/services/bostaAuthService";

/**
 * Manage Bosta credentials stored in the DB (settings key "bosta_auth").
 * Protected by header:  x-admin-secret: <ADMIN_SECRET env>
 *
 * GET  /api/admin/bosta-settings              -> masked current settings
 * POST /api/admin/bosta-settings              -> body: { apiKey?, token?, refreshToken? }
 * POST /api/admin/bosta-settings?refresh=true -> force login & save a new token
 */

const mask = (v?: string) => (v ? `${v.slice(0, 6)}...${v.slice(-4)}` : null);

function authorized(req: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  return !!secret && req.headers.get("x-admin-secret") === secret;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const s = await BostaAuthService.getInstance().getSettings();
  return NextResponse.json({
    apiKey: mask(s.apiKey),
    token: mask(s.token),
    refreshToken: mask(s.refreshToken),
    tokenExpiry: s.tokenExpiry ? new Date(s.tokenExpiry).toISOString() : null,
  });
}

export async function POST(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const auth = BostaAuthService.getInstance();

  if (new URL(req.url).searchParams.get("refresh") === "true") {
    const token = await auth.forceTokenRefresh();
    return NextResponse.json({ success: !!token, token: mask(token) });
  }

  const body = await req.json().catch(() => ({}));
  const { apiKey, token, refreshToken } = body as Record<string, string | undefined>;
  if (!apiKey && !token && !refreshToken) {
    return NextResponse.json(
      { error: "Provide at least one of: apiKey, token, refreshToken" },
      { status: 400 }
    );
  }

  const cleanToken = token?.replace(/^Bearer\s+/i, "");
  let tokenExpiry: number | undefined;
  if (cleanToken) {
    try {
      const exp = JSON.parse(Buffer.from(cleanToken.split(".")[1], "base64").toString()).exp;
      tokenExpiry = exp ? exp * 1000 : undefined;
    } catch {}
  }

  const saved = await auth.saveSettings({
    apiKey: apiKey?.trim(),
    token: cleanToken,
    refreshToken,
    tokenExpiry,
  });

  return NextResponse.json({
    success: true,
    apiKey: mask(saved.apiKey),
    token: mask(saved.token),
    tokenExpiry: saved.tokenExpiry ? new Date(saved.tokenExpiry).toISOString() : null,
  });
}
