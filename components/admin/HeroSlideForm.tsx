"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroSlide } from "@/data/hero";
import { normalizeImageUrl } from "@/lib/utils";

interface HeroSlideFormProps {
  slide?: HeroSlide | null;
  onClose: () => void;
  onSave: (slide: HeroSlide) => void;
}

export default function HeroSlideForm({ slide, onClose, onSave }: HeroSlideFormProps) {
  const [formData, setFormData] = useState({
    image: "",
    alt: "",
  });

  useEffect(() => {
    if (slide) {
      setFormData({
        image: slide.image,
        alt: slide.alt,
      });
    }
  }, [slide]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const image = normalizeImageUrl(formData.image.trim());
    const alt = formData.alt.trim();

    onSave({
      id: slide?.id ?? `hero-slide-${Date.now()}`,
      image,
      alt,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{slide ? "Edit Hero Slide" : "Add Hero Slide"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Image URL *</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://placehold.co/1920x1080/png?text=Hero+slide+URL"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Alt Text *</label>
              <Input
                value={formData.alt}
                onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                placeholder="Describe the slide image"
                required
              />
            </div>

            {formData.image && (
              <div>
                <p className="mb-2 text-sm font-medium">Preview</p>
                <div className="overflow-hidden rounded-lg border border-black/10 bg-muted">
                  <img
                    src={formData.image}
                    alt={formData.alt || "Hero slide preview"}
                    className="h-56 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 pt-2">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {slide ? "Update Slide" : "Add Slide"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
