export async function POST(req: Request) {
    const data = await req.json();
  const API_SECRET_KEY = process.env.VDO_API_SECRET;
  if (!API_SECRET_KEY) {
    return new Response(JSON.stringify({ error: 'API secret key not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

  const vdoResponse = await fetch(`https://dev.vdocipher.com/api/videos/${videoId}/otp`, {
    method: 'POST',
    headers: {
      'Authorization': `Apisecret ${API_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const res = await vdoResponse.json();

  return new Response(JSON.stringify(res), {
    status: vdoResponse.status,
    headers: { 'Content-Type': 'application/json' },
  });
}