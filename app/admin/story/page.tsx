"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { StoryPageContent, StoryPromiseIcon } from "@/data/story";
import { withCacheBust } from "@/lib/fetch-api";
import { canonicalImageUrlForStorage } from "@/lib/utils";

function emptyStoryForm(): StoryPageContent {
  return {
    heroTitle: "",
    heroSubtitle: "",
    section1: { heading: "", body: "", imageUrl: "" },
    section2: { heading: "", body: "", imageUrl: "" },
    promises: [
      { title: "", body: "", icon: "leaf" },
      { title: "", body: "", icon: "leaf" },
      { title: "", body: "", icon: "leaf" },
    ],
    cta: { label: "", href: "" },
  };
}

const textareaClass =
  "w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm min-h-[100px]";
const selectClass =
  "w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm h-11";

const ICON_OPTIONS: { value: StoryPromiseIcon; label: string }[] = [
  { value: "leaf", label: "Leaf (real ingredients)" },
  { value: "flame", label: "Flame (slow infusion)" },
  { value: "layers", label: "Layers (small batches)" },
];

export default function AdminStoryPage() {
  const [form, setForm] = useState<StoryPageContent>(() => emptyStoryForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(withCacheBust("/api/story"), {
        cache: "no-store",
        headers: {
          Pragma: "no-cache",
          "Cache-Control": "no-cache",
        },
      });
      const result = await response.json();
      if (result.success) {
        setForm(result.data ?? emptyStoryForm());
      }
    } catch (error) {
      console.error("Failed to load story:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: StoryPageContent = {
        ...form,
        section1: {
          ...form.section1,
          imageUrl: canonicalImageUrlForStorage(form.section1.imageUrl.trim()),
        },
        section2: {
          ...form.section2,
          imageUrl: canonicalImageUrlForStorage(form.section2.imageUrl.trim()),
        },
        cta: {
          label: form.cta.label.trim(),
          href: form.cta.href.trim(),
        },
      };

      const response = await fetch("/api/story", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.success) {
        if (result.data) setForm(result.data);
        alert("Story saved.");
      } else {
        alert("Failed to save: " + (result.error ?? "Unknown error"));
      }
    } catch (error) {
      console.error(error);
      alert("Failed to save story");
    } finally {
      setSaving(false);
    }
  };

  const updatePromise = (
    index: 0 | 1 | 2,
    field: keyof StoryPageContent["promises"][0],
    value: string
  ) => {
    const next = [...form.promises] as StoryPageContent["promises"];
    next[index] = { ...next[index], [field]: value } as (typeof next)[0];
    setForm({ ...form, promises: next });
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
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="font-display text-xl font-semibold">Story page</h1>
            </div>
            <Link href="/story">
              <Button variant="ghost" size="sm">
                View live page
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {loading ? (
          <p className="text-muted-foreground">Loading story…</p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-8">
            <p className="text-sm text-muted-foreground">
              The live <Link href="/story" className="text-primary underline-offset-4 hover:underline">/story</Link>{" "}
              page only shows content from Supabase. If the table has no row yet, run{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">scripts/seed_story_page_row.sql</code> or save
              here once to publish.
            </p>
            <Card>
              <CardHeader>
                <CardTitle>Hero</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Title</label>
                  <Input
                    value={form.heroTitle}
                    onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Subtitle</label>
                  <textarea
                    value={form.heroSubtitle}
                    onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                    className={textareaClass}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Section — image left</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Heading</label>
                  <Input
                    value={form.section1.heading}
                    onChange={(e) =>
                      setForm({ ...form, section1: { ...form.section1, heading: e.target.value } })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Body</label>
                  <textarea
                    value={form.section1.body}
                    onChange={(e) =>
                      setForm({ ...form, section1: { ...form.section1, body: e.target.value } })
                    }
                    className={textareaClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Image URL</label>
                  <Input
                    value={form.section1.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, section1: { ...form.section1, imageUrl: e.target.value } })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Promise cards (3)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {([0, 1, 2] as const).map((i) => (
                  <div key={i} className="space-y-4 border-b border-black/10 pb-8 last:border-0 last:pb-0">
                    <p className="text-sm font-semibold text-muted-foreground">Card {i + 1}</p>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Title</label>
                      <Input
                        value={form.promises[i].title}
                        onChange={(e) => updatePromise(i, "title", e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Description</label>
                      <textarea
                        value={form.promises[i].body}
                        onChange={(e) => updatePromise(i, "body", e.target.value)}
                        className={textareaClass}
                        required
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Icon</label>
                      <select
                        value={form.promises[i].icon}
                        onChange={(e) => updatePromise(i, "icon", e.target.value as StoryPromiseIcon)}
                        className={selectClass}
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Section — image right</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Heading</label>
                  <Input
                    value={form.section2.heading}
                    onChange={(e) =>
                      setForm({ ...form, section2: { ...form.section2, heading: e.target.value } })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Body</label>
                  <textarea
                    value={form.section2.body}
                    onChange={(e) =>
                      setForm({ ...form, section2: { ...form.section2, body: e.target.value } })
                    }
                    className={textareaClass}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Image URL</label>
                  <Input
                    value={form.section2.imageUrl}
                    onChange={(e) =>
                      setForm({ ...form, section2: { ...form.section2, imageUrl: e.target.value } })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bottom button</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Label</label>
                  <Input
                    value={form.cta.label}
                    onChange={(e) => setForm({ ...form, cta: { ...form.cta, label: e.target.value } })}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Link (path or full URL)</label>
                  <Input
                    value={form.cta.href}
                    onChange={(e) => setForm({ ...form, cta: { ...form.cta, href: e.target.value } })}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => void load()} disabled={saving}>
                Reload from server
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save story"}
              </Button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
