"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  ArrowLeft,
  Search,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FAQCategory } from "@/data/faq";
import FAQForm from "@/components/admin/FAQForm";

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<FAQCategory | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<{ categoryId: string; question: any } | null>(null);
  const [reorderBusy, setReorderBusy] = useState(false);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch("/api/faq", { cache: "no-store" });
      const result = await response.json();
      if (result.success) {
        setFaqs(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category and all its questions?")) return;

    try {
      const response = await fetch(`/api/faq?id=${id}&type=category`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        fetchFAQs();
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };

  const handleDeleteQuestion = async (categoryId: string, questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const response = await fetch(`/api/faq?id=${questionId}&type=question`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (result.success) {
        fetchFAQs();
      }
    } catch (error) {
      console.error("Failed to delete question:", error);
    }
  };

  const handleEditCategory = (category: FAQCategory) => {
    setEditingCategory(category);
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleEditQuestion = (categoryId: string, question: any) => {
    setEditingQuestion({ categoryId, question });
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setEditingQuestion(null);
    setShowForm(true);
  };

  const handleAddQuestion = (categoryId: string) => {
    setEditingQuestion({ categoryId, question: null });
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingCategory(null);
    setEditingQuestion(null);
    fetchFAQs();
  };

  const canReorderQuestions = searchTerm.trim() === "";

  const handleMoveQuestion = async (
    categoryId: string,
    questionId: string,
    direction: "up" | "down"
  ) => {
    const category = faqs.find((c) => c.id === categoryId);
    if (!category) return;
    const idx = category.questions.findIndex((q) => q.id === questionId);
    if (idx === -1) return;
    const newIdx = direction === "up" ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= category.questions.length) return;

    const questionIds = category.questions.map((q) => q.id);
    [questionIds[idx], questionIds[newIdx]] = [questionIds[newIdx], questionIds[idx]];

    setReorderBusy(true);
    try {
      const response = await fetch("/api/faq", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, questionIds }),
      });
      const result = await response.json();
      if (result.success) {
        await fetchFAQs();
      } else {
        alert(result.error ?? "Failed to reorder questions");
      }
    } catch (error) {
      console.error("Failed to reorder FAQ:", error);
      alert("Failed to reorder questions");
    } finally {
      setReorderBusy(false);
    }
  };

  const filteredFAQs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (q) =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0 || category.category.toLowerCase().includes(searchTerm.toLowerCase()));

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
              <HelpCircle className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-display font-semibold">FAQ Management</h1>
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
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 flex flex-col gap-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-describedby={!canReorderQuestions ? "faq-search-reorder-hint" : undefined}
              />
            </div>
            {!canReorderQuestions && (
              <p id="faq-search-reorder-hint" className="text-xs text-muted-foreground pl-1">
                Clear search to reorder questions with the arrow buttons.
              </p>
            )}
          </div>
          <Button onClick={handleAddCategory} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* FAQs List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-muted-foreground">Loading FAQs...</p>
          </div>
        ) : filteredFAQs.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? "No FAQs found matching your search." : "No FAQs yet. Add your first category!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredFAQs.map((category) => (
              <Card key={category.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{category.category}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {category.questions.length} question{category.questions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleAddQuestion(category.id)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Question
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleEditCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.questions.map((question, index) => (
                      <div
                        key={question.id}
                        className="p-4 border rounded-lg flex items-start justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium mb-1">{question.question}</h4>
                          <p className="text-sm text-muted-foreground">{question.answer}</p>
                        </div>
                        <div className="flex items-start gap-1 shrink-0">
                          {canReorderQuestions && (
                            <div className="flex flex-col gap-0.5 border-r border-black/10 pr-1 mr-1">
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                disabled={reorderBusy || index === 0}
                                onClick={() => handleMoveQuestion(category.id, question.id, "up")}
                                aria-label="Move question up"
                              >
                                <ChevronUp className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                disabled={
                                  reorderBusy || index === category.questions.length - 1
                                }
                                onClick={() => handleMoveQuestion(category.id, question.id, "down")}
                                aria-label="Move question down"
                              >
                                <ChevronDown className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleEditQuestion(category.id, question)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8"
                            onClick={() => handleDeleteQuestion(category.id, question.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* FAQ Form Modal */}
      {showForm && (
        <FAQForm
          category={editingCategory}
          question={editingQuestion}
          categories={faqs}
          onClose={handleFormClose}
        />
      )}
    </div>
  );
}
