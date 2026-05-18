import { useMemo, useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, Sparkles, Loader2, Carrot } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { ROW_TINTS } from "@/components/ingredients/ingredientsData";
import { AddIngredientModal } from "@/components/ingredients/AddIngredientModal";
import { toast } from "sonner";
import { useIngredientStore } from "@/stores/ingredientStore";


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


  const handleSave = async (data) => {
    try {
      if (data.id) {
        await updateIngredient(data.id, data.name);
        toast.success("Ingredient updated");
      } else {
        await addIngredient(data.name);
        toast.success("Ingredient added");
      }
    } catch (error) {
      toast.error(error?.message || "Failed to save ingredient");
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await deleteIngredient(confirmDelete.id);
      toast.success("Ingredient deleted");
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error?.message || "Failed to delete ingredient");
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Pantry Ingredients
          </span>
        }
        description="Manage and organize ingredients used across your recipes"
        breadcrumbs={[{ label: "Ingredients" }]}
        actions={
          <Button
            onClick={() => setModal({ open: true, initial: null })}
            className="h-10 gap-2 rounded-xl bg-gradient-to-r from-primary to-indigo-500 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all font-semibold"
          >
            <Plus className="h-4 w-4" />
            Add Ingredient
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ingredients..."
            className="h-11 rounded-2xl border-border/60 bg-card/60 pl-10 backdrop-blur shadow-sm focus-visible:ring-primary/20 transition-all"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-border/60 bg-card/60 shadow-sm backdrop-blur">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30 border-b-border/60">
              <TableHead className="w-20 px-6 py-4 text-foreground font-bold tracking-tight">#</TableHead>
              <TableHead className="text-foreground font-bold tracking-tight">Ingredient Name</TableHead>
              <TableHead className="w-32 text-right pr-6 text-foreground font-bold tracking-tight">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && ingredients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-48 text-center">
                  <PageLoader label="Loading ingredients…" size="sm" />
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((ing, idx) => (
                <TableRow
                  key={ing.id}
                  className="group border-b border-border/40 transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted/60"
                >
                  <TableCell className="px-6 py-4 font-bold text-muted-foreground">
                    {idx + 1}
                  </TableCell>
                  <TableCell className="py-4 font-semibold text-foreground">
                    {ing.name}
                  </TableCell>
                  <TableCell className="py-4 pr-6">
                    <div className="flex items-center justify-end gap-1.5 opacity-60 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => setModal({ open: true, initial: ing })}
                        title="Edit Ingredient"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10 active:scale-95"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(ing)}
                        title="Delete Ingredient"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-700 active:scale-95 dark:text-rose-400 dark:hover:bg-rose-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}


            {!isLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="h-64 text-center border-0">
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-12 backdrop-blur m-4">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
                      <Carrot className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">No Ingredients Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {query ? "Try adjusting your search query." : "Your pantry is empty. Click 'Add Ingredient' to get started."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>


      <AddIngredientModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        initial={modal.initial}
        onSave={handleSave}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete ingredient?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              This will permanently remove <span className="font-bold text-foreground">"{confirmDelete?.name}"</span> from your pantry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30"
            >
              Delete Ingredient
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
