import { useState, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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



export function AddChildModal({ open, onClose, onSubmit, room, initial }) {
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
          days: initial.daysAttending ? Array.from(initial.daysAttending).map((v, i) => v === '1' ? DAYS[i] : null).filter(Boolean) : [...DAYS],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-xl font-bold text-foreground">
            {initial ? "Edit Child" : "+ Add New Child"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {room && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm text-foreground">
              Adding child to room: <strong>{room.name}</strong>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.firstname}
                onChange={(e) => update("firstname", e.target.value)}
                placeholder="Enter first name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>
                Last Name
              </Label>
              <Input
                value={form.lastname}
                onChange={(e) => update("lastname", e.target.value)}
                placeholder="Enter last name"
              />
            </div>


            <div className="space-y-2">
              <Label>
                Date of Birth <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={form.dob}
                onChange={(e) => update("dob", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => update("startDate", e.target.value)}
                required
              />
            </div>


            <div className="space-y-2">
              <Label>Choose Image</Label>
              <label className="flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-border px-3 py-2 text-sm hover:bg-muted/50">
                <Upload className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {preview ? "Change image" : "Choose file"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="hidden"
                />
              </label>
              {preview && (
                <img
                  src={preview}
                  alt="preview"
                  className="mt-2 h-20 w-20 rounded-md border border-border object-cover"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Status <span className="text-destructive">*</span>
              </Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Gender <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-5">
              {GENDER_OPTIONS.map((g) => (
                <label
                  key={g.value}
                  className="flex cursor-pointer items-center gap-2 text-sm"
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

          <div className="space-y-2">
            <Label>
              Days Attending <span className="text-destructive">*</span>
            </Label>
            <div className="flex flex-wrap gap-4">
              {DAYS.map((d) => (
                <label
                  key={d}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={form.days.includes(d)}
                    onChange={() => toggleDay(d)}
                    className="h-4 w-4 accent-primary"
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{initial ? "Update" : "Submit"}</Button>
        </div>
      </form>
    </div>
  );
}