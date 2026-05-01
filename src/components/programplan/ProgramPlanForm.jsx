import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Save,
  X,
  Search,
  Calendar,
  Building2,
  DoorOpen,
  Users,
  Sparkles,
  Target,
  BookOpen,
  Activity as ActivityIcon,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MONTHS,
  YEARS,
  SUBJECT_TREE,
  ACTIVITY_SUBJECTS,
  RICH_SUBJECTS,
  ADDITIONAL_FIELDS,
  EDUCATORS,
  EYLF_OUTCOMES,
} from "./data";
import { ActivityPickerModal } from "./ActivityPickerModal";
import { EylfPickerModal } from "./EylfPickerModal";
import { mockChildren } from "@/services/mocks/data";
import { useCentreStore } from "@/stores/centreStore";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const empty = (centreId, roomId) => ({
  centreId: centreId || "",
  roomId: roomId || "",
  month: MONTHS[new Date().getMonth()],
  year: new Date().getFullYear(),
  educators: [],
  children: [],
  focusArea: "",
  // activity-based subjects
  practicalLife: [],
  sensorial: [],
  math: [],
  language: [],
  culture: [],
  // rich text subject
  artCraft: "",
  // additional
  eylf: [],
  outdoor: "",
  inquiry: "",
  sustainability: "",
  specialEvents: "",
  childrenVoices: "",
  familiesInput: "",
  groupExperience: "",
  spontaneous: "",
  mindfulness: "",
  whatIsWorking: "",
  whatIsNotWorking: "",
  status: "draft",
});

const SUBJECT_FIELDS = {
  "practical-life": "practicalLife",
  sensorial: "sensorial",
  math: "math",
  language: "language",
  culture: "culture",
};

