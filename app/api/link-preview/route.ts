import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Basic validation
    if (!targetUrl.startsWith('http')) {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    try {
      const urlObj = new URL(targetUrl);
      const hostname = urlObj.hostname;
      // Basic SSRF protection
      if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)) {
        return NextResponse.json({ error: "Access to local network is forbidden" }, { status: 403 });
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch URL" }, { status: 400 });
    }

    const html = await res.text();
    const $ = cheerio.load(html);
    
    // Extract Metadata using Cheerio
    const getMeta = (prop: string, nameAttr: string = "property") => 
      $(`meta[${nameAttr}="${prop}"]`).attr("content") || 
      $(`meta[${nameAttr}="${prop.replace('og:', 'twitter:')}"]`).attr("content");

    const title = getMeta("og:title") || $("title").text() || null;
    const description = getMeta("og:description") || getMeta("description", "name") || null;
    const siteName = getMeta("og:site_name") || null;
    const locale = getMeta("og:locale") || null;

    // Support multiple images
    const images: { url: string, width?: string, height?: string }[] = [];
    
    $('meta[property="og:image"], meta[property="twitter:image"], meta[property="og:image:url"]').each((_, el) => {
      const url = $(el).attr("content");
      if (url) {
        // Find adjacent properties if any (naively, just take them if they exist next to it, but standard OG puts them as separate meta tags)
        images.push({ url });
      }
    });

    // Deduplicate images
    const uniqueImages = Array.from(new Set(images.map(i => i.url))).map(url => ({ url }));

    let image = uniqueImages.length > 0 ? uniqueImages[0].url : null;

    if (!image) {
      const iconUrl = 
        $('link[rel="apple-touch-icon"]').attr("href") || 
        $('link[rel="icon"]').attr("href") || 
        $('link[rel="shortcut icon"]').attr("href");
      
      if (iconUrl) {
        try {
          image = new URL(iconUrl, targetUrl).href;
          uniqueImages.push({ url: image });
        } catch (e) {
        }
      } else {
        try {
          image = new URL('/favicon.ico', targetUrl).href;
          uniqueImages.push({ url: image });
        } catch (e) {}
      }
    }

    // Determine domain for source
    const domain = new URL(targetUrl).hostname.replace('www.', '');

    return NextResponse.json({
      url: targetUrl,
      title: title ? title.trim() : null,
      description: description ? description.trim() : null,
      image,
      images: uniqueImages,
      siteName,
      locale,
      domain
    });
  } catch (err) {
    console.error("Link preview error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
