"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function HeroAdminPage() {
  const [savedImages, setSavedImages] = useState<[string, string, string]>(["", "", ""]);
  const [images, setImages] = useState<[string, string, string]>(["", "", ""]);
  const [isEditing, setIsEditing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/hero", {
        cache: "no-store",
        credentials: "same-origin",
      });
      const result = await response.json();
      if (result.success && Array.isArray(result.data?.images) && result.data.images.length === 3) {
        const raw = result.data.images;
        const next: [string, string, string] = [
          String(raw[0] ?? ""),
          String(raw[1] ?? ""),
          String(raw[2] ?? ""),
        ];
        setSavedImages(next);
        setImages(next);
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
      const response = await fetch("/api/hero", {
        method: "PUT",
        cache: "no-store",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images }),
      });
      const result = await response.json();
      if (result.success && Array.isArray(result.data?.images) && result.data.images.length === 3) {
        const raw = result.data.images;
        const next: [string, string, string] = [
          String(raw[0] ?? ""),
          String(raw[1] ?? ""),
          String(raw[2] ?? ""),
        ];
        setSavedImages(next);
        setImages(next);
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

  const setAt = (index: 0 | 1 | 2, value: string) => {
    setImages((prev) => {
      const next: [string, string, string] = [...prev] as [string, string, string];
      next[index] = value;
      return next;
    });
  };

  const startEdit = () => {
    setImages([...savedImages] as [string, string, string]);
    setIsEditing(true);
    setLoadError(null);
  };

  const cancelEdit = () => {
    setImages([...savedImages] as [string, string, string]);
    setIsEditing(false);
    setLoadError(null);
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <ImageIcon className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-display font-semibold">Hero images</h1>
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
              <CardTitle className="text-lg">Homepage hero</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Three image URLs (first → third). Only non-empty links appear on the site.
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
                <Button type="button" variant="outline" size="sm" onClick={() => void load()} disabled={saving}>
                  Reload
                </Button>
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            {loadError ? (
              <p className="text-sm text-red-700">{loadError}</p>
            ) : null}

            {loading ? (
              <p className="text-sm text-muted-foreground">Loading current hero URLs…</p>
            ) : !isEditing ? (
              <ul className="divide-y divide-black/10 rounded-xl border border-black/10 bg-muted/30">
                {[0, 1, 2].map((i) => {
                  const url = savedImages[i].trim();
                  return (
                    <li key={i} className="flex gap-3 px-4 py-3 text-sm">
                      <span className="w-8 shrink-0 font-medium text-muted-foreground">{i + 1}.</span>
                      <div className="min-w-0 flex-1">
                        {url ? (
                          <p className="break-all font-mono text-xs leading-relaxed" title={savedImages[i]}>
                            {savedImages[i]}
                          </p>
                        ) : (
                          <p className="text-muted-foreground italic">No URL set</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i}>
                    <label className="mb-1 block text-sm font-medium">Image URL {i + 1}</label>
                    <Input
                      value={images[i]}
                      onChange={(e) => setAt(i as 0 | 1 | 2, e.target.value)}
                      placeholder="https://…"
                    />
                  </div>
                ))}
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