export function ProgramPlanForm({ mode = "create", initial, onCancel, onSubmit, defaults }) {
  const centres = useCentreStore((s) => s.centres);
  const rooms = useMemo(() => {
    // Use mockChildren room names for available rooms scoped per centre
    const byCentre = {};
    mockChildren.forEach((c) => {
      if (!byCentre[c.centreId]) byCentre[c.centreId] = new Set();
      byCentre[c.centreId].add(c.roomName);
    });
    return byCentre;
  }, []);

  const [data, setData] = useState(() =>
    initial ? { ...empty(), ...initial } : empty(defaults?.centreId, defaults?.roomName)
  );

  const [picker, setPicker] = useState(null); // subjectKey
  const [eylfOpen, setEylfOpen] = useState(false);
  const [educatorQuery, setEducatorQuery] = useState("");
  const [childQuery, setChildQuery] = useState("");

  const update = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const toggleArr = (k, v) => {
    setData((p) => {
      const arr = p[k] || [];
      return {
        ...p,
        [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
      };
    });
  };

  const availableRooms = rooms[data.centreId] ? Array.from(rooms[data.centreId]) : [];
  const availableChildren = mockChildren.filter(
    (c) => c.centreId === data.centreId && (!data.roomId || c.roomName === data.roomId)
  );

  const handleSubmit = (status) => {
    if (!data.centreId || !data.roomId) {
      toast.error("Please select a centre and room.");
      return;
    }
    onSubmit({ ...data, status });
  };

  return (
    <div>
      <PageHeader
        title={mode === "edit" ? "Edit Program Plan" : "Create Program Plan"}
        description="Plan monthly experiences across Montessori subjects and EYLF outcomes"
        breadcrumbs={[
          { label: "Program Plan", to: "/program-plan" },
          { label: mode === "edit" ? "Edit" : "Create" },
        ]}
        actions={
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card via-card to-muted/30 p-6 shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl"
        />

        {/* TOP: Centre / Room / Month / Year */}
        <Section icon={Calendar} title="Plan Details">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Field label="Centre" icon={Building2}>
              <Select value={data.centreId} onValueChange={(v) => update("centreId", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select centre" /></SelectTrigger>
                <SelectContent>
                  {centres.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Room" icon={DoorOpen}>
              <Select value={data.roomId} onValueChange={(v) => update("roomId", v)}>
                <SelectTrigger className="h-10"><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {availableRooms.length === 0 ? (
                    <SelectItem value="__none" disabled>No rooms for this centre</SelectItem>
                  ) : availableRooms.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Month" icon={Calendar}>
              <Select value={data.month} onValueChange={(v) => update("month", v)}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Year" icon={Calendar}>
              <Select value={String(data.year)} onValueChange={(v) => update("year", Number(v))}>
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Section>

        {/* Educators & Children */}
        <Section icon={Users} title="Team & Children">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <ChipPicker
              label="Select Educators"
              query={educatorQuery}
              setQuery={setEducatorQuery}
              options={EDUCATORS.filter((e) => e.toLowerCase().includes(educatorQuery.toLowerCase()))}
              selected={data.educators}
              onToggle={(v) => toggleArr("educators", v)}
            />
            <ChipPicker
              label="Select Children"
              query={childQuery}
              setQuery={setChildQuery}
              options={availableChildren
                .map((c) => `${c.firstName} ${c.lastName}`)
                .filter((n) => n.toLowerCase().includes(childQuery.toLowerCase()))}
              selected={data.children}
              onToggle={(v) => toggleArr("children", v)}
              emptyHint="Pick a centre & room first"
            />
          </div>
        </Section>

        {/* Focus Area */}
        <Section icon={Target} title="Focus">
          <Field label="Focus Areas">
            <Textarea
              value={data.focusArea}
              onChange={(e) => update("focusArea", e.target.value)}
              placeholder="Focus Area"
              rows={3}
            />
          </Field>
        </Section>

        {/* Activity-based subjects */}
        <Section icon={ActivityIcon} title="Subject Activities">
          <div className="space-y-4">
            {ACTIVITY_SUBJECTS.map((key) => {
              const field = SUBJECT_FIELDS[key];
              const subj = SUBJECT_TREE[key];
              const selected = data[field] || [];
              return (
                <div key={key} className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-sm font-semibold text-primary">{subj.label}</Label>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setPicker(key)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Search className="mr-1.5 h-4 w-4" />
                      Select Activities
                    </Button>
                  </div>
                  <div className="min-h-[44px] rounded-md border border-dashed border-border bg-muted/20 p-2">
                    {selected.length === 0 ? (
                      <p className="text-xs text-muted-foreground">No activities selected.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {selected.map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
                          >
                            {a}
                            <button
                              type="button"
                              onClick={() => update(field, selected.filter((x) => x !== a))}
                              className="hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Rich text subjects (Art & Craft) */}
            {RICH_SUBJECTS.map((s) => (
              <Field key={s.key} label={s.label}>
                <Textarea
                  value={data[s.key]}
                  onChange={(e) => update(s.key, e.target.value)}
                  placeholder={s.placeholder}
                  rows={3}
                />
              </Field>
            ))}
          </div>
        </Section>

        {/* Additional Experiences */}
        <Section icon={Sparkles} title="Additional Experiences">
          {/* EYLF picker */}
          <div className="mb-5 rounded-xl border border-border bg-background/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-sm font-semibold text-primary">EYLF Outcomes</Label>
              <Button type="button" size="sm" onClick={() => setEylfOpen(true)}>
                <Search className="mr-1.5 h-4 w-4" />
                Select EYLF
              </Button>
            </div>
            <div className="min-h-[44px] rounded-md border border-dashed border-border bg-muted/20 p-2">
              {data.eylf.length === 0 ? (
                <p className="text-xs text-muted-foreground">No outcomes selected.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {data.eylf.map((code) => {
                    const outcome = EYLF_OUTCOMES.find((o) => o.code === code);
                    return (
                      <span
                        key={code}
                        title={outcome?.label}
                        className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-medium text-accent-foreground"
                      >
                        EYLF {code}
                        <button
                          type="button"
                          onClick={() => update("eylf", data.eylf.filter((x) => x !== code))}
                          className="hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {ADDITIONAL_FIELDS.map((f) => (
              <Field key={f.key} label={f.label}>
                <Textarea
                  value={data[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                  placeholder={f.placeholder || ""}
                  rows={3}
                />
              </Field>
            ))}
          </div>
        </Section>

        {/* Status */}
        <Section icon={BookOpen} title="Status">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => update("status", "draft")}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                data.status === "draft"
                  ? "bg-destructive text-destructive-foreground shadow"
                  : "border border-border bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              Draft
            </button>
            <button
              type="button"
              onClick={() => update("status", "published")}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                data.status === "published"
                  ? "bg-emerald-600 text-white shadow"
                  : "border border-border bg-background text-muted-foreground hover:bg-muted"
              )}
            >
              Published
            </button>
          </div>
        </Section>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
          <Button
            onClick={() => handleSubmit(data.status)}
            className="bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700"
          >
            <Save className="mr-1.5 h-4 w-4" />
            {mode === "edit" ? "Update" : "Save"}
          </Button>
          {mode === "edit" && (
            <Button
              onClick={() => handleSubmit(data.status)}
              variant="default"
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Save className="mr-1.5 h-4 w-4" />
              Save as New
            </Button>
          )}
          <Button variant="destructive" onClick={onCancel}>
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Modals */}
      {picker && (
        <ActivityPickerModal
          open
          subjectKey={picker}
          initial={data[SUBJECT_FIELDS[picker]] || []}
          onClose={() => setPicker(null)}
          onSave={(items) => {
            update(SUBJECT_FIELDS[picker], items);
            setPicker(null);
          }}
        />
      )}
      <EylfPickerModal
        open={eylfOpen}
        initial={data.eylf}
        onClose={() => setEylfOpen(false)}
        onSave={(items) => {
          update("eylf", items);
          setEylfOpen(false);
        }}
      />
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <section className="relative mb-7">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <Label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-primary">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </Label>
      {children}
    </div>
  );
}

function ChipPicker({ label, query, setQuery, options, selected, onToggle, emptyHint }) {
  return (
    <div>
      <Label className="mb-1.5 block text-xs font-semibold text-primary">{label}</Label>
      <div className="rounded-xl border border-border bg-background/60 p-3">
        <div className="relative mb-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="h-9 pl-9"
          />
        </div>
        <div className="flex max-h-32 flex-wrap gap-1.5 overflow-y-auto">
          {options.length === 0 ? (
            <p className="px-1 text-xs text-muted-foreground">{emptyHint || "No matches"}</p>
          ) : (
            options.map((opt) => {
              const isSel = selected.includes(opt);
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onToggle(opt)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                    isSel
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  )}
                >
                  {opt}
                </button>
              );
            })
          )}
        </div>
        {selected.length > 0 && (
          <p className="mt-2 text-[11px] text-muted-foreground">{selected.length} selected</p>
        )}
      </div>
    </div>
  );
}