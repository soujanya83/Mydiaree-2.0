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
  Mail,
  Phone,
  Briefcase,
  User,
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
import { Pagination } from "@/components/common/Pagination";

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
        title={
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Staff Settings
          </span>
        }
        description="Manage staff accounts and access for each center"
        breadcrumbs={[{ label: "Settings", to: "/settings" }, { label: "Staff Settings" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-10 gap-2 rounded-xl bg-card/60 backdrop-blur border-border/60 shadow-sm font-medium">
                  {activeCenter?.name ?? "Select Center"}
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-xl">
                {storeCenters.map((c) => (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => setCenterId(c.id)}
                    className="flex items-center justify-between gap-2 py-2.5 cursor-pointer font-medium"
                  >
                    {c.name}
                    {c.id === centerId && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button onClick={() => setModal({ open: true, initial: null })} className="h-10 gap-2 rounded-xl font-semibold shadow-md shadow-primary/20">
              <Plus className="h-4 w-4" />
              Add Staff
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-card/60 text-primary shadow-sm backdrop-blur">
          <Filter className="h-5 w-5" />
        </div>
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by name"
            className="h-11 rounded-2xl border-border/60 bg-card/60 pl-10 backdrop-blur shadow-sm focus-visible:ring-primary/20 transition-all font-medium"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-80 animate-pulse rounded-3xl border border-border/60 bg-card/40 backdrop-blur" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/40 py-24 text-center backdrop-blur">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">No Staff Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {query ? "Try adjusting your search filters." : "You haven't added any staff to this center yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedStaff.map((s) => {
              const hasAccess = !!s.accessExpiresAt && new Date(s.accessExpiresAt) > new Date();
              const isAdmin = s.admin === "1";
              
              return (
                <div
                  key={s.id}
                  className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 h-full"
                >
                  <div
                    className="absolute inset-0 -z-10 opacity-60"
                    style={{
                      background:
                        "radial-gradient(circle at top right, color-mix(in oklab, var(--primary) 8%, transparent), transparent 60%)",
                    }}
                  />

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex flex-col gap-1.5">
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                        <Briefcase className="h-3 w-3" />
                        {isAdmin ? "Admin" : (s.title || "Staff")}
                      </div>
                      {s.active ? (
                        <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-success"></span>
                          Active
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground"></span>
                          Inactive
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-sm transition-all hover:scale-105 active:scale-95 ${
                            hasAccess
                              ? "bg-success/15 text-success hover:bg-success/25"
                              : "bg-destructive/10 text-destructive hover:bg-destructive/20"
                          }`}
                        >
                          <Shield className="h-3.5 w-3.5" />
                          {hasAccess ? "Access" : "No Access"}
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        {ACCESS_OPTIONS.map((opt) => (
                          <DropdownMenuItem key={opt.value} onClick={() => setAccess(s.id, opt)} className="font-medium cursor-pointer">
                            Grant for {opt.label}
                          </DropdownMenuItem>
                        ))}
                        {hasAccess && (
                          <DropdownMenuItem
                            onClick={() => setAccess(s.id, null)}
                            className="text-destructive font-bold cursor-pointer"
                          >
                            Revoke Access
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-col items-center text-center relative z-10 flex-grow">
                    <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary/40 to-indigo-500/40 opacity-70 blur-md"></div>
                      <Avatar className="relative h-20 w-20 border-2 border-background shadow-md">
                        <AvatarImage src={s.avatar} alt={s.name} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                          {getInitials(s.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground line-clamp-1">{s.name}</h3>
                    
                    <div className="mt-3 space-y-2 w-full text-sm">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground bg-background/40 py-1.5 px-3 rounded-lg w-full">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="truncate text-xs font-medium">{s.email}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-muted-foreground bg-background/40 py-1.5 px-3 rounded-lg w-full">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="truncate text-xs font-medium">{s.contact || "No Contact"}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-muted-foreground bg-background/40 py-1.5 px-3 rounded-lg w-full">
                        <User className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="truncate text-xs font-medium capitalize">{s.gender?.toLowerCase() || "Not Specified"}</span>
                      </div>
                    </div>

                    {hasAccess && (
                      <div className="mt-4 w-full rounded-lg bg-destructive/10 py-1.5 px-2 text-center border border-destructive/20">
                        <p className="text-[10px] font-bold uppercase text-destructive tracking-wide">
                          Expires: {formatExpiry(s.accessExpiresAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-2 border-t border-border/50 pt-4 relative z-10">
                    <button
                      type="button"
                      onClick={() => toggleActive(s.id)}
                      title={s.active ? "Deactivate Staff" : "Activate Staff"}
                      className={`inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                        s.active
                          ? "border-success/30 bg-success/10 text-success hover:bg-success/20"
                          : "border-muted-foreground/30 bg-muted text-muted-foreground hover:bg-muted-foreground/20"
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {s.active ? "Active" : "Inactive"}
                    </button>
                    
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setModal({ open: true, initial: s })}
                        title="Edit Staff"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors hover:bg-primary/20 active:scale-95"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirm({ open: true, id: s.id })}
                        title="Delete Staff"
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 active:scale-95 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-6"
          />
        </>
      )}

      <AddStaffModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        initial={modal.initial}
        onSave={handleSave}
      />

      <AlertDialog open={confirm.open} onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete this staff member?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              This action cannot be undone. The staff member will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30"
            >
              Delete Staff
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
