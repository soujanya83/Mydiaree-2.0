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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Wifi, Globe, MapPin, Tag, ShieldAlert, Check, Copy, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const emptyForm = { ip: "", name: "", location: "", status: "active" };

export function AddIpModal({ open, onOpenChange, initial, onSave, saving = false }) {
  const [form, setForm] = useState(emptyForm);
  const [yourIp, setYourIp] = useState("");
  const [checking, setChecking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState({});

  const isEdit = !!initial?.id;

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : emptyForm);
      setYourIp("");
      setCopied(false);
      setErrors({});
    }
  }, [open, initial]);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "ip") setErrors((prev) => ({ ...prev, wifi_ip: null }));
    if (k === "name") setErrors((prev) => ({ ...prev, wifi_name: null }));
    if (k === "status") setErrors((prev) => ({ ...prev, status: null }));
  };

  const handleCheckIp = async () => {
    setChecking(true);
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      setYourIp(data.ip);
      toast.success("Successfully retrieved your public IP!");
    } catch {
      toast.error("Failed to retrieve your public IP");
    } finally {
      setChecking(false);
    }
  };

  const handleCopyAndPaste = () => {
    if (yourIp) {
      update("ip", yourIp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.info("IP address populated in form");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    let localErrors = {};
    if (!form.ip.trim()) {
      localErrors.wifi_ip = ["The wifi ip field is required."];
    }
    if (!form.name.trim()) {
      localErrors.wifi_name = ["The wifi name field is required."];
    }
    if (!form.status) {
      localErrors.status = ["The status field is required."];
    }
    
    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      toast.error("Validation failed.");
      return;
    }

    try {
      const didSave = await onSave({ ...form, id: initial?.id });
      if (didSave !== false) {
        onOpenChange(false);
      }
    } catch (error) {
      const responseData = error?.response?.data;
      if (responseData && responseData.errors) {
        setErrors(responseData.errors);
        toast.error(responseData.message || "Validation failed.");
      } else {
        toast.error(error?.message || "Failed to save IP Address");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-lg border border-border/80 bg-card/95 backdrop-blur-md rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200">
        <DialogHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-5 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Wifi className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-foreground text-lg font-extrabold tracking-tight">
                {isEdit ? "Edit Allowed IP" : "Add Allowed IP"}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure network restrictions and allowed static IPs
              </p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-5 px-6 py-5">
            {/* IP Address Field */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                IP Address <span className="text-destructive font-bold ml-0.5">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground/50" />
                  <Input
                    value={form.ip}
                    onChange={(e) => update("ip", e.target.value)}
                    placeholder="e.g. 192.168.1.1"
                    className={cn(
                      "pl-10 h-11 border-muted-foreground/20 bg-muted/20 focus-visible:ring-primary/20 rounded-xl font-mono text-sm",
                      errors.wifi_ip && "border-destructive focus-visible:ring-destructive/20"
                    )}
                    disabled={saving}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCheckIp}
                  disabled={checking || saving}
                  className="h-11 px-4 rounded-xl border-border hover:bg-muted font-bold transition-all text-xs"
                >
                  {checking ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Wifi className="h-4 w-4 mr-1 text-primary" />
                  )}
                  Check My IP
                </Button>
              </div>

              {errors.wifi_ip && (
                <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                  {errors.wifi_ip[0]}
                </p>
              )}

              {/* Your current public IP hint */}
              {yourIp && (
                <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/10 px-3 py-2 mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <span className="text-xs font-bold text-primary/80 font-mono">
                    Your IP: {yourIp}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyAndPaste}
                    className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase tracking-wider hover:underline"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3" /> Applied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Use this IP
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* IP Name Field */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                IP Name / Label <span className="text-destructive font-bold ml-0.5">*</span>
              </Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="e.g. Primary Center Wifi Office"
                  className={cn(
                    "pl-10 h-11 border-muted-foreground/20 bg-muted/20 focus-visible:ring-primary/20 rounded-xl",
                    errors.wifi_name && "border-destructive focus-visible:ring-destructive/20"
                  )}
                  disabled={saving}
                />
              </div>
              {errors.wifi_name && (
                <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                  {errors.wifi_name[0]}
                </p>
              )}
            </div>

            {/* Location Field */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                Location <span className="text-muted-foreground/40 font-normal lowercase">(optional)</span>
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted-foreground/50" />
                <Input
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="e.g. Reception, Main Building"
                  className="pl-10 h-11 border-muted-foreground/20 bg-muted/20 focus-visible:ring-primary/20 rounded-xl"
                  disabled={saving}
                />
              </div>
            </div>

            {/* Status Selector */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                Status <span className="text-destructive font-bold ml-0.5">*</span>
              </Label>
              <RadioGroup
                value={form.status}
                onValueChange={(v) => update("status", v)}
                className="flex items-center gap-6 p-1"
                disabled={saving}
              >
                <label
                  htmlFor="ip-active"
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-2xl border p-4 cursor-pointer transition-all",
                    form.status === "active"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-muted/15 text-muted-foreground hover:bg-muted/30",
                    errors.status && "border-destructive"
                  )}
                >
                  <RadioGroupItem value="active" id="ip-active" className="accent-primary" />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold">Active</span>
                    <span className="text-[10px] opacity-80 font-medium">Immediately allow connection</span>
                  </div>
                </label>

                <label
                  htmlFor="ip-inactive"
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-2xl border p-4 cursor-pointer transition-all",
                    form.status === "inactive"
                      ? "border-destructive bg-destructive/5 text-destructive"
                      : "border-border bg-muted/15 text-muted-foreground hover:bg-muted/30",
                    errors.status && "border-destructive"
                  )}
                >
                  <RadioGroupItem value="inactive" id="ip-inactive" className="accent-destructive" />
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold">Inactive</span>
                    <span className="text-[10px] opacity-80 font-medium">Temporarily disable access</span>
                  </div>
                </label>
              </RadioGroup>
              {errors.status && (
                <p className="text-xs font-semibold text-destructive mt-1 px-1 animate-in fade-in-50">
                  {errors.status[0]}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="border-t border-border/40 bg-muted/30 px-6 py-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
              className="rounded-xl font-bold h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-primary px-8 font-bold shadow-lg shadow-primary/20 h-11"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Saving...
                </>
              ) : isEdit ? (
                "Update IP Address"
              ) : (
                "Save IP Address"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
