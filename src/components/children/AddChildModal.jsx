import { useState, useEffect } from "react";
import { X, Upload, Loader2, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DAYS, GENDER_OPTIONS, STATUS_OPTIONS } from "./childrenData";
import { toast } from "sonner";

const blank = {
  firstname: "",
  lastname: "",
  dob: "",
  startDate: "",
  image: "",
  imageFile: null,
  status: "Active",
  gender: "Male",
  days: [...DAYS],
};



const parseDaysAttending = (initial, defaultDays) => {
  if (!initial) return [...defaultDays];
  const rawDays = initial.daysAttending ?? initial.dayAttending ?? initial.days_attending ?? initial.days;
  if (!rawDays) return [...defaultDays];

  if (Array.isArray(rawDays)) {
    return rawDays
      .map((d) => defaultDays.find((day) => day.toLowerCase() === String(d).toLowerCase()))
      .filter(Boolean);
  }

  if (typeof rawDays === "string") {
    if (/^[01]+$/.test(rawDays)) {
      return Array.from(rawDays)
        .map((v, i) => (v === '1' ? defaultDays[i] : null))
        .filter(Boolean);
    }
    return rawDays
      .split(",")
      .map((d) => d.trim())
      .map((d) => defaultDays.find((day) => day.toLowerCase() === d.toLowerCase()))
      .filter(Boolean);
  }

  return [...defaultDays];
};

export function AddChildModal({ open, onClose, onSubmit, room, initial, isSaving }) {
  const [form, setForm] = useState(blank);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (open) {
      if (initial) {
        setForm({
          firstname: initial.name || "",
          lastname: initial.lastname || "",
          dob: initial.dob || "",
          startDate: initial.startDate || "",
          image: initial.imageUrl || "",
          imageFile: null,
          status: initial.status ? (initial.status.charAt(0).toUpperCase() + initial.status.slice(1).toLowerCase()) : "Active",
          gender: initial.gender ? (initial.gender.charAt(0).toUpperCase() + initial.gender.slice(1).toLowerCase()) : "Male",
          days: parseDaysAttending(initial, DAYS),
        });
        setPreview(initial.imageUrl ? (initial.imageUrl.startsWith("http") ? initial.imageUrl : `https://mydiaree.com.au/${initial.imageUrl}`) : "");
      } else {
        setForm(blank);
        setPreview("");
      }
    }
  }, [open, initial]);



  if (!open) return null;

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const toggleDay = (d) =>
    setForm((p) => ({
      ...p,
      days: p.days.includes(d) ? p.days.filter((x) => x !== d) : [...p.days, d],
    }));

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    update("imageFile", f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstname.trim()) {
      toast.error("First name is required");
      return;
    }
    if (!form.dob || !form.startDate) {
      toast.error("Date of Birth and Start Date are required");
      return;
    }
    if (!form.gender) {
      toast.error("Please select a gender");
      return;
    }
    
    // Format payload for API
    const payload = {
      firstname: form.firstname,
      lastname: form.lastname,
      dob: form.dob,
      startDate: form.startDate,
      gender: form.gender,
      status: form.status,
      days: form.days,
    };
    if (form.imageFile) payload.file = form.imageFile;
    
    onSubmit(payload);
  };


  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[750px] p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <DialogHeader className="px-6 pb-2 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Baby className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground pr-8">
                  {initial ? "Edit Child Profile" : "Add New Child"}
                </DialogTitle>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">
                  {initial ? "Update details for this child" : "Create a new profile for enrollment"}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="flex-1 space-y-6 px-6 py-5">
            {room && (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                Adding child to room: <strong>{room.name}</strong>
              </div>
            )}

            <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider opacity-80">
                General Details
              </h3>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={form.firstname}
                    onChange={(e) => update("firstname", e.target.value)}
                    placeholder="Enter first name"
                    required
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    Last Name
                  </Label>
                  <Input
                    value={form.lastname}
                    onChange={(e) => update("lastname", e.target.value)}
                    placeholder="Enter last name"
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    Date of Birth <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.dob}
                    onChange={(e) => update("dob", e.target.value)}
                    required
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => update("startDate", e.target.value)}
                    required
                    className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-bold text-foreground">Profile Image</Label>
                  <div className="flex items-center gap-4 rounded-xl border border-dashed border-border/80 bg-background/50 p-4 transition-colors hover:bg-muted/40">
                    {preview ? (
                      <div className="relative h-16 w-16 shrink-0 rounded-full border-2 border-background shadow-md">
                        <img
                          src={preview}
                          alt="preview"
                          className="h-full w-full rounded-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Upload className="h-6 w-6" />
                      </div>
                    )}
                    
                    <div className="flex flex-col flex-1 gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {preview ? "Image selected" : "Upload a profile picture"}
                      </span>
                      <label className="self-start cursor-pointer rounded-lg bg-secondary px-4 py-2 text-xs font-bold text-secondary-foreground shadow-sm transition-colors hover:bg-secondary/80">
                        Choose file
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFile}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select value={form.status} onValueChange={(v) => update("status", v)}>
                    <SelectTrigger className="h-11 rounded-xl bg-background/50 focus-visible:ring-primary/20 font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {STATUS_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-foreground">
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-4 pt-2">
                    {GENDER_OPTIONS.map((g) => (
                      <label
                        key={g.value}
                        className="flex cursor-pointer items-center gap-2 text-sm font-medium"
                      >
                        <input
                          type="radio"
                          name="gender"
                          value={g.value}
                          checked={form.gender === g.value}
                          onChange={() => update("gender", g.value)}
                          className="h-4 w-4 accent-primary"
                        />
                        {g.label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/10 p-5">
              <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider opacity-80">
                Attendance
              </h3>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-foreground">
                  Days Attending <span className="text-destructive">*</span>
                </Label>
                <div className="flex flex-wrap gap-3">
                  {DAYS.map((d) => (
                    <label
                      key={d}
                      className={`flex cursor-pointer select-none items-center justify-center rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                        form.days.includes(d)
                          ? "border-primary bg-primary/10 text-primary shadow-sm"
                          : "border-border bg-background/50 text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={form.days.includes(d)}
                        onChange={() => toggleDay(d)}
                        className="hidden"
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 border-t border-border/50 bg-muted/10 px-6 py-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose} 
              disabled={isSaving}
              className="rounded-xl font-semibold"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initial ? "Update Profile" : "Add Child"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}