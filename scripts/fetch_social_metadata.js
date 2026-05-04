const https = require('https');
const fs = require('fs');

const links = [
  "https://vt.tiktok.com/ZSayBAQy8",
  "https://www.instagram.com/reel/DNlr8yxIH8B/?igsh=djFic3RsNWpmM2dw",
  "https://vt.tiktok.com/ZSayBAJUW/",
  "https://vt.tiktok.com/ZSayBB8rP/",
  "https://vt.tiktok.com/ZSayBUeKU/",
  "https://vt.tiktok.com/ZSayBMouU/",
  "https://vt.tiktok.com/ZSayBQf83/",
  "https://vt.tiktok.com/ZSayBtUJL/",
  "https://vt.tiktok.com/ZSayBggbH/",
  "https://vt.tiktok.com/ZSayBaLcj/",
  "https://vt.tiktok.com/ZSayBQeNR/",
  "https://vt.tiktok.com/ZSayBVFrx/",
  "https://vt.tiktok.com/ZSayBqV17/",
  "https://vt.tiktok.com/ZSayBvMWV/",
  "https://vt.tiktok.com/ZSayBX1cw/",
  "https://vt.tiktok.com/ZSayBbR1d/",
  "https://vt.tiktok.com/ZSayBuFTX/",
  "https://vt.tiktok.com/ZSayBvrqG/",
  "https://www.instagram.com/reel/DTnIoPdE5uP/?igsh=YTQ0cGNnaW52MHEw",
  "https://www.instagram.com/reel/DTQxBLDk4Xx/?igsh=MXRyejJ1eGh1YnY0cA==",
  "https://www.instagram.com/reel/DSqXExhDIg8/?igsh=ODNodGVxaWRueXo1",
  "https://www.instagram.com/reel/DR5NFdgE27Y/?igsh=dWI0czZ0YXlyd3Fn",
  "https://www.instagram.com/reel/DNvUXXYZrQd/?igsh=MThtcHVwcDB5a3hsaw==",
  "https://www.instagram.com/reel/DPJIbXIk6lL/?igsh=MTlvNTg3Y3Jmbmptcw=="
];

async function processLink(url) {
  let finalUrl = url;
  let videoId = null;
  let thumb = null;
  
  try {
      if (url.includes('instagram.com/reel/')) {
        const match = url.match(/\/reel\/([^\/]+)\//);
        if (match) {
            videoId = match[1];
            thumb = `https://www.instagram.com/p/${match[1]}/media/?size=l`;
        }
      } else if (url.includes('tiktok.com')) {
          finalUrl = await resolveRedirect(url);
          // Extract Video ID from final URL
          // https://www.tiktok.com/@username/video/732...
          const videoMatch = finalUrl.match(/\/video\/(\d+)/);
          if (videoMatch) {
              videoId = videoMatch[1];
          }
          
          const oembedUrl = `https://www.tiktok.com/oembed?url=${finalUrl}`;
          const data = await fetchJson(oembedUrl);
          if (data && data.thumbnail_url) {
              thumb = data.thumbnail_url;
          }
      }
  } catch (e) {
      // console.error(e);
  }

  return { original: url, finalUrl, videoId, thumb };
}

function resolveRedirect(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                resolve(res.headers.location);
            } else {
                resolve(url);
            }
        });
        req.on('error', reject);
    });
}

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null);
                }
            });
        }).on('error', reject);
    });
}

(async () => {
    const promises = links.map(processLink);
    const resultsArray = await Promise.all(promises);
    
    fs.writeFileSync('social_metadata.json', JSON.stringify(resultsArray, null, 2));
    console.log("Done.");
})();
