"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Trash2, ArrowUp, ArrowDown, Save, Eye, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StoryContent, StorySection } from "@/data/story";
import RichTextEditor from "./RichTextEditor";
import dynamic from "next/dynamic";

interface StoryCanvasProps {
  story: StoryContent;
  onSave: (updatedStory: StoryContent) => void;
  onPreview?: () => void;
}

export default function StoryCanvas({ story, onSave, onPreview }: StoryCanvasProps) {
  const [localStory, setLocalStory] = useState<StoryContent>(story);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState<{ sectionId?: string; field: string; promiseId?: string } | null>(null);
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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

  const updateField = useCallback((sectionId: string | null, field: string, value: any, promiseId?: string) => {
    setLocalStory((prev) => {
      if (!sectionId) {
        // Update page-level fields
        return { ...prev, [field]: value };
      }
      
      const updatedSections = prev.sections.map((s) => {
        if (s.id === sectionId) {
          if (promiseId && s.promises) {
            const updatedPromises = s.promises.map((p) =>
              p.id === promiseId ? { ...p, [field]: value } : p
            );
            return { ...s, promises: updatedPromises };
          }
          return { ...s, [field]: value };
        }
        return s;
      });
      return { ...prev, sections: updatedSections };
    });
  }, []);

  const addSection = useCallback((type: StorySection["type"]) => {
    const newSectionId = Date.now().toString();
    setLocalStory((prev) => {
      const newSection: StorySection = {
        id: newSectionId,
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
    
    // Scroll to the new section after it's rendered
    setTimeout(() => {
      const sectionElement = sectionRefs.current[newSectionId];
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight the section briefly
        setHighlightedSection(newSectionId);
        setTimeout(() => setHighlightedSection(null), 2000);
      }
    }, 100);
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

  const renderEditableText = (
    sectionId: string | null,
    field: string,
    value: string,
    className: string = "",
    isRichText: boolean = false,
    promiseId?: string
  ) => {
    const isEditing = editingField?.sectionId === sectionId && 
                     editingField?.field === field && 
                     editingField?.promiseId === promiseId;

    if (isEditing) {
      return (
        <div className="relative z-50 mb-4">
          {isRichText ? (
            <div className="bg-white border-2 border-primary rounded-lg p-4 shadow-xl">
              <RichTextEditor
                value={value || ""}
                onChange={(val) => updateField(sectionId, field, val, promiseId)}
                placeholder="Enter text..."
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => setEditingField(null)}>
                  Done
                </Button>
              </div>
            </div>
          ) : field === "ctaText" ? (
            <div className="bg-white border-2 border-primary rounded-lg p-2 shadow-xl">
              <input
                type="text"
                value={value || ""}
                onChange={(e) => updateField(sectionId, field, e.target.value, promiseId)}
                className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm"
                placeholder="Button text"
                autoFocus
                onBlur={() => setTimeout(() => setEditingField(null), 200)}
              />
              <input
                type="text"
                value={localStory.sections.find(s => s.id === sectionId)?.ctaLink || ""}
                onChange={(e) => updateField(sectionId, "ctaLink", e.target.value, promiseId)}
                className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm mt-2"
                placeholder="Button link (e.g., /shop)"
                onBlur={() => setTimeout(() => setEditingField(null), 200)}
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => setEditingField(null)}>
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white border-2 border-primary rounded-lg p-2 shadow-xl">
              <textarea
                value={value || ""}
                onChange={(e) => updateField(sectionId, field, e.target.value, promiseId)}
                className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm min-h-[100px]"
                autoFocus
                onBlur={() => setTimeout(() => setEditingField(null), 200)}
              />
              <div className="flex gap-2 mt-2">
                <Button size="sm" onClick={() => setEditingField(null)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // For CTA text inside buttons, don't wrap in clickable div
    if (field === "ctaText" && value) {
      return (
        <span className={className}>
          {value || "Click to edit..."}
        </span>
      );
    }

    return (
      <div
        className={`group relative cursor-pointer ${className}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setEditingField({ sectionId: sectionId || undefined, field, promiseId });
        }}
      >
        {isRichText ? (
          <div
            dangerouslySetInnerHTML={{ __html: value || "<p class='text-muted-foreground italic'>Click to edit...</p>" }}
            className="prose prose-sm max-w-none"
          />
        ) : (
          <span className={value ? "" : "text-muted-foreground italic"}>{value || "Click to edit..."}</span>
        )}
        {field !== "ctaText" && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 bg-white shadow-md z-10"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditingField({ sectionId: sectionId || undefined, field, promiseId });
            }}
          >
            <Edit2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  };

  const renderEditableImage = (sectionId: string, field: string, value: string, alt: string = "") => {
    const isEditing = editingField?.sectionId === sectionId && editingField?.field === field;
    const section = localStory.sections.find(s => s.id === sectionId);

    if (isEditing) {
      return (
        <div className="bg-white border-2 border-primary rounded-lg p-4 shadow-xl z-50 relative mb-4">
          <input
            type="text"
            value={value || ""}
            onChange={(e) => updateField(sectionId, field, e.target.value)}
            placeholder="/images/hero/image.png"
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm mb-2"
            autoFocus
          />
          <input
            type="text"
            value={alt || ""}
            onChange={(e) => updateField(sectionId, "imageAlt", e.target.value)}
            placeholder="Image alt text"
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm mb-2"
          />
          <select
            value={section?.imagePosition || "left"}
            onChange={(e) => updateField(sectionId, "imagePosition", e.target.value)}
            className="w-full rounded-lg border border-black/10 bg-white px-4 py-2 text-sm mb-2"
          >
            <option value="left">Image on Left</option>
            <option value="right">Image on Right</option>
          </select>
          <Button size="sm" onClick={() => setEditingField(null)}>
            Done
          </Button>
        </div>
      );
    }

    return (
      <div
        className="group relative cursor-pointer"
        onClick={() => setEditingField({ sectionId, field })}
      >
        {value ? (
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border-2 border-transparent group-hover:border-primary transition-colors">
            <Image
              src={value}
              alt={alt || ""}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <Button
                size="icon"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100 transition-opacity bg-white shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingField({ sectionId, field });
                }}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center group-hover:border-primary transition-colors">
            <div className="text-center">
              <Edit2 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Click to add image</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (section: StorySection, index: number) => {
    const isHighlighted = highlightedSection === section.id;
    
    switch (section.type) {
      case "hero":
        return (
          <div 
            key={section.id} 
            ref={(el) => { sectionRefs.current[section.id] = el; }}
            className={`mb-16 grid gap-12 lg:grid-cols-2 lg:items-center relative group transition-all duration-500 ${
              isHighlighted ? "ring-4 ring-primary ring-offset-4 rounded-2xl p-4" : ""
            }`}
          >
            <div className="absolute -left-8 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveSection(section.id, "up")}
                disabled={index === 0}
                className="h-8 w-8"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveSection(section.id, "down")}
                disabled={index === localStory.sections.length - 1}
                className="h-8 w-8"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteSection(section.id)}
                className="h-8 w-8 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className={section.imagePosition === "right" ? "order-2" : ""}>
              {renderEditableImage(section.id, "image", section.image || "", section.imageAlt || "")}
            </div>
            <div className="space-y-6">
              {renderEditableText(section.id, "title", section.title || "", "font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl")}
              {renderEditableText(section.id, "description", section.description || "", "text-lg text-[hsl(var(--text-secondary))]", true)}
            </div>
          </div>
        );

      case "promises":
        return (
          <div 
            key={section.id} 
            ref={(el) => { sectionRefs.current[section.id] = el; }}
            className={`mb-16 relative group transition-all duration-500 ${
              isHighlighted ? "ring-4 ring-primary ring-offset-4 rounded-2xl p-4" : ""
            }`}
          >
            <div className="absolute -left-8 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveSection(section.id, "up")}
                disabled={index === 0}
                className="h-8 w-8"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveSection(section.id, "down")}
                disabled={index === localStory.sections.length - 1}
                className="h-8 w-8"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteSection(section.id)}
                className="h-8 w-8 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {renderEditableText(
              section.id,
              "title",
              section.title || "",
              "mb-12 text-center font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl"
            )}
            {section.promises && section.promises.length > 0 && (
              <div className="grid gap-6 md:grid-cols-3">
                {section.promises.map((promise) => (
                  <Card
                    key={promise.id}
                    className="group h-full cursor-pointer transition-all duration-300 border-black/10 bg-white/80 hover:!bg-[hsl(var(--primary))] hover:!border-[hsl(var(--primary))] hover:!shadow-[hsl(var(--primary))]/20 relative"
                  >
                    <CardContent className="p-6">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => removePromise(section.id, promise.id)}
                          className="h-6 w-6 text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {renderEditableText(
                        section.id,
                        "title",
                        promise.title,
                        "mb-3 font-display text-xl font-semibold text-[hsl(var(--text-primary))] transition-colors duration-300 group-hover:!text-white",
                        false,
                        promise.id
                      )}
                      {renderEditableText(
                        section.id,
                        "description",
                        promise.description,
                        "text-sm text-[hsl(var(--text-secondary))] transition-colors duration-300 group-hover:!text-white/90",
                        false,
                        promise.id
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => addPromise(section.id)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Promise Card
            </Button>
          </div>
        );

      case "content":
        return (
          <div 
            key={section.id} 
            ref={(el) => { sectionRefs.current[section.id] = el; }}
            className={`mb-16 grid gap-12 lg:grid-cols-2 lg:items-center relative group transition-all duration-500 ${
              isHighlighted ? "ring-4 ring-primary ring-offset-4 rounded-2xl p-4" : ""
            }`}
          >
            <div className="absolute -left-8 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveSection(section.id, "up")}
                disabled={index === 0}
                className="h-8 w-8"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveSection(section.id, "down")}
                disabled={index === localStory.sections.length - 1}
                className="h-8 w-8"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteSection(section.id)}
                className="h-8 w-8 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className={`space-y-6 ${section.imagePosition === "right" ? "order-2 lg:order-1" : "order-2 lg:order-1"}`}>
              {renderEditableText(section.id, "title", section.title || "", "font-display text-3xl font-bold text-[hsl(var(--text-primary))] sm:text-4xl")}
              {renderEditableText(section.id, "description", section.description || "", "text-lg text-[hsl(var(--text-secondary))]", true)}
              {section.ctaText && section.ctaLink ? (
                <div 
                  className="inline-block"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!editingField || editingField.sectionId !== section.id || editingField.field !== "ctaText") {
                      setEditingField({ sectionId: section.id, field: "ctaText" });
                    }
                  }}
                >
                  <Button size="lg" className="relative group/btn pointer-events-none">
                    {renderEditableText(section.id, "ctaText", section.ctaText, "")}
                  </Button>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setEditingField({ sectionId: section.id, field: "ctaText" });
                  }}
                  className="cursor-pointer"
                >
                  Click to add CTA
                </Button>
              )}
            </div>
            {section.image ? (
              <div className={section.imagePosition === "right" ? "order-1 lg:order-2" : "order-1 lg:order-2"}>
                {renderEditableImage(section.id, "image", section.image, section.imageAlt || "")}
              </div>
            ) : (
              <div className={section.imagePosition === "right" ? "order-1 lg:order-2" : "order-1 lg:order-2"}>
                {renderEditableImage(section.id, "image", "", "")}
              </div>
            )}
          </div>
        );

      case "cta":
        return (
          <div 
            key={section.id} 
            ref={(el) => { sectionRefs.current[section.id] = el; }}
            className={`mb-16 text-center relative group transition-all duration-500 ${
              isHighlighted ? "ring-4 ring-primary ring-offset-4 rounded-2xl p-4" : ""
            }`}
          >
            <div className="absolute -left-8 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveSection(section.id, "up")}
                disabled={index === 0}
                className="h-8 w-8"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => moveSection(section.id, "down")}
                disabled={index === localStory.sections.length - 1}
                className="h-8 w-8"
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteSection(section.id)}
                className="h-8 w-8 text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {section.ctaText && section.ctaLink ? (
              <div 
                className="inline-block"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!editingField || editingField.sectionId !== section.id || editingField.field !== "ctaText") {
                    setEditingField({ sectionId: section.id, field: "ctaText" });
                  }
                }}
              >
                <Button size="lg" className="relative group/btn pointer-events-none">
                  {renderEditableText(section.id, "ctaText", section.ctaText, "")}
                </Button>
              </div>
            ) : (
              <Button 
                size="lg" 
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingField({ sectionId: section.id, field: "ctaText" });
                }}
                className="cursor-pointer"
              >
                Click to add CTA
              </Button>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const sortedSections = [...localStory.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-primary))]">
      {/* Toolbar */}
      <div className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-display font-bold">Story Editor</h2>
              <p className="text-sm text-muted-foreground">
                Click any element to edit. Changes auto-save after 2 seconds.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-2 mr-4">
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
        </div>
      </div>

      {/* Canvas - Renders exactly like the frontend */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Page Header */}
        <div className="mb-12 text-center">
          {renderEditableText(
            null,
            "pageTitle",
            localStory.pageTitle,
            "mb-4 font-display text-4xl font-bold text-[hsl(var(--text-primary))] sm:text-5xl"
          )}
          {renderEditableText(
            null,
            "pageSubtitle",
            localStory.pageSubtitle,
            "mx-auto max-w-2xl text-lg text-[hsl(var(--text-secondary))]"
          )}
        </div>

        {/* Sections */}
        {sortedSections.map((section, index) => renderSection(section, index))}
      </div>
    </div>
  );
}
