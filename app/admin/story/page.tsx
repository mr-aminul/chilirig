"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  BookOpen, 
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StoryContent } from "@/data/story";
import StoryCanvas from "@/components/admin/StoryCanvas";

export default function StoryPage() {
  const [storyContent, setStoryContent] = useState<StoryContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStory();
  }, []);

  const fetchStory = async () => {
    try {
      const response = await fetch("/api/story");
      const result = await response.json();
      if (result.success) {
        setStoryContent(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch story:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (updatedStory: StoryContent) => {
    setStoryContent(updatedStory);
  };

  const handlePreview = () => {
    window.open("/story", "_blank");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-black/10 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <BookOpen className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-display font-semibold">Story Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  View Site
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading story content...</p>
          </div>
        ) : storyContent ? (
          <StoryCanvas
            story={storyContent}
            onSave={handleSave}
            onPreview={handlePreview}
          />
        ) : (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No story content found.</p>
          </div>
        )}
      </main>
    </div>
  );
}
