import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, Search, Pencil, Trash2, Filter, Users, ChevronDown, Check } from "lucide-react";
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
import { parentService } from "@/services/parentService";
import { AddParentModal } from "@/components/parents/AddParentModal";
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

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Users className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-3 text-sm text-muted-foreground">No parents in this center.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paginatedParents.map((p) => (
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
                      <p className="mt-1 text-xs italic text-muted-foreground">
                        No children linked
                      </p>
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

      <AddParentModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        initial={modal.initial}
        onSave={handleSave}
        availableChildren={availableChildren}
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
