import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use direct Supabase client (not the cookie-based one) to avoid all auth/session issues
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Detect social media crawlers
function isCrawler(ua: string): boolean {
  return /facebookexternalhit|Facebot|WhatsApp|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discord|Googlebot|bingbot|Pinterestbot/i.test(ua);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const supabase = getSupabase();
  const userAgent = request.headers.get("user-agent") || "";

  // Fetch the link from the database
  const { data: link, error } = await supabase
    .from("links")
    .select("*")
    .eq("short_slug", slug)
    .single();

  if (error || !link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  // --- Log the click (fire-and-forget) ---
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  const country = request.headers.get("x-vercel-ip-country") || "Unknown";

  supabase.from("clicks").insert({
    link_id: link.id,
    ip_address: ip,
    country,
    referrer: request.headers.get("referer") || "",
    device_type: /mobile/i.test(userAgent) ? "mobile" : "desktop",
  }).then(() => {});

  // --- CRAWLER PATH: Serve full HTML with OG meta tags ---
  if (isCrawler(userAgent)) {
    const title = link.meta_title || link.internal_name || "LinkFocus";
    const description = link.meta_description || "";
    const imageUrl = link.meta_image_url || "";
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://short-linker-site.vercel.app").replace(/\/+$/, "");
    const canonicalUrl = `${baseUrl}/${slug}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:site_name" content="LinkFocus" />
  ${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />` : ""}

  <!-- Twitter -->
  <meta name="twitter:card" content="${imageUrl ? "summary_large_image" : "summary"}" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />` : ""}

  <meta http-equiv="refresh" content="0;url=${escapeHtml(link.original_url)}" />
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(link.original_url)}">${escapeHtml(link.original_url)}</a></p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  // --- HUMAN PATH: Instant 302 redirect ---
  return NextResponse.redirect(link.original_url, { status: 302 });
}

// Utility to escape HTML special characters to prevent XSS
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
