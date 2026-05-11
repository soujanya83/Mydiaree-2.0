import { useEffect, useRef, useState } from "react";
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

const empty = {
  name: "",
  email: "",
  password: "",
  contact: "",
  gender: "",
  avatar: "",
};

export function AddStaffModal({ open, onOpenChange, initial, onSave }) {
  const [form, setForm] = useState(empty);
  const fileRef = useRef(null);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setForm({
        ...empty,
        ...initial,
        gender: initial.gender?.toUpperCase() || "",
        password: "",
      });
    } else {
      setForm(empty);
    }
  }, [open, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    set("avatarFile", file);
    const reader = new FileReader();
    reader.onload = () => set("avatar", reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onSave({
      id: initial?.id,
      name: form.name.trim(),
      email: form.email.trim(),
      contact: form.contact.trim(),
      gender: form.gender,
      password: form.password,
      avatar: form.avatar,
      avatarFile: form.avatarFile,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-primary px-5 py-4">
          <DialogTitle className="text-primary-foreground text-base font-semibold">
            {isEdit ? "Edit Staff" : "Add New Staff"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-4">Staff Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">{isEdit ? "Name" : "Staff Name"}</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Enter name"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Email ID</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="Enter email"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">
                    Password{" "}
                    {isEdit && (
                      <span className="text-success font-medium">
                        (Optional - Leave blank if not changing)
                      </span>
                    )}
                  </Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Contact No</Label>
                  <Input
                    value={form.contact}
                    onChange={(e) => set("contact", e.target.value)}
                    placeholder="Enter contact number"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-semibold">Gender</Label>
                  <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-sm font-semibold">
                    Profile Image{" "}
                    {isEdit && <span className="text-success font-medium">(Optional)</span>}
                  </Label>
                  <div className="flex items-center gap-3 rounded-md border border-input bg-transparent px-3 py-2">
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="rounded-md border bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-secondary/80"
                    >
                      Choose file
                    </button>
                    <span className="text-xs text-muted-foreground truncate">
                      {form.avatar ? "Image selected" : "No file chosen"}
                    </span>
                    {form.avatar && (
                      <img
                        src={form.avatar}
                        alt="avatar preview"
                        className="ml-auto h-9 w-9 rounded-full object-cover border"
                      />
                    )}
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
          </div>

          <DialogFooter className="border-t bg-muted/30 px-5 py-3 gap-2">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button type="submit">{isEdit ? "Update" : "Save"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
