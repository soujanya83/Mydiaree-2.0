import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EDUCATOR_POOL } from "@/components/rooms/roomsData";

const empty = {
  name: "",
  capacity: "",
  fromAge: "",
  toAge: "",
  status: "active",
  educatorIds: [],
};

export function CreateRoomModal({ open, onClose, onSubmit, initial }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name || "",
              capacity: initial.capacity ?? "",
              fromAge: initial.fromAge ?? "",
              toAge: initial.toAge ?? "",
              status: initial.status || "active",
              educatorIds: (initial.educators || []).map((e) => e.id),
            }
          : empty
      );
    }
  }, [open, initial]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleEd = (id) =>
    set(
      "educatorIds",
      form.educatorIds.includes(id)
        ? form.educatorIds.filter((x) => x !== id)
        : [...form.educatorIds, id]
    );

  const canSubmit =
    form.name.trim() &&
    form.capacity !== "" &&
    form.fromAge !== "" &&
    form.toAge !== "";

  const handleSubmit = () => {
    if (!canSubmit) return;
    const educators = EDUCATOR_POOL.filter((e) =>
      form.educatorIds.includes(e.id)
    );
    onSubmit({
      name: form.name.trim(),
      capacity: Number(form.capacity),
      fromAge: Number(form.fromAge),
      toAge: Number(form.toAge),
      status: form.status,
      educators,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">
            {initial ? "Edit Room" : "Create Room"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-5 overflow-y-auto px-6 py-5 sm:grid-cols-2" style={{ maxHeight: "70vh" }}>
          <Field label="Name">
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g Adventures"
            />
          </Field>
          <Field label="Capacity">
            <Input
              type="number"
              min={0}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="e.g 20"
            />
          </Field>
          <Field label="From Age">
            <Input
              type="number"
              min={0}
              value={form.fromAge}
              onChange={(e) => set("fromAge", e.target.value)}
              placeholder="e.g 0"
            />
          </Field>
          <Field label="To Age">
            <Input
              type="number"
              min={0}
              value={form.toAge}
              onChange={(e) => set("toAge", e.target.value)}
              placeholder="e.g 5"
            />
          </Field>
          <Field label="Status">
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Educators">
            <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-md border border-input bg-background p-2">
              {EDUCATOR_POOL.map((ed) => {
                const checked = form.educatorIds.includes(ed.id);
                return (
                  <label
                    key={ed.id}
                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-muted"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleEd(ed.id)}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-sm text-foreground">{ed.name}</span>
                  </label>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={!canSubmit} onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}