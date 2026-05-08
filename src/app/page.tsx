import Link from "next/link";
import {
  Link2,
  BarChart3,
  Share2,
  Zap,
  Shield,
  Globe,
  ArrowRight,
  Sparkles,
  MousePointerClick,
  ChevronRight,
  ExternalLink,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid opacity-30 pointer-events-none" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-teal-500/8 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-purple-500/5 via-transparent to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow duration-300">
              <Link2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white leading-tight">LinkFocus</span>
              <span className="text-[10px] text-white/40 leading-tight -mt-0.5">Smart Link Management</span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">How It Works</a>
            <a href="#analytics" className="text-sm text-white/60 hover:text-white transition-colors">Analytics</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-300 text-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            <span>Smart URL Management Platform</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 animate-slide-up">
            <span className="text-white">Shorten. Customize.</span>
            <br />
            <span className="gradient-text">Analyze.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up" style={{ animationDelay: "0.1s" }}>
            Create powerful shortened links with custom Open Graph metadata.
            Control exactly how your links appear on social media and track every click in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/auth/signup">
              <Button size="lg" className="text-base px-8">
                Start For Free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="text-base px-8">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Hero Visual */}
          <div className="mt-20 relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-teal-500/10 to-cyan-500/5 rounded-3xl blur-2xl" />
            <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-6 sm:p-8">
              {/* Browser Mock */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4 h-8 rounded-lg bg-white/5 border border-white/[0.06] flex items-center px-3">
                  <span className="text-xs text-white/30 font-mono">short-linker-site.vercel.app/my-link</span>
                </div>
              </div>
              
              {/* Preview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 text-left hover:border-teal-500/20 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-3 group-hover:bg-teal-500/20 transition-colors">
                    <Link2 className="w-5 h-5 text-teal-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">2,847</div>
                  <div className="text-sm text-white/40">Total Links</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 text-left hover:border-cyan-500/20 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3 group-hover:bg-cyan-500/20 transition-colors">
                    <MousePointerClick className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">148.5K</div>
                  <div className="text-sm text-white/40">Total Clicks</div>
                </div>
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-5 text-left hover:border-purple-500/20 transition-colors group">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 group-hover:bg-purple-500/20 transition-colors">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-white mb-1">42</div>
                  <div className="text-sm text-white/40">Countries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-500/5 text-teal-300 text-xs mb-4">
              <Zap className="w-3 h-3" />
              FEATURES
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to <span className="text-gradient-teal">manage links</span>
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              A complete toolkit for creating, customizing, and tracking your shortened URLs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Share2,
                title: "Custom OG Metadata",
                description: "Set custom titles, descriptions, and images for social media previews. Control how your links appear on Discord, Twitter, and Facebook.",
                color: "teal",
              },
              {
                icon: BarChart3,
                title: "Real-Time Analytics",
                description: "Track clicks, devices, browsers, geographic locations, and referrer sources with beautiful real-time dashboards.",
                color: "cyan",
              },
              {
                icon: Link2,
                title: "Custom Short Slugs",
                description: "Create memorable, branded short URLs with your own custom slugs. No random strings — pure readability.",
                color: "purple",
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Enterprise-grade security with Supabase authentication. Your links, your data, your control.",
                color: "emerald",
              },
              {
                icon: Eye,
                title: "Social Preview",
                description: "See a live preview of how your link will appear when shared on social media before publishing it.",
                color: "blue",
              },
              {
                icon: ExternalLink,
                title: "Instant Redirects",
                description: "Lightning-fast server-side redirects. Your users get where they need to go without any delay.",
                color: "amber",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-${feature.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 text-${feature.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-500/[0.02] to-transparent" />
        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/5 text-cyan-300 text-xs mb-4">
              <ChevronRight className="w-3 h-3" />
              HOW IT WORKS
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Three simple steps
            </h2>
            <p className="text-white/50 max-w-xl mx-auto">
              Create optimized, trackable links in seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Paste Your URL",
                description: "Enter any long URL and choose a custom short slug for your brand.",
              },
              {
                step: "02",
                title: "Customize Metadata",
                description: "Set your OG title, description, and image to control social media previews.",
              },
              {
                step: "03",
                title: "Share & Track",
                description: "Share your link anywhere and watch real-time analytics roll in.",
              },
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className="text-5xl font-black text-white/[0.04] mb-4 group-hover:text-teal-500/10 transition-colors duration-300">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Analytics Preview */}
      <section id="analytics" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/20 bg-purple-500/5 text-purple-300 text-xs mb-4">
                <BarChart3 className="w-3 h-3" />
                ANALYTICS
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Deep insights into every click
              </h2>
              <p className="text-white/50 mb-8 leading-relaxed">
                Understand your audience with detailed analytics. See where your clicks come from,
                what devices they use, and how your links perform over time.
              </p>
              <div className="space-y-4">
                {[
                  "Click-through rates and time-series trends",
                  "Device, browser, and OS breakdown",
                  "Geographic distribution by country",
                  "Referrer source tracking",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-teal-400" />
                    </div>
                    <span className="text-sm text-white/70">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/auth/signup">
                  <Button>
                    Start Tracking
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Analytics Visual */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-purple-500/10 rounded-3xl blur-2xl" />
              <div className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-sm p-6">
                <div className="space-y-4">
                  {/* Mini chart bars */}
                  <div className="flex items-end gap-1.5 h-32">
                    {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 50].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-teal-500/40 to-cyan-500/60 transition-all duration-300 hover:from-teal-500/60 hover:to-cyan-500/80" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                      <div className="text-xs text-white/40 mb-1">Clicks Today</div>
                      <div className="text-xl font-bold text-white">1,284</div>
                      <div className="text-xs text-teal-400">+12.5%</div>
                    </div>
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                      <div className="text-xs text-white/40 mb-1">Top Country</div>
                      <div className="text-xl font-bold text-white">🇺🇸 USA</div>
                      <div className="text-xs text-cyan-400">34.2%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.04] to-white/[0.01] p-12 sm:p-16">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-transparent to-purple-500/5 rounded-3xl" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to take control of your links?
              </h2>
              <p className="text-white/50 mb-8 max-w-md mx-auto">
                Join thousands of marketers and developers who use LinkFocus to optimize their link sharing.
              </p>
              <Link href="/auth/signup">
                <Button size="lg" className="text-base px-10">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-white/80">LinkFocus</span>
          </div>
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} LinkFocus. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
