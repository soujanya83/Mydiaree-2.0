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
import { Users, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const fileRef = useRef(null);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;
    setShowPassword(false);
    if (initial) {
      const normalizedGender = initial.gender
        ? initial.gender.charAt(0).toUpperCase() + initial.gender.slice(1).toLowerCase()
        : "";
      setForm({
        ...empty,
        ...initial,
        gender: normalizedGender,
        password: "",
      });
    } else {
      setForm(empty);
    }
    setIsSaving(false);
    setErrors({});
  }, [open, initial]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "name") setErrors((prev) => ({ ...prev, name: null }));
    if (k === "email") setErrors((prev) => ({ ...prev, email: null }));
    if (k === "password") setErrors((prev) => ({ ...prev, password: null }));
    if (k === "contact") setErrors((prev) => ({ ...prev, contactNo: null }));
    if (k === "gender") setErrors((prev) => ({ ...prev, gender: null }));
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
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <DialogHeader className="px-6 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {isEdit ? "Edit Staff Details" : "Add New Staff"}
              </DialogTitle>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                {isEdit ? "Update the profile information for this staff member" : "Create a new staff profile for your center"}
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
                    Staff Name <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g., Jane Doe"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.name && "border-destructive focus-visible:ring-destructive/20"
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
                    placeholder="jane@example.com"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.email && "border-destructive focus-visible:ring-destructive/20"
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
                      Password {!isEdit && <span className="text-destructive font-bold ml-0.5">*</span>}
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
                        errors.password && "border-destructive focus-visible:ring-destructive/20"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
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
                      errors.contactNo && "border-destructive focus-visible:ring-destructive/20"
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
                    <SelectTrigger className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.gender && "border-destructive"
                    )}>
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
              ) : (
                isEdit ? "Save Changes" : "Add Staff"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
