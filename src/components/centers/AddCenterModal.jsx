import { useEffect, useState } from "react";
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
import { Building, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const empty = { name: "", addressStreet: "", addressCity: "", addressState: "", addressZip: "", adminName: "", adminEmail: "", adminPassword: "" };

export function AddCenterModal({ open, onOpenChange, initial, onSave }) {
  const [form, setForm] = useState(empty);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const isEdit = !!initial?.id;

  useEffect(() => {
    if (!open) return;
    setForm(initial ? { ...empty, ...initial } : empty);
    setIsSaving(false);
    setErrors({});
  }, [open, initial]);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "name") setErrors((prev) => ({ ...prev, centerName: null }));
    if (k === "addressStreet") setErrors((prev) => ({ ...prev, adressStreet: null }));
    if (k === "addressCity") setErrors((prev) => ({ ...prev, addressCity: null }));
    if (k === "addressState") setErrors((prev) => ({ ...prev, addressState: null }));
    if (k === "addressZip") setErrors((prev) => ({ ...prev, addressZip: null }));
    if (k === "adminName") setErrors((prev) => ({ ...prev, admin_name: null }));
    if (k === "adminEmail") setErrors((prev) => ({ ...prev, admin_email: null }));
    if (k === "adminPassword") setErrors((prev) => ({ ...prev, admin_password: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    let localErrors = {};
    if (!form.name.trim()) {
      localErrors.centerName = ["The center name field is required."];
    }
    if (!form.addressStreet.trim()) {
      localErrors.adressStreet = ["The adress street field is required."];
    }
    if (!form.addressCity.trim()) {
      localErrors.addressCity = ["The address city field is required."];
    }
    if (!form.addressState.trim()) {
      localErrors.addressState = ["The address state field is required."];
    }
    if (!form.addressZip.trim()) {
      localErrors.addressZip = ["The address zip field is required."];
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
        addressStreet: form.addressStreet.trim(),
        addressCity: form.addressCity.trim(),
        addressState: form.addressState.trim(),
        addressZip: form.addressZip.trim(),
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        adminPassword: form.adminPassword,
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
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <DialogHeader className="px-6 pb-2 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {isEdit ? "Edit Center" : "Add New Center"}
              </DialogTitle>
              <p className="text-sm font-medium text-muted-foreground mt-0.5">
                {isEdit ? "Update the details of your center" : "Create a new center for your organization"}
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-6">
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider opacity-80">
                Center Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-bold text-foreground">
                    Center Name <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  <Input
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g., Melbourne Early Learning"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.centerName && "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {errors.centerName && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.centerName[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-bold text-foreground">
                    Street Address <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  <Input
                    value={form.addressStreet}
                    onChange={(e) => set("addressStreet", e.target.value)}
                    placeholder="123 Education Lane"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.adressStreet && "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {errors.adressStreet && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.adressStreet[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    City <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  <Input
                    value={form.addressCity}
                    onChange={(e) => set("addressCity", e.target.value)}
                    placeholder="Melbourne"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.addressCity && "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {errors.addressCity && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.addressCity[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    State <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  <Input
                    value={form.addressState}
                    onChange={(e) => set("addressState", e.target.value)}
                    placeholder="VIC"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.addressState && "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {errors.addressState && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.addressState[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    Postal Code <span className="text-destructive font-bold ml-0.5">*</span>
                  </Label>
                  <Input
                    value={form.addressZip}
                    onChange={(e) => set("addressZip", e.target.value)}
                    placeholder="3000"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.addressZip && "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {errors.addressZip && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.addressZip[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider opacity-80">
                Admin Information <span className="text-muted-foreground font-normal ml-1">(Optional)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-bold text-foreground">
                    Admin Name
                  </Label>
                  <Input
                    value={form.adminName}
                    onChange={(e) => set("adminName", e.target.value)}
                    placeholder="e.g., John Smith"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.admin_name && "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {errors.admin_name && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.admin_name[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-bold text-foreground">
                    Admin Email
                  </Label>
                  <Input
                    type="email"
                    value={form.adminEmail}
                    onChange={(e) => set("adminEmail", e.target.value)}
                    placeholder="e.g., admin@example.com"
                    className={cn(
                      "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium",
                      errors.admin_email && "border-destructive focus-visible:ring-destructive/20"
                    )}
                  />
                  {errors.admin_email && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.admin_email[0]}
                    </p>
                  )}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-bold text-foreground">
                    Admin Password
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={form.adminPassword}
                      onChange={(e) => set("adminPassword", e.target.value)}
                      placeholder="Enter admin password"
                      className={cn(
                        "h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium pr-10",
                        errors.admin_password && "border-destructive focus-visible:ring-destructive/20"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.admin_password && (
                    <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                      {errors.admin_password[0]}
                    </p>
                  )}
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
                isEdit ? "Save Changes" : "Add Center"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
