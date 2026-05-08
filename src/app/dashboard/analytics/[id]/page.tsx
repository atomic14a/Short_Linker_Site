"use client";

import { useState, useEffect, use } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, MousePointerClick, Globe, MonitorSmartphone, Calendar, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format, subDays, startOfDay } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface ClickData {
  id: string;
  click_timestamp: string;
  country: string;
  device_type: string;
  referrer: string;
}

interface LinkData {
  id: string;
  internal_name: string;
  short_slug: string;
}

const COLORS = ['#14b8a6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-strong rounded-lg px-3 py-2 text-xs border border-white/10 shadow-xl">
        <p className="font-semibold text-white mb-1">{label}</p>
        <p className="text-teal-400">
          Clicks: <span className="font-bold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function LinkAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [loading, setLoading] = useState(true);
  const [link, setLink] = useState<LinkData | null>(null);
  const [clicks, setClicks] = useState<ClickData[]>([]);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: linkData } = await supabase
        .from("links")
        .select("id, internal_name, short_slug")
        .eq("id", resolvedParams.id)
        .eq("user_id", user.id)
        .single();

      if (linkData) {
        setLink(linkData);
        
        let dateFilter = new Date();
        if (timeRange === "24h") dateFilter = subDays(new Date(), 1);
        else if (timeRange === "7d") dateFilter = subDays(new Date(), 7);
        else if (timeRange === "30d") dateFilter = subDays(new Date(), 30);

        const { data: clicksData } = await supabase
          .from("clicks")
          .select("*")
          .eq("link_id", linkData.id)
          .gte("click_timestamp", dateFilter.toISOString());

        if (clicksData) setClicks(clicksData);
      }
      setLoading(false);
    };

    setLoading(true);
    fetchData();
  }, [resolvedParams.id, timeRange]);

  // Data processing for charts
  const getTimeSeriesData = () => {
    const data: Record<string, number> = {};
    const now = new Date();
    
    if (timeRange === "24h") {
      for (let i = 23; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 60 * 60 * 1000);
        data[format(d, "HA")] = 0;
      }
      clicks.forEach(c => {
        const d = new Date(c.click_timestamp);
        const k = format(d, "HA");
        if (data[k] !== undefined) data[k]++;
      });
    } else {
      const days = timeRange === "7d" ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = subDays(now, i);
        data[format(d, "MMM d")] = 0;
      }
      clicks.forEach(c => {
        const d = new Date(c.click_timestamp);
        const k = format(d, "MMM d");
        if (data[k] !== undefined) data[k]++;
      });
    }

    return Object.entries(data).map(([name, Clicks]) => ({ name, Clicks }));
  };

  const getDeviceData = () => {
    const data: Record<string, number> = { Desktop: 0, Mobile: 0, Tablet: 0, Other: 0 };
    clicks.forEach(c => {
      const dev = c.device_type || "Other";
      if (data[dev] !== undefined) data[dev]++;
      else data.Other++;
    });
    return Object.entries(data).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }));
  };

  const getCountryData = () => {
    const data: Record<string, number> = {};
    clicks.forEach(c => {
      const country = c.country || "Unknown";
      data[country] = (data[country] || 0) + 1;
    });
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  };

  const getReferrerData = () => {
    const data: Record<string, number> = {};
    clicks.forEach(c => {
      const ref = c.referrer || "Direct";
      // Simplify referrer domain
      let domain = ref;
      try {
        if (ref.startsWith('http')) domain = new URL(ref).hostname;
      } catch (e) { /* ignore */ }
      
      if (domain === "t.co") domain = "Twitter";
      if (domain.includes("facebook.com")) domain = "Facebook";
      if (domain.includes("linkedin.com")) domain = "LinkedIn";
      
      data[domain] = (data[domain] || 0) + 1;
    });
    return Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-teal-400" /></div>;
  }

  if (!link) {
    return <div>Link not found</div>;
  }

  const timeSeriesData = getTimeSeriesData();
  const deviceData = getDeviceData();
  const countryData = getCountryData();
  const referrerData = getReferrerData();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/analytics">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            {link.internal_name}
          </h1>
          <p className="text-sm text-teal-400 font-mono mt-1">/{link.short_slug}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Card className="bg-white/[0.02] border-white/[0.06] p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <div className="text-xs text-white/50">Total Clicks (period)</div>
              <div className="text-2xl font-bold text-white">{clicks.length}</div>
            </div>
          </Card>
        </div>

        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="24h">24h</TabsTrigger>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {clicks.length === 0 ? (
        <Card className="p-12 text-center bg-white/[0.02] border-white/[0.06]">
          <Calendar className="w-8 h-8 text-white/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No clicks in this period</h3>
          <p className="text-sm text-white/40">Try selecting a wider date range or sharing your link more.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <Card className="lg:col-span-3 bg-white/[0.02] border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-sm text-white/70">Click Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="rgba(255,255,255,0.3)" 
                      fontSize={12} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.3)" 
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="Clicks" 
                      stroke="#14b8a6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorClicks)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Device Types */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-sm text-white/70 flex items-center gap-2">
                <MonitorSmartphone className="w-4 h-4" /> Device Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(10,10,26,0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {deviceData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-white/60">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Locations */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-sm text-white/70 flex items-center gap-2">
                <Globe className="w-4 h-4" /> Top Locations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {countryData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 text-center text-xs text-white/40">{index + 1}</div>
                      <span className="text-sm text-white font-medium">{entry.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-teal-400">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Referrers */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-sm text-white/70 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Top Referrers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referrerData.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="w-6 text-center text-xs text-white/40">{index + 1}</div>
                      <span className="text-sm text-white font-medium truncate max-w-[150px]">{entry.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-cyan-400">{entry.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
