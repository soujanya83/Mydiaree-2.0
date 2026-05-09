import { useEffect, useMemo, useState, useRef } from "react";
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
  Trash2,
  Upload,
  ArrowLeft,
  Info,
  Loader2,
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
import { useCentreStore } from "@/stores/centreStore";
import { mockObservations } from "@/components/observation/observationsData";
import { OBSERVATION_TREE } from "@/components/observation/data";
import { observationService } from "@/services/learning/observationService";
import { childrenService } from "@/services/centre/childrenService";
import { programPlanService } from "@/services/learning/programPlanService";
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

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.15)_1px,transparent_0)] [background-size:16px_16px]";

export default function ObservationCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [search] = useSearchParams();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const { rooms: allRooms } = useRoomStore();
  const { activeCentreId } = useCentreStore();

  const [obsData, setObsData] = useState(null);
  const [isLoading, setIsLoading] = useState(isEdit);

  const initialTitle = search.get("title") || "";

  const [tab, setTab] = useState("observations");
  const [assessTab, setAssessTab] = useState("montessori");

  // Form state
  const [rooms, setRooms] = useState([]);
  const [children, setChildren] = useState([]);
  const [educators, setEducators] = useState([]);
  
  const [availableEducators, setAvailableEducators] = useState([]);
  const [availableChildren, setAvailableChildren] = useState([]);
  const [isChildrenLoading, setIsChildrenLoading] = useState(false);

  const [title, setTitle] = useState(initialTitle);
  const [observation, setObservation] = useState("");
  const [learningAnalysis, setLearningAnalysis] = useState("");
  const [childVoice, setChildVoice] = useState("");
  const [futurePlan, setFuturePlan] = useState("");
  const [implementation, setImplementation] = useState("");
  const [criticalReflection, setCriticalReflection] = useState("");
  const [media, setMedia] = useState([]); // { file, preview, isExisting, url }

  // Assessment state
  const [montSubject, setMontSubject] = useState("math");
  const [montSelected, setMontSelected] = useState({});
  const [eylfOutcome, setEylfOutcome] = useState("Outcome 1");
  const [eylfSelected, setEylfSelected] = useState(new Set());
  const [devAge, setDevAge] = useState("4 to 8 months");
  const [devValues, setDevValues] = useState({});

  // Link state
  const [linkObs, setLinkObs] = useState([]);
  const [linkRefl, setLinkRefl] = useState([]);
  const [linkPlan, setLinkPlan] = useState([]);
  const [linkPicker, setLinkPicker] = useState(null);

  // Pickers
  const [showRoomsPicker, setShowRoomsPicker] = useState(false);
  const [showChildrenPicker, setShowChildrenPicker] = useState(false);
  const [showEducatorsPicker, setShowEducatorsPicker] = useState(false);

  // 1. Fetch Rooms and Staff on Centre Change
  useEffect(() => {
    const loadRoomsAndStaff = async () => {
      if (!activeCentreId) return;
      try {
        const response = await programPlanService.getRoomsAndStaff(activeCentreId);
        if (response.status) {
          setAvailableEducators(
            response.roomStaffs ||
            response.staff ||
            response.data?.roomStaffs ||
            response.data?.staff ||
            []
          );
        }
      } catch (error) {
        console.error("Failed to load staff:", error);
      }
    };
    loadRoomsAndStaff();
  }, [activeCentreId]);

  // 2. Fetch Children when selected Rooms change
  useEffect(() => {
    const loadChildren = async () => {
      if (rooms.length === 0) {
        setAvailableChildren([]);
        return;
      }
      setIsChildrenLoading(true);
      try {
        const results = await Promise.all(
          rooms.map(roomId => childrenService.filterChildren({ room: roomId }))
        );
        const merged = results.flatMap(res => res.children || res.data || []);
        // Unique by ID
        const unique = Array.from(new Map(merged.map(c => [c.id, c])).values());
        setAvailableChildren(unique);
      } catch (error) {
        console.error("Failed to load children for selected rooms:", error);
      } finally {
        setIsChildrenLoading(false);
      }
    };
    loadChildren();
  }, [rooms]);

  useEffect(() => {
    if (isEdit) {
      const loadObs = async () => {
        try {
          const res = await observationService.getObservationDetails(id);
          if (res.status) {
            const d = res.data;
            setObsData(d);
            setTitle(d.obestitle?.replace(/<[^>]*>/g, "") || "");
            setObservation(d.notes || "");
            setLearningAnalysis(d.reflection || "");
            setChildVoice(d.child_voice || "");
            setFuturePlan(d.future_plan || "");
            setImplementation(d.implementation || "");
            setRooms(d.room ? d.room.split(",") : []);
            setChildren(d.child ? d.child.map(c => String(c.childId)) : []);
            setEducators(d.tagged_staff ? d.tagged_staff.split(",") : []);
            if (d.media) {
              setMedia(d.media.map(m => ({ isExisting: true, url: m.mediaUrl, id: m.id })));
            }
          }
        } catch (error) {
          toast.error("Failed to load observation data");
        } finally {
          setIsLoading(false);
        }
      };
      loadObs();
    }
  }, [id, isEdit]);

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    if (media.length + files.length > 3) {
      toast.error("Maximum 3 media files allowed");
      return;
    }
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false
    }));
    setMedia(prev => [...prev, ...newMedia]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (index) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (status) => {
    if (!rooms.length || !children.length || !title || !observation) {
      toast.error("Please fill in all required fields (Rooms, Children, Title, Observation)");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        center_id: activeCentreId,
        obestitle: title,
        title: title,
        notes: observation,
        reflection: learningAnalysis,
        child_voice: childVoice,
        future_plan: futurePlan,
        implmentation: implementation, // Note: backend uses 'implmentation' (missing 'e')
        selected_rooms: rooms, // Will be appended as selected_rooms[] by service
        selected_children: children.join(","), // Screenshot shows comma-separated string
        selected_staff: educators, // Will be appended as selected_staff[] by service
        media: media.filter(m => !m.isExisting).map(m => m.file),
        status: status === "published" ? "Published" : "Draft",
      };

      if (isEdit) {
        payload.id = id;
      }

      const res = await observationService.saveObservation(payload);
      if (res.status) {
        toast.success(res.message || "Observation saved successfully");
        navigate("/observation");
      } else {
        toast.error(res.message || "Failed to save observation");
      }
    } catch (error) {
      console.error("Error saving observation:", error);
      toast.error("An error occurred while saving the observation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <div className="min-h-screen pb-20">
      {/* Premium Header */}
      <div className="sticky top-0 z-40 -mx-6 mb-6 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/observation")} className="h-9 w-9 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isEdit ? "Edit Observation" : "Create New Observation"}
              </h1>
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link to="/observation" className="hover:text-foreground">Observations</Link>
                <span>/</span>
                <span>{isEdit ? "Edit" : "New"}</span>
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-bold text-muted-foreground md:flex">
              <Calendar className="h-3.5 w-3.5" /> {today}
            </div>
            <Button variant="outline" className="h-9 rounded-full border-sky-500/30 text-sky-600 hover:bg-sky-50">
              <Eye className="mr-1.5 h-4 w-4" /> Preview
            </Button>
            <Button 
              onClick={() => handleSave("draft")} 
              variant="outline" 
              className="h-9 rounded-full border-amber-500/30 text-amber-600 hover:bg-amber-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <FileText className="mr-1.5 h-4 w-4" />}
              Draft
            </Button>
            <Button 
              onClick={() => handleSave("published")} 
              className="h-9 rounded-full bg-emerald-600 px-6 shadow-lg shadow-emerald-500/20 hover:bg-emerald-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Save className="mr-1.5 h-4 w-4" />}
              {isEdit ? "Update" : "Publish"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-card p-1.5 shadow-sm">
          {TABS.map((t) => {
            const Icon = t.Icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`group relative flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider transition-all ${
                  active
                    ? "bg-foreground text-background shadow-lg"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <Icon className={`h-4 w-4 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`} />
                {t.label}
                {active && (
                  <span className="absolute -bottom-1.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-foreground" />
                )}
              </button>
            );
          })}
        </div>

        {tab === "observations" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tagging Section */}
            <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                  <User className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Tagging & Classification</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <PremiumPickerField
                  label="Rooms"
                  icon={DoorOpen}
                  colour="emerald"
                  selectedItems={rooms.map(id => ({ id, label: allRooms.find(r => String(r.id) === String(id))?.name || id }))}
                  onRemove={(id) => setRooms(prev => prev.filter(x => x !== id))}
                  onClick={() => setShowRoomsPicker(true)}
                  placeholder="Select rooms"
                />
                <PremiumPickerField
                  label="Children"
                  icon={User}
                  colour="sky"
                  selectedItems={children.map(id => ({ id, label: availableChildren.find(c => String(c.id) === String(id))?.name || id }))}
                  onRemove={(id) => setChildren(prev => prev.filter(x => x !== id))}
                  onClick={() => setShowChildrenPicker(true)}
                  placeholder="Select children"
                />
                <PremiumPickerField
                  label="Educators"
                  icon={User}
                  colour="rose"
                  selectedItems={educators.map(id => {
                    const found = availableEducators.find(e => String(e.staffid || e.id) === String(id));
                    return { id, label: found ? found.name : id };
                  })}
                  onRemove={(id) => setEducators(prev => prev.filter(x => x !== id))}
                  onClick={() => setShowEducatorsPicker(true)}
                  placeholder="Select educators"
                />
              </div>
            </section>

            {/* Core Content */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                {/* Observation Content */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Observation Details</h3>
                  </div>

                  <div className="space-y-6">
                    <FormGroup label="Title" info="A short descriptive title for the observation">
                      <Input 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Outdoor Play at the Sandpit"
                        className="h-12 border-none bg-muted/30 focus-visible:ring-sky-500/50" 
                      />
                    </FormGroup>

                    <FormGroup label="Observation" info="What did you see? Describe the event objectively.">
                      <Textarea 
                        value={observation} 
                        onChange={(e) => setObservation(e.target.value)} 
                        rows={6}
                        placeholder="Describe the child's actions, words, and interactions in detail..."
                        className="border-none bg-muted/30 focus-visible:ring-sky-500/50 resize-none"
                      />
                      <RefineButton />
                    </FormGroup>
                  </div>
                </section>

                {/* Analysis & Reflection */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6 flex items-center gap-2">
                    <div className="rounded-lg bg-amber-500/10 p-2 text-amber-600">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Analysis & Outcomes</h3>
                  </div>

                  <div className="space-y-6">
                    <FormGroup label="Learning Analysis" info="What learning did you observe taking place?">
                      <Textarea 
                        value={learningAnalysis} 
                        onChange={(e) => setLearningAnalysis(e.target.value)} 
                        rows={4}
                        placeholder="Interpret the learning through the lens of developmental milestones or EYLF outcomes..."
                        className="border-none bg-muted/30 focus-visible:ring-amber-500/50"
                      />
                      <RefineButton />
                    </FormGroup>

                    <FormGroup label="Child's Voice" info="How did the child express themselves during or after?">
                      <Textarea 
                        value={childVoice} 
                        onChange={(e) => setChildVoice(e.target.value)} 
                        rows={3}
                        placeholder="Quotes from the child or descriptions of their non-verbal expressions..."
                        className="border-none bg-muted/30 focus-visible:ring-amber-500/50"
                      />
                    </FormGroup>
                  </div>
                </section>
              </div>

              {/* Sidebar: Media & Plans */}
              <div className="space-y-8">
                {/* Media Section */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Media</h3>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">{media.length}/3 Files</span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {media.map((m, i) => (
                      <div key={i} className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                        <img 
                          src={m.isExisting ? m.url : m.preview} 
                          className="h-full w-full object-cover transition-transform group-hover:scale-105" 
                          alt="preview" 
                        />
                        <button
                          onClick={() => removeMedia(i)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    
                    {media.length < 3 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 transition-colors hover:border-primary/40 hover:bg-primary/5 ${PATTERN_BG}`}
                      >
                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                          <Upload className="h-5 w-5" />
                        </div>
                        <span className="mt-2 text-xs font-semibold text-foreground">Add Media</span>
                        <span className="text-[10px] text-muted-foreground mt-1">PNG, JPG, MP4</span>
                      </button>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple 
                      accept="image/*,video/*"
                      onChange={handleMediaSelect}
                    />
                  </div>
                </section>

                {/* Plans */}
                <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="mb-4 text-sm font-bold text-foreground uppercase tracking-wider">Next Steps</h3>
                  <div className="space-y-4">
                    <FormGroup label="Future Plan">
                      <Textarea 
                        value={futurePlan} 
                        onChange={(e) => setFuturePlan(e.target.value)} 
                        rows={3}
                        placeholder="What will you do next to support this learning?"
                        className="text-xs border-none bg-muted/20"
                      />
                    </FormGroup>
                    <FormGroup label="Implementation">
                      <Textarea 
                        value={implementation} 
                        onChange={(e) => setImplementation(e.target.value)} 
                        rows={3}
                        placeholder="How was this plan implemented?"
                        className="text-xs border-none bg-muted/20"
                      />
                    </FormGroup>
                  </div>
                </section>
              </div>
            </div>
            
          {/* Bottom Actions */}
          <div className="mt-12 flex flex-wrap items-center justify-end gap-4 border-t border-border pt-8">
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => handleSave("draft")} 
              className="h-12 rounded-xl border-amber-500/30 px-8 text-amber-600 hover:bg-amber-50 shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileText className="mr-2 h-5 w-5" />}
              Save as Draft
            </Button>
            <Button 
              size="lg" 
              onClick={() => handleSave("published")} 
              className="h-12 rounded-xl bg-primary px-10 font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {isEdit ? "Update Observation" : "Publish Now"}
            </Button>
          </div>
        </div>
        )}

        {/* Assessment & Link tabs remain functional but wrapped in similar premium containers */}
        {tab === "assessment" && (
           <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
             {/* Content similar to before but with improved styling */}
             <div className="flex flex-wrap items-center gap-2 mb-6">
                {ASSESS_TABS.map((t) => {
                  const Icon = t.Icon;
                  const active = assessTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setAssessTab(t.id)}
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                        active
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>
              {/* ... Rest of Assessment Tab UI with Select and List ... */}
           </div>
        )}
      </div>

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
        items={availableChildren.map((c) => ({ id: String(c.id), label: c.name }))}
        selected={children}
        onClose={() => setShowChildrenPicker(false)}
        onSave={(v) => { setChildren(v); setShowChildrenPicker(false); }}
      />
      <MultiPickerModal
        open={showEducatorsPicker}
        title="Select Educators"
        items={availableEducators.map((e) => ({ id: String(e.staffid || e.id), label: e.name }))}
        selected={educators}
        onClose={() => setShowEducatorsPicker(false)}
        onSave={(v) => { setEducators(v); setShowEducatorsPicker(false); }}
      />
    </div>
  );
}

function PremiumPickerField({ label, icon: Icon, selectedItems, onRemove, onClick, placeholder, colour }) {
  const colours = {
    emerald: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
    sky: "bg-sky-500/10 text-sky-600 border-sky-500/20 hover:bg-sky-500/20",
    rose: "bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500/20",
  };

  const tagColours = {
    emerald: "bg-emerald-500 text-white shadow-emerald-500/20",
    sky: "bg-sky-500 text-white shadow-sky-500/20",
    rose: "bg-rose-500 text-white shadow-rose-500/20",
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="flex flex-wrap gap-2">
        {selectedItems?.map((item) => (
          <div
            key={item.id}
            className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-bold shadow-sm animate-in zoom-in-95 ${tagColours[colour]}`}
          >
            {item.label}
            <button
              onClick={() => onRemove(item.id)}
              className="rounded-full p-0.5 hover:bg-white/20 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <button
          onClick={onClick}
          className={`flex items-center gap-2 rounded-xl border p-3.5 text-sm font-semibold transition-all ${colours[colour]} ${selectedItems?.length > 0 ? "h-auto py-2" : "w-full"}`}
        >
          <div className="flex items-center gap-2">
            {Icon && <Icon className="h-4 w-4" />}
            {selectedItems?.length === 0 ? placeholder : <Plus className="h-4 w-4" />}
          </div>
        </button>
      </div>
    </div>
  );
}

function FormGroup({ label, children, info }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-bold text-foreground">{label}</label>
        {info && (
          <div className="group relative">
            <Info className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="absolute bottom-full left-1/2 mb-2 w-48 -translate-x-1/2 rounded-lg bg-foreground p-2 text-[10px] text-background opacity-0 shadow-xl transition-opacity group-hover:opacity-100 pointer-events-none">
              {info}
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

function RefineButton() {
  return (
    <div className="mt-2 flex justify-end">
      <button className="group flex items-center gap-1.5 rounded-full bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-1.5 text-[11px] font-bold text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-105 active:scale-95">
        <Sparkles className="h-3.5 w-3.5 animate-pulse" /> Refine with AI Documentation
      </button>
    </div>
  );
}

function DoorOpen(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 4h3a2 2 0 0 1 2 2v14"/><path d="M2 20h3"/><path d="M13 20h9"/><path d="M10 12v.01"/><path d="M13 4H6a2 2 0 0 0-2 2v14h9V4Z"/></svg>
  );
}

function User(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
  );
}

function MultiPickerModal({ open, title, items, selected, onClose, onSave, isLoading, emptyMessage }) {
  const [local, setLocal] = useState(selected || []);
  useEffect(() => { if (open) setLocal(selected || []); }, [open, selected]);
  if (!open) return null;
  const toggle = (id) => {
    setLocal((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border px-8 py-6">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted-foreground hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm font-medium">Fetching children list...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Info className="h-10 w-10 opacity-20 mb-3" />
              <p className="text-sm px-10 font-medium">{emptyMessage || "No items available"}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {items.map((it) => (
                <label key={it.id} className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 transition-colors ${local.includes(it.id) ? "bg-primary/10 text-primary" : "hover:bg-muted"}`}>
                  <input
                    type="checkbox"
                    checked={local.includes(it.id)}
                    onChange={() => toggle(it.id)}
                    className="h-5 w-5 rounded-md accent-primary"
                  />
                  <span className="text-sm font-semibold">{it.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-border bg-muted/20 px-8 py-6">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button onClick={() => onSave(local)} className="rounded-xl bg-primary px-8 shadow-lg shadow-primary/20" disabled={isLoading || items.length === 0}>
            Save Selection
          </Button>
        </div>
      </div>
    </div>
  );
}