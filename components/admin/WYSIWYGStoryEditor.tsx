"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Save, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StoryContent, StorySection } from "@/data/story";
import EditableField from "./EditableField";
import RichTextEditor from "./RichTextEditor";

interface WYSIWYGStoryEditorProps {
  story: StoryContent;
  onSave: (updatedStory: StoryContent) => void;
  onPreview?: () => void;
}

export default function WYSIWYGStoryEditor({ story, onSave, onPreview }: WYSIWYGStoryEditorProps) {
  const [localStory, setLocalStory] = useState<StoryContent>(story);
  const [saving, setSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    setLocalStory(story);
  }, [story]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/story", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localStory),
      });
      const result = await response.json();
      if (result.success) {
        onSave(localStory);
      }
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  }, [localStory, onSave]);

  const autoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 2000);
  }, [handleSave]);

  // Auto-save effect
  useEffect(() => {
    if (isInitialMount.current) return;
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [localStory, handleSave]);

  const addSection = useCallback((type: StorySection["type"]) => {
    setLocalStory((prev) => {
      const newSection: StorySection = {
        id: Date.now().toString(),
        type,
        order: prev.sections.length + 1,
        title: "",
        description: "",
        image: "",
        imageAlt: "",
        imagePosition: "left",
        promises: type === "promises" ? [{ id: "1", title: "", description: "" }] : undefined,
        ctaText: "",
        ctaLink: "",
      };
      return { ...prev, sections: [...prev.sections, newSection] };
    });
  }, []);

  const deleteSection = useCallback((id: string) => {
    if (!confirm("Delete this section?")) return;
    setLocalStory((prev) => {
      const updated = prev.sections
        .filter((s) => s.id !== id)
        .map((s, index) => ({ ...s, order: index + 1 }));
      return { ...prev, sections: updated };
    });
  }, []);

  const moveSection = useCallback((id: string, direction: "up" | "down") => {
    setLocalStory((prev) => {
      const index = prev.sections.findIndex((s) => s.id === id);
      if (index === -1) return prev;
      if (direction === "up" && index === 0) return prev;
      if (direction === "down" && index === prev.sections.length - 1) return prev;

      const newSections = [...prev.sections];
      const newIndex = direction === "up" ? index - 1 : index + 1;
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      const updated = newSections.map((s, i) => ({ ...s, order: i + 1 }));
      return { ...prev, sections: updated };
    });
  }, []);

  const updatePromise = useCallback((sectionId: string, promiseId: string, field: "title" | "description", value: string) => {
    setLocalStory((prev) => {
      const updatedSections = prev.sections.map((s) => {
        if (s.id === sectionId && s.promises) {
          const updatedPromises = s.promises.map((p) =>
            p.id === promiseId ? { ...p, [field]: value } : p
          );
          return { ...s, promises: updatedPromises };
        }
        return s;
      });
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const addPromise = useCallback((sectionId: string) => {
    setLocalStory((prev) => {
      const updatedSections = prev.sections.map((s) => {
        if (s.id === sectionId) {
          const newPromise = { id: Date.now().toString(), title: "", description: "" };
          return { ...s, promises: [...(s.promises || []), newPromise] };
        }
        return s;
      });
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const removePromise = useCallback((sectionId: string, promiseId: string) => {
    setLocalStory((prev) => {
      const updatedSections = prev.sections.map((s) => {
        if (s.id === sectionId && s.promises) {
          return { ...s, promises: s.promises.filter((p) => p.id !== promiseId) };
        }
        return s;
      });
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const renderSection = (section: StorySection, index: number) => {
    return (
      <Card key={section.id} className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-lg">
                {section.type === "hero"
                  ? "Hero Section"
                  : section.type === "promises"
                  ? "Promises Section"
                  : section.type === "content"
                  ? "Content Section"
                  : "CTA Section"}{" "}
                #{index + 1}
              </CardTitle>
            </div>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveSection(section.id, "up")}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveSection(section.id, "down")}
                disabled={index === localStory.sections.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => deleteSection(section.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hero & Content Sections */}
          {(section.type === "hero" || section.type === "content") && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <EditableField
                  value={section.title || ""}
                  onChange={(val) => {
                    setLocalStory((prev) => {
                      const updatedSections = prev.sections.map((s) =>
                        s.id === section.id ? { ...s, title: val } : s
                      );
                      return { ...prev, sections: updatedSections };
                    });
                  }}
                  placeholder="Enter section title..."
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <div className="border rounded-lg p-2">
                  <RichTextEditor
                    value={section.description || ""}
                    onChange={(val) => {
                      setLocalStory((prev) => {
                        const updatedSections = prev.sections.map((s) =>
                          s.id === section.id ? { ...s, description: val } : s
                        );
                        const updated = { ...prev, sections: updatedSections };
                        // Auto-save after update
                        if (autoSaveTimerRef.current) {
                          clearTimeout(autoSaveTimerRef.current);
                        }
                        autoSaveTimerRef.current = setTimeout(() => {
                          handleSave();
                        }, 2000);
                        return updated;
                      });
                    }}
                    placeholder="Enter description..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Image URL</label>
                  <EditableField
                    value={section.image || ""}
                    onChange={(val) => {
                      setLocalStory((prev) => {
                        const updatedSections = prev.sections.map((s) =>
                          s.id === section.id ? { ...s, image: val } : s
                        );
                        return { ...prev, sections: updatedSections };
                      });
                    }}
                    placeholder="/images/hero/image.png"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Image Position</label>
                  <select
                    value={section.imagePosition || "left"}
                    onChange={(e) => {
                      setLocalStory((prev) => {
                        const updatedSections = prev.sections.map((s) =>
                          s.id === section.id ? { ...s, imagePosition: e.target.value as "left" | "right" } : s
                        );
                        return { ...prev, sections: updatedSections };
                      });
                    }}
                    className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm h-11"
                  >
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
              {section.type === "content" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">CTA Text</label>
                    <EditableField
                      value={section.ctaText || ""}
                      onChange={(val) => {
                        setLocalStory((prev) => {
                          const updatedSections = prev.sections.map((s) =>
                            s.id === section.id ? { ...s, ctaText: val } : s
                          );
                          return { ...prev, sections: updatedSections };
                        });
                      }}
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">CTA Link</label>
                    <EditableField
                      value={section.ctaLink || ""}
                      onChange={(val) => {
                        setLocalStory((prev) => {
                          const updatedSections = prev.sections.map((s) =>
                            s.id === section.id ? { ...s, ctaLink: val } : s
                          );
                          return { ...prev, sections: updatedSections };
                        });
                      }}
                      placeholder="/shop"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Promises Section */}
          {section.type === "promises" && (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Section Title</label>
                <EditableField
                  value={section.title || ""}
                  onChange={(val) => {
                    setLocalStory((prev) => {
                      const updatedSections = prev.sections.map((s) =>
                        s.id === section.id ? { ...s, title: val } : s
                      );
                      return { ...prev, sections: updatedSections };
                    });
                  }}
                  placeholder="Our Small Batch Promise"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-medium">Promise Cards</label>
                  <Button size="sm" variant="ghost" onClick={() => addPromise(section.id)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Promise
                  </Button>
                </div>
                <div className="space-y-4">
                  {section.promises?.map((promise) => (
                    <Card key={promise.id}>
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Promise Card</span>
                          {section.promises && section.promises.length > 1 && (
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => removePromise(section.id, promise.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <EditableField
                          value={promise.title}
                          onChange={(val) => {
                            setLocalStory((prev) => {
                              const updatedSections = prev.sections.map((s) => {
                                if (s.id === section.id && s.promises) {
                                  const updatedPromises = s.promises.map((p) =>
                                    p.id === promise.id ? { ...p, title: val } : p
                                  );
                                  return { ...s, promises: updatedPromises };
                                }
                                return s;
                              });
                              return { ...prev, sections: updatedSections };
                            });
                          }}
                          placeholder="Promise title"
                        />
                        <EditableField
                          value={promise.description}
                          onChange={(val) => {
                            setLocalStory((prev) => {
                              const updatedSections = prev.sections.map((s) => {
                                if (s.id === section.id && s.promises) {
                                  const updatedPromises = s.promises.map((p) =>
                                    p.id === promise.id ? { ...p, description: val } : p
                                  );
                                  return { ...s, promises: updatedPromises };
                                }
                                return s;
                              });
                              return { ...prev, sections: updatedSections };
                            });
                          }}
                          type="textarea"
                          multiline
                          placeholder="Promise description"
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* CTA Section */}
              {section.type === "cta" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">CTA Text</label>
                <EditableField
                  value={section.ctaText || ""}
                  onChange={(val) => {
                    setLocalStory((prev) => {
                      const updatedSections = prev.sections.map((s) =>
                        s.id === section.id ? { ...s, ctaText: val } : s
                      );
                      return { ...prev, sections: updatedSections };
                    });
                  }}
                  placeholder="Shop Now"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">CTA Link</label>
                <EditableField
                  value={section.ctaLink || ""}
                  onChange={(val) => {
                    setLocalStory((prev) => {
                      const updatedSections = prev.sections.map((s) =>
                        s.id === section.id ? { ...s, ctaLink: val } : s
                      );
                      return { ...prev, sections: updatedSections };
                    });
                  }}
                  placeholder="/shop"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold mb-2">Edit Story Content</h2>
          <p className="text-sm text-muted-foreground">
            Click on any field to edit. Changes auto-save after 2 seconds.
          </p>
        </div>
        <div className="flex gap-2">
          {onPreview && (
            <Button variant="ghost" onClick={onPreview}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Saving..." : "Save Now"}
          </Button>
        </div>
      </div>

      {/* Page Header */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Page Header</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Page Title</label>
              <EditableField
                value={localStory.pageTitle}
                onChange={(val) => {
                  setLocalStory((prev) => ({ ...prev, pageTitle: val }));
                }}
                placeholder="Our Story"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Page Subtitle</label>
              <EditableField
                value={localStory.pageSubtitle}
                onChange={(val) => {
                  setLocalStory((prev) => ({ ...prev, pageSubtitle: val }));
                }}
                placeholder="Born from a passion for bold flavor..."
              />
            </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Sections</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => addSection("hero")}>
              <Plus className="h-4 w-4 mr-2" />
              Hero
            </Button>
            <Button size="sm" variant="ghost" onClick={() => addSection("promises")}>
              <Plus className="h-4 w-4 mr-2" />
              Promises
            </Button>
            <Button size="sm" variant="ghost" onClick={() => addSection("content")}>
              <Plus className="h-4 w-4 mr-2" />
              Content
            </Button>
            <Button size="sm" variant="ghost" onClick={() => addSection("cta")}>
              <Plus className="h-4 w-4 mr-2" />
              CTA
            </Button>
          </div>
        </div>

        {localStory.sections
          .sort((a, b) => a.order - b.order)
          .map((section, index) => renderSection(section, index))}
      </div>
    </div>
  );
}
