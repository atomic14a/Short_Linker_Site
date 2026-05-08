"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Link2,
  Plus,
  Search,
  Copy,
  ExternalLink,
  Pencil,
  Trash2,
  Loader2,
  MousePointerClick,
  BarChart3,
  CheckCircle2,
  Image as ImageIcon,
  Eye,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface LinkItem {
  id: string;
  internal_name: string;
  original_url: string;
  short_slug: string;
  meta_title: string;
  meta_description: string;
  meta_image_url: string;
  created_at: string;
  click_count?: number;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [totalClicks, setTotalClicks] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [form, setForm] = useState({
    original_url: "",
    short_slug: "",
    internal_name: "",
    meta_title: "",
    meta_description: "",
    meta_image_url: "",
  });

  const openCreateDialog = useCallback(() => {
    setEditingLink(null);
    setForm({ original_url: "", short_slug: "", internal_name: "", meta_title: "", meta_description: "", meta_image_url: "" });
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((link: LinkItem) => {
    setEditingLink(link);
    setForm({
      original_url: link.original_url,
      short_slug: link.short_slug,
      internal_name: link.internal_name,
      meta_title: link.meta_title || "",
      meta_description: link.meta_description || "",
      meta_image_url: link.meta_image_url || "",
    });
    setDialogOpen(true);
  }, []);

  const fetchLinks = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) {
      // Get click counts
      const linksWithClicks = await Promise.all(
        data.map(async (link) => {
          const { count } = await supabase
            .from("clicks")
            .select("*", { count: "exact", head: true })
            .eq("link_id", link.id);
          return { ...link, click_count: count || 0 };
        })
      );
      setLinks(linksWithClicks);
      setTotalClicks(linksWithClicks.reduce((sum, l) => sum + (l.click_count || 0), 0));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    const action = searchParams.get("action");
    if (action === "create") {
      openCreateDialog();
    }
  }, [searchParams, openCreateDialog]);

  const handleSave = async () => {
    if (!form.original_url || !form.short_slug || !form.internal_name) {
      toast({ title: "Missing fields", description: "URL, slug, and name are required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingLink) {
      const { error } = await supabase
        .from("links")
        .update({
          original_url: form.original_url,
          short_slug: form.short_slug,
          internal_name: form.internal_name,
          meta_title: form.meta_title || null,
          meta_description: form.meta_description || null,
          meta_image_url: form.meta_image_url || null,
        })
        .eq("id", editingLink.id);

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Link updated", description: "Your link has been updated successfully.", variant: "success" as "default" });
        setDialogOpen(false);
        fetchLinks();
      }
    } else {
      const { error } = await supabase.from("links").insert({
        user_id: user.id,
        original_url: form.original_url,
        short_slug: form.short_slug,
        internal_name: form.internal_name,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
        meta_image_url: form.meta_image_url || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Slug taken", description: "This short slug is already in use. Try a different one.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        }
      } else {
        toast({ title: "Link created!", description: "Your new short link is ready to use.", variant: "success" as "default" });
        setDialogOpen(false);
        fetchLinks();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("clicks").delete().eq("link_id", id);
    const { error } = await supabase.from("links").delete().eq("id", id);
    if (!error) {
      toast({ title: "Link deleted", description: "The link and its analytics have been removed." });
      fetchLinks();
    }
    setDeleting(null);
  };

  const copyToClipboard = async (slug: string, id: string) => {
    const url = `${window.location.origin}/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast({ title: "Copied!", description: url });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredLinks = links.filter(
    (l) =>
      l.internal_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.short_slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.original_url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/50 mt-1">Manage your shortened links</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4" />
          Create Link
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="hover:border-teal-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center">
                <Link2 className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{links.length}</div>
                <div className="text-xs text-white/40">Total Links</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-cyan-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{links.length}</div>
                <div className="text-xs text-white/40">Active Links</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:border-purple-500/20 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <MousePointerClick className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{totalClicks.toLocaleString()}</div>
                <div className="text-xs text-white/40">Total Clicks</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <Input
            placeholder="Search links..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Links List */}
      {filteredLinks.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {searchQuery ? "No links found" : "No links yet"}
          </h3>
          <p className="text-sm text-white/40 mb-6">
            {searchQuery ? "Try a different search term." : "Create your first shortened link to get started."}
          </p>
          {!searchQuery && (
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4" />
              Create Your First Link
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLinks.map((link) => (
            <Card key={link.id} className="hover:border-white/[0.12] transition-all group">
              <CardContent className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Link Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white truncate">{link.internal_name}</h3>
                      {link.meta_title && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          <ImageIcon className="w-2.5 h-2.5" />
                          OG
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-sm text-teal-400 font-mono">{appUrl}/{link.short_slug}</code>
                      <button
                        onClick={() => copyToClipboard(link.short_slug, link.id)}
                        className="text-white/30 hover:text-white transition-colors cursor-pointer"
                      >
                        {copiedId === link.id ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-white/30 truncate">{link.original_url}</p>
                  </div>

                  {/* Clicks */}
                  <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                    <div className="flex items-center gap-1.5 text-sm">
                      <MousePointerClick className="w-3.5 h-3.5 text-white/30" />
                      <span className="font-semibold text-white">{link.click_count || 0}</span>
                      <span className="text-white/30 text-xs">clicks</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    <Link href={`/dashboard/analytics/${link.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <BarChart3 className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                    <a href={`/${link.short_slug}`} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    </a>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(link)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      onClick={() => handleDelete(link.id)}
                      disabled={deleting === link.id}
                    >
                      {deleting === link.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Edit Link" : "Create New Link"}</DialogTitle>
            <DialogDescription>
              {editingLink ? "Update your link details and metadata." : "Create a shortened link with custom metadata."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Internal Name *</Label>
                <Input
                  placeholder="My Campaign Link"
                  value={form.internal_name}
                  onChange={(e) => setForm({ ...form, internal_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Destination URL *</Label>
                <Input
                  placeholder="https://example.com/very-long-url"
                  value={form.original_url}
                  onChange={(e) => setForm({ ...form, original_url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Short Slug *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30 whitespace-nowrap font-mono">{appUrl}/</span>
                  <Input
                    placeholder="my-link"
                    value={form.short_slug}
                    onChange={(e) => setForm({ ...form, short_slug: e.target.value.replace(/[^a-zA-Z0-9-_]/g, "") })}
                    disabled={!!editingLink}
                  />
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4 text-teal-400" />
                  <span className="text-sm font-medium text-white">OG Metadata (optional)</span>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Meta Title</Label>
                    <Input
                      placeholder="Custom title for social media"
                      value={form.meta_title}
                      onChange={(e) => setForm({ ...form, meta_title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Meta Description</Label>
                    <Textarea
                      placeholder="Custom description for social previews"
                      value={form.meta_description}
                      onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                      className="min-h-[70px]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Meta Image URL</Label>
                    <Input
                      placeholder="https://example.com/og-image.jpg"
                      value={form.meta_image_url}
                      onChange={(e) => setForm({ ...form, meta_image_url: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Social Preview */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">Social Media Preview</span>
              </div>
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                {/* OG Image */}
                <div className="aspect-video bg-gradient-to-br from-teal-500/10 to-cyan-500/10 flex items-center justify-center border-b border-white/[0.06]">
                  {form.meta_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.meta_image_url}
                      alt="OG Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ImageIcon className="w-8 h-8 text-white/15 mx-auto mb-2" />
                      <p className="text-xs text-white/25">No image set</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-[10px] text-white/30 uppercase tracking-wider mb-1 font-mono">
                    {appUrl ? new URL(appUrl).hostname : "linkfocus.app"}
                  </p>
                  <h4 className="text-sm font-semibold text-white mb-1 line-clamp-2">
                    {form.meta_title || form.internal_name || "Your Link Title"}
                  </h4>
                  <p className="text-xs text-white/40 line-clamp-2">
                    {form.meta_description || "Your link description will appear here..."}
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-white/25 mt-2 text-center">
                Preview of how your link will appear on social media
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/[0.06]">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  {editingLink ? "Save Changes" : "Create Link"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 text-teal-400 animate-spin" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
