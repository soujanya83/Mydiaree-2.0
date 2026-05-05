import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  FileText,
  Sparkles,
  Image as ImageIcon,
  X,
  Search,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import { mockReflections } from "@/components/reflection/reflectionsData";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EYLF_OUTCOMES = [
  "Outcome 1 - 1.1 Children feel safe, secure, and supported",
  "Outcome 1 - 1.2 Children develop their emerging autonomy",
  "Outcome 2 - 2.1 Children develop a sense of belonging",
  "Outcome 3 - 3.1 Children become strong in their wellbeing",
  "Outcome 4 - 4.1 Children develop dispositions for learning",
  "Outcome 5 - 5.1 Children interact verbally and non-verbally",
];

const STAFF = ["testtt 2", "Sarah Lee", "Mia Chen", "Daniel Park", "Priya Nair"];

export default function DailyReflectionCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [search] = useSearchParams();
  const isEdit = Boolean(id);

  const { rooms: allRooms } = useRoomStore();
  const { children: allChildren } = useChildrenStore();

  const existing = useMemo(
    () => (isEdit ? mockReflections.find((r) => r.id === id) : null),
    [id, isEdit]
  );

  const initialTitle = existing?.title || search.get("title") || "";

  const [rooms, setRooms] = useState(existing?.roomIds || []);
  const [children, setChildren] = useState(existing?.childIds || []);
  const [staff, setStaff] = useState(existing?.educators || []);
  const [eylf, setEylf] = useState(existing?.eylf || []);
  const [title, setTitle] = useState(initialTitle);
  const [reflection, setReflection] = useState(existing?.reflection || "");

  const [picker, setPicker] = useState(null); // 'rooms' | 'children' | 'staff' | 'eylf'

  const handleSave = (status) => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    toast.success(
      isEdit
        ? `Reflection updated (${status})`
        : `Reflection ${status === "published" ? "published" : "saved as draft"}`
    );
    navigate("/daily-reflections");
  };

  const childName =
    children.length > 0
      ? allChildren.find((c) => String(c.id) === String(children[0]))?.name?.toUpperCase() || ""
      : "";

  return (
    <div>
      {/* Top header strip */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/daily-reflections")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/daily-reflections" className="hover:text-foreground">Reflection</Link>
            <span>/</span>
            <span className="text-foreground">{isEdit ? "Edit" : "Store"}</span>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs">
            <span className="text-muted-foreground">Child Name:</span>
            <span className="rounded bg-muted px-2 py-0.5 font-bold text-emerald-700">
              {childName || "—"}
            </span>
          </div>
          <Button onClick={() => handleSave("published")} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="mr-1.5 h-4 w-4" /> Publish Now
          </Button>
          <Button onClick={() => handleSave("draft")} className="bg-amber-500 text-amber-950 hover:bg-amber-600">
            <FileText className="mr-1.5 h-4 w-4" /> Make Draft
          </Button>
        </div>
      </div>

      {/* Daily Reflection banner */}
      <div className="mb-6 rounded-xl border-2 border-emerald-500/40 bg-card px-6 py-4 text-center">
        <h2 className="inline-flex items-center gap-2 text-base font-bold text-foreground">
          <FileText className="h-4 w-4" /> Daily Reflection
        </h2>
      </div>

      {/* Rooms / Children */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <ChipPickerField
          label="Rooms"
          colour="emerald"
          values={rooms.map((id) => allRooms.find((r) => String(r.id) === String(id))?.name || id)}
          onAdd={() => setPicker("rooms")}
          onRemove={(idx) => setRooms((p) => p.filter((_, i) => i !== idx))}
          chipClass="bg-emerald-500 text-white"
          buttonClass="border-emerald-500 text-emerald-600"
        />
        <ChipPickerField
          label="Children"
          colour="sky"
          values={children.map((id) => allChildren.find((c) => String(c.id) === String(id))?.name || id)}
          onAdd={() => setPicker("children")}
          onRemove={(idx) => setChildren((p) => p.filter((_, i) => i !== idx))}
          chipClass="bg-sky-500 text-white"
          buttonClass="border-sky-500 text-sky-600"
        />
      </div>

      {/* Staff */}
      <div className="mb-6">
        <ChipPickerField
          label="Staff"
          colour="rose"
          values={staff}
          onAdd={() => setPicker("staff")}
          onRemove={(idx) => setStaff((p) => p.filter((_, i) => i !== idx))}
          chipClass="bg-rose-400 text-white"
          buttonClass="border-sky-500 text-sky-600"
        />
      </div>

      {/* EYLF */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-bold text-emerald-600">EYLF</h3>
        <div className="flex items-stretch gap-0 overflow-hidden rounded-md border border-border">
          <div className="flex-1 bg-muted/30 px-4 py-3 text-sm">
            {eylf.length === 0 ? (
              <span className="text-muted-foreground">No EYLF outcomes selected</span>
            ) : (
              <div className="flex flex-wrap gap-2">
                {eylf.map((label, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 rounded bg-emerald-100 px-2 py-1 text-xs text-emerald-700"
                  >
                    {label}
                    <button onClick={() => setEylf((p) => p.filter((_, j) => j !== i))}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => setPicker("eylf")}
            className="flex items-center gap-1.5 bg-sky-500 px-5 text-sm font-semibold text-white hover:bg-sky-600"
          >
            <Search className="h-3.5 w-3.5" /> Select EYLF
          </button>
        </div>
      </div>

      {/* Title / Reflection */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormBlock label="Title">
          <Textarea value={title} onChange={(e) => setTitle(e.target.value)} rows={3} />
          <RefineButton />
        </FormBlock>
        <FormBlock label="Reflection">
          <Textarea value={reflection} onChange={(e) => setReflection(e.target.value)} rows={3} />
          <RefineButton />
        </FormBlock>
      </div>

      {/* Media */}
      <div className="mb-6">
        <h3 className="mb-2 text-base font-bold text-foreground">Media Upload Section</h3>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10">
          <Button variant="outline" className="border-sky-500/40 text-sky-700">
            <ImageIcon className="mr-1.5 h-4 w-4" /> Select up to 10 Images/Videos
          </Button>
          <p className="mt-2 text-xs text-muted-foreground">
            Only images and videos are allowed. Max 10 files.
          </p>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Button onClick={() => handleSave("draft")} className="bg-slate-700 text-white hover:bg-slate-800">
            <FileText className="mr-1.5 h-4 w-4" /> Make Draft
          </Button>
          <Button onClick={() => handleSave("published")} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="mr-1.5 h-4 w-4" /> Publish Now
          </Button>
        </div>
        <Button onClick={() => handleSave("draft")} className="bg-emerald-600 hover:bg-emerald-700">
          Submit <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>

      {/* Picker modal */}
      {picker && (
        <PickerModal
          title={
            picker === "rooms" ? "Select Rooms" :
            picker === "children" ? "Select Children" :
            picker === "staff" ? "Select Staff" : "Select EYLF Outcomes"
          }
          options={
            picker === "rooms"
              ? allRooms.map((r) => ({ value: r.id, label: r.name }))
              : picker === "children"
              ? allChildren.map((c) => ({ value: c.id, label: c.name }))
              : picker === "staff"
              ? STAFF.map((s) => ({ value: s, label: s }))
              : EYLF_OUTCOMES.map((o) => ({ value: o, label: o }))
          }
          selected={
            picker === "rooms" ? rooms :
            picker === "children" ? children :
            picker === "staff" ? staff : eylf
          }
          onClose={() => setPicker(null)}
          onSave={(vals) => {
            if (picker === "rooms") setRooms(vals);
            else if (picker === "children") setChildren(vals);
            else if (picker === "staff") setStaff(vals);
            else setEylf(vals);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}

function FormBlock({ label, children }) {
  return (
    <div>
      <h4 className="mb-1.5 text-sm font-bold text-emerald-600">{label}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function RefineButton() {
  return (
    <div className="flex justify-end">
      <Button
        size="sm"
        className="bg-sky-500 text-white hover:bg-sky-600"
        onClick={() => toast.info("AI refinement coming soon")}
      >
        <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Refine with Ai
      </Button>
    </div>
  );
}

function ChipPickerField({ label, values, onAdd, onRemove, chipClass, buttonClass }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-emerald-600">{label}</h3>
      <div className="rounded-lg border border-border bg-card p-4">
        <button
          onClick={onAdd}
          className={`mb-3 inline-flex items-center gap-1.5 rounded-md border-2 px-4 py-2 text-sm font-semibold ${buttonClass}`}
        >
          Select {label}
        </button>
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.map((v, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold uppercase ${chipClass}`}
              >
                {v}
                <button onClick={() => onRemove(i)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PickerModal({ title, options, selected, onClose, onSave }) {
  const [chosen, setChosen] = useState(new Set(selected));
  const toggle = (v) => {
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <div className="space-y-1">
            {options.map((o) => {
              const checked = chosen.has(o.value);
              return (
                <label
                  key={o.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                    checked ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(o.value)}
                    className="accent-emerald-500"
                  />
                  <span className="text-foreground">{o.label}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(Array.from(chosen))} className="bg-emerald-600 hover:bg-emerald-700">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}