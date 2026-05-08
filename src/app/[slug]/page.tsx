import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

// Professional Shortlinker Engine
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  try {
    const supabase = await createClient();
    const { data: link } = await supabase
      .from("links")
      .select("*")
      .eq("short_slug", slug)
      .single();

    if (!link) return { title: "Link Not Found" };

    const title = link.meta_title || link.internal_name || "LinkFocus";
    const description = link.meta_description || "You are being redirected...";
    const imageUrl = link.meta_image_url || "";
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://short-linker-site.vercel.app";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${baseUrl}/${slug}`,
        siteName: "LinkFocus",
        type: "website",
        images: imageUrl ? [{ url: imageUrl }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: imageUrl ? [imageUrl] : [],
      },
    };
  } catch (e) {
    return { title: "Redirecting..." };
  }
}

export default async function SlugRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const supabase = await createClient();
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";

  const { data: link } = await supabase
    .from("links")
    .select("id, original_url")
    .eq("short_slug", slug)
    .single();

  if (!link) notFound();

  // Async logging (don't wait for this to redirect)
  const forwardedFor = headersList.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(',')[0] : "127.0.0.1";
  const country = headersList.get("x-vercel-ip-country") || "Unknown";
  
  supabase.from("clicks").insert({
    link_id: link.id,
    ip_address: ip,
    country,
    referrer: headersList.get("referer") || "",
    device_type: /mobile/i.test(userAgent) ? "mobile" : "desktop",
  }).then(() => {});

  // --- THE PERMANENT SOLUTION ---
  // 1. We return a raw HTML structure that bypasses Next.js standard layout for this specific route.
  // 2. This ensures that the crawler sees the Meta Tags in the <head> before the JS redirect kicks in.
  return (
    <div style={{ background: "#050510", color: "white", display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "sans-serif" }}>
      <script dangerouslySetInnerHTML={{ __html: `window.location.href = "${link.original_url}";` }} />
      <div style={{ textAlign: "center" }}>
        <div style={{ width: "40px", height: "40px", border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#2dd4bf", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
        <p style={{ opacity: 0.6 }}>Redirecting to your destination...</p>
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
      </div>
    </div>
  );
}
