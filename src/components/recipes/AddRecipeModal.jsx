import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { ChefHat, Utensils, Video, X, Upload, Loader2, Image as ImageIcon } from "lucide-react";
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
          image: initial.mediaUrl ? (initial.mediaUrl.startsWith("http") ? initial.mediaUrl : `https://mydiaree.com.au/${initial.mediaUrl}`) : "",
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
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl max-h-[92vh] flex flex-col">
        <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <DialogHeader className="px-6 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {initial ? "Edit Recipe" : "Create New Recipe"}
              </DialogTitle>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                {initial ? "Update your recipe details and ingredients" : "Add a new culinary masterpiece to your collection"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6 overflow-y-auto custom-scrollbar">
          <div className="rounded-2xl border border-border/60 bg-muted/20 p-5 space-y-5">
            <h3 className="text-xs font-bold text-foreground uppercase tracking-widest opacity-70">
              Basic Information
            </h3>
            
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-bold">Item Name *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Chicken Dum Biryani"
                  className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Food Type *</Label>
                <Select value={form.foodType} onValueChange={(v) => set("foodType", v)}>
                  <SelectTrigger className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {FOOD_TYPES.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">Meal Type *</Label>
                <Select value={form.mealType} onValueChange={(v) => set("mealType", v)}>
                  <SelectTrigger className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium">
                    <SelectValue placeholder="Select Meal Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {RECIPE_MEAL_TYPES.map((m, i) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label.toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 relative">
                <Label className="text-sm font-bold">Add Ingredients</Label>
                <div className="relative">
                  <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    value={ingQuery}
                    onChange={(e) => {
                      setIngQuery(e.target.value);
                      setIngOpen(true);
                    }}
                    onFocus={() => setIngOpen(true)}
                    onBlur={() => setTimeout(() => setIngOpen(false), 200)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addIngredient(ingQuery);
                      }
                    }}
                    placeholder="Search ingredients..."
                    className="h-11 pl-10 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
                
                {ingOpen && filteredIngs.length > 0 && (
                  <div className="absolute z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-border/60 bg-popover/95 backdrop-blur shadow-lg p-1 animate-in fade-in zoom-in-95 duration-200">
                    {filteredIngs.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addIngredient(o.name);
                        }}
                        className="flex w-full items-center px-3 py-2 text-sm font-medium rounded-lg hover:bg-primary/10 hover:text-primary transition-colors text-left"
                      >
                        {o.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {form.ingredients.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {form.ingredients.map((ing) => (
                  <Badge 
                    key={ing} 
                    variant="secondary" 
                    className="pl-3 pr-1 py-1 gap-1 rounded-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary transition-all font-bold"
                  >
                    {ing}
                    <button
                      type="button"
                      onClick={() => removeIngredient(ing)}
                      className="ml-1 flex h-4 w-4 items-center justify-center rounded-full transition-colors hover:bg-primary hover:text-white"
                      aria-label={`Remove ${ing}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold px-1">Preparation Steps</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Write the step-by-step preparation method here..."
                className="rounded-2xl bg-muted/20 border-border/60 focus-visible:ring-primary/20 min-h-[120px] p-4 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold px-1">Additional Notes</Label>
              <Textarea
                rows={2}
                value={form.note}
                onChange={(e) => set("note", e.target.value)}
                placeholder="Substitution tips or dietary warnings..."
                className="rounded-xl bg-muted/20 border-border/60 focus-visible:ring-primary/20 min-h-[80px] p-4 font-medium"
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-3">
              <Label className="text-sm font-bold px-1">Visual Media</Label>
              <div className="relative group">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />
                <div 
                  onClick={() => fileRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-all cursor-pointer p-4 h-32 ${
                    form.image 
                      ? "border-primary/40 bg-primary/5" 
                      : "border-border/60 bg-muted/10 hover:bg-muted/20 hover:border-primary/20"
                  }`}
                >
                  {form.image ? (
                    <div className="relative h-full aspect-video rounded-lg overflow-hidden border border-primary/20">
                      <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          set("image", "");
                          set("imageFile", null);
                        }}
                        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-white shadow-md hover:scale-110 transition-transform"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm text-primary">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">Add Recipe Photo</span>
                    </>
                  )}
                </div>
                <p className="text-[10px] font-bold text-center mt-1.5 text-muted-foreground opacity-60 uppercase tracking-wider">
                  JPG or PNG • Max 5MB
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold px-1">Video Guide</Label>
              <div className="space-y-3">
                <input
                  ref={videoFileRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFile}
                  className="hidden"
                />
                <div 
                  onClick={() => videoFileRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed transition-all cursor-pointer p-4 h-32 ${
                    form.videoFile 
                      ? "border-primary/40 bg-primary/5" 
                      : "border-border/60 bg-muted/10 hover:bg-muted/20 hover:border-primary/20"
                  }`}
                >
                  {form.videoFile ? (
                    <div className="flex flex-col items-center gap-1">
                      <Video className="h-6 w-6 text-primary" />
                      <span className="text-xs font-bold text-primary truncate max-w-[150px]">
                        {form.videoFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          set("videoFile", null);
                        }}
                        className="text-[10px] font-bold text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background shadow-sm text-primary">
                        <Video className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">Upload Video</span>
                    </>
                  )}
                </div>

                <div className="relative">
                  <Input
                    value={form.videoUrl}
                    onChange={(e) => set("videoUrl", e.target.value)}
                    placeholder="Or paste YouTube link..."
                    className="h-10 rounded-xl bg-background/50 text-xs font-medium focus-visible:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-end gap-3 border-t border-border/50 px-6 py-4 bg-muted/10">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            disabled={loading}
            className="rounded-xl font-bold h-11"
          >
            Cancel
          </Button>
          <Button 
            onClick={submit} 
            disabled={!canSubmit || loading}
            className="rounded-xl h-11 px-8 bg-gradient-to-r from-primary to-indigo-500 text-white font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              initial ? "Update Recipe" : "Save Recipe"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}