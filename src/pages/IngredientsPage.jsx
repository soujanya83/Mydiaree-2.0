import { useMemo, useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Sparkles, Loader2, Carrot, Wheat, Milk, Flame, Package, ArrowLeft, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AddIngredientModal } from "@/components/ingredients/AddIngredientModal";
import { toast } from "sonner";
import { useIngredientStore } from "@/stores/ingredientStore";
import { cn } from "@/lib/utils";

const CATEGORY_RULES = [
  {
    name: "Baking & Grains",
    keywords: ["flour", "sugar", "baking", "soda", "yeast", "cocoa", "chocolate", "starch", "powder", "oil"],
    color: "emerald",
    icon: "Wheat",
  },
  {
    name: "Dairy & Fats",
    keywords: ["butter", "milk", "cream", "cheese", "yogurt", "ghee", "fat"],
    color: "sky",
    icon: "Milk",
  },
  {
    name: "Spices & Herbs",
    keywords: ["coriander", "chilli", "ginger", "garlic", "salt", "pepper", "cinnamon", "vanilla", "essence", "oregano", "parsley", "basil", "spice", "herb"],
    color: "rose",
    icon: "Flame",
  },
  {
    name: "Fresh Produce",
    keywords: ["fruits", "vegetables", "apple", "banana", "orange", "lemon", "tomato", "onion", "carrot", "berries"],
    color: "amber",
    icon: "Carrot",
  },
];

const getCategory = (name) => {
  const lower = name.toLowerCase();
  for (const cat of CATEGORY_RULES) {
    if (cat.keywords.some((kw) => lower.includes(kw))) {
      return cat;
    }
  }
  return { name: "Other Ingredients", color: "indigo", icon: "Package" };
};

const ICON_MAP = {
  Wheat: Wheat,
  Milk: Milk,
  Flame: Flame,
  Carrot: Carrot,
  Package: Package,
};

const COLOR_MAP = {
  emerald: {
    border: "border-emerald-500/10 hover:border-emerald-500/25",
    bg: "bg-emerald-500/10",
    text: "text-emerald-600",
    badge: "bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20",
  },
  sky: {
    border: "border-sky-500/10 hover:border-sky-500/25",
    bg: "bg-sky-500/10",
    text: "text-sky-600",
    badge: "bg-sky-500/10 text-sky-700 hover:bg-sky-500/20",
  },
  rose: {
    border: "border-rose-500/10 hover:border-rose-500/25",
    bg: "bg-rose-500/10",
    text: "text-rose-600",
    badge: "bg-rose-500/10 text-rose-700 hover:bg-rose-500/20",
  },
  amber: {
    border: "border-amber-500/10 hover:border-amber-500/25",
    bg: "bg-amber-500/10",
    text: "text-amber-600",
    badge: "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20",
  },
  indigo: {
    border: "border-indigo-500/10 hover:border-indigo-500/25",
    bg: "bg-indigo-500/10",
    text: "text-indigo-600",
    badge: "bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20",
  },
};

