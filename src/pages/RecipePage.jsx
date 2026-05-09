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
                <div className="flex items-center gap-2 border-b-2 border-primary/40 pb-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold text-primary">{meal.label}</h2>
                  <span className="text-xs text-muted-foreground">
                    ({items.length})
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
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm transition hover:shadow-md">
      <div className="border-b bg-muted/30 px-4 py-2">
        <h3 className="truncate text-sm font-bold text-primary">{recipe.name}</h3>
      </div>
      <div className="relative h-40 w-full overflow-hidden bg-muted">
        {recipe.image ? (
          <img
            src={imageUrl}
            alt={recipe.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-8 w-8" />
          </div>
        )}
        {foodLabel && (
          <Badge
            className={`absolute bottom-2 left-2 ${
              isVeg
                ? "bg-emerald-600 hover:bg-emerald-600"
                : "bg-rose-600 hover:bg-rose-600"
            } text-white border-0`}
          >
            {foodLabel.toUpperCase()}
          </Badge>
        )}
      </div>

      <div className="space-y-2 px-4 py-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span className="truncate">{recipe.author}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(recipe.date)}</span>
        </div>

        {recipe.videoUrl && (
          <a
            href={recipe.videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/20"
          >
            <Youtube className="h-3.5 w-3.5" />
            Watch Video
          </a>
        )}

        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
            aria-label="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
            aria-label="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
