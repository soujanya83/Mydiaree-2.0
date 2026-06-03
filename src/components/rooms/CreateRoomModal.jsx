import { useEffect, useState, useRef, useCallback } from "react";
import { X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoomStore } from "@/stores/roomStore";
import { useCentreStore } from "@/stores/centreStore";
import { staffService } from "@/services/admin/staffService";

const empty = {
  name: "",
  capacity: "",
  fromAge: "",
  toAge: "",
  status: "Active",
  color: "#25176F",
  educatorIds: [],
};

export function CreateRoomModal({ open, onClose, onSubmit, initial }) {
  const { isSubmitting } = useRoomStore();
  const { activeCentreId } = useCentreStore();
  const [form, setForm] = useState(empty);
  const isEdit = Boolean(initial);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const observer = useRef();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1); // Reset page on new search
      setStaffList([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch staff
  useEffect(() => {
    if (!open || !activeCentreId) return;
    const fetchStaff = async () => {
      setIsLoading(true);
      try {
        const response = await staffService.getStaffSettings({
          center_id: activeCentreId,
          search: debouncedQuery,
          page,
          per_page: 50,
        });
        const items = response.data?.staff?.data || [];
        const activeItems = items.filter((s) => s.status === "ACTIVE");

        setStaffList((prev) => (page === 1 ? activeItems : [...prev, ...activeItems]));
        const pagination = response.pagination || response.data?.staff || {};
        setHasMore(pagination.current_page < pagination.last_page);
      } catch (error) {
        console.error("Failed to fetch staff", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStaff();
  }, [open, activeCentreId, debouncedQuery, page]);

  const lastElementRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore],
  );

  useEffect(() => {
    if (open) {
      setForm(
        initial
          ? {
              name: initial.name || "",
              capacity: initial.capacity ?? "",
              fromAge: initial.ageFrom ?? initial.fromAge ?? "",
              toAge: initial.ageTo ?? initial.toAge ?? "",
              status: initial.status || "Active",
              color: initial.color || "#25176F",
              educatorIds: (initial.educators || []).map((e) => String(e.userid || e.id)),
            }
          : empty,
      );
    }
  }, [open, initial]);

  if (!open) return null;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleEd = (id) =>
    set(
      "educatorIds",
      form.educatorIds.includes(String(id))
        ? form.educatorIds.filter((x) => x !== String(id))
        : [...form.educatorIds, String(id)],
    );

  const canSubmit =
    form.name.trim() &&
    form.capacity !== "" &&
    form.fromAge !== "" &&
    form.toAge !== "" &&
    (!isEdit || form.educatorIds.length > 0);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      name: form.name.trim(),
      capacity: Number(form.capacity),
      ageFrom: Number(form.fromAge),
      ageTo: Number(form.toAge),
      status: form.status,
      color: form.color,
      educatorIds: form.educatorIds,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">
            {isEdit ? "Edit Room" : "Create Room"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className="grid gap-5 overflow-y-auto px-6 py-5 sm:grid-cols-2"
          style={{ maxHeight: "70vh" }}
        >
          <Field label="Name" required>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g Adventures"
            />
          </Field>
          <Field label="Capacity" required>
            <Input
              type="number"
              min={0}
              value={form.capacity}
              onChange={(e) => set("capacity", e.target.value)}
              placeholder="e.g 20"
            />
          </Field>
          <Field label="From Age" required>
            <Input
              type="number"
              min={0}
              value={form.fromAge}
              onChange={(e) => set("fromAge", e.target.value)}
              placeholder="e.g 0"
            />
          </Field>
          <Field label="To Age" required>
            <Input
              type="number"
              min={0}
              value={form.toAge}
              onChange={(e) => set("toAge", e.target.value)}
              placeholder="e.g 5"
            />
          </Field>
          <Field label="Status" required>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Room Color" required>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                className="h-10 w-20 cursor-pointer rounded border border-input bg-background p-1"
              />
              <Input
                value={form.color}
                onChange={(e) => set("color", e.target.value)}
                placeholder="#000000"
                className="font-mono"
              />
            </div>
          </Field>
          <Field
            label={isEdit ? "Educators" : "Educators (Optional)"}
            required={isEdit}
            className="sm:col-span-2"
          >
            <div className="mb-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search educators..."
                className="h-8 text-sm"
              />
            </div>
            <div className="max-h-44 space-y-1.5 overflow-y-auto rounded-md border border-input bg-background p-2">
              {staffList.length === 0 && !isLoading ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No educators found for this center.
                </p>
              ) : (
                staffList.map((ed, index) => {
                  const idStr = String(ed.staffid || ed.id || ed.userid);
                  const checked = form.educatorIds.includes(idStr);
                  const isLastElement = staffList.length === index + 1;
                  return (
                    <label
                      key={idStr}
                      ref={isLastElement ? lastElementRef : null}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleEd(idStr)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm text-foreground">{ed.name}</span>
                    </label>
                  );
                })
              )}
              {isLoading && (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </Field>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button disabled={!canSubmit || isSubmitting} onClick={handleSubmit}>
            {isSubmitting ? "Submitting..." : isEdit ? "Update" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className, required }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold text-foreground">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
