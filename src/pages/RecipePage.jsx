import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  ChevronDown,
  ChefHat,
  Eye,
  ZoomIn
} from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCentreStore } from "@/stores/centreStore";

import {
  RECIPE_MEAL_TYPES,
  FOOD_TYPES,
} from "@/components/recipes/recipesData";
import { AddRecipeModal } from "@/components/recipes/AddRecipeModal";
import { toast } from "sonner";
import { useRecipeStore } from "@/stores/recipeStore";
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";


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

const CARD_PRIMARY_ACTION_CLASSES =
  "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted/50 active:scale-90";
const CARD_PRIMARY_ACTION_STYLE = {
  color: "var(--primary)",
};

export default function RecipePage() {
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const centres = useCentreStore((s) => s.centres);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);
  const { can } = usePermissions();
  const perms = ACTION_PERMISSIONS.recipe;

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
  const [zoomedImage, setZoomedImage] = useState(null);

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
  
  // Use unique_meal_types from API if available, fallback to static types
  const availableMealTypes = mealTypes?.length > 0 ? mealTypes : RECIPE_MEAL_TYPES.map(m => m.id.toUpperCase());
  
  // Clean up format for tabs display (e.g., "AFTERNOON_TEA" -> "Afternoon Tea")
  const formatTabLabel = (str) => {
    return str.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title={
          <span className="bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent font-black tracking-tight">
            Recipes Library
          </span>
        }
        description="Browse, manage, and discover saved recipes for all meal types"
        breadcrumbs={[{ label: "Recipes Library" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="h-10 w-[220px] rounded-xl border-border/70 bg-background/70 backdrop-blur shadow-sm">
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
            {can(perms.add) && (
              <Button
                onClick={() => setModal({ open: true, initial: null })}
                className="h-10 gap-1.5 rounded-xl bg-gradient-to-r from-primary to-indigo-500 shadow-md shadow-primary/20 hover:scale-[1.01] transition-transform font-bold"
              >
                <Plus className="h-4.5 w-4.5" />
                Add Recipe
              </Button>
            )}
          </div>
        }
      />

      <div className="space-y-8">
        {isLoading && !hasRecipes ? (
          <PageLoader label="Loading recipes…" />
        ) : hasRecipes ? (
          <Tabs defaultValue={availableMealTypes[0]} className="w-full">
            <div className="mb-6 flex overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="h-12 bg-background/50 border border-border/60 p-1 rounded-2xl backdrop-blur shadow-sm">
                {availableMealTypes.map((mealType) => (
                  <TabsTrigger
                    key={mealType}
                    value={mealType}
                    className="rounded-xl px-5 py-2 font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
                  >
                    {formatTabLabel(mealType)}
                    <span className="ml-2 inline-flex h-5 items-center justify-center rounded-full bg-foreground/10 px-2 text-[10px] group-data-[state=active]:bg-white/20">
                      {recipesGrouped[mealType]?.length || 0}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {availableMealTypes.map((mealType) => {
              const items = recipesGrouped[mealType] || [];
              return (
                <TabsContent key={mealType} value={mealType} className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/40 py-24 text-center backdrop-blur">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20 mb-4">
                        <UtensilsCrossed className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold tracking-tight text-foreground">No {formatTabLabel(mealType)} Recipes</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Click "Add Recipe" to create your first one.</p>
                    </div>
                  ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                            ingredients: r.ingredients || [],
                          }}
                          onEdit={() => setModal({ open: true, initial: r })}
                          onDelete={() => setConfirmDelete(r)}
                          onZoomImage={setZoomedImage}
                          canEdit={can(perms.edit)}
                          canDelete={can(perms.delete)}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/40 py-32 text-center backdrop-blur">
            <div className="pointer-events-none absolute h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-indigo-500/20 text-primary shadow-inner shadow-primary/10 ring-1 ring-primary/20">
              <ChefHat className="h-10 w-10" />
            </div>
            <h3 className="relative text-2xl font-bold tracking-tight text-foreground">Your Recipe Book is Empty</h3>
            <p className="relative mt-2 text-sm font-medium text-muted-foreground max-w-sm">
              Start building your center's menu library. Click "Add Recipe" to create your first delicious entry.
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
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete recipe?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              This will permanently remove <span className="font-bold text-foreground">"{confirmDelete?.itemName}"</span> from your center.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Recipe"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Zoom Modal */}
      <Dialog open={!!zoomedImage} onOpenChange={(o) => !o && setZoomedImage(null)}>
        <DialogContent className="p-0 overflow-hidden sm:max-w-2xl border border-border/80 bg-black/95 backdrop-blur rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="relative w-full flex items-center justify-center p-2 bg-neutral-950/80">
            <img
              src={zoomedImage?.url}
              alt={zoomedImage?.name}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/75 px-6 py-4 text-white border-t border-white/10 backdrop-blur-sm">
              <p className="font-extrabold text-base">{zoomedImage?.name}</p>
              {zoomedImage?.author && (
                <p className="text-xs text-white/60 mt-0.5">Recipe by: {zoomedImage.author}</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecipeCard({ recipe, onEdit, onDelete, onZoomImage, canEdit = true, canDelete = true }) {
  const foodLabel = FOOD_TYPES.find((f) => f.id === recipe.foodType || f.id === recipe.foodType?.toLowerCase())?.label || recipe.foodType;
  const isVeg = recipe.foodType?.toLowerCase() === "veg";
  
  const getCleanImageUrl = (url) => {
    if (!url) return null;
    let cleaned = url.replace(/\\/g, "/");
    // Clean up any double slashes (e.g. "//") except after protocol
    cleaned = cleaned.replace(/([^:]\/)\/+/g, "$1");
    if (cleaned.startsWith("uploads/recipes/")) {
      cleaned = "storage/" + cleaned;
    }
    if (cleaned.startsWith("http")) return cleaned;
    return `https://mydiaree.com.au/${cleaned}`;
  };

  const imageUrl = getCleanImageUrl(recipe.image);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 h-full">
      <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/10 blur-3xl transition-opacity group-hover:bg-primary/20" />
      
      {/* 1. Image Container (Top) */}
      <div 
        onClick={() => imageUrl && onZoomImage({ url: imageUrl, name: recipe.name, author: recipe.author })}
        className={cn(
          "relative h-48 w-full shrink-0 overflow-hidden bg-muted/40",
          imageUrl ? "cursor-zoom-in" : ""
        )}
      >
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={recipe.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
            <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <ZoomIn className="h-4.5 w-4.5" />
            </div>
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/5">
            <UtensilsCrossed className="h-12 w-12 text-primary/30" />
          </div>
        )}
      </div>

      {/* 2. Body */}
      <div className="relative flex flex-grow flex-col p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-lg font-bold tracking-tight leading-snug text-foreground">
            {recipe.name}
          </h3>
          {foodLabel && (
            <div
              className={cn(
                "shrink-0 flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest shadow-sm",
                isVeg
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50"
                  : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50"
              )}
            >
              <div
                className={cn("h-1.5 w-1.5 rounded-full shadow-sm", isVeg ? "bg-emerald-500 shadow-emerald-500/50" : "bg-rose-500 shadow-rose-500/50")}
              />
              {foodLabel}
            </div>
          )}
        </div>

        <div className="mb-4 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-indigo-500/20 text-primary text-[10px] font-bold shadow-inner ring-1 ring-primary/30">
               {(recipe.author || "?").charAt(0).toUpperCase()}
            </div>
            <p className="font-semibold text-foreground line-clamp-1">
              <span className="text-muted-foreground font-medium mr-1">By:</span>
              {recipe.author}
            </p>
          </div>

          <div className="flex items-center gap-2 pt-0.5 font-medium">
            <Calendar className="h-4 w-4 text-primary/60" />
            <span>{formatDate(recipe.date)}</span>
          </div>
        </div>

        {/* Static Ingredients Tags (Show 4 explicitly, hover popup for more) */}
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <div className="mt-auto mb-5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">
              Ingredients
            </span>
            <div className="flex flex-wrap gap-1.5 items-center">
              {recipe.ingredients.slice(0, 4).map((ing) => (
                <Badge
                  key={ing.id || ing.name}
                  variant="outline"
                  className="rounded-xl border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-semibold text-primary/95"
                >
                  {ing.name}
                </Badge>
              ))}
              
              {recipe.ingredients.length > 4 && (
                <TooltipProvider delayDuration={50}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center rounded-full border border-border bg-muted/40 hover:bg-muted/80 px-2 py-0.5 text-[10px] font-bold text-muted-foreground transition-colors cursor-pointer"
                      >
                        +{recipe.ingredients.length - 4} more
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="bg-card text-card-foreground border shadow-xl max-w-[240px] p-2.5 rounded-2xl">
                      <div className="flex flex-wrap gap-1">
                        {recipe.ingredients.slice(4).map((ing) => (
                          <Badge
                            key={ing.id || ing.name}
                            variant="outline"
                            className="rounded-lg border-border bg-muted/40 px-1.5 py-0.5 text-[9px] font-medium"
                          >
                            {ing.name}
                          </Badge>
                        ))}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={cn("flex items-center justify-end gap-1.5 pt-3 border-t border-border/50", recipe.ingredients?.length === 0 && "mt-auto")}>
          {recipe.videoUrl && (
            <a
              href={recipe.videoUrl}
              target="_blank"
              rel="noreferrer"
              title="Watch Video"
              className={CARD_PRIMARY_ACTION_CLASSES}
              style={CARD_PRIMARY_ACTION_STYLE}
            >
              <Youtube className="h-4 w-4" />
            </a>
          )}
          {canEdit && (
            <button
              type="button"
              onClick={onEdit}
              title="Edit"
              className={CARD_PRIMARY_ACTION_CLASSES}
              style={CARD_PRIMARY_ACTION_STYLE}
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Delete"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-all duration-200 hover:bg-rose-50 hover:text-rose-700 active:scale-90 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
