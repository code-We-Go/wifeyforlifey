import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    console.log('TikTok embed request for URL:', url);

    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // Validate that it's a TikTok URL
    if (!url.includes('tiktok.com')) {
      return NextResponse.json(
        { error: 'Invalid TikTok URL' },
        { status: 400 }
      );
    }

    // Check if it's a photo post
    const photoMatch = url.match(/\/photo\/(\d+)/);
    if (!photoMatch) {
      return NextResponse.json(
        { error: 'This endpoint only supports TikTok photo posts' },
        { status: 400 }
      );
    }

    try {
      // Fetch the TikTok page to extract metadata and image
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });

      if (response.ok) {
        const html = await response.text();
        
        // Extract metadata from the HTML
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descriptionMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i) || 
                                 html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i);
        const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i);
        const authorMatch = html.match(/<meta[^>]*name="author"[^>]*content="([^"]*)"[^>]*>/i) ||
                           html.match(/@([^"'\s]+)/);

        const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : 'TikTok Photo Post';
        const description = descriptionMatch ? descriptionMatch[1].trim() : '';
        const imageUrl = imageMatch ? imageMatch[1].trim() : '';
        const author = authorMatch ? (authorMatch[1] || '').trim() : 'TikTok User';

        console.log('Extracted metadata:', { title, description, imageUrl, author });

        // Create a rich embed with the actual photo content
        const embedData = {
          version: "1.0",
          type: "rich",
          title: title,
          description: description,
          author_name: author,
          provider_name: "TikTok",
          provider_url: "https://www.tiktok.com",
          thumbnail_url: imageUrl,
          html: `
            <div style="background-color: #fbf3e0; border-radius: 12px; padding: 20px; border: 2px solid rgba(139, 69, 19, 0.2); max-width: 500px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              ${imageUrl ? `
                <div style="margin-bottom: 16px; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                  <img src="${imageUrl}" alt="${title}" style="width: 100%; height: auto; display: block; max-height: 400px; object-fit: cover;" onload="this.style.opacity=1" style="opacity: 0; transition: opacity 0.3s;" />
                </div>
              ` : ''}
              <div style="text-align: left;">
                <h3 style="color: #8b4513; margin: 0 0 8px 0; font-size: 18px; font-weight: 600; line-height: 1.4;">${title}</h3>
                ${description ? `<p style="color: #8b4513; margin: 0 0 12px 0; font-size: 14px; line-height: 1.5; opacity: 0.8;">${description}</p>` : ''}
                <p style="color: #8b4513; margin: 0 0 16px 0; font-size: 13px; opacity: 0.7; font-weight: 500;">by ${author}</p>
                <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; padding: 12px 20px; background-color: #8b4513; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; transition: all 0.2s; box-shadow: 0 2px 4px rgba(139, 69, 19, 0.3); hover:background-color: #6d3410;">
                  <svg style="margin-right: 8px; width: 18px; height: 18px;" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
                  </svg>
                  View Full Post on TikTok
                </a>
              </div>
            </div>
          `
        };

        return NextResponse.json(embedData);
      }
    } catch (fetchError) {
      console.error('Error fetching TikTok page:', fetchError);
    }

    // Fallback: Create a basic embed without image
    const fallbackEmbedData = {
      version: "1.0",
      type: "rich",
      title: "TikTok Photo Post",
      author_name: "TikTok User",
      provider_name: "TikTok",
      provider_url: "https://www.tiktok.com",
      html: `
        <div style="background-color: #fbf3e0; border-radius: 12px; padding: 20px; border: 2px solid rgba(139, 69, 19, 0.2); max-width: 400px; margin: 0 auto; text-align: center; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="margin-bottom: 16px;">
            <svg style="width: 48px; height: 48px; color: #8b4513; opacity: 0.7;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
            </svg>
          </div>
          <h3 style="color: #8b4513; margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">TikTok Photo Post</h3>
          <p style="color: #8b4513; margin: 0 0 16px 0; font-size: 14px; opacity: 0.8;">Check out this photo post on TikTok</p>
          <a href="${url}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; padding: 12px 20px; background-color: #8b4513; color: white; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 500; transition: all 0.2s; box-shadow: 0 2px 4px rgba(139, 69, 19, 0.3);">
            <svg style="margin-right: 8px; width: 18px; height: 18px;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43V7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.43z"/>
            </svg>
            View on TikTok
          </a>
        </div>
      `
    };

    console.log('Returning fallback embed data for photo post');
    return NextResponse.json(fallbackEmbedData);

    // Original oEmbed approach (commented out for now)
    /*
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(oembedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      console.error(`TikTok oEmbed API returned ${response.status}: ${response.statusText}`);
      throw new Error(`TikTok oEmbed API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('TikTok oEmbed response:', data);

    // Apply custom styling to the HTML if it exists
    if (data.html) {
      data.html = data.html.replace(
        '<blockquote',
        '<blockquote style="background-color: #fbf3e0; border-radius: 8px; padding: 16px; border: 2px solid rgba(139, 69, 19, 0.2);"'
      );
    }

    return NextResponse.json(data);
    */
  } catch (error) {
    console.error('TikTok oEmbed error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch TikTok embed data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}