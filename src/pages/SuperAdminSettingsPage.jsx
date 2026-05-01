import { useMemo, useState } from "react";
import { Plus, Search, Pencil, Filter, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { initialSuperAdmins } from "@/components/superadmin/superAdminsData";
import { AddSuperAdminModal } from "@/components/superadmin/AddSuperAdminModal";
import { toast } from "sonner";

function getInitials(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function SuperAdminSettingsPage() {
  const [admins, setAdmins] = useState(initialSuperAdmins);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, initial: null });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q),
    );
  }, [admins, query]);

  const handleSave = (data) => {
    if (data.id) {
      setAdmins((arr) =>
        arr.map((a) => (a.id === data.id ? { ...a, ...data } : a)),
      );
      toast.success("Superadmin updated");
    } else {
      setAdmins((arr) => [
        ...arr,
        { ...data, id: `sa${Date.now()}` },
      ]);
      toast.success("Superadmin added");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super-Admin Settings"
        description="Manage super admin accounts that oversee the platform"
        breadcrumbs={[{ label: "Superadmin Settings" }]}
        actions={
          <Button
            onClick={() => setModal({ open: true, initial: null })}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Superadmin
          </Button>
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
            placeholder="Filter by name or email"
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">
            No superadmins found.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((a) => (
            <div
              key={a.id}
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
                <div className="relative">
                  {a.avatar ? (
                    <img
                      src={a.avatar}
                      alt={a.name}
                      className="h-20 w-20 rounded-full object-cover ring-4 ring-background shadow-md"
                    />
                  ) : (
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xl font-bold text-primary-foreground ring-4 ring-background shadow-md">
                      {getInitials(a.name)}
                    </div>
                  )}
                </div>
                <h3 className="mt-3 text-base font-bold text-foreground">
                  {a.name}
                </h3>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-foreground">
                    <span className="font-semibold">Email: </span>
                    <span className="text-muted-foreground break-all">
                      {a.email}
                    </span>
                  </p>
                  <p className="text-foreground">
                    <span className="font-semibold">Contact: </span>
                    <span className="text-muted-foreground">
                      {a.contact || "—"}
                    </span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModal({ open: true, initial: a })}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddSuperAdminModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        initial={modal.initial}
        onSave={handleSave}
      />
    </div>
  );
}