import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, X, Upload } from "lucide-react";
import {
  RECIPE_MEAL_TYPES,
  FOOD_TYPES,
} from "./recipesData";
import { useIngredientStore } from "@/stores/ingredientStore";
import { useRecipeStore } from "@/stores/recipeStore";
import { useCentreStore } from "@/stores/centreStore";
import { toast } from "sonner";


const empty = {
  name: "",
  foodType: "",
  mealType: "",
  ingredients: [],
  description: "",
  note: "",
  image: "",
  videoUrl: "",
};

export function AddRecipeModal({ open, onOpenChange, initial }) {
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const { ingredients: allIngredients, fetchIngredients } = useIngredientStore();
  const { addRecipe, updateRecipe } = useRecipeStore();

  const [form, setForm] = useState(empty);
  const [ingQuery, setIngQuery] = useState("");
  const [ingOpen, setIngOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef(null);

  const videoFileRef = useRef(null);

  useEffect(() => {
    if (open) {
      fetchIngredients();
    }
  }, [open, fetchIngredients]);


  useEffect(() => {
    if (open) {
      if (initial) {
        // Handle various potential keys and data types for ingredients
        const rawIngs = initial.ingredients || initial.ingredient || initial.recipe_ingredients || [];
        let ingList = [];
        
        if (Array.isArray(rawIngs)) {
          ingList = rawIngs;
        } else if (typeof rawIngs === 'string' && rawIngs.includes(',')) {
          ingList = rawIngs.split(',').map(s => s.trim());
        } else if (rawIngs) {
          ingList = [rawIngs];
        }

        const names = ingList.map(item => {
          if (typeof item === 'object' && item.name) return item.name;
          // If it's an ID (number or string), find the name in our global list
          const found = allIngredients.find(ai => String(ai.id) === String(item));
          return found ? found.name : item;
        }).filter(Boolean);

        setForm({
          ...empty,
          name: initial.itemName || "",
          foodType: (initial.foodtype || "").replace("-", "_"),
          mealType: (initial.type || "").toLowerCase(),
          ingredients: names,
          description: initial.recipe || "",
          note: initial.notes || initial.note || "",
          image: initial.mediaUrl || "",
          videoUrl: initial.RecipeVideolink || "",
        });
      } else {
        setForm(empty);
      }
      setIngQuery("");
    }
  }, [open, initial, allIngredients]);




  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const addIngredient = (val) => {
    const v = val.trim();
    if (!v) return;
    if (form.ingredients.includes(v)) return;
    set("ingredients", [...form.ingredients, v]);
    setIngQuery("");
  };
  const removeIngredient = (val) =>
    set(
      "ingredients",
      form.ingredients.filter((x) => x !== val)
    );

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("imageFile", file);
    const reader = new FileReader();
    reader.onload = () => set("image", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleVideoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("videoFile", file);
  };


  const canSubmit = form.name.trim() && form.foodType && form.mealType;

  const submit = async () => {
    if (!canSubmit || loading) return;
    setLoading(true);
    
    // Find ingredient IDs from names

    const selectedIngIds = form.ingredients.map(name => {
      const found = allIngredients.find(i => i.name === name);
      return found ? found.id : null;
    }).filter(id => id !== null);

    const payload = {
      centerId: activeCentreId,
      itemName: form.name,
      mealType: form.mealType,
      ingredients: selectedIngIds,
      recipe: form.description,
      notes: form.note,
      foodtype: form.foodType,
      RecipeVideolink: form.videoUrl,
    };

    if (form.imageFile) payload["image[]"] = form.imageFile;
    if (form.videoFile) payload["video[]"] = form.videoFile;

    try {
      if (initial?.id) {
        await updateRecipe({ ...payload, id: initial.id });
        toast.success("Recipe updated successfully");
      } else {
        await addRecipe(payload);
        toast.success("Recipe added successfully");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(error?.message || "Failed to save recipe");
    } finally {
      setLoading(false);
    }
  };



  const filteredIngs = allIngredients.filter(
    (o) =>
      o.name.toLowerCase().includes(ingQuery.toLowerCase()) &&
      !form.ingredients.includes(o.name)
  );


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden max-h-[92vh] flex flex-col">
        <DialogHeader className="bg-primary text-primary-foreground px-5 py-4 space-y-0">
          <DialogTitle className="text-primary-foreground text-base">
            {initial ? "Edit Recipe" : "Add Recipe"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          <div className="space-y-1.5">
            <Label>Item Name</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Chicken Dum Biryani"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Food Type</Label>
            <Select value={form.foodType} onValueChange={(v) => set("foodType", v)}>
              <SelectTrigger>
                <SelectValue placeholder="-- Select Type --" />
              </SelectTrigger>
              <SelectContent>
                {FOOD_TYPES.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Select Meal Type</Label>
              <Select value={form.mealType} onValueChange={(v) => set("mealType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select MealType" />
                </SelectTrigger>
                <SelectContent>
                  {RECIPE_MEAL_TYPES.map((m, i) => (
                    <SelectItem key={m.id} value={m.id}>
                      {i + 1} - {m.label.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 relative">
              <Label>Select Ingredient</Label>
              <Input
                value={ingQuery}
                onChange={(e) => {
                  setIngQuery(e.target.value);
                  setIngOpen(true);
                }}
                onFocus={() => setIngOpen(true)}
                onBlur={() => setTimeout(() => setIngOpen(false), 150)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addIngredient(ingQuery);
                  }
                }}
                placeholder="Select ingredients"
              />
              {ingOpen && filteredIngs.length > 0 && (
                <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border bg-popover shadow-md">
                  {filteredIngs.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addIngredient(o.name);
                      }}
                      className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                    >
                      {o.name}
                    </button>
                  ))}
                </div>
              )}
              {form.ingredients.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {form.ingredients.map((ing) => (
                    <Badge key={ing} variant="secondary" className="gap-1">
                      {ing}
                      <button
                        type="button"
                        onClick={() => removeIngredient(ing)}
                        className="ml-0.5 rounded hover:bg-background/40"
                        aria-label={`Remove ${ing}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description Recipe</Label>
            <Textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Step by step preparation..."
            />
          </div>

          <div className="space-y-1.5">
            <Label>Note (if ingredient not available)</Label>
            <Textarea
              rows={2}
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Optional notes..."
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Add Image</Label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose file
                </Button>
                {form.image ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-md border">
                    <img
                      src={form.image}
                      alt="preview"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => set("image", "")}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                      aria-label="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">No file chosen</span>
                )}
              </div>
              <p className="text-xs font-semibold text-emerald-600">(Under 5 MB Only)</p>
            </div>

            <div className="space-y-1.5">
              <Label>Add Video</Label>
              <input
                ref={videoFileRef}
                type="file"
                accept="video/*"
                onChange={handleVideoFile}
                className="hidden"
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => videoFileRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose Video
                </Button>
                {form.videoFile ? (
                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">{form.videoFile.name}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">No file chosen</span>
                )}
              </div>
              <p className="text-xs font-semibold text-emerald-600">(Under 10 MB Only)</p>
              
              <div className="mt-2 space-y-1.5">
                <Label className="text-xs">Or YouTube Link</Label>
                <Input
                  value={form.videoUrl}
                  onChange={(e) => set("videoUrl", e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="h-8 text-xs"
                />
              </div>
            </div>

          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-5 py-3 bg-muted/30">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit || loading}>
            {loading ? (initial ? "Updating..." : "Saving...") : (initial ? "Update" : "Save")}
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}