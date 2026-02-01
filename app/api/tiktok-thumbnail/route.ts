import { NextRequest, NextResponse } from 'next/server';

// In-memory cache (consider using Redis for production)
const thumbnailCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoUrl = searchParams.get('url');

  if (!videoUrl) {
    return NextResponse.json({ error: 'Missing video URL' }, { status: 400 });
  }

  // Check cache first
  const cached = thumbnailCache.get(videoUrl);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return NextResponse.json({ thumbnail_url: cached.url });
  }

  try {
    // Fetch from TikTok oEmbed API
    const response = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(videoUrl)}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`TikTok API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.thumbnail_url) {
      // Cache the result
      thumbnailCache.set(videoUrl, {
        url: data.thumbnail_url,
        timestamp: Date.now(),
      });

      return NextResponse.json({ thumbnail_url: data.thumbnail_url });
    }

    return NextResponse.json({ error: 'No thumbnail found' }, { status: 404 });
  } catch (error) {
    console.error('Failed to fetch TikTok thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to fetch thumbnail' },
      { status: 500 }
    );
  }
}