export default function IngredientsPage() {
  const {
    ingredients,
    isLoading,
    fetchIngredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
  } = useIngredientStore();

  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, initial: null });
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ingredients;
    return ingredients.filter((i) => i.name.toLowerCase().includes(q));
  }, [ingredients, query]);

  const groupedCategories = useMemo(() => {
    const list = CATEGORY_RULES.map((cat) => ({
      ...cat,
      items: [],
    }));
    const others = { name: "Other Ingredients", color: "indigo", icon: "Package", items: [] };

    filtered.forEach((ing) => {
      const cat = getCategory(ing.name);
      if (cat.name === "Other Ingredients") {
        others.items.push(ing);
      } else {
        const found = list.find((c) => c.name === cat.name);
        if (found) {
          found.items.push(ing);
        } else {
          others.items.push(ing);
        }
      }
    });

    return [...list, others].filter((g) => g.items.length > 0);
  }, [filtered]);

  const handleSave = async (data) => {
    try {
      if (data.id) {
        await updateIngredient(data.id, data.name);
        toast.success("Ingredient successfully updated");
      } else {
        await addIngredient(data.name);
        toast.success("Ingredient successfully added to pantry");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to save ingredient");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteIngredient(confirmDelete.id);
      toast.success("Ingredient removed from pantry");
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error?.message || "Failed to delete ingredient");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={
          <span className="bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">
            Pantry Ingredients
          </span>
        }
        description="Manage, categorise and track culinary raw items for menus and recipes"
        breadcrumbs={[{ label: "Ingredients" }]}
        actions={
          <Button
            onClick={() => setModal({ open: true, initial: null })}
            className="h-10 gap-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-500 shadow-md shadow-primary/20 hover:scale-[1.01] transition-transform font-bold"
          >
            <Plus className="h-4.5 w-4.5" />
            Add Ingredient
          </Button>
        }
      />

      {/* Info Block / Banner */}
      <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/0 to-transparent p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="bg-primary/10 text-primary font-bold uppercase tracking-wider text-[10px] px-2.5 py-1">
              Food & Nutrition
            </Badge>
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
              Kitchen <span className="text-primary font-black">Pantry</span>
            </h2>
            <p className="max-w-2xl text-sm font-medium text-muted-foreground leading-relaxed">
              Organise raw food items into groups. These ingredients populate options when creating meal plans and recipes for child attendance menus.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <Carrot className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
        </div>
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/5 blur-3xl" />
      </section>

      {/* Search Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ingredients..."
            className="h-11 rounded-2xl border-muted-foreground/20 bg-card pl-10 focus-visible:ring-primary/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Content Grid */}
      {isLoading && ingredients.length === 0 ? (
        <div className="py-24">
          <PageLoader label="Fetching ingredients list..." size="sm" />
        </div>
      ) : groupedCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card/60 p-16 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground/40 border border-dashed">
            <Carrot className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-foreground">No Ingredients Found</h3>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground leading-relaxed">
            {query ? "Try adjusting your search filters." : "Your kitchen pantry is empty. Click 'Add Ingredient' to populate items."}
          </p>
          {!query && (
            <Button onClick={() => setModal({ open: true, initial: null })} variant="outline" className="mt-5 rounded-xl text-xs font-bold border-border">
              <Plus className="mr-1 h-4 w-4" /> Add First Ingredient
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedCategories.map((group) => {
            const colors = COLOR_MAP[group.color] || COLOR_MAP.indigo;
            const IconComp = ICON_MAP[group.icon] || Package;

            return (
              <div
                key={group.name}
                className={cn(
                  "flex flex-col rounded-3xl border bg-card shadow-sm p-6 relative overflow-hidden transition-all duration-200 hover:shadow-md",
                  colors.border
                )}
              >
                {/* Category Card Header */}
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-border/40">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("flex h-9 w-9 items-center justify-center rounded-xl", colors.bg, colors.text)}>
                      <IconComp className="h-5 w-5" />
                    </div>
                    <span className="font-extrabold text-foreground text-base sm:text-lg tracking-tight">{group.name}</span>
                  </div>
                  <Badge className={cn("font-bold rounded-full text-xs border-none px-2.5 py-0.5", colors.badge)}>
                    {group.items.length}
                  </Badge>
                </div>

                {/* Scrollable list of ingredients inside card */}
                <div className="space-y-2.5 flex-1 max-h-[270px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                  {group.items.map((ing) => (
                    <div
                      key={ing.id}
                      className="group flex items-center justify-between rounded-xl bg-muted/20 px-4 py-3 hover:bg-muted/40 transition-colors"
                    >
                      <span className="font-bold text-foreground text-sm sm:text-base tracking-tight truncate pr-2">
                        {ing.name}
                      </span>

                      {/* Actions on hover */}
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                        <button
                          type="button"
                          onClick={() => setModal({ open: true, initial: ing })}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-border bg-card text-primary transition-all hover:bg-primary/10 active:scale-90"
                          title="Edit Ingredient"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(ing)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/10 bg-card text-red-500 transition-all hover:bg-red-50 hover:text-red-700 active:scale-90"
                          title="Delete Ingredient"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddIngredientModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        initial={modal.initial}
        onSave={handleSave}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent className="rounded-3xl border border-border/80 bg-card p-6 shadow-2xl max-w-md animate-in zoom-in-95 duration-200">
          <AlertDialogHeader className="space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-center text-lg font-extrabold text-foreground">
              Delete Pantry Ingredient?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm font-medium text-muted-foreground leading-relaxed px-2">
              This action will permanently delete <span className="font-bold text-foreground">"{confirmDelete?.name}"</span>. It will be removed from your available ingredients whitelist.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2">
            <AlertDialogCancel className="w-full rounded-xl font-bold h-11 border-border bg-card">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="w-full rounded-xl bg-red-500 text-white font-bold h-11 hover:bg-red-600 shadow-lg shadow-red-500/10"
            >
              Delete Ingredient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
