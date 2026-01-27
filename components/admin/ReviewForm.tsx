"use client";

import { useState, useEffect } from "react";
import { X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Review } from "@/data/reviews";

interface ReviewFormProps {
  review?: Review | null;
  onClose: () => void;
}

export default function ReviewForm({ review, onClose }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    rating: "5",
    comment: "",
    date: new Date().toISOString().split("T")[0],
    verified: true,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (review) {
      setFormData({
        name: review.name,
        rating: review.rating.toString(),
        comment: review.comment,
        date: review.date,
        verified: review.verified,
      });
    }
  }, [review]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...(review && { id: review.id }),
        name: formData.name,
        rating: formData.rating,
        comment: formData.comment,
        date: formData.date,
        verified: formData.verified,
      };

      const url = "/api/reviews";
      const method = review ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        onClose();
      } else {
        alert("Failed to save review: " + result.error);
      }
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Failed to save review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{review ? "Edit Review" : "Add New Review"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Customer Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Date *</label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Rating *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: rating.toString() })}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        rating <= parseInt(formData.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {formData.rating} / 5
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Comment *</label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm min-h-[120px]"
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="verified"
                checked={formData.verified}
                onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                className="h-4 w-4"
              />
              <label htmlFor="verified" className="text-sm font-medium">
                Verified Purchase
              </label>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : review ? "Update Review" : "Create Review"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
