"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoryContent, StorySection } from "@/data/story";

interface StoryFormProps {
  story: StoryContent;
  onClose: () => void;
}

export default function StoryForm({ story, onClose }: StoryFormProps) {
  const [formData, setFormData] = useState({
    pageTitle: "",
    pageSubtitle: "",
    sections: [] as StorySection[],
  });

  const [editingSection, setEditingSection] = useState<StorySection | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (story) {
      setFormData({
        pageTitle: story.pageTitle,
        pageSubtitle: story.pageSubtitle,
        sections: story.sections || [],
      });
    }
  }, [story]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        id: story.id,
        pageTitle: formData.pageTitle,
        pageSubtitle: formData.pageSubtitle,
        sections: formData.sections,
      };

      const response = await fetch("/api/story", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        onClose();
      } else {
        alert("Failed to save story: " + result.error);
      }
    } catch (error) {
      console.error("Error saving story:", error);
      alert("Failed to save story");
    } finally {
      setLoading(false);
    }
  };

  const addSection = (type: StorySection["type"]) => {
    const newSection: StorySection = {
      id: Date.now().toString(),
      type,
      order: formData.sections.length + 1,
      title: "",
      description: "",
      image: "",
      imageAlt: "",
      imagePosition: "left",
      promises: type === "promises" ? [{ id: "1", title: "", description: "" }] : undefined,
      ctaText: "",
      ctaLink: "",
    };
    setFormData({
      ...formData,
      sections: [...formData.sections, newSection],
    });
    setEditingSection(newSection);
  };

  const deleteSection = (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    const updated = formData.sections
      .filter((s) => s.id !== id)
      .map((s, index) => ({ ...s, order: index + 1 }));
    setFormData({ ...formData, sections: updated });
    if (editingSection?.id === id) {
      setEditingSection(null);
    }
  };

  const updateSection = (id: string, updates: Partial<StorySection>) => {
    const updated = formData.sections.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    setFormData({ ...formData, sections: updated });
    if (editingSection?.id === id) {
      setEditingSection({ ...editingSection, ...updates });
    }
  };

  const moveSection = (id: string, direction: "up" | "down") => {
    const index = formData.sections.findIndex((s) => s.id === id);
    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === formData.sections.length - 1) return;

    const newSections = [...formData.sections];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    const updated = newSections.map((s, i) => ({ ...s, order: i + 1 }));
    setFormData({ ...formData, sections: updated });
  };

  const updatePromise = (sectionId: string, promiseId: string, field: "title" | "description", value: string) => {
    const section = formData.sections.find((s) => s.id === sectionId);
    if (!section || !section.promises) return;

    const updatedPromises = section.promises.map((p) =>
      p.id === promiseId ? { ...p, [field]: value } : p
    );
    updateSection(sectionId, { promises: updatedPromises });
  };

  const addPromise = (sectionId: string) => {
    const section = formData.sections.find((s) => s.id === sectionId);
    if (!section) return;

    const newPromise = {
      id: Date.now().toString(),
      title: "",
      description: "",
    };
    updateSection(sectionId, {
      promises: [...(section.promises || []), newPromise],
    });
  };

  const removePromise = (sectionId: string, promiseId: string) => {
    const section = formData.sections.find((s) => s.id === sectionId);
    if (!section || !section.promises) return;

    const updatedPromises = section.promises.filter((p) => p.id !== promiseId);
    updateSection(sectionId, { promises: updatedPromises });
  };

  const getSectionTypeLabel = (type: StorySection["type"]) => {
    switch (type) {
      case "hero":
        return "Hero Section";
      case "promises":
        return "Promises/Cards";
      case "content":
        return "Content Section";
      case "cta":
        return "Call to Action";
      default:
        return type;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Story Content</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Page Header */}
            <div className="border-b pb-4">
              <h3 className="font-semibold mb-4">Page Header</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Page Title *</label>
                  <Input
                    value={formData.pageTitle}
                    onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Page Subtitle *</label>
                  <Input
                    value={formData.pageSubtitle}
                    onChange={(e) => setFormData({ ...formData, pageSubtitle: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sections Management */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Sections</h3>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addSection("hero")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Hero
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addSection("promises")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Promises
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addSection("content")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Content
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => addSection("cta")}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    CTA
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {formData.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <Card key={section.id} className="relative">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                            <CardTitle className="text-lg">
                              {getSectionTypeLabel(section.type)} #{index + 1}
                            </CardTitle>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveSection(section.id, "up")}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => moveSection(section.id, "down")}
                              disabled={index === formData.sections.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setEditingSection(editingSection?.id === section.id ? null : section)
                              }
                            >
                              {editingSection?.id === section.id ? "Collapse" : "Edit"}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSection(section.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>

                      {editingSection?.id === section.id && (
                        <CardContent className="space-y-4 border-t pt-4">
                          {/* Common Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium mb-1 block">Section Title</label>
                              <Input
                                value={section.title || ""}
                                onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium mb-1 block">Section Subtitle</label>
                              <Input
                                value={section.subtitle || ""}
                                onChange={(e) => updateSection(section.id, { subtitle: e.target.value })}
                              />
                            </div>
                          </div>

                          {/* Hero & Content Sections */}
                          {(section.type === "hero" || section.type === "content") && (
                            <>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Description</label>
                                <textarea
                                  value={section.description || ""}
                                  onChange={(e) =>
                                    updateSection(section.id, { description: e.target.value })
                                  }
                                  className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm min-h-[100px]"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Image URL</label>
                                  <Input
                                    value={section.image || ""}
                                    onChange={(e) => updateSection(section.id, { image: e.target.value })}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Image Alt Text</label>
                                  <Input
                                    value={section.imageAlt || ""}
                                    onChange={(e) => updateSection(section.id, { imageAlt: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">Image Position</label>
                                <select
                                  value={section.imagePosition || "left"}
                                  onChange={(e) =>
                                    updateSection(section.id, {
                                      imagePosition: e.target.value as "left" | "right",
                                    })
                                  }
                                  className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm h-11"
                                >
                                  <option value="left">Left</option>
                                  <option value="right">Right</option>
                                </select>
                              </div>
                              {section.type === "content" && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium mb-1 block">CTA Text</label>
                                    <Input
                                      value={section.ctaText || ""}
                                      onChange={(e) => updateSection(section.id, { ctaText: e.target.value })}
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium mb-1 block">CTA Link</label>
                                    <Input
                                      value={section.ctaLink || ""}
                                      onChange={(e) => updateSection(section.id, { ctaLink: e.target.value })}
                                    />
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {/* Promises Section */}
                          {section.type === "promises" && (
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium">Promise Cards</label>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addPromise(section.id)}
                                >
                                  <Plus className="h-4 w-4 mr-2" />
                                  Add Promise
                                </Button>
                              </div>
                              <div className="space-y-2">
                                {section.promises?.map((promise) => (
                                  <div key={promise.id} className="p-4 border rounded-lg space-y-2">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-sm font-medium">Promise Card</span>
                                      {section.promises && section.promises.length > 1 && (
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => removePromise(section.id, promise.id)}
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                    <Input
                                      value={promise.title}
                                      onChange={(e) =>
                                        updatePromise(section.id, promise.id, "title", e.target.value)
                                      }
                                      placeholder="Promise title"
                                    />
                                    <textarea
                                      value={promise.description}
                                      onChange={(e) =>
                                        updatePromise(section.id, promise.id, "description", e.target.value)
                                      }
                                      placeholder="Promise description"
                                      className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm min-h-[80px]"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* CTA Section */}
                          {section.type === "cta" && (
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium mb-1 block">CTA Text *</label>
                                <Input
                                  value={section.ctaText || ""}
                                  onChange={(e) => updateSection(section.id, { ctaText: e.target.value })}
                                  required
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium mb-1 block">CTA Link *</label>
                                <Input
                                  value={section.ctaLink || ""}
                                  onChange={(e) => updateSection(section.id, { ctaLink: e.target.value })}
                                  required
                                />
                              </div>
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
