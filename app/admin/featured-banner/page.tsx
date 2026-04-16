"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Flame, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function FeaturedBannerAdminPage() {
  const [savedUrl, setSavedUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/featured-banner", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const result = await response.json();
      if (result.success && typeof result.data?.imageUrl === "string") {
        const next = String(result.data.imageUrl);
        setSavedUrl(next);
        setImageUrl(next);
        setIsEditing(false);
      } else {
        setLoadError(result.error ?? `Failed to load (${response.status})`);
      }
    } catch {
      setLoadError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const save = async () => {
    setSaving(true);
    setLoadError(null);
    try {
      const response = await fetch("/api/featured-banner", {
        method: "PUT",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const result = await response.json();
      if (result.success && typeof result.data?.imageUrl === "string") {
        const next = String(result.data.imageUrl);
        setSavedUrl(next);
        setImageUrl(next);
        setIsEditing(false);
      } else {
        setLoadError(result.error ?? `Save failed (${response.status})`);
      }
    } catch {
      setLoadError("Network error while saving");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = () => {
    setImageUrl(savedUrl);
    setIsEditing(true);
    setLoadError(null);
  };

  const cancelEdit = () => {
    setImageUrl(savedUrl);
    setIsEditing(false);
    setLoadError(null);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Flame className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-display font-semibold">Featured banner</h1>
            </div>
            <Link href="/">
              <Button variant="ghost" size="sm">
                View Site
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-lg">“Grow your cravings” section</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Image on the right of the homepage block above Recipes. Leave empty to use the
                default placeholder.
              </p>
            </div>
            {!loading && !loadError ? (
              <div className="flex flex-wrap gap-2">
                {!isEditing ? (
                  <Button type="button" variant="secondary" className="gap-2" onClick={startEdit}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void load()}
                  disabled={saving}
                >
                  Reload
                </Button>
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {loadError ? <p className="text-sm text-red-700">{loadError}</p> : null}

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading current image URL…</p>
            ) : !isEditing ? (
              <div className="rounded-xl border border-black/10 bg-muted/30 px-4 py-3 text-sm">
                {savedUrl.trim() ? (
                  <p className="break-all font-mono text-xs leading-relaxed" title={savedUrl}>
                    {savedUrl}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">No URL set — placeholder shows on site</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Image URL</label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Button onClick={() => void save()} disabled={saving}>
                    {saving ? "Saving…" : "Save"}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
