import { useMemo, useState, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Filter,
  Users,
  Shield,
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
import { staffService } from "@/services/admin/staffService";
import { AddStaffModal } from "@/components/staff/AddStaffModal";
import { Loader2 } from "lucide-react";
import { useCentreStore } from "@/stores/centreStore";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatExpiry(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function StaffSettingsPage() {
  const { centres: storeCenters } = useCentreStore();
  const [staff, setStaff] = useState([]);
  const [centerId, setCenterId] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const [modal, setModal] = useState({ open: false, initial: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  // Fallback options for mock access, assuming API might not have this yet
  const ACCESS_OPTIONS = [
    { label: "1 Hour", value: "1h", ms: 3600000 },
    { label: "1 Day", value: "1d", ms: 86400000 },
    { label: "1 Week", value: "1w", ms: 604800000 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // If centerId is not set, set it to the first center from store
        let currentCenterId = centerId;
        if (!currentCenterId && storeCenters.length > 0) {
          currentCenterId = storeCenters[0].id;
          setCenterId(currentCenterId);
        }

        if (currentCenterId) {
          const res = await staffService.getStaffSettings(currentCenterId);
          if (res.status && res.data) {
            const mappedStaff = (res.data.staff || []).map((s) => ({
              ...s,
              avatar: s.imageUrl
                ? s.imageUrl.startsWith("http")
                  ? s.imageUrl
                  : `https://mydiaree.com.au/${s.imageUrl}`
                : "",
              contact: s.contactNo || "",
              active: s.status === "ACTIVE",
            }));
            setStaff(mappedStaff);
          } else {
            toast.error(res.message || "Failed to load staff");
          }
        }
      } catch (error) {
        toast.error("An error occurred while loading settings");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (storeCenters.length > 0) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [centerId, storeCenters]);

  const activeCenter = storeCenters.find((c) => c.id === centerId);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return staff.filter((s) => (q ? s.name.toLowerCase().includes(q) : true));
  }, [staff, query]);

  useEffect(() => {
    setPage(1);
  }, [query, centerId]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedStaff = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSave = async (data) => {
    try {
      const formData = new FormData();
      formData.append("center_id", centerId);
      if (data.id) formData.append("id", data.id);
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("contactNo", data.contact);
      formData.append("gender", data.gender || "");
      if (data.password) formData.append("password", data.password);
      if (data.avatarFile) formData.append("imageUrl", data.avatarFile);

      const res = data.id
        ? await staffService.updateStaff(formData)
        : await staffService.createStaff(formData);

      if (res.status) {
        toast.success(res.message || `Staff ${data.id ? "updated" : "added"} successfully`);
        setModal({ open: false, initial: null });
        // Refresh by triggering the same logic (we can just reset centerId to itself to re-trigger, or call fetch)
        // Easiest is to manually update or just temporarily change loading
        setLoading(true);
        const refetch = await staffService.getStaffSettings(centerId);
        if (refetch.status && refetch.data) {
          const mappedStaff = (refetch.data.staff || []).map((s) => ({
            ...s,
            avatar: s.imageUrl
              ? s.imageUrl.startsWith("http")
                ? s.imageUrl
                : `https://mydiaree.com.au/${s.imageUrl}`
              : "",
            contact: s.contactNo || "",
            active: s.status === "ACTIVE",
          }));
          setStaff(mappedStaff);
        }
        setLoading(false);
      } else {
        toast.error(res.message || "Validation failed");
      }
    } catch (error) {
      toast.error("Failed to save staff");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm.id) return;
    try {
      const res = await staffService.deleteStaff(confirm.id);
      if (res.status) {
        toast.success(res.message || "Staff deleted successfully");
        setStaff((arr) => arr.filter((s) => s.id !== confirm.id));
      } else {
        toast.error(res.message || "Failed to delete staff");
      }
    } catch (error) {
      toast.error("Failed to delete staff");
      console.error(error);
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  const setAccess = (id, opt) => {
    const expiresAt = opt ? new Date(Date.now() + opt.ms).toISOString() : null;
    setStaff((arr) => arr.map((s) => (s.id === id ? { ...s, accessExpiresAt: expiresAt } : s)));
    toast.success(opt ? `Access granted for ${opt.label}` : "Access revoked");
  };

  const toggleActive = (id) => {
    setStaff((arr) => arr.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Settings"
        description="Manage staff accounts and access for each center"
        breadcrumbs={[{ label: "Settings", to: "/settings" }, { label: "Staff Settings" }]}
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
                {storeCenters.map((c) => (
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
              Add Staff
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
            placeholder="Filter by name"
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
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No staff in this center.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedStaff.map((s) => {
              const hasAccess = !!s.accessExpiresAt && new Date(s.accessExpiresAt) > new Date();
              return (
                <div
                  key={s.id}
                  className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div
                    className="absolute inset-0 -z-10 opacity-60"
                    style={{
                      background:
                        "radial-gradient(circle at top right, color-mix(in oklab, var(--primary) 8%, transparent), transparent 60%)",
                    }}
                  />

                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold shadow-sm ${
                            hasAccess
                              ? "bg-success text-success-foreground"
                              : "bg-destructive text-destructive-foreground"
                          }`}
                        >
                          <Shield className="h-3.5 w-3.5" />
                          {hasAccess ? "Access" : "No Access"}
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-32">
                        {ACCESS_OPTIONS.map((opt) => (
                          <DropdownMenuItem key={opt.value} onClick={() => setAccess(s.id, opt)}>
                            {opt.label}
                          </DropdownMenuItem>
                        ))}
                        {hasAccess && (
                          <DropdownMenuItem
                            onClick={() => setAccess(s.id, null)}
                            className="text-destructive"
                          >
                            Revoke
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-1 flex flex-col items-center text-center">
                    <Avatar className="h-20 w-20 border-2 border-background shadow-sm">
                      <AvatarImage src={s.avatar} alt={s.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(s.name)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-3 text-base font-bold text-foreground">{s.name}</h3>
                    <p className="mt-1 text-xs text-foreground">
                      <span className="font-semibold">Email: </span>
                      <span className="text-muted-foreground">{s.email}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-foreground">
                      <span className="font-semibold">Contact: </span>
                      <span className="text-muted-foreground">{s.contact || "—"}</span>
                    </p>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setModal({ open: true, initial: s })}
                      className="inline-flex items-center justify-center rounded-md bg-primary p-2 text-primary-foreground shadow-sm hover:opacity-90"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirm({ open: true, id: s.id })}
                      className="inline-flex items-center justify-center rounded-md bg-destructive p-2 text-destructive-foreground shadow-sm hover:opacity-90"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(s.id)}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-semibold shadow-sm ${
                        s.active
                          ? "border-success/40 bg-success/10 text-success"
                          : "border-muted-foreground/30 bg-muted text-muted-foreground"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {s.active ? "Active" : "Inactive"}
                    </button>
                  </div>

                  {hasAccess && (
                    <p className="mt-3 text-center text-xs font-semibold text-destructive">
                      Access Expires: {formatExpiry(s.accessExpiresAt)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.max(1, p - 1));
                    }}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  // Show current, first, last, and immediate siblings
                  if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                    return (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href="#"
                          isActive={page === p}
                          onClick={(e) => {
                            e.preventDefault();
                            setPage(p);
                          }}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  if (p === page - 2 || p === page + 2) {
                    return (
                      <PaginationItem key={p}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage((p) => Math.min(totalPages, p + 1));
                    }}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}

      <AddStaffModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        initial={modal.initial}
        onSave={handleSave}
      />

      <AlertDialog open={confirm.open} onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this staff?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The staff member will be permanently removed.
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
