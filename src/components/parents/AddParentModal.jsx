import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, ChevronDown, Check, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RELATION_OPTIONS } from "./parentsData";
import { Users, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { childrenService } from "@/services/centre/childrenService";

const empty = {
  name: "",
  email: "",
  password: "",
  contact: "",
  gender: "",
  avatar: "",
  avatarFile: null,
  children: [{ childId: "", relation: "" }],
};

export function AddParentModal({
  open,
  onOpenChange,
  initial,
  onSave,
  availableChildren = [],
  centerId,
}) {
  const [form, setForm] = useState(empty);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const fileRef = useRef(null);
  const isEdit = !!initial?.id;

  // Search & Infinite Scroll state for children
  const [childrenList, setChildrenList] = useState([]);
  const [childrenPage, setChildrenPage] = useState(1);
  const [childrenHasMore, setChildrenHasMore] = useState(true);
  const [childrenSearch, setChildrenSearch] = useState("");
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const searchTimeoutRef = useRef(null);

  const fetchChildrenForModal = async (pageNumber = 1, searchQuery = "", isAppend = false) => {
    if (!centerId) return;
    setIsLoadingChildren(true);
    try {
      const res = await childrenService.filterChildren({
        center_id: centerId,
        page: pageNumber,
        per_page: 10,
        search: searchQuery,
      });
      if (res && res.data) {
        const list = res.data.data || [];
        const lastPage = res.data.last_page || 1;
        setChildrenHasMore(pageNumber < lastPage);
        setChildrenList((prev) => {
          const combined = isAppend ? [...prev, ...list] : list;
          const unique = [];
          const seen = new Set();

          // Seed from prefilled children to make sure they are present
          if (initial?.children) {
            initial.children.forEach((c) => {
              if (c.childId && !seen.has(String(c.childId))) {
                seen.add(String(c.childId));
                unique.push({ id: Number(c.childId), name: c.name, lastname: c.lastname });
              }
            });
          }

          combined.forEach((c) => {
            if (c.id && !seen.has(String(c.id))) {
              seen.add(String(c.id));
              unique.push(c);
            }
          });
          return unique;
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setForm(
      initial
        ? {
            ...empty,
            ...initial,
            password: "",
            children: initial.children?.length
              ? initial.children.map((c) => ({
                  childId: c.childId ? String(c.childId) : "",
                  relation: c.relation || "",
                }))
              : [{ childId: "", relation: "" }],
          }
        : empty,
    );
    setIsSaving(false);
    setErrors({});
    setShowPassword(false);

    // Reset pagination state and seed initial children if present
    const initialList =
      initial?.children?.map((c) => ({
        id: Number(c.childId),
        name: c.name,
        lastname: c.lastname,
      })) || [];
    setChildrenList(initialList);
    setChildrenPage(1);
    setChildrenSearch("");
    setChildrenHasMore(true);
  }, [open, initial]);

  const handleChildrenSearchChange = (val) => {
    setChildrenSearch(val);
    setChildrenPage(1);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      fetchChildrenForModal(1, val, false);
    }, 300);
  };

  const handleScroll = (e) => {
    const target = e.currentTarget;
    if (
      target.scrollHeight - target.scrollTop <= target.clientHeight + 10 &&
      childrenHasMore &&
      !isLoadingChildren
    ) {
      const nextPage = childrenPage + 1;
      setChildrenPage(nextPage);
      fetchChildrenForModal(nextPage, childrenSearch, true);
    }
  };

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "name") setErrors((prev) => ({ ...prev, name: null }));
    if (k === "email") setErrors((prev) => ({ ...prev, email: null }));
    if (k === "password") setErrors((prev) => ({ ...prev, password: null }));
    if (k === "contact") setErrors((prev) => ({ ...prev, contactNo: null }));
    if (k === "gender") setErrors((prev) => ({ ...prev, gender: null }));
  };

  const setChild = (i, k, v) => {
    setForm((f) => ({
      ...f,
      children: f.children.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)),
    }));
    setErrors((prev) => ({ ...prev, children: null }));
  };

  const addChildRow = () => {
    setForm((f) => ({ ...f, children: [...f.children, { childId: "", relation: "" }] }));
    setErrors((prev) => ({ ...prev, children: null }));
  };

  const removeChildRow = (i) => {
    setForm((f) => ({ ...f, children: f.children.filter((_, idx) => idx !== i) }));
    setErrors((prev) => ({ ...prev, children: null }));
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("avatarFile", file);
    const reader = new FileReader();
    reader.onload = () => set("avatar", reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    let localErrors = {};
    if (!form.name.trim()) {
      localErrors.name = ["The name field is required."];
    }
    if (!form.email.trim()) {
      localErrors.email = ["The email field is required."];
    }
    if (!form.password && !isEdit) {
      localErrors.password = ["The password field is required."];
    }
    if (!form.contact.trim()) {
      localErrors.contactNo = ["The contact no field is required."];
    }
    if (!form.gender) {
      localErrors.gender = ["The gender field is required."];
    }

    const validChildren = form.children.filter((c) => c.childId && c.relation);
    if (validChildren.length === 0) {
      localErrors.children = ["The children field is required."];
    }

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      toast.error("Validation failed.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave?.({
        id: initial?.id,
        name: form.name.trim(),
        email: form.email.trim(),
        contact: form.contact.trim(),
        gender: form.gender,
        password: form.password,
        avatar: form.avatar,
        avatarFile: form.avatarFile,
        children: validChildren,
      });
      onOpenChange(false);
    } catch (err) {
      if (err && err.errors) {
        setErrors(err.errors);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <DialogHeader className="px-6 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {isEdit ? "Edit Parent Details" : "Add New Parent"}
              </DialogTitle>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                {isEdit
                  ? "Update the profile and linked children for this parent"
                  : "Create a new parent profile and link them to their children"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-6">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider opacity-80">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    Parent Name <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g., John Doe"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.name && "border-destructive focus-visible:ring-destructive/20",
                    )}
                  />
                  {errors.name && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.name[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    Email Address <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="john@example.com"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.email && "border-destructive focus-visible:ring-destructive/20",
                    )}
                  />
                  {errors.email && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.email[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground flex items-center justify-between">
                    <span>
                      Password{" "}
                      {!isEdit && <span className="text-destructive font-bold ml-0.5">*</span>}
                    </span>
                    {isEdit && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        (Leave blank to keep current)
                      </span>
                    )}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      placeholder="••••••••"
                      className={cn(
                        "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium pr-10",
                        errors.password && "border-destructive focus-visible:ring-destructive/20",
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.password[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    Contact Number <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  <Input
                    value={form.contact}
                    onChange={(e) => set("contact", e.target.value)}
                    placeholder="e.g., 0412 345 678"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.contactNo && "border-destructive focus-visible:ring-destructive/20",
                    )}
                  />
                  {errors.contactNo && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.contactNo[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    Gender <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger
                      className={cn(
                        "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                        errors.gender && "border-destructive",
                      )}
                    >
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.gender[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2 mt-2">
                  <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                    Profile Image
                    {isEdit && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        (Optional)
                      </span>
                    )}
                  </Label>
                  <div className="flex items-center gap-4 rounded-xl border border-dashed border-border/80 bg-background/50 p-4 transition-colors hover:bg-muted/40">
                    {form.avatar ? (
                      <div className="relative h-16 w-16 shrink-0 rounded-full border-2 border-background shadow-md">
                        <img
                          src={form.avatar}
                          alt="avatar preview"
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Users className="h-6 w-6" />
                      </div>
                    )}

                    <div className="flex flex-col flex-1 gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {form.avatar ? "Image selected" : "Upload a profile picture"}
                      </span>
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="self-start rounded-lg bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80"
                      >
                        Choose file
                      </button>
                    </div>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFile}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/10 p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider opacity-80">
                Linked Children <span className="text-destructive font-bold ml-0.5">*</span>
              </h3>
              <div className="space-y-4">
                {form.children.map((row, i) => (
                  <div
                    key={i}
                    className="relative rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm transition-all hover:shadow-md"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Child Profile
                        </Label>
                        <DropdownMenu
                          onOpenChange={(open) => {
                            if (open) {
                              setChildrenPage(1);
                              setChildrenSearch("");
                              setChildrenHasMore(true);
                              fetchChildrenForModal(1, "", false);
                            }
                          }}
                        >
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "h-10 w-full justify-between rounded-xl bg-background/50 font-medium text-left px-3 hover:bg-background/70 border border-input",
                                !row.childId && "text-muted-foreground",
                              )}
                            >
                              <span className="truncate">
                                {row.childId
                                  ? (() => {
                                      const found = childrenList.find(
                                        (c) => String(c.id) === String(row.childId),
                                      );
                                      return found
                                        ? `${found.name} ${found.lastname || ""}`.trim()
                                        : `Selected Child (ID: ${row.childId})`;
                                    })()
                                  : "Select Child"}
                              </span>
                              <ChevronDown className="h-4 w-4 shrink-0 opacity-50 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            className="w-[300px] p-2 rounded-xl bg-card border border-border shadow-lg"
                            align="start"
                          >
                            <div className="p-1 mb-2">
                              <Input
                                value={childrenSearch}
                                onChange={(e) => handleChildrenSearchChange(e.target.value)}
                                placeholder="Search children..."
                                className="h-9 rounded-lg bg-background"
                              />
                            </div>
                            <div
                              className="max-h-[200px] overflow-y-auto space-y-0.5 custom-scrollbar pr-1"
                              onScroll={handleScroll}
                            >
                              {childrenList.length === 0 && !isLoadingChildren && (
                                <div className="p-2 text-xs text-center text-muted-foreground">
                                  No children found
                                </div>
                              )}
                              {childrenList.map((c) => (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => setChild(i, "childId", String(c.id))}
                                  className={cn(
                                    "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground transition-all",
                                    String(row.childId) === String(c.id) &&
                                      "bg-accent/80 font-bold",
                                  )}
                                >
                                  <span className="truncate">
                                    {c.name} {c.lastname || ""}
                                  </span>
                                  {String(row.childId) === String(c.id) && (
                                    <Check className="h-4 w-4 text-primary shrink-0 ml-2" />
                                  )}
                                </button>
                              ))}
                              {isLoadingChildren && (
                                <div className="flex items-center justify-center p-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                          Relationship
                        </Label>
                        <Select
                          value={row.relation}
                          onValueChange={(v) => setChild(i, "relation", v)}
                        >
                          <SelectTrigger className="h-10 rounded-xl bg-background/50 font-medium">
                            <SelectValue placeholder="Select Relation" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {RELATION_OPTIONS.map((r) => (
                              <SelectItem key={r} value={r}>
                                {r}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    {form.children.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChildRow(i)}
                        className="absolute top-1/2 right-3 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-rose-50 text-rose-500 shadow-sm transition-colors hover:bg-rose-100 hover:text-rose-600 active:scale-95 dark:bg-rose-950/30 dark:hover:bg-rose-900/40"
                        aria-label="Remove child"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.children && (
                <p className="text-xs font-semibold text-destructive mt-2 px-1 animate-in fade-in-50">
                  {errors.children[0]}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={addChildRow}
                className="mt-4 w-full h-10 border-dashed border-border/80 text-muted-foreground hover:text-foreground rounded-xl"
              >
                <Plus className="mr-2 h-4 w-4" />
                Link Another Child
              </Button>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 border-t border-border/50 bg-muted/10 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="rounded-xl font-semibold"
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isEdit ? (
                "Save Changes"
              ) : (
                "Add Parent"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
