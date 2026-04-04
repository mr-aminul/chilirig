"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowLeft, ArrowUp, ImageIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { imageSrcForNext } from "@/lib/media-url";
import {
  defaultInstagramGalleryContent,
  InstagramGalleryContent,
  InstagramGalleryTile,
} from "@/data/instagram-gallery";

function newTileId() {
  return `ig-${crypto.randomUUID()}`;
}

export default function InstagramGalleryAdminPage() {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [tiles, setTiles] = useState<InstagramGalleryTile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    try {
      const response = await fetch("/api/instagram-gallery", { cache: "no-store" });
      const result = await response.json();
      if (result.success && result.data) {
        setHeading(result.data.heading);
        setSubheading(result.data.subheading);
        setTiles(result.data.tiles);
      }
    } catch (error) {
      console.error("Failed to fetch Instagram gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const persist = async (next: InstagramGalleryContent) => {
    setSaving(true);
    try {
      const response = await fetch("/api/instagram-gallery", {
        method: "PUT",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const result = await response.json();
      if (result.success) {
        setHeading(result.data.heading);
        setSubheading(result.data.subheading);
        setTiles(result.data.tiles);
      } else {
        alert(result.error ?? "Failed to save");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save Instagram gallery");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    await persist({
      heading: heading.trim() || defaultInstagramGalleryContent.heading,
      subheading: subheading.trim() || defaultInstagramGalleryContent.subheading,
      tiles,
    });
  };

  const updateTile = (id: string, patch: Partial<InstagramGalleryTile>) => {
    setTiles((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  };

  const handleMove = (id: string, direction: -1 | 1) => {
    const index = tiles.findIndex((t) => t.id === id);
    const target = index + direction;
    if (index === -1 || target < 0 || target >= tiles.length) return;
    const next = [...tiles];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setTiles(next);
  };

  const handleRemove = (id: string) => {
    if (tiles.length <= 1) {
      alert("Keep at least one image tile.");
      return;
    }
    if (!confirm("Remove this tile?")) return;
    setTiles((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAdd = () => {
    if (tiles.length >= 12) {
      alert("Maximum 12 tiles.");
      return;
    }
    const defaults = defaultInstagramGalleryContent.tiles[tiles.length % 6] ?? defaultInstagramGalleryContent.tiles[0];
    setTiles((prev) => [
      ...prev,
      {
        id: newTileId(),
        image: defaults.image,
        alt: `Instagram post ${prev.length + 1}`,
        href: defaults.href,
      },
    ]);
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
              <h1 className="text-xl font-display font-semibold">Instagram gallery</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  View Site
                </Button>
              </Link>
              <Button size="sm" onClick={() => void handleSaveAll()} disabled={saving || loading}>
                {saving ? "Saving…" : "Save all"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-3xl font-display font-bold">Homepage Instagram section</h2>
          <p className="text-muted-foreground">
            Heading, subheading, and image tiles above the newsletter on the home page.
          </p>
        </div>

        {loading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Section text</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="ig-heading" className="text-sm font-medium">
                    Heading
                  </label>
                  <Input
                    id="ig-heading"
                    value={heading}
                    onChange={(e) => setHeading(e.target.value)}
                    placeholder="Follow us on Instagram"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="ig-sub" className="text-sm font-medium">
                    Subheading
                  </label>
                  <Input
                    id="ig-sub"
                    value={subheading}
                    onChange={(e) => setSubheading(e.target.value)}
                    placeholder="Share your ChiliRig creations with #ChiliRig"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-xl font-semibold">Tiles ({tiles.length})</h3>
              <Button type="button" variant="secondary" className="gap-2" onClick={handleAdd}>
                <Plus className="h-4 w-4" />
                Add tile
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {tiles.map((tile, index) => (
                <Card key={tile.id} className="overflow-hidden">
                  <div className="relative h-48 bg-muted">
                    <img
                      src={imageSrcForNext(tile.image)}
                      alt={tile.alt}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute right-2 top-2 rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
                      {index + 1}
                    </div>
                  </div>
                  <CardContent className="space-y-3 pt-4">
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">Image URL</span>
                      <Input
                        value={tile.image}
                        onChange={(e) => updateTile(tile.id, { image: e.target.value })}
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">Alt text</span>
                      <Input
                        value={tile.alt}
                        onChange={(e) => updateTile(tile.id, { alt: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-medium text-muted-foreground">Link (optional)</span>
                      <Input
                        value={tile.href}
                        onChange={(e) => updateTile(tile.id, { href: e.target.value })}
                        placeholder="https://www.instagram.com/…"
                        className="font-mono text-xs"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button size="sm" variant="secondary" type="button" onClick={() => handleMove(tile.id, -1)}>
                        <ArrowUp className="mr-1 h-4 w-4" />
                        Up
                      </Button>
                      <Button size="sm" variant="secondary" type="button" onClick={() => handleMove(tile.id, 1)}>
                        <ArrowDown className="mr-1 h-4 w-4" />
                        Down
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        type="button"
                        className="border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100"
                        onClick={() => handleRemove(tile.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-sm text-muted-foreground">
              Click &quot;Save all&quot; in the header to publish heading, subheading, and tile order.
            </p>
          </>
        )}
      </main>
    </div>
  );
}
