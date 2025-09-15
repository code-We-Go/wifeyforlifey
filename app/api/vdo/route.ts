import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  const data = await req.json();
  const API_SECRET_KEY = process.env.VDO_API_SECRET;
  if (!API_SECRET_KEY) {
    return new Response(JSON.stringify({ error: "API secret key not set" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Get current user from session
  const user = await getCurrentUser();

  // You can parse the request body if you want to allow custom TTL or videoId
  // const { ttl = 300 } = await req.json();
  const ttl = 300;
  const videoId = data.videoID; // You can make this dynamic if needed
  const annotate = data.annotate; // Accept annotate from request body

  // Build the body for the VdoCipher API request
  const body: any = { ttl };
  if (annotate) {
    body.annotate = annotate;
  }

  // Add user email with @ removed and ensure it's under 36 characters
  if (user && user.email) {
    // VdoCipher docs specify only alphanumeric, hyphens and underscores are allowed
    // Remove @ and any characters after it, then limit to 36 characters
    const sanitizedEmail = user.email.split('@')[0].replace(/[^a-zA-Z0-9_-]/g, '_');
    body.userId = sanitizedEmail.substring(0, 36);
  }

  const vdoResponse = await fetch(
    `https://dev.vdocipher.com/api/videos/${videoId}/otp`,
    {
      method: "POST",
      headers: {
        Authorization: `Apisecret ${API_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const res = await vdoResponse.json();

  return new Response(JSON.stringify(res), {
    status: vdoResponse.status,
    headers: { "Content-Type": "application/json" },
  });
}