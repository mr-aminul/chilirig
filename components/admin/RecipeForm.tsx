"use client";

import { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "@/components/ui/loader";
import { Recipe } from "@/data/recipes";

interface RecipeFormProps {
  recipe?: Recipe | null;
  onClose: () => void;
}

export default function RecipeForm({ recipe, onClose }: RecipeFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    image: "",
    prepTime: "",
    cookTime: "",
    servings: "2",
    heatLevel: "3",
    ingredients: [{ name: "", amount: "" }],
    steps: [{ step: 1, instruction: "" }],
    tips: [""],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title,
        slug: recipe.slug,
        description: recipe.description,
        image: recipe.image,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings.toString(),
        heatLevel: recipe.heatLevel.toString(),
        ingredients:
          recipe.ingredients.length > 0
            ? recipe.ingredients
            : [{ name: "", amount: "" }],
        steps:
          recipe.steps.length > 0
            ? recipe.steps
            : [{ step: 1, instruction: "" }],
        tips: recipe.tips && recipe.tips.length > 0 ? recipe.tips : [""],
      });
    }
  }, [recipe]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...(recipe && { id: recipe.id }),
        title: formData.title,
        slug: formData.slug || formData.title.toLowerCase().replace(/\s+/g, "-"),
        description: formData.description,
        image: formData.image,
        prepTime: formData.prepTime,
        cookTime: formData.cookTime,
        servings: formData.servings,
        heatLevel: formData.heatLevel,
        ingredients: formData.ingredients.filter(
          (ing) => ing.name.trim() && ing.amount.trim()
        ),
        steps: formData.steps
          .filter((step) => step.instruction.trim())
          .map((step, index) => ({
            step: index + 1,
            instruction: step.instruction,
          })),
        tips: formData.tips.filter((tip) => tip.trim()),
      };

      const url = "/api/recipes";
      const method = recipe ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (result.success) {
        onClose();
      } else {
        alert("Failed to save recipe: " + result.error);
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe");
    } finally {
      setLoading(false);
    }
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: "", amount: "" }],
    });
  };

  const removeIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    });
  };

  const updateIngredient = (index: number, field: "name" | "amount", value: string) => {
    const updated = [...formData.ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, ingredients: updated });
  };

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { step: formData.steps.length + 1, instruction: "" }],
    });
  };

  const removeStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    });
  };

  const updateStep = (index: number, value: string) => {
    const updated = [...formData.steps];
    updated[index] = { ...updated[index], instruction: value };
    setFormData({ ...formData, steps: updated });
  };

  const addTip = () => {
    setFormData({
      ...formData,
      tips: [...formData.tips, ""],
    });
  };

  const removeTip = (index: number) => {
    setFormData({
      ...formData,
      tips: formData.tips.filter((_, i) => i !== index),
    });
  };

  const updateTip = (index: number, value: string) => {
    const updated = [...formData.tips];
    updated[index] = value;
    setFormData({ ...formData, tips: updated });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{recipe ? "Edit Recipe" : "Add New Recipe"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Recipe Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Auto-generated from title"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm min-h-[100px]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Prep Time *</label>
                <Input
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                  placeholder="5 min"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cook Time *</label>
                <Input
                  value={formData.cookTime}
                  onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                  placeholder="10 min"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Servings *</label>
                <Input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Heat Level *</label>
                <select
                  value={formData.heatLevel}
                  onChange={(e) => setFormData({ ...formData, heatLevel: e.target.value })}
                  className="w-full rounded-lg border border-black/10 bg-white/60 backdrop-blur-sm px-4 py-2 text-sm h-11"
                  required
                >
                  <option value="1">1 - Mild</option>
                  <option value="2">2 - Medium Mild</option>
                  <option value="3">3 - Medium</option>
                  <option value="4">4 - Hot</option>
                  <option value="5">5 - Extra Hot</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Image URL *</label>
              <Input
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="/images/recipes/recipe-name.png"
                required
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Ingredients *</label>
                <Button type="button" variant="ghost" size="sm" onClick={addIngredient}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Ingredient
                </Button>
              </div>
              <div className="space-y-2">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={ingredient.name}
                      onChange={(e) => updateIngredient(index, "name", e.target.value)}
                      placeholder="Ingredient name"
                      className="flex-1"
                    />
                    <Input
                      value={ingredient.amount}
                      onChange={(e) => updateIngredient(index, "amount", e.target.value)}
                      placeholder="Amount"
                      className="w-32"
                    />
                    {formData.ingredients.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Steps *</label>
                <Button type="button" variant="ghost" size="sm" onClick={addStep}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
              <div className="space-y-2">
                {formData.steps.map((step, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="flex items-center justify-center w-8 h-11 rounded-lg bg-muted text-sm font-medium">
                      {index + 1}
                    </span>
                    <Input
                      value={step.instruction}
                      onChange={(e) => updateStep(index, e.target.value)}
                      placeholder="Step instruction"
                      className="flex-1"
                    />
                    {formData.steps.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeStep(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium">Tips (Optional)</label>
                <Button type="button" variant="ghost" size="sm" onClick={addTip}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Tip
                </Button>
              </div>
              <div className="space-y-2">
                {formData.tips.map((tip, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={tip}
                      onChange={(e) => updateTip(index, e.target.value)}
                      placeholder="Tip text"
                      className="flex-1"
                    />
                    {formData.tips.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTip(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : recipe ? (
                  "Update Recipe"
                ) : (
                  "Create Recipe"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
