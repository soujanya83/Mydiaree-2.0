import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, Search, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
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
import {
  initialIngredients,
  ROW_TINTS,
} from "@/components/ingredients/ingredientsData";
import { AddIngredientModal } from "@/components/ingredients/AddIngredientModal";
import { toast } from "sonner";

export default function IngredientsPage() {
  const [items, setItems] = useState(initialIngredients);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, initial: null });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.name.toLowerCase().includes(q));
  }, [items, query]);

  const handleSave = (data) => {
    if (data.id) {
      setItems((arr) => arr.map((i) => (i.id === data.id ? { ...i, name: data.name } : i)));
      toast.success("Ingredient updated");
    } else {
      setItems((arr) => [...arr, { id: `i${Date.now()}`, name: data.name }]);
      toast.success("Ingredient added");
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) return;
    setItems((arr) => arr.filter((i) => i.id !== confirmDelete.id));
    toast.success("Ingredient deleted");
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ingredients List"
        description="Manage your pantry ingredients used in recipes"
        breadcrumbs={[{ label: "Ingredients List" }]}
        actions={
          <Button onClick={() => setModal({ open: true, initial: null })} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Ingredient
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ingredient..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-16 px-4 text-foreground font-semibold">#</TableHead>
              <TableHead className="text-foreground font-semibold">Ingredient Name</TableHead>
              <TableHead className="w-48 text-right pr-4 text-foreground font-semibold">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ing, idx) => (
              <TableRow
                key={ing.id}
                className={`${ROW_TINTS[idx % ROW_TINTS.length]} hover:brightness-95`}
              >
                <TableCell className="px-4 py-3 font-semibold text-foreground">
                  {idx + 1}
                </TableCell>
                <TableCell className="py-3 text-foreground">{ing.name}</TableCell>
                <TableCell className="py-3 pr-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setModal({ open: true, initial: ing })}
                      className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(ing)}
                      className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow-sm hover:opacity-90"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No ingredients found.
                  </p>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete ingredient?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{confirmDelete?.name}" from your ingredients list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
