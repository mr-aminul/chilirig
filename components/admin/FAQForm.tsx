"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FAQCategory } from "@/data/faq";

interface FAQFormProps {
  category: FAQCategory | null;
  question: { categoryId: string; question: any } | null;
  categories: FAQCategory[];
  onClose: () => void;
}

export default function FAQForm({ category, question, categories, onClose }: FAQFormProps) {
  const [formData, setFormData] = useState({
    categoryName: "",
    questionText: "",
    answerText: "",
    categoryId: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (category) {
      setFormData({
        categoryName: category.category,
        questionText: "",
        answerText: "",
        categoryId: category.id,
      });
    } else if (question) {
      setFormData({
        categoryName: "",
        questionText: question.question?.question || "",
        answerText: question.question?.answer || "",
        categoryId: question.categoryId,
      });
    } else {
      setFormData({
        categoryName: "",
        questionText: "",
        answerText: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
      });
    }
  }, [category, question, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (category || (!category && !question)) {
        // Creating or editing a category
        const payload = {
          id: category?.id || Date.now().toString(),
          category: formData.categoryName,
          questions: category?.questions || [],
        };

        const response = await fetch("/api/faq", {
          method: category ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, type: "category" }),
        });

        const result = await response.json();
        if (result.success) {
          onClose();
        } else {
          alert("Failed to save category: " + result.error);
        }
      } else if (question) {
        // Creating or editing a question
        const payload = {
          id: question.question?.id || Date.now().toString(),
          question: formData.questionText,
          answer: formData.answerText,
        };

        const response = await fetch("/api/faq", {
          method: question.question ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, type: "question", categoryId: formData.categoryId }),
        });

        const result = await response.json();
        if (result.success) {
          onClose();
        } else {
          alert("Failed to save question: " + result.error);
        }
      }
    } catch (error) {
      console.error("Error saving FAQ:", error);
      alert("Failed to save FAQ");
    } finally {
      setLoading(false);
    }
  };

  const isEditingCategory = category !== null || (category === null && question === null);
  const isEditingQuestion = question !== null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {isEditingCategory
              ? category
                ? "Edit Category"
                : "Add New Category"
              : question?.question
              ? "Edit Question"
              : "Add New Question"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isEditingCategory ? (
              <div>
                <label className="text-sm font-medium mb-1 block">Category Name *</label>
                <Input
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  required
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium mb-1 block">Category *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm h-11"
                    required
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Question *</label>
                  <Input
                    value={formData.questionText}
                    onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Answer *</label>
                  <textarea
                    value={formData.answerText}
                    onChange={(e) => setFormData({ ...formData, answerText: e.target.value })}
                    className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm min-h-[120px]"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
