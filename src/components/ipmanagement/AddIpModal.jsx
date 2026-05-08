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

const emptyForm = { ip: "", name: "", location: "", status: "active" };

export function AddIpModal({ open, onOpenChange, initial, onSave, saving = false }) {
  const [form, setForm] = useState(emptyForm);
  const [yourIp, setYourIp] = useState("");
  const [checking, setChecking] = useState(false);

  const isEdit = !!initial?.id;

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : emptyForm);
      setYourIp("");
    }
  }, [open, initial]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleCheckIp = async () => {
    setChecking(true);
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      setYourIp(data.ip);
    } catch {
      toast.error("Failed to fetch IP");
    } finally {
      setChecking(false);
    }
  };

  const handlePaste = () => {
    if (yourIp) update("ip", yourIp);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.ip.trim() || !form.name.trim()) {
      toast.error("IP and Name are required");
      return;
    }
    const didSave = await onSave({ ...form, id: initial?.id });
    if (didSave !== false) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden sm:max-w-lg">
        <DialogHeader className="bg-primary px-5 py-4">
          <DialogTitle className="text-primary-foreground text-base font-semibold">
            {isEdit ? "Edit Wifi IP" : "Add New Wifi IP"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-5 py-5">
            <div className="space-y-2">
              <Label className="text-sm font-semibold">IP</Label>
              <div className="flex gap-2">
                <Input
                  value={form.ip}
                  onChange={(e) => update("ip", e.target.value)}
                  placeholder="Enter IP"
                  className="flex-1"
                  disabled={saving}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCheckIp}
                  disabled={checking || saving}
                >
                  {checking ? "..." : "Check IP"}
                </Button>
                {yourIp && (
                  <Button type="button" onClick={handlePaste} disabled={saving}>
                    Paste
                  </Button>
                )}
              </div>
              {yourIp && <p className="text-xs text-muted-foreground">Your IP: {yourIp}</p>}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">IP Name</Label>
              <Input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Enter IP Name"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">IP Location</Label>
              <Input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="Enter IP Location"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">IP Status</Label>
              <RadioGroup
                value={form.status}
                onValueChange={(v) => update("status", v)}
                className="flex items-center gap-6"
                disabled={saving}
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="active" id="ip-active" />
                  <Label htmlFor="ip-active" className="font-semibold cursor-pointer">
                    Active
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="inactive" id="ip-inactive" />
                  <Label htmlFor="ip-inactive" className="font-semibold cursor-pointer">
                    Inactive
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter className="border-t bg-muted/30 px-5 py-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : isEdit ? "Update IP" : "Save IP"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
