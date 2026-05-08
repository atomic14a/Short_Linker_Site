import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

// Helper to parse basic device info from user agent
function parseUserAgent(ua: string) {
  const uaLower = ua.toLowerCase();
  let device = "Desktop";
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(uaLower)) {
    device = "Tablet";
  } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(uaLower)) {
    device = "Mobile";
  }
  return device;
}

// Generate dynamic metadata for the [slug] route
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  console.log(`[Metadata] Scraping link for slug: ${slug}`);

  try {
    const supabase = await createClient();
    const { data: link, error } = await supabase
      .from("links")
      .select("*")
      .eq("short_slug", slug)
      .single();

    if (error || !link) {
      console.warn(`[Metadata] Link not found or Supabase error for slug: ${slug}`, error);
      return { title: "Link Not Found" };
    }

    const title = link.meta_title || link.internal_name || "LinkFocus Redirect";
    const description = link.meta_description || "You are being redirected...";
    const imageUrl = link.meta_image_url || "";
    // Fallback to a default if NEXT_PUBLIC_APP_URL is missing
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://shortlink.novatixdigi.online";
    const url = `${baseUrl}/${slug}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        siteName: "LinkFocus",
        type: "website",
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630 }] : [],
      },
      twitter: {
        card: imageUrl ? "summary_large_image" : "summary",
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (err) {
    console.error(`[Metadata] Critical error in generateMetadata for slug: ${slug}`, err);
    return { title: "LinkFocus" };
  }
}

// Main page component for the redirect
export default async function SlugRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = await createClient();
  const headersList = await headers();

  const { data: link } = await supabase
    .from("links")
    .select("id, original_url")
    .eq("short_slug", slug)
    .single();

  if (!link) {
    notFound();
  }

  // --- Analytics Collection ---
  const userAgent = headersList.get("user-agent") || "";
  const referrer = headersList.get("referer") || "";
  
  // Forwarded for header usually contains the real IP in production
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(',')[0] : "127.0.0.1";
  
  // Vercel specific headers for geography
  const country = headersList.get("x-vercel-ip-country") || "Unknown";
  
  const device = parseUserAgent(userAgent);

  // We do not wait for this insert to complete before redirecting to keep it fast.
  // Using an un-awaited promise for fire-and-forget logging.
  supabase.from("clicks").insert({
    link_id: link.id,
    ip_address: ip, // In a real app, hash this for privacy
    country,
    referrer,
    device_type: device,
  }).then(({error}) => {
     if(error) console.error("Error logging click:", error);
  });

  // Execute client-side redirect.
  // We use a script for immediate redirect and a meta refresh in the body for fallback.
  return (
    <div className="bg-[#050510] text-white flex items-center justify-center min-h-screen font-sans">
      <meta httpEquiv="refresh" content={`0;url=${link.original_url}`} />
      <div className="text-center animate-pulse">
        <div className="w-12 h-12 rounded-full border-4 border-teal-500/30 border-t-teal-400 animate-spin mx-auto mb-4" />
        <p className="text-white/60">Redirecting to destination...</p>
        <script dangerouslySetInnerHTML={{ __html: `window.location.replace("${link.original_url}");` }} />
      </div>
    </div>
  );
}
