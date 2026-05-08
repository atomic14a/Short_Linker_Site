"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface LinkStat {
  id: string;
  internal_name: string;
  short_slug: string;
  click_count: number;
}

export default function AnalyticsOverviewPage() {
  const [links, setLinks] = useState<LinkStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: linksData } = await supabase
        .from("links")
        .select("id, internal_name, short_slug")
        .eq("user_id", user.id);

      if (linksData) {
        const stats = await Promise.all(
          linksData.map(async (link) => {
            const { count } = await supabase
              .from("clicks")
              .select("*", { count: "exact", head: true })
              .eq("link_id", link.id);
            return { ...link, click_count: count || 0 };
          })
        );
        
        setLinks(stats.sort((a, b) => b.click_count - a.click_count));
      }
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
        <p className="text-sm text-white/50 mt-1">Select a link to view detailed statistics</p>
      </div>

      <div className="space-y-4">
        {links.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No data yet</h3>
            <p className="text-sm text-white/40 mb-6">Create links and share them to start collecting analytics.</p>
            <Link href="/dashboard?action=create">
              <Button>Create a Link</Button>
            </Link>
          </Card>
        ) : (
          links.map((link) => (
            <Link key={link.id} href={`/dashboard/analytics/${link.id}`}>
              <Card className="hover:border-teal-500/30 transition-colors group cursor-pointer border-white/[0.06] bg-white/[0.02]">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-teal-400 transition-colors">
                      {link.internal_name}
                    </h3>
                    <p className="text-xs text-white/40 mt-1">/{link.short_slug}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white/[0.04] px-3 py-1.5 rounded-lg border border-white/[0.06]">
                    <span className="text-lg font-bold text-white">{link.click_count}</span>
                    <span className="text-xs text-white/40">clicks</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
