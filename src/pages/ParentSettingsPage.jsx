import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Filter, Users, ChevronDown, Check, Mail, Phone, User } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
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
import { parentService } from "@/services/admin/parentService";
import { AddParentModal } from "@/components/parents/AddParentModal";
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

export default function ParentSettingsPage() {
  const { centres: storeCenters } = useCentreStore();
  const [parents, setParents] = useState([]);
  const [availableChildren, setAvailableChildren] = useState([]);
  const [centerId, setCenterId] = useState("");
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const [modal, setModal] = useState({ open: false, initial: null });
  const [confirm, setConfirm] = useState({ open: false, id: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let currentCenterId = centerId;
        if (!currentCenterId && storeCenters.length > 0) {
          currentCenterId = storeCenters[0].id;
          setCenterId(currentCenterId);
        }

        if (currentCenterId) {
          const res = await parentService.getParentSettings(currentCenterId);
          if (res.status !== "error" && res.data) {
            const fetchedChildren = res.data.children || [];
            setAvailableChildren(fetchedChildren);

            const mappedParents = (res.data.parents || []).map((p) => ({
              ...p,
              gender: p.gender ? (p.gender.charAt(0).toUpperCase() + p.gender.slice(1).toLowerCase()) : "",
              avatar: p.imageUrl
                ? p.imageUrl.startsWith("http")
                  ? p.imageUrl
                  : `https://mydiaree.com.au/${p.imageUrl}`
                : "",
              contact: p.contactNo || "",
              children: (p.children || []).map((c) => ({
                childId: String(c.id || c.pivot?.childid || ""),
                relation: c.pivot?.relation || "",
              })),
            }));
            setParents(mappedParents);
          } else {
            toast.error(res.message || "Failed to load parents");
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

  const childName = useCallback((id) => {
    const child = availableChildren.find((c) => String(c.id) === String(id));
    return child ? `${child.name} ${child.lastname || ""}`.trim() : "Unknown";
  }, [availableChildren]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return parents.filter((p) => {
      if (!q) return true;
      if (p.name.toLowerCase().includes(q)) return true;
      return p.children.some((c) => childName(c.childId).toLowerCase().includes(q));
    });
  }, [parents, query, childName]);

  useEffect(() => {
    setPage(1);
  }, [query, centerId]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedParents = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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

      if (data.children && data.children.length > 0) {
        data.children.forEach((c, index) => {
          formData.append(`children[${index}][childid]`, c.childId);
          formData.append(`children[${index}][relation]`, c.relation);
        });
      }

      const res = data.id
        ? await parentService.updateParent(formData)
        : await parentService.createParent(formData);

      if (res.status === "success" || res.success) {
        toast.success(res.message || `Parent ${data.id ? "updated" : "added"} successfully`);
        setModal({ open: false, initial: null });
        setLoading(true);
        const refetch = await parentService.getParentSettings(centerId);
        if (refetch.status !== "error" && refetch.data) {
          const fetchedChildren = refetch.data.children || [];
          setAvailableChildren(fetchedChildren);

          const mappedParents = (refetch.data.parents || []).map((p) => ({
            ...p,
            gender: p.gender ? (p.gender.charAt(0).toUpperCase() + p.gender.slice(1).toLowerCase()) : "",
            avatar: p.imageUrl
              ? p.imageUrl.startsWith("http")
                ? p.imageUrl
                : `https://mydiaree.com.au/${p.imageUrl}`
              : "",
            contact: p.contactNo || "",
            children: (p.children || []).map((c) => ({
              childId: String(c.id || c.pivot?.childid || ""),
              relation: c.pivot?.relation || "",
            })),
          }));
          setParents(mappedParents);
        }
        setLoading(false);
      } else {
        toast.error(res.message || res.errors?.email?.[0] || "Validation failed");
      }
    } catch (error) {
      toast.error("Failed to save parent");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!confirm.id) return;
    try {
      const res = await parentService.deleteParent(confirm.id);
      if (res.status === "success" || res.success) {
        toast.success(res.message || "Parent deleted successfully");
        setParents((arr) => arr.filter((p) => p.id !== confirm.id));
      } else {
        toast.error(res.message || "Failed to delete parent");
      }
    } catch (error) {
      toast.error("Failed to delete parent");
      console.error(error);
    } finally {
      setConfirm({ open: false, id: null });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Parent Settings
          </span>
        }
        description="Manage parent accounts and link them to children"
        breadcrumbs={[{ label: "Settings", to: "/settings" }, { label: "Parent Settings" }]}
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
              Add Parent
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
            placeholder="Filter by Parent or Child"
            className="h-11 rounded-2xl border-border/60 bg-card/60 pl-10 backdrop-blur shadow-sm focus-visible:ring-primary/20 transition-all font-medium"
          />
        </div>
      </div>

      {loading ? (
        <PageLoader label="Loading parents…" />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-card/40 py-24 text-center backdrop-blur">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20">
            <Users className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-bold tracking-tight text-foreground">No Parents Found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {query ? "Try adjusting your search filters." : "You haven't added any parents to this center yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedParents.map((p) => (
              <div
                key={p.id}
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 h-full"
              >
                <div
                  className="absolute inset-0 -z-10 opacity-60"
                  style={{
                    background:
                      "radial-gradient(circle at top right, color-mix(in oklab, var(--primary) 8%, transparent), transparent 60%)",
                  }}
                />

                <div className="flex flex-col items-center text-center relative z-10 flex-grow">
                  <div className="relative mb-4 group-hover:scale-105 transition-transform duration-300">
                    <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary/40 to-indigo-500/40 opacity-70 blur-md"></div>
                    <Avatar className="relative h-20 w-20 border-2 border-background shadow-md">
                      <AvatarImage src={p.avatar} alt={p.name} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                        {getInitials(p.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight text-foreground line-clamp-1">{p.name}</h3>
                  
                  <div className="mt-3 space-y-2 w-full text-sm">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground bg-background/40 py-1.5 px-3 rounded-lg w-full">
                      <Mail className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      <span className="truncate text-xs font-medium">{p.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 text-muted-foreground bg-background/40 py-1.5 px-3 rounded-lg w-full">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                      <span className="truncate text-xs font-medium">{p.contact || "No Contact"}</span>
                    </div>
                    {p.gender && (
                      <div className="flex items-center justify-center gap-2 text-muted-foreground bg-background/40 py-1.5 px-3 rounded-lg w-full">
                        <User className="h-3.5 w-3.5 shrink-0 text-primary/60" />
                        <span className="truncate text-xs font-medium capitalize">{p.gender}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 w-full">
                    {p.children.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 py-2 text-center text-xs italic text-muted-foreground">
                        No children linked
                      </div>
                    ) : (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="w-full justify-between rounded-xl h-9 text-xs font-semibold bg-background/60 hover:bg-background shadow-sm border-border/80">
                            Linked Children ({p.children.length})
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-56 rounded-xl p-1.5">
                          <div className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Child • Relation
                          </div>
                          {p.children.map((c, i) => (
                            <DropdownMenuItem key={i} className="flex justify-between items-center py-2 px-2.5 rounded-lg focus:bg-primary/5 cursor-default">
                              <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                                {childName(c.childId)}
                              </span>
                              <span className="text-xs font-bold text-primary/80 bg-primary/10 px-2 py-0.5 rounded-md">
                                {c.relation}
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 border-t border-border/50 pt-4 relative z-10">
                  <button
                    type="button"
                    onClick={() => setModal({ open: true, initial: p })}
                    className="flex flex-1 h-9 items-center justify-center gap-1.5 rounded-xl bg-primary/10 text-xs font-bold text-primary transition-colors hover:bg-primary/20 active:scale-95"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirm({ open: true, id: p.id })}
                    title="Delete Parent"
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 hover:text-rose-700 active:scale-95 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-6"
          />
        </>
      )}

      <AddParentModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        initial={modal.initial}
        onSave={handleSave}
        availableChildren={availableChildren}
      />

      <AlertDialog open={confirm.open} onOpenChange={(o) => setConfirm((c) => ({ ...c, open: o }))}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Delete this parent?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium text-muted-foreground">
              This action cannot be undone. The parent account and its child links will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30"
            >
              Delete Parent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
