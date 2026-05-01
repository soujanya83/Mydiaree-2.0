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
  INGREDIENT_OPTIONS,
} from "./recipesData";

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

export function AddRecipeModal({ open, onOpenChange, onSave, initial }) {
  const [form, setForm] = useState(empty);
  const [ingQuery, setIngQuery] = useState("");
  const [ingOpen, setIngOpen] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...empty, ...initial } : empty);
      setIngQuery("");
    }
  }, [open, initial]);

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
    const reader = new FileReader();
    reader.onload = () => set("image", String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const canSubmit = form.name.trim() && form.foodType && form.mealType;

  const submit = () => {
    if (!canSubmit) return;
    onSave?.({
      ...form,
      id: initial?.id,
      author: initial?.author || "Deepti (Superadmin)",
      date: initial?.date || new Date().toISOString().slice(0, 10),
    });
    onOpenChange(false);
  };

  const filteredIngs = INGREDIENT_OPTIONS.filter(
    (o) =>
      o.toLowerCase().includes(ingQuery.toLowerCase()) &&
      !form.ingredients.includes(o)
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
                      key={o}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        addIngredient(o);
                      }}
                      className="block w-full px-3 py-1.5 text-left text-sm hover:bg-accent"
                    >
                      {o}
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
              <Label>Add Video Link</Label>
              <Input
                value={form.videoUrl}
                onChange={(e) => set("videoUrl", e.target.value)}
                placeholder="https://youtube.com/..."
              />
              <p className="text-xs font-semibold text-emerald-600">(Under 10 MB Only)</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-5 py-3 bg-muted/30">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}