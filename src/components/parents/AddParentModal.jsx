import { useEffect, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

const empty = {
  name: "",
  email: "",
  password: "",
  contact: "",
  gender: "",
  avatar: "",
  children: [{ childId: "", relation: "" }],
};

export function AddParentModal({ open, onOpenChange, initial, onSave, availableChildren = [] }) {
  const [form, setForm] = useState(empty);
  const [isSaving, setIsSaving] = useState(false);
  const fileRef = useRef(null);
  const isEdit = !!initial?.id;

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
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setChild = (i, k, v) =>
    setForm((f) => ({
      ...f,
      children: f.children.map((c, idx) => (idx === i ? { ...c, [k]: v } : c)),
    }));
  const addChildRow = () =>
    setForm((f) => ({ ...f, children: [...f.children, { childId: "", relation: "" }] }));
  const removeChildRow = (i) =>
    setForm((f) => ({ ...f, children: f.children.filter((_, idx) => idx !== i) }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => set("avatar", reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || isSaving) return;
    
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
        children: form.children.filter((c) => c.childId && c.relation),
      });
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
                {isEdit ? "Update the profile and linked children for this parent" : "Create a new parent profile and link them to their children"}
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
                  <Label className="text-sm font-bold text-foreground">Parent Name *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g., John Doe"
                    required
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Email Address *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground flex items-center justify-between">
                    <span>Password</span>
                    {isEdit && (
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        (Leave blank to keep current)
                      </span>
                    )}
                  </Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="••••••••"
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Contact Number</Label>
                  <Input
                    value={form.contact}
                    onChange={(e) => set("contact", e.target.value)}
                    placeholder="e.g., 0412 345 678"
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium">
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2 mt-2">
                  <Label className="text-sm font-bold text-foreground flex items-center gap-2">
                    Profile Image
                    {isEdit && <span className="text-[10px] uppercase tracking-wider text-muted-foreground">(Optional)</span>}
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
                Linked Children
              </h3>
              <div className="space-y-4">
                {form.children.map((row, i) => (
                  <div key={i} className="relative rounded-2xl border border-border/60 bg-background/60 p-4 shadow-sm transition-all hover:shadow-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Child Profile</Label>
                        <Select
                          value={row.childId}
                          onValueChange={(v) => setChild(i, "childId", v)}
                        >
                          <SelectTrigger className="h-10 rounded-xl bg-background/50 font-medium">
                            <SelectValue placeholder="Select Child" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {availableChildren.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.name} {c.lastname || ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Relationship</Label>
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
              disabled={isSaving || !form.name.trim() || !form.email.trim()}
              className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEdit ? "Save Changes" : "Add Parent"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
