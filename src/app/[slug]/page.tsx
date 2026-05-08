import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

// Direct Supabase client for server-side fetching
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Detect social media crawlers
function isCrawler(ua: string): boolean {
  const bots = [
    'facebookexternalhit',
    'Facebot',
    'WhatsApp',
    'Twitterbot',
    'LinkedInBot',
    'TelegramBot',
    'Slackbot',
    'Discordbot',
    'Googlebot',
    'bingbot',
    'Pinterestbot',
    'redditbot',
    'applebot',
  ];
  return bots.some(bot => ua.toLowerCase().includes(bot.toLowerCase()));
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();

  try {
    const { data: link, error } = await supabase
      .from("links")
      .select("*")
      .eq("short_slug", slug)
      .single();

    if (error || !link) {
      return {
        title: "Link Not Found — LinkFocus",
      };
    }

    const title = link.meta_title || link.internal_name || "LinkFocus";
    const description = link.meta_description || "Shared via LinkFocus URL Shortener";
    const imageUrl = link.meta_image_url || "";
    const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://short-linker-site.vercel.app").replace(/\/+$/, "");
    const canonicalUrl = `${baseUrl}/${slug}`;

    return {
      title,
      description,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: `/${slug}`,
      },
      openGraph: {
        title,
        description,
        url: canonicalUrl,
        siteName: "LinkFocus",
        images: imageUrl ? [{ url: imageUrl }] : [],
        type: "website",
      },
      twitter: {
        card: imageUrl ? "summary_large_image" : "summary",
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  } catch (err) {
    console.error("Metadata error:", err);
    return {
      title: "LinkFocus — Smart URL Management",
    };
  }
}

export default async function SlugPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = getSupabase();
  const headerList = await headers();
  const userAgent = headerList.get("user-agent") || "";

  // Fetch the link
  const { data: link, error } = await supabase
    .from("links")
    .select("*")
    .eq("short_slug", slug)
    .single();

  if (error || !link) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-muted-foreground">This link doesn't exist or has been removed.</p>
        <a href="/" className="mt-6 text-primary hover:underline font-medium">Return to LinkFocus</a>
      </div>
    );
  }

  // Log the click (fire-and-forget in the background)
  const forwardedFor = headerList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
  const country = headerList.get("x-vercel-ip-country") || "Unknown";

  // Using a separate task for tracking so it doesn't block the redirect
  const trackClick = async () => {
    try {
      await supabase.from("clicks").insert({
        link_id: link.id,
        ip_address: ip,
        country,
        referrer: headerList.get("referer") || "",
        device_type: /mobile/i.test(userAgent) ? "mobile" : "desktop",
      });
    } catch (e) {
      console.error("Tracking error:", e);
    }
  };

  // If it's a crawler, we just show a "Redirecting..." page so it stays on 200 OK and reads Metadata
  if (isCrawler(userAgent)) {
    // We trigger tracking too
    await trackClick();
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <h1 className="text-xl font-medium mb-2">Redirecting you to your destination...</h1>
        <p className="text-muted-foreground text-sm">If you are not redirected automatically, <a href={link.original_url} className="text-primary hover:underline">click here</a>.</p>
        
        {/* Fallback meta refresh for non-JS bots that might follow it */}
        <meta http-equiv="refresh" content={`0;url=${link.original_url}`} />
      </div>
    );
  }

  // For humans, track and redirect immediately
  await trackClick();
  redirect(link.original_url);
}
