import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Eye,
  ListChecks,
  Link2,
  Calendar,
  Sparkles,
  Save,
  FileText,
  Image as ImageIcon,
  Plus,
  X,
  ChevronDown,
  Wand2,
  ClipboardList,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import { mockObservations } from "@/components/observation/observationsData";
import { OBSERVATION_TREE } from "@/components/observation/data";
import { toast } from "sonner";

const TABS = [
  { id: "observations", label: "Observations", Icon: Eye },
  { id: "assessment", label: "Assessment", Icon: ListChecks },
  { id: "link", label: "Link", Icon: Link2 },
];

const ASSESS_TABS = [
  { id: "montessori", label: "Montessori", Icon: ClipboardList },
  { id: "eylf", label: "EYLF", Icon: ListChecks },
  { id: "development", label: "Developmental Milestone", Icon: Layers },
];

const EYLF_OUTCOMES_BY_GROUP = {
  "Outcome 1": [
    "1.1 Children feel safe, secure, and supported",
    "1.2 Children develop their emerging autonomy, inter-dependence, resilience and sense of agency",
    "1.3 Children develop knowledgeable and confident self identities",
    "1.4 Children learn to interact in relation to others with care, empathy and respect",
  ],
  "Outcome 2": [
    "2.1 Children develop a sense of belonging to groups and communities",
    "2.2 Children respond to diversity with respect",
    "2.3 Children become aware of fairness",
    "2.4 Children become socially responsible and show respect for the environment",
  ],
  "Outcome 3": [
    "3.1 Children become strong in their social, emotional and spiritual wellbeing",
    "3.2 Children take increasing responsibility for their own health and physical wellbeing",
  ],
  "Outcome 4": [
    "4.1 Children develop dispositions for learning",
    "4.2 Children develop a range of skills and processes",
  ],
  "Outcome 5": [
    "5.1 Children interact verbally and non-verbally with others",
    "5.2 Children engage with a range of texts",
  ],
};

const DEV_AGE_GROUPS = ["0 to 4 months", "4 to 8 months", "8 to 12 months", "1 to 2 years", "2 to 3 years"];

const DEV_DOMAINS = {
  Physical: [
    "rolls from back to front",
    "sits with support",
    "reaches for and grasps objects",
  ],
  Social: [
    "reacts with arousal, attention or approach to presence of another baby or young child",
    "responds to own name",
    "smiles often and shows excitement when sees preparations being made for meals or for bath",
    "recognises familiar people and stretches arms to be picked up",
  ],
  Emotional: [
    "shows pleasure with familiar people",
    "expresses distress when separated from caregiver",
  ],
  Cognitive: [
    "explores objects with hands and mouth",
    "looks for partially hidden objects",
  ],
  Language: [
    "babbles using consonants and vowels",
    "responds to sounds",
  ],
};

const DEV_LEVELS = ["Introduced", "Working towards", "Achieved"];

