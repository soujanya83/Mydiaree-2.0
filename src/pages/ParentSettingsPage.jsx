import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Filter,
  Users,
  ChevronDown,
  Check,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { toast } from "sonner";
import { initialCenters } from "@/components/centers/centersData";
import { initialParents, AVAILABLE_CHILDREN } from "@/components/parents/parentsData";
import { AddParentModal } from "@/components/parents/AddParentModal";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function childName(id) {
  return AVAILABLE_CHILDREN.find((c) => c.id === id)?.name ?? "Unknown";
}

export default function ParentSettingsPage() {
  const [parents, setParents] = useState(initialParents);
  const [centerId, setCenterId] = useState(initialCenters[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, initial: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  const activeCenter = initialCenters.find((c) => c.id === centerId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parents
      .filter((p) => p.centerId === centerId)
      .filter((p) => {
        if (!q) return true;
        if (p.name.toLowerCase().includes(q)) return true;
        return p.children.some((c) => childName(c.childId).toLowerCase().includes(q));
      });
  }, [parents, centerId, query]);

  const handleSave = (data) => {
    if (data.id) {
      setParents((arr) => arr.map((p) => (p.id === data.id ? { ...p, ...data } : p)));
      toast.success("Parent updated");
    } else {
      setParents((arr) => [
        ...arr,
        { ...data, id: `p${Date.now()}`, centerId },
      ]);
      toast.success("Parent added");
    }
  };

  const handleDelete = () => {
    setParents((arr) => arr.filter((p) => p.id !== confirm.id));
    setConfirm({ open: false, id: null });
    toast.success("Parent deleted");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Parent Settings"
        description="Manage parent accounts and link them to children"
        breadcrumbs={[{ label: "Settings", to: "/settings" }, { label: "Parent Settings" }]}
        actions={
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {activeCenter?.name ?? "Select Center"}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {initialCenters.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => setCenterId(c.id)}
                    className="flex items-center justify-between gap-2"
                  >
                    {c.name}
                    {c.id === centerId && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setModal({ open: true, initial: null })} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Parent
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-card text-primary">
          <Filter className="h-4 w-4" />
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by Parent or Child"
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No parents in this center.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
            >
              <div
                className="absolute inset-0 -z-10 opacity-60"
                style={{
                  background:
                    "radial-gradient(circle at top right, color-mix(in oklab, var(--primary) 8%, transparent), transparent 60%)",
                }}
              />

              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
                  <AvatarImage src={p.avatar} alt={p.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitials(p.name)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 text-base font-bold text-foreground">{p.name}</h3>
                <p className="mt-1 text-xs text-foreground">
                  <span className="font-semibold">Email: </span>
                  <span className="text-muted-foreground break-all">{p.email}</span>
                </p>
                <p className="mt-0.5 text-xs text-foreground">
                  <span className="font-semibold">Contact: </span>
                  <span className="text-muted-foreground">{p.contact || "—"}</span>
                </p>

                <div className="mt-3 w-full">
                  <p className="text-xs font-semibold text-foreground">Children:</p>
                  {p.children.length === 0 ? (
                    <p className="mt-1 text-xs italic text-muted-foreground">No children linked</p>
                  ) : (
                    <ul className="mt-1 space-y-0.5">
                      {p.children.map((c, i) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          {childName(c.childId)}{" "}
                          <span className="text-foreground">({c.relation})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setModal({ open: true, initial: p })}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm({ open: true, id: p.id })}
                  className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow-sm hover:opacity-90"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddParentModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        initial={modal.initial}
        onSave={handleSave}
      />

      <AlertDialog open={confirm.open} onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this parent?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The parent account will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}