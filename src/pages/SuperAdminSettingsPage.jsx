import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Pencil, Filter, ShieldAlert, Trash2, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddSuperAdminModal } from "@/components/superadmin/AddSuperAdminModal";
import { superAdminService } from "@/services/admin/superAdminService";
import { toast } from "sonner";
import { IMG_BASE_API } from "../api/imageapi";

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
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState({ open: false, initial: null });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getSuperAdmins();
      if (res.status) {
        const mappedAdmins = res.data.map((admin) => ({
          id: admin.id,
          name: admin.name || "",
          email: admin.email || "",
          contact: admin.contactNo || "",
          gender: admin.gender || "",
          avatar: admin.imageUrl
            ? admin.imageUrl.startsWith("http")
              ? admin.imageUrl
              : `${IMG_BASE_API}${admin.imageUrl}`
            : "",
          originalData: admin,
        }));
        setAdmins(mappedAdmins);
      } else {
        toast.error(res.message || "Failed to fetch superadmins");
      }
    } catch (error) {
      toast.error("An error occurred while fetching superadmins");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return admins;
    return admins.filter(
      (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
    );
  }, [admins, query]);

  const handleSave = async (data) => {
    try {
      const formData = new FormData();
      if (data.id) formData.append("id", data.id);
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("contactNo", data.contactNo);
      formData.append("gender", data.gender || "");

      if (data.password) formData.append("password", data.password);
      if (data.centerName) formData.append("centerName", data.centerName);
      if (data.adressStreet) formData.append("adressStreet", data.adressStreet);
      if (data.addressCity) formData.append("addressCity", data.addressCity);
      if (data.addressState) formData.append("addressState", data.addressState);
      if (data.addressZip) formData.append("addressZip", data.addressZip);
      if (data.avatarFile) formData.append("imageUrl", data.avatarFile);

      const res = await superAdminService.createSuperAdmin(formData);
      if (res.status === false) {
        toast.error(res.message || "Validation failed");
        return;
      }

      toast.success(`Superadmin ${data.id ? "updated" : "added"} successfully`);
      fetchAdmins();
    } catch (error) {
      toast.error("Failed to save superadmin");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this superadmin?")) return;
    try {
      const res = await superAdminService.deleteSuperAdmin(id);
      if (res.status === false) {
        toast.error(res.message || "Failed to delete");
        return;
      }
      toast.success("Superadmin deleted successfully");
      fetchAdmins();
    } catch (error) {
      toast.error("Failed to delete superadmin");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Super-Admin Settings"
        description="Manage super admin accounts that oversee the platform"
        breadcrumbs={[{ label: "Superadmin Settings" }]}
        actions={
          <Button onClick={() => setModal({ open: true, initial: null })} className="gap-2">
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

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No superadmins found.</p>
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
                <h3 className="mt-3 text-base font-bold text-foreground">{a.name}</h3>
                <div className="mt-2 space-y-1 text-xs">
                  <p className="text-foreground">
                    <span className="font-semibold">Email: </span>
                    <span className="text-muted-foreground break-all">{a.email}</span>
                  </p>
                  <p className="text-foreground">
                    <span className="font-semibold">Contact: </span>
                    <span className="text-muted-foreground">{a.contact || "—"}</span>
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModal({ open: true, initial: a })}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-destructive-foreground shadow-sm hover:opacity-90"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
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
