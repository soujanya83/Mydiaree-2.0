import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  Youtube,
  User,
  Calendar,
  ImageOff,
  Loader2,
} from "lucide-react";
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
import { useCentreStore } from "@/stores/centreStore";

import {
  RECIPE_MEAL_TYPES,
  FOOD_TYPES,
} from "@/components/recipes/recipesData";
import { AddRecipeModal } from "@/components/recipes/AddRecipeModal";
import { toast } from "sonner";
import { useRecipeStore } from "@/stores/recipeStore";


function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt)) return d;
  return dt.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RecipePage() {
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const centres = useCentreStore((s) => s.centres);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);

  const {
    recipesGrouped,
    mealTypes,
    isLoading,
    fetchRecipes,
    deleteRecipe,
  } = useRecipeStore();

  const [modal, setModal] = useState({ open: false, initial: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeCentreId) {
      fetchRecipes(activeCentreId);
    }
  }, [activeCentreId, fetchRecipes]);

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await deleteRecipe(confirmDelete.id, activeCentreId);
      toast.success("Recipe deleted");
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error?.message || "Failed to delete recipe");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasRecipes = Object.values(recipesGrouped).some((arr) => arr.length > 0);



  return (
    <div className="space-y-6">
      <PageHeader
        title="Recipes List"
        description="Browse all saved recipes by meal type"
        breadcrumbs={[{ label: "Recipes List" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select centre" />
              </SelectTrigger>
              <SelectContent>
                {centres.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => setModal({ open: true, initial: null })}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Recipe
            </Button>
          </div>
        }
      />

      <div className="space-y-8">
        {isLoading && !hasRecipes ? (
          <div className="py-20 text-center text-muted-foreground">
            Loading recipes...
          </div>
        ) : (
          RECIPE_MEAL_TYPES.map((meal) => {
            const items = recipesGrouped[meal.id.toUpperCase()] || recipesGrouped[meal.id] || [];
            if (items.length === 0) return null;
            return (
              <section key={meal.id} className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                  <div className="flex items-center gap-2">
                    <UtensilsCrossed className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-bold text-foreground">{meal.label}</h2>
                  </div>
                  <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-bold text-muted-foreground uppercase">
                    {items.length} Recipes
                  </span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {items.map((r) => (
                    <RecipeCard
                      key={r.id}
                      recipe={{
                        id: r.id,
                        name: r.itemName,
                        foodType: r.foodtype,
                        mealType: r.type,
                        description: r.recipe,
                        note: r.notes,
                        image: r.mediaUrl,
                        videoUrl: r.RecipeVideolink,
                        author: r.created_by_name || "Unknown",
                        date: r.createdAt,
                      }}
                      onEdit={() => setModal({ open: true, initial: r })}
                      onDelete={() => setConfirmDelete(r)}
                    />
                  ))}
                </div>
              </section>
            );
          })
        )}

        {!isLoading && !hasRecipes && (
          <div className="rounded-xl border bg-card p-10 text-center">
            <UtensilsCrossed className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No recipes yet. Click "Add Recipe" to create your first one.
            </p>
          </div>
        )}
      </div>

      <AddRecipeModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        initial={modal.initial}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete recipe?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{confirmDelete?.itemName}" from your center.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RecipeCard({ recipe, onEdit, onDelete }) {
  const foodLabel = FOOD_TYPES.find((f) => f.id === recipe.foodType || f.id === recipe.foodType?.toLowerCase())?.label || recipe.foodType;
  const isVeg = recipe.foodType?.toLowerCase() === "veg";
  const imageUrl = recipe.image?.startsWith("http") ? recipe.image : `https://mydiaree.com.au/${recipe.image}`;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:shadow-md h-full">
      {/* 1. Image Container (Top) */}
      <div className="relative h-44 w-full shrink-0 overflow-hidden bg-muted/40">
        {recipe.image ? (
          <img
            src={imageUrl}
            alt={recipe.name}
            className="h-full w-full object-cover transition-opacity duration-1000 animate-in fade-in"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UtensilsCrossed className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}

      </div>

      {/* 2. Body */}
      <div className="flex flex-grow flex-col p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">
            {recipe.name}
          </h3>
          {foodLabel && (
            <div
              className={`shrink-0 flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                isVeg
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50"
                  : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50"
              }`}
            >
              <div
                className={`h-1 w-1 rounded-full ${isVeg ? "bg-emerald-500" : "bg-rose-500"}`}
              />
              {foodLabel}
            </div>
          )}
        </div>

        <div className="mb-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold dark:bg-slate-800 dark:text-slate-400">
               {(recipe.author || "?").charAt(0)}
            </div>
            <p className="font-medium text-foreground line-clamp-1">
              <span className="text-muted-foreground font-normal">By: </span>
              {recipe.author}
            </p>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(recipe.date)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-auto flex items-center justify-end gap-1 border-t border-border/50 pt-3">
          {recipe.videoUrl && (
            <a
              href={recipe.videoUrl}
              target="_blank"
              rel="noreferrer"
              title="Watch Video"
              className="flex h-8 w-8 items-center justify-center rounded-md text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
            >
              <Youtube className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={onEdit}
            title="Edit"
            className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-50"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            title="Delete"
            className="flex h-8 w-8 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