export default function ObservationCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [search] = useSearchParams();
  const isEdit = Boolean(id);

  const { rooms: allRooms } = useRoomStore();
  const { children: allChildren } = useChildrenStore();

  const existing = useMemo(
    () => (isEdit ? mockObservations.find((o) => o.id === id) : null),
    [id, isEdit]
  );

  const initialTitle = existing?.title || search.get("title") || "";

  const [tab, setTab] = useState("observations");
  const [assessTab, setAssessTab] = useState("montessori");

  // Observations tab state
  const [rooms, setRooms] = useState(existing?.roomId ? [existing.roomId] : []);
  const [children, setChildren] = useState(existing?.childId ? [existing.childId] : []);
  const [educators, setEducators] = useState(existing?.tagEducators || []);
  const [title, setTitle] = useState(initialTitle);
  const [observation, setObservation] = useState(existing?.observation || "");
  const [learningAnalysis, setLearningAnalysis] = useState(existing?.learningAnalysis || "");
  const [childVoice, setChildVoice] = useState(existing?.childVoice || "");
  const [futurePlan, setFuturePlan] = useState(existing?.futurePlan || "");
  const [implementation, setImplementation] = useState(existing?.implementation || "");
  const [criticalReflection, setCriticalReflection] = useState(existing?.criticalReflection || "");

  // Assessment state
  const [montSubject, setMontSubject] = useState("math");
  const [montSelected, setMontSelected] = useState({}); // {subject:[items]}
  const [eylfOutcome, setEylfOutcome] = useState("Outcome 1");
  const [eylfSelected, setEylfSelected] = useState(new Set());
  const [devAge, setDevAge] = useState("4 to 8 months");
  const [devValues, setDevValues] = useState({}); // { [item]: level }

  // Link state
  const [linkObs, setLinkObs] = useState([]);
  const [linkRefl, setLinkRefl] = useState([]);
  const [linkPlan, setLinkPlan] = useState([]);
  const [linkPicker, setLinkPicker] = useState(null); // 'obs' | 'refl' | 'plan' | null

  // Pickers
  const [showRoomsPicker, setShowRoomsPicker] = useState(false);
  const [showChildrenPicker, setShowChildrenPicker] = useState(false);
  const [showEducatorsPicker, setShowEducatorsPicker] = useState(false);

  const today = new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  const handleSave = (status) => {
    toast.success(
      isEdit ? `Observation updated (${status})` : `Observation ${status === "published" ? "published" : "saved as draft"}`
    );
    navigate("/observation");
  };

  return (
    <div>
      {/* Top header strip */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link to="/observation" className="hover:text-foreground">Observation</Link>
          <span>/</span>
          <span className="text-foreground">{isEdit ? "Edit Observation" : "Store Observation"}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs">
            <span className="text-muted-foreground">Child Name:</span>
            <span className="font-semibold text-foreground">
              {children.length ? allChildren.find((c) => String(c.id) === String(children[0]))?.name || "—" : "—"}
            </span>
          </div>
          <Button variant="outline" className="border-sky-500/40 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/20">
            <Wand2 className="mr-1.5 h-4 w-4" /> AI Assistance
          </Button>
          <div className="inline-flex items-center gap-1.5 rounded-md border border-sky-500/40 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 dark:bg-sky-950/20">
            <Calendar className="h-3.5 w-3.5" /> {today}
          </div>
          <Button variant="outline" className="border-emerald-500/40 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/20">
            <Eye className="mr-1.5 h-4 w-4" /> Preview
          </Button>
          <Button onClick={() => handleSave("published")} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="mr-1.5 h-4 w-4" /> Publish Now
          </Button>
          <Button onClick={() => handleSave("draft")} className="bg-amber-500 text-amber-950 hover:bg-amber-600">
            <FileText className="mr-1.5 h-4 w-4" /> Make Draft
          </Button>
        </div>
      </div>

      {/* Big tabs */}
      <div className="mb-6 grid grid-cols-3 gap-3 rounded-xl border border-border bg-card p-2 shadow-sm">
        {TABS.map((t) => {
          const Icon = t.Icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold uppercase tracking-wide transition ${
                active
                  ? "border-b-2 border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/30"
                  : "text-muted-foreground hover:bg-muted/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "observations" && (
        <div className="space-y-6">
          {/* Rooms / Children */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <PickerField
              label="Rooms"
              colour="emerald"
              count={rooms.length}
              onClick={() => setShowRoomsPicker(true)}
              placeholder="Select Rooms"
            />
            <PickerField
              label="Children"
              colour="sky"
              count={children.length}
              onClick={() => setShowChildrenPicker(true)}
              placeholder="Select Children"
            />
          </div>

          <div>
            <PickerField
              label="Tag Educators"
              colour="rose"
              count={educators.length}
              onClick={() => setShowEducatorsPicker(true)}
              placeholder="Select Educators"
            />
          </div>

          {/* Title & Observation */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormBlock label="Title">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
              <RefineButton />
            </FormBlock>
            <FormBlock label="Observation">
              <Textarea value={observation} onChange={(e) => setObservation(e.target.value)} rows={4} />
              <RefineButton />
            </FormBlock>
          </div>

          {/* Media upload */}
          <div>
            <h3 className="mb-2 text-sm font-bold text-foreground">Media Upload Section</h3>
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/30 px-6 py-10">
              <Button variant="outline" className="border-sky-500/40 text-sky-700">
                <ImageIcon className="mr-1.5 h-4 w-4" /> Select up to 3 Images/Videos
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">
                Only images and videos are allowed. Max 3 files.
              </p>
            </div>
          </div>

          {/* Analysis / Voice */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormBlock label="Learning Analysis">
              <Textarea value={learningAnalysis} onChange={(e) => setLearningAnalysis(e.target.value)} rows={4} />
              <RefineButton />
            </FormBlock>
            <FormBlock label="Child's Voice">
              <Textarea value={childVoice} onChange={(e) => setChildVoice(e.target.value)} rows={4} />
              <RefineButton />
            </FormBlock>
          </div>

          {/* Future plan / Implementation */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <FormBlock label="Future Plan">
              <Textarea value={futurePlan} onChange={(e) => setFuturePlan(e.target.value)} rows={4} />
              <RefineButton />
            </FormBlock>
            <FormBlock label="Implementation">
              <Textarea value={implementation} onChange={(e) => setImplementation(e.target.value)} rows={4} />
              <RefineButton />
            </FormBlock>
          </div>

          {/* Critical Reflection */}
          <FormBlock label="Critical Reflection">
            <Textarea value={criticalReflection} onChange={(e) => setCriticalReflection(e.target.value)} rows={4} />
            <RefineButton />
          </FormBlock>

          <div className="flex justify-end">
            <Button size="lg" onClick={() => handleSave("draft")}>
              Submit <Plus className="ml-1.5 h-4 w-4 rotate-45" />
            </Button>
          </div>
        </div>
      )}

      {tab === "assessment" && (
        <div className="space-y-5">
          {/* Sub-tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {ASSESS_TABS.map((t) => {
              const Icon = t.Icon;
              const active = assessTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setAssessTab(t.id)}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-bold uppercase ${
                    active
                      ? "bg-emerald-500 text-white"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {assessTab === "montessori" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Select Subject</label>
                <Select value={montSubject} onValueChange={setMontSubject}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(OBSERVATION_TREE).map(([k, s]) => (
                      <SelectItem key={k} value={k}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {Object.entries(OBSERVATION_TREE[montSubject].activities).map(([key, a]) => {
                  const selected = (montSelected[montSubject] || []).includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setMontSelected((prev) => {
                          const cur = new Set(prev[montSubject] || []);
                          if (cur.has(key)) cur.delete(key); else cur.add(key);
                          return { ...prev, [montSubject]: Array.from(cur) };
                        });
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg border-l-4 px-4 py-3 text-left text-sm font-semibold transition ${
                        selected
                          ? "border-sky-500 bg-sky-50 text-sky-700 dark:bg-sky-950/30"
                          : "border-transparent bg-muted/30 text-foreground hover:bg-muted/50"
                      }`}
                    >
                      <ListChecks className="h-3.5 w-3.5 text-sky-500" />
                      {a.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Montessori assessment saved")}>
                  Save Montessori Assessment
                </Button>
              </div>
            </div>
          )}

          {assessTab === "eylf" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Select Outcome</label>
                <Select value={eylfOutcome} onValueChange={setEylfOutcome}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(EYLF_OUTCOMES_BY_GROUP).map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                {EYLF_OUTCOMES_BY_GROUP[eylfOutcome].map((label) => {
                  const selected = eylfSelected.has(label);
                  return (
                    <button
                      key={label}
                      onClick={() => {
                        setEylfSelected((prev) => {
                          const next = new Set(prev);
                          if (next.has(label)) next.delete(label); else next.add(label);
                          return next;
                        });
                      }}
                      className={`block w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
                        selected
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30"
                          : "bg-muted/30 text-emerald-600 hover:bg-muted/50"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast.success("EYLF selection saved")}>Save EYLF Selection</Button>
              </div>
            </div>
          )}

          {assessTab === "development" && (
            <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-foreground">Select Age Group</label>
                <Select value={devAge} onValueChange={setDevAge}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DEV_AGE_GROUPS.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                {Object.entries(DEV_DOMAINS).map(([domain, items]) => (
                  <details
                    key={domain}
                    className="overflow-hidden rounded-lg border-l-4 border-amber-400 bg-muted/20"
                    open={domain === "Social"}
                  >
                    <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-bold text-amber-600">
                      {domain}
                      <ChevronDown className="h-4 w-4" />
                    </summary>
                    <div className="divide-y divide-border bg-card">
                      {items.map((item) => (
                        <div key={item} className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
                          <span className="flex-1 text-foreground">{item}</span>
                          {DEV_LEVELS.map((lvl) => (
                            <label key={lvl} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                              <input
                                type="radio"
                                name={item}
                                checked={devValues[item] === lvl}
                                onChange={() => setDevValues((prev) => ({ ...prev, [item]: lvl }))}
                                className="accent-emerald-500"
                              />
                              {lvl}
                            </label>
                          ))}
                          <button
                            onClick={() => setDevValues((prev) => { const n = { ...prev }; delete n[item]; return n; })}
                            className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 px-2 py-0.5 text-xs text-rose-500 hover:bg-rose-500/10"
                          >
                            <X className="h-3 w-3" /> Clear
                          </button>
                        </div>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => toast.success("Development milestones saved")}>
                  Save Development Milestone
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "link" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => setLinkPicker("obs")} className="bg-sky-500 hover:bg-sky-600">
              <Plus className="mr-1.5 h-4 w-4" /> Link Observation
            </Button>
            <Button onClick={() => setLinkPicker("refl")} variant="outline" className="bg-muted text-foreground">
              <Plus className="mr-1.5 h-4 w-4" /> Link Reflection
            </Button>
            <Button onClick={() => setLinkPicker("plan")} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="mr-1.5 h-4 w-4" /> Link Program Plan
            </Button>
          </div>

          <LinkedList title="Linked observations" items={linkObs} onRemove={(i) => setLinkObs(linkObs.filter((_, idx) => idx !== i))} />
          <LinkedList title="Linked reflections" items={linkRefl} onRemove={(i) => setLinkRefl(linkRefl.filter((_, idx) => idx !== i))} />
          <LinkedList title="Linked program plans" items={linkPlan} onRemove={(i) => setLinkPlan(linkPlan.filter((_, idx) => idx !== i))} />
        </div>
      )}

      {/* Pickers */}
      <MultiPickerModal
        open={showRoomsPicker}
        title="Select Rooms"
        items={allRooms.map((r) => ({ id: r.id, label: r.name }))}
        selected={rooms}
        onClose={() => setShowRoomsPicker(false)}
        onSave={(v) => { setRooms(v); setShowRoomsPicker(false); }}
      />
      <MultiPickerModal
        open={showChildrenPicker}
        title="Select Children"
        items={allChildren.map((c) => ({ id: c.id, label: c.name }))}
        selected={children}
        onClose={() => setShowChildrenPicker(false)}
        onSave={(v) => { setChildren(v); setShowChildrenPicker(false); }}
      />
      <MultiPickerModal
        open={showEducatorsPicker}
        title="Select Educators"
        items={["Sarah Lee", "Mia Chen", "Daniel Park", "Priya Nair", "Deepti"].map((n) => ({ id: n, label: n }))}
        selected={educators}
        onClose={() => setShowEducatorsPicker(false)}
        onSave={(v) => { setEducators(v); setShowEducatorsPicker(false); }}
      />

      {/* Link picker */}
      <LinkPickerModal
        open={Boolean(linkPicker)}
        type={linkPicker}
        onClose={() => setLinkPicker(null)}
        onSave={(picked) => {
          if (linkPicker === "obs") setLinkObs((p) => [...p, ...picked]);
          if (linkPicker === "refl") setLinkRefl((p) => [...p, ...picked]);
          if (linkPicker === "plan") setLinkPlan((p) => [...p, ...picked]);
          setLinkPicker(null);
        }}
      />
    </div>
  );
}

function PickerField({ label, count, onClick, placeholder, colour = "primary" }) {
  const colourMap = {
    emerald: "border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10",
    sky: "border-sky-500/40 text-sky-600 hover:bg-sky-500/10",
    rose: "border-rose-500/40 text-rose-500 hover:bg-rose-500/10",
    primary: "border-primary/40 text-primary hover:bg-primary/10",
  };
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-foreground">{label}</label>
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-2 rounded-md border bg-card px-4 py-2 text-sm font-medium ${colourMap[colour]}`}
      >
        {count > 0 ? `${count} selected` : placeholder}
      </button>
    </div>
  );
}

function FormBlock({ label, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-bold text-foreground">{label}</label>
      <div className="rounded-md border border-border bg-card p-2">
        {children}
      </div>
    </div>
  );
}

function RefineButton() {
  return (
    <div className="mt-2 flex justify-end">
      <button className="inline-flex items-center gap-1 rounded-md bg-sky-500 px-3 py-1 text-xs font-semibold text-white hover:bg-sky-600">
        <Sparkles className="h-3 w-3" /> Refine with AI
      </button>
    </div>
  );
}

function LinkedList({ title, items, onRemove }) {
  if (items.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <h4 className="mb-2 text-xs font-bold uppercase text-muted-foreground">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((it, i) => (
          <li key={`${it.id}-${i}`} className="flex items-center justify-between rounded-md bg-muted/30 px-3 py-2 text-sm">
            <span className="font-medium text-foreground">{it.title}</span>
            <button
              onClick={() => onRemove(i)}
              className="text-rose-500 hover:text-rose-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function MultiPickerModal({ open, title, items, selected, onClose, onSave }) {
  const [local, setLocal] = useState(selected || []);
  useEffect(() => { if (open) setLocal(selected || []); }, [open, selected]);
  if (!open) return null;
  const toggle = (id) => {
    setLocal((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
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
        <div className="max-h-80 overflow-y-auto px-4 py-3">
          {items.map((it) => (
            <label key={it.id} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted/50">
              <input
                type="checkbox"
                checked={local.includes(it.id)}
                onChange={() => toggle(it.id)}
                className="h-4 w-4 accent-sky-500"
              />
              <span className="text-sm text-foreground">{it.label}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(local)}>Save</Button>
        </div>
      </div>
    </div>
  );
}

function LinkPickerModal({ open, type, onClose, onSave }) {
  const [local, setLocal] = useState([]);
  const [search, setSearch] = useState("");
  useEffect(() => { if (open) { setLocal([]); setSearch(""); } }, [open]);

  if (!open) return null;

  const titleMap = { obs: "Select Observations", refl: "Select Reflections", plan: "Select Program Plans" };
  const items = mockObservations.slice(0, 9).map((o) => ({ id: o.id, title: o.title, author: o.author }));
  const filtered = items.filter((i) => i.title.toLowerCase().includes(search.toLowerCase()));

  const toggle = (it) => {
    setLocal((prev) => prev.find((x) => x.id === it.id) ? prev.filter((x) => x.id !== it.id) : [...prev, it]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">{titleMap[type]}</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-4">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title…"
            className="mb-4"
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((it) => {
              const checked = Boolean(local.find((x) => x.id === it.id));
              return (
                <label
                  key={it.id}
                  className={`group cursor-pointer overflow-hidden rounded-lg border bg-card text-left transition ${
                    checked ? "border-sky-500 ring-1 ring-sky-500/40" : "border-border hover:border-foreground/20"
                  }`}
                >
                  <div className="flex h-28 items-center justify-center bg-muted/40">
                    <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1 p-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggle(it)}
                        className="h-4 w-4 accent-sky-500"
                      />
                      <span className="text-sm font-semibold text-foreground">{it.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Created by: {it.author}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button onClick={() => onSave(local)} className="bg-emerald-600 hover:bg-emerald-700">
            Submit Selected
          </Button>
        </div>
      </div>
    </div>
  );
}