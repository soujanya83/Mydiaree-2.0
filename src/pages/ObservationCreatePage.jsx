import { useCallback, useEffect, useMemo, useState, useRef } from "react";
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
  Search,
  Wand2,
  ClipboardList,
  Layers,
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
import { useCentreStore } from "@/stores/centreStore";
import { OBSERVATION_TREE } from "@/components/observation/data";
import { observationService } from "@/services/learning/observationService";
import { childrenService } from "@/services/centre/childrenService";
import { staffService } from "@/services/admin/staffService";
import { toast } from "sonner";
import { StatusTriangle } from "@/components/lessonplan/StatusTriangle";
import { nextStatus } from "@/components/lessonplan/progressData";

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

const UI_TO_API_ASSESSMENT = {
  introduced: "Introduced",
  practicing: "Working",
  completed: "Completed",
};

const API_TO_UI_ASSESSMENT = {
  Introduced: "introduced",
  Working: "practicing",
  Completed: "completed",
};

const DEV_MILESTONE_STATUSES = ["Introduced", "Working towards", "Achieved"];

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.15)_1px,transparent_0)] [background-size:16px_16px]";
const IMG_BASE = "https://mydiaree.com.au/";

const avatarUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${IMG_BASE}${url.replace(/^\/+/, "")}`;
};

const fullName = (person, fallback = "Unknown") =>
  [person?.name, person?.lastname].filter(Boolean).join(" ").trim() || person?.name || fallback;

const mergeById = (current, next) => {
  const map = new Map(current.map((item) => [String(item.id), item]));
  next.forEach((item) => {
    if (item?.id !== undefined && item?.id !== null) map.set(String(item.id), item);
  });
  return Array.from(map.values());
};

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
  const [savedObservationId, setSavedObservationId] = useState(id || null);

  const initialTitle = search.get("title") || "";

  const [tab, setTab] = useState("observations");
  const [assessTab, setAssessTab] = useState("montessori");

  // Form state
  const [rooms, setRooms] = useState([]);
  const [children, setChildren] = useState([]);
  const [educators, setEducators] = useState([]);

  const [availableEducators, setAvailableEducators] = useState([]);
  const [availableChildren, setAvailableChildren] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [childrenSearch, setChildrenSearch] = useState("");
  const [childrenPage, setChildrenPage] = useState(1);
  const [childrenTotalPages, setChildrenTotalPages] = useState(1);
  const [isChildrenLoading, setIsChildrenLoading] = useState(false);
  const [educatorsList, setEducatorsList] = useState([]);
  const [educatorsSearch, setEducatorsSearch] = useState("");
  const [educatorsPage, setEducatorsPage] = useState(1);
  const [educatorsTotalPages, setEducatorsTotalPages] = useState(1);
  const [isEducatorsLoading, setIsEducatorsLoading] = useState(false);

  const [title, setTitle] = useState(initialTitle);
  const [observation, setObservation] = useState("");
  const [learningAnalysis, setLearningAnalysis] = useState("");
  const [childVoice, setChildVoice] = useState("");
  const [futurePlan, setFuturePlan] = useState("");
  const [implementation, setImplementation] = useState("");
  const [criticalReflection, setCriticalReflection] = useState("");
  const [status, setStatus] = useState("draft");
  const [media, setMedia] = useState([]); // { file, preview, isExisting, url }

  // Assessment state
  const [montessoriSubjects, setMontessoriSubjects] = useState([]);
  const [montessoriModules, setMontessoriModules] = useState([]);
  const [montessoriSubmodules, setMontessoriSubmodules] = useState([]);
  const [montSubjectId, setMontSubjectId] = useState("");
  const [montModuleId, setMontModuleId] = useState("");
  const [montSelected, setMontSelected] = useState({});
  const [isMontSubjectsLoading, setIsMontSubjectsLoading] = useState(false);
  const [isMontModulesLoading, setIsMontModulesLoading] = useState(false);
  const [isMontSubmodulesLoading, setIsMontSubmodulesLoading] = useState(false);
  const [isMontessoriSaving, setIsMontessoriSaving] = useState(false);
  const [eylfOutcome, setEylfOutcome] = useState("Outcome 1");
  const [eylfSelected, setEylfSelected] = useState(new Set());
  const [devAgeGroups, setDevAgeGroups] = useState([]);
  const [devModules, setDevModules] = useState([]);
  const [devSubmodules, setDevSubmodules] = useState([]);
  const [devAgeId, setDevAgeId] = useState("");
  const [devModuleId, setDevModuleId] = useState("");
  const [devSelected, setDevSelected] = useState({});
  const [isDevAgeGroupsLoading, setIsDevAgeGroupsLoading] = useState(false);
  const [isDevModulesLoading, setIsDevModulesLoading] = useState(false);
  const [isDevSubmodulesLoading, setIsDevSubmodulesLoading] = useState(false);
  const [isDevSaving, setIsDevSaving] = useState(false);

  // Link state
  const [linkObs, setLinkObs] = useState([]);
  const [linkRefl, setLinkRefl] = useState([]);
  const [linkPlan, setLinkPlan] = useState([]);
  const [linkPicker, setLinkPicker] = useState(null);

  // Pickers
  const [showRoomsPicker, setShowRoomsPicker] = useState(false);
  const [showChildrenPicker, setShowChildrenPicker] = useState(false);
  const [showEducatorsPicker, setShowEducatorsPicker] = useState(false);

  const fetchEducators = useCallback(
    async (pageNumber, searchQuery) => {
      if (!activeCentreId) {
        setEducatorsList([]);
        setEducatorsTotalPages(1);
        return;
      }
      setIsEducatorsLoading(true);
      try {
        const response = await staffService.getStaffSettings({
          center_id: activeCentreId,
          search: searchQuery,
          page: pageNumber,
          per_page: 10,
        });
        if (response.status) {
          const pageData = response.data?.staff?.data || response.data?.staff || [];
          const activeStaff = pageData.filter((item) => item.status === "ACTIVE");
          const lastPage = response.data?.staff?.last_page || response.pagination?.last_page || 1;
          setEducatorsList((prev) =>
            pageNumber === 1 ? activeStaff : mergeById(prev, activeStaff),
          );
          setAvailableEducators((prev) => mergeById(prev, activeStaff));
          setEducatorsTotalPages(lastPage);
        }
      } catch (error) {
        console.error("Failed to load educators:", error);
      } finally {
        setIsEducatorsLoading(false);
      }
    },
    [activeCentreId],
  );

  const fetchChildren = useCallback(
    async (pageNumber, searchQuery, roomIds) => {
      if (!activeCentreId || roomIds.length === 0) {
        setChildrenList([]);
        setChildrenTotalPages(1);
        return;
      }
      setIsChildrenLoading(true);
      try {
        const responses = await Promise.all(
          roomIds.map((roomId) =>
            childrenService.filterChildren({
              room_id: roomId,
              center_id: activeCentreId,
              search: searchQuery,
              page: pageNumber,
              per_page: 10,
            }),
          ),
        );
        const pageData = responses.flatMap(
          (response) => response.data?.data || response.data || [],
        );
        const lastPage = Math.max(
          1,
          ...responses.map(
            (response) => response.pagination?.last_page || response.data?.last_page || 1,
          ),
        );
        const unique = mergeById([], pageData);
        setChildrenList((prev) => (pageNumber === 1 ? unique : mergeById(prev, unique)));
        setAvailableChildren((prev) => mergeById(prev, unique));
        setChildrenTotalPages(lastPage);
      } catch (error) {
        console.error("Failed to load children for selected rooms:", error);
      } finally {
        setIsChildrenLoading(false);
      }
    },
    [activeCentreId],
  );

  useEffect(() => {
    setEducatorsPage(1);
    fetchEducators(1, educatorsSearch);
  }, [fetchEducators, educatorsSearch]);

  useEffect(() => {
    setChildrenPage(1);
    fetchChildren(1, childrenSearch, rooms);
  }, [fetchChildren, childrenSearch, rooms]);

  useEffect(() => {
    const loadSubjects = async () => {
      setIsMontSubjectsLoading(true);
      try {
        const res = await observationService.getAssessmentSubjects("montessori");
        if (res.status) {
          setMontessoriSubjects(res.data || []);
        } else {
          toast.error(res.message || "Failed to load Montessori subjects");
        }
      } catch (error) {
        console.error("Failed to load Montessori subjects:", error);
        toast.error("Failed to load Montessori subjects");
      } finally {
        setIsMontSubjectsLoading(false);
      }
    };
    loadSubjects();
  }, []);

  useEffect(() => {
    const loadModules = async () => {
      if (!montSubjectId) {
        setMontessoriModules([]);
        setMontModuleId("");
        return;
      }
      setIsMontModulesLoading(true);
      try {
        const res = await observationService.getAssessmentModules({
          framework: "montessori",
          subjectId: montSubjectId,
        });
        if (res.status) {
          setMontessoriModules(res.data || []);
          setMontModuleId("");
          setMontessoriSubmodules([]);
          setMontSelected({});
        } else {
          toast.error(res.message || "Failed to load Montessori modules");
        }
      } catch (error) {
        console.error("Failed to load Montessori modules:", error);
        toast.error("Failed to load Montessori modules");
      } finally {
        setIsMontModulesLoading(false);
      }
    };
    loadModules();
  }, [montSubjectId]);

  useEffect(() => {
    const loadSubmodules = async () => {
      if (!montModuleId) {
        setMontessoriSubmodules([]);
        return;
      }
      setIsMontSubmodulesLoading(true);
      try {
        const res = await observationService.getAssessmentSubmodules({
          framework: "montessori",
          moduleId: montModuleId,
        });
        if (res.status) {
          setMontessoriSubmodules(res.data || []);
          setMontSelected({});
        } else {
          toast.error(res.message || "Failed to load Montessori submodules");
        }
      } catch (error) {
        console.error("Failed to load Montessori submodules:", error);
        toast.error("Failed to load Montessori submodules");
      } finally {
        setIsMontSubmodulesLoading(false);
      }
    };
    loadSubmodules();
  }, [montModuleId]);

  useEffect(() => {
    const loadDevelopmentAgeGroups = async () => {
      setIsDevAgeGroupsLoading(true);
      try {
        const res = await observationService.getDevelopmentMilestoneSubjects();
        if (res.status) {
          setDevAgeGroups(res.data || []);
        } else {
          toast.error(res.message || "Failed to load developmental milestone age groups");
        }
      } catch (error) {
        console.error("Failed to load developmental milestone age groups:", error);
        toast.error("Failed to load developmental milestone age groups");
      } finally {
        setIsDevAgeGroupsLoading(false);
      }
    };
    loadDevelopmentAgeGroups();
  }, []);

  useEffect(() => {
    const loadDevelopmentModules = async () => {
      if (!devAgeId) {
        setDevModules([]);
        setDevModuleId("");
        setDevSubmodules([]);
        setDevSelected({});
        return;
      }
      setIsDevModulesLoading(true);
      try {
        const res = await observationService.getDevelopmentMilestoneModules(devAgeId);
        if (res.status) {
          setDevModules(res.data || []);
          setDevModuleId("");
          setDevSubmodules([]);
          setDevSelected({});
        } else {
          toast.error(res.message || "Failed to load developmental milestone modules");
        }
      } catch (error) {
        console.error("Failed to load developmental milestone modules:", error);
        toast.error("Failed to load developmental milestone modules");
      } finally {
        setIsDevModulesLoading(false);
      }
    };
    loadDevelopmentModules();
  }, [devAgeId]);

  useEffect(() => {
    const loadDevelopmentSubmodules = async () => {
      if (!devModuleId) {
        setDevSubmodules([]);
        setDevSelected({});
        return;
      }
      setIsDevSubmodulesLoading(true);
      try {
        const res = await observationService.getDevelopmentMilestoneSubmodules(devModuleId);
        if (res.status) {
          setDevSubmodules(res.data || []);
          setDevSelected({});
        } else {
          toast.error(res.message || "Failed to load developmental milestone submodules");
        }
      } catch (error) {
        console.error("Failed to load developmental milestone submodules:", error);
        toast.error("Failed to load developmental milestone submodules");
      } finally {
        setIsDevSubmodulesLoading(false);
      }
    };
    loadDevelopmentSubmodules();
  }, [devModuleId]);

  const loadMoreEducators = () => {
    if (isEducatorsLoading || educatorsPage >= educatorsTotalPages) return;
    const nextPage = educatorsPage + 1;
    setEducatorsPage(nextPage);
    fetchEducators(nextPage, educatorsSearch);
  };

  const loadMoreChildren = () => {
    if (isChildrenLoading || childrenPage >= childrenTotalPages) return;
    const nextPage = childrenPage + 1;
    setChildrenPage(nextPage);
    fetchChildren(nextPage, childrenSearch, rooms);
  };

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
            setChildren(d.child ? d.child.map((c) => String(c.childId)) : []);
            setEducators(d.tagged_staff ? d.tagged_staff.split(",") : []);
            setAvailableChildren((prev) =>
              mergeById(
                prev,
                (d.child || [])
                  .map((tag) => {
                    const child = tag.child || tag;
                    return child?.id ? child : { ...child, id: child?.childId };
                  })
                  .filter((child) => child?.id || child?.childId),
              ),
            );
            setStatus(d.status?.toLowerCase() === "published" ? "published" : "draft");
            if (d.media) {
              setMedia(d.media.map((m) => ({ isExisting: true, url: m.mediaUrl, id: m.id })));
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
    const newMedia = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isExisting: false,
    }));
    setMedia((prev) => [...prev, ...newMedia]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (index) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
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
        media: media.filter((m) => !m.isExisting).map((m) => m.file),
        status: status === "published" ? "Published" : "Draft",
      };

      if (isEdit) {
        payload.id = id;
      }

      const res = await observationService.saveObservation(payload);
      if (res.status) {
        toast.success(res.message || "Observation saved successfully");
        const nextObservationId = res.id || id;
        setSavedObservationId(nextObservationId);
        setTab("assessment");
        setAssessTab("montessori");
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

  const handleMainTabChange = (nextTab) => {
    if (nextTab !== "observations" && !savedObservationId) {
      toast.error("Please save the observation before moving to assessments or links");
      return;
    }
    setTab(nextTab);
  };

  const toggleMontessoriSubmodule = (submoduleId) => {
    setMontSelected((prev) => {
      const key = String(submoduleId);
      if (prev[key]) {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: "introduced" };
    });
  };

  const cycleMontessoriStatus = (submoduleId) => {
    setMontSelected((prev) => {
      const key = String(submoduleId);
      const current = prev[key] || "introduced";
      return { ...prev, [key]: nextStatus(current) };
    });
  };

  const handleSaveMontessori = async () => {
    if (!savedObservationId) {
      toast.error("Please save the observation first");
      setTab("observations");
      return;
    }

    const subactivities = Object.entries(montSelected).map(([idSubActivity, uiStatus]) => ({
      idSubActivity: Number(idSubActivity),
      assesment: UI_TO_API_ASSESSMENT[uiStatus] || "Introduced",
    }));

    if (subactivities.length === 0) {
      toast.error("Please select at least one Montessori submodule");
      return;
    }

    setIsMontessoriSaving(true);
    try {
      const res = await observationService.saveMontessoriAssessment({
        observationId: Number(savedObservationId),
        subactivities,
      });
      if (res.status) {
        toast.success(res.message || "Montessori data saved successfully");
        setSavedObservationId(res.id || savedObservationId);
        setAssessTab("eylf");
      } else {
        toast.error(res.message || "Failed to save Montessori data");
      }
    } catch (error) {
      console.error("Failed to save Montessori assessment:", error);
      toast.error("Failed to save Montessori data");
    } finally {
      setIsMontessoriSaving(false);
    }
  };

  const handleSaveDevelopmentMilestone = async () => {
    if (!savedObservationId) {
      toast.error("Please save the observation first");
      setTab("observations");
      return;
    }

    const selections = Object.entries(devSelected).map(([idSub, assessment]) => ({
      idSub: Number(idSub),
      assessment,
    }));

    if (selections.length === 0) {
      toast.error("Please select at least one developmental milestone");
      return;
    }

    setIsDevSaving(true);
    try {
      const res = await observationService.saveDevelopmentMilestone({
        observationId: Number(savedObservationId),
        selections,
      });
      if (res.status) {
        toast.success(res.message || "Developmental milestone data saved successfully");
      } else {
        toast.error(res.message || "Failed to save developmental milestone data");
      }
    } catch (error) {
      console.error("Failed to save developmental milestone:", error);
      toast.error("Failed to save developmental milestone data");
    } finally {
      setIsDevSaving(false);
    }
  };

  const today = new Date()
    .toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  return (
    <div className="min-h-screen pb-20">
      {/* Premium Header */}
      <div className="sticky top-0 z-40 -mx-6 mb-6 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/observation")}
              className="h-9 w-9 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isEdit ? "Edit Observation" : "Create New Observation"}
              </h1>
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link to="/observation" className="hover:text-foreground">
                  Observations
                </Link>
                <span>/</span>
                <span>{isEdit ? "Edit" : "New"}</span>
              </nav>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-bold text-muted-foreground md:flex">
              <Calendar className="h-3.5 w-3.5" /> {today}
            </div>
            <div className="flex items-center gap-2">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  className={`h-9 w-[120px] rounded-full border-none font-bold uppercase tracking-wider text-[10px] ${status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                >
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => handleSave()}
                className="h-9 rounded-full bg-primary px-6 shadow-lg shadow-primary/20 hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-1.5 h-4 w-4" />
                )}
                {isEdit ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 grid grid-cols-3 gap-2 rounded-2xl border border-sidebar-border bg-sidebar p-1.5 shadow-sm">
          {TABS.map((t) => {
            const Icon = t.Icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleMainTabChange(t.id)}
                className={`group relative flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-bold uppercase tracking-wider transition-all ${
                  active
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "text-sidebar-foreground/90 hover:bg-primary/15 hover:text-sidebar-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 transition-transform ${active ? "scale-110" : "group-hover:scale-110"}`}
                />
                {t.label}
                {active && (
                  <span className="absolute -bottom-1.5 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary" />
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
                  required
                  actionLabel={`Manage Rooms (${rooms.length})`}
                  selectedItems={rooms.map((id) => ({
                    id,
                    label: allRooms.find((r) => String(r.id) === String(id))?.name || id,
                  }))}
                  onRemove={(id) => setRooms((prev) => prev.filter((x) => x !== id))}
                  onClick={() => setShowRoomsPicker(true)}
                  placeholder="Select rooms"
                />
                <PremiumPickerField
                  label="Children"
                  icon={User}
                  colour="sky"
                  required
                  actionLabel={`Manage Children (${children.length})`}
                  selectedItems={children.map((id) => ({
                    id,
                    label:
                      fullName(
                        availableChildren.find((c) => String(c.id) === String(id)),
                        "",
                      ) || id,
                  }))}
                  onRemove={(id) => setChildren((prev) => prev.filter((x) => x !== id))}
                  onClick={() => {
                    if (rooms.length === 0) {
                      toast.error("Please select a room first.");
                      return;
                    }
                    setShowChildrenPicker(true);
                  }}
                  placeholder="Select children"
                />
                <PremiumPickerField
                  label="Educators"
                  icon={User}
                  colour="rose"
                  actionLabel={`Manage Educators (${educators.length})`}
                  selectedItems={educators.map((id) => {
                    const found = availableEducators.find((e) => String(e.id) === String(id));
                    return { id, label: found ? found.name : id };
                  })}
                  onRemove={(id) => setEducators((prev) => prev.filter((x) => x !== id))}
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

                    <FormGroup
                      label="Observation"
                      info="What did you see? Describe the event objectively."
                    >
                      <Textarea
                        value={observation}
                        onChange={(e) => setObservation(e.target.value)}
                        rows={6}
                        placeholder="Describe the child's actions, words, and interactions in detail..."
                        className="border-none bg-muted/30 focus-visible:ring-sky-500/50 resize-none"
                      />
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
                    <FormGroup
                      label="Learning Analysis"
                      info="What learning did you observe taking place?"
                    >
                      <Textarea
                        value={learningAnalysis}
                        onChange={(e) => setLearningAnalysis(e.target.value)}
                        rows={4}
                        placeholder="Interpret the learning through the lens of developmental milestones or EYLF outcomes..."
                        className="border-none bg-muted/30 focus-visible:ring-amber-500/50"
                      />
                    </FormGroup>

                    <FormGroup
                      label="Child's Voice"
                      info="How did the child express themselves during or after?"
                    >
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
                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                      Media
                    </h3>
                    <span className="text-[10px] font-medium text-muted-foreground uppercase">
                      {media.length}/3 Files
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {media.map((m, i) => (
                      <div
                        key={i}
                        className="group relative aspect-video overflow-hidden rounded-xl border border-border bg-muted"
                      >
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
                        <span className="mt-2 text-xs font-semibold text-foreground">
                          Add Media
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-1">
                          PNG, JPG, MP4
                        </span>
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
                  <h3 className="mb-4 text-sm font-bold text-foreground uppercase tracking-wider">
                    Next Steps
                  </h3>
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
            <div className="mt-12 border-t border-border pt-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
                <div className="w-full sm:w-56">
                  <FormGroup
                    label="Status"
                    info="Choose whether to keep as draft or publish to families"
                  >
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger
                        className={`h-12 w-full rounded-xl border-none font-bold uppercase tracking-wider text-xs ${status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormGroup>
                </div>

                <Button
                  size="lg"
                  onClick={() => handleSave()}
                  className="h-12 min-w-[200px] rounded-xl bg-primary px-10 text-base font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-5 w-5" />
                  )}
                  {isEdit ? "Update Observation" : "Save Observation"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Assessment & Link tabs remain functional but wrapped in similar premium containers */}
        {tab === "assessment" && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm animate-in fade-in slide-in-from-bottom-4">
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

            {assessTab === "montessori" && (
              <MontessoriAssessmentPanel
                observationId={savedObservationId}
                subjects={montessoriSubjects}
                modules={montessoriModules}
                submodules={montessoriSubmodules}
                subjectId={montSubjectId}
                moduleId={montModuleId}
                selected={montSelected}
                isSubjectsLoading={isMontSubjectsLoading}
                isModulesLoading={isMontModulesLoading}
                isSubmodulesLoading={isMontSubmodulesLoading}
                isSaving={isMontessoriSaving}
                onSubjectChange={setMontSubjectId}
                onModuleChange={setMontModuleId}
                onToggleSubmodule={toggleMontessoriSubmodule}
                onCycleStatus={cycleMontessoriStatus}
                onStatusChange={(submoduleId, apiStatus) =>
                  setMontSelected((prev) => ({
                    ...prev,
                    [String(submoduleId)]: API_TO_UI_ASSESSMENT[apiStatus] || "introduced",
                  }))
                }
                onSave={handleSaveMontessori}
              />
            )}

            {assessTab === "eylf" && (
              <AssessmentPlaceholder
                title="EYLF"
                description="Montessori has been saved. EYLF assessment can be completed next."
              />
            )}

            {assessTab === "development" && (
              <DevelopmentMilestonePanel
                observationId={savedObservationId}
                ageGroups={devAgeGroups}
                modules={devModules}
                submodules={devSubmodules}
                ageId={devAgeId}
                moduleId={devModuleId}
                selected={devSelected}
                isAgeGroupsLoading={isDevAgeGroupsLoading}
                isModulesLoading={isDevModulesLoading}
                isSubmodulesLoading={isDevSubmodulesLoading}
                isSaving={isDevSaving}
                onAgeChange={setDevAgeId}
                onModuleChange={setDevModuleId}
                onStatusChange={(submoduleId, status) =>
                  setDevSelected((prev) => ({
                    ...prev,
                    [String(submoduleId)]: status,
                  }))
                }
                onClear={(submoduleId) =>
                  setDevSelected((prev) => {
                    const next = { ...prev };
                    delete next[String(submoduleId)];
                    return next;
                  })
                }
                onSave={handleSaveDevelopmentMilestone}
              />
            )}
          </div>
        )}
      </div>

      {/* Pickers */}
      <MultiPickerModal
        open={showRoomsPicker}
        title="Select Rooms"
        items={allRooms.map((r) => ({ id: String(r.id), label: r.name }))}
        selected={rooms}
        onClose={() => setShowRoomsPicker(false)}
        onSave={(v) => {
          setRooms(v);
          setShowRoomsPicker(false);
        }}
      />
      <MultiPickerModal
        open={showChildrenPicker}
        title="Select Children"
        items={childrenList.map((c) => ({
          id: String(c.id),
          label: fullName(c, `Child ${c.id}`),
          imageUrl: c.imageUrl,
          meta: c.room ? `Room ID: ${c.room}` : "Child",
        }))}
        selected={children}
        isLoading={isChildrenLoading}
        searchQuery={childrenSearch}
        onSearchChange={setChildrenSearch}
        onLoadMore={loadMoreChildren}
        hasMore={childrenPage < childrenTotalPages}
        emptyMessage={
          rooms.length === 0
            ? "Please select a room first to see children"
            : "No children found in selected rooms"
        }
        onClose={() => setShowChildrenPicker(false)}
        onSave={(v) => {
          setChildren(v);
          setShowChildrenPicker(false);
        }}
      />
      <MultiPickerModal
        open={showEducatorsPicker}
        title="Select Educators"
        items={educatorsList.map((e) => ({
          id: String(e.id),
          label: e.name || `Staff ${e.id}`,
          imageUrl: e.imageUrl,
          meta: e.title || e.userType || "Staff",
        }))}
        selected={educators}
        isLoading={isEducatorsLoading}
        searchQuery={educatorsSearch}
        onSearchChange={setEducatorsSearch}
        onLoadMore={loadMoreEducators}
        hasMore={educatorsPage < educatorsTotalPages}
        onClose={() => setShowEducatorsPicker(false)}
        onSave={(v) => {
          setEducators(v);
          setShowEducatorsPicker(false);
        }}
      />
    </div>
  );
}

function PremiumPickerField({
  label,
  icon: Icon,
  colour,
  actionLabel,
  selectedItems,
  onRemove,
  onClick,
  placeholder,
  required,
}) {
  const colours = {
    emerald: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20",
    sky: "text-sky-600 bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/20",
    rose: "text-rose-600 bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/20",
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-1">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          {label}
          {required && <span className="text-destructive font-bold ml-0.5">*</span>}
        </label>
        {actionLabel && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClick}
            className="h-8 border-primary/30 px-3 text-xs font-semibold text-primary hover:bg-primary/10"
          >
            {actionLabel}
          </Button>
        )}
      </div>
      <div
        onClick={onClick}
        className="min-h-[56px] w-full cursor-pointer rounded-2xl border border-border bg-muted/20 p-3 transition-all hover:border-primary/30 hover:bg-muted/30"
      >
        <div className="flex flex-wrap gap-2">
          {selectedItems.length > 0 ? (
            selectedItems.map((item) => (
              <span
                key={item.id}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold transition-all ${colours[colour]}`}
              >
                {item.label}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(item.id);
                  }}
                  className="rounded-full hover:bg-black/10 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground/60 py-1 px-1">
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{placeholder}</span>
            </div>
          )}
        </div>
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

function MontessoriAssessmentPanel({
  observationId,
  subjects,
  modules,
  submodules,
  subjectId,
  moduleId,
  selected,
  isSubjectsLoading,
  isModulesLoading,
  isSubmodulesLoading,
  isSaving,
  onSubjectChange,
  onModuleChange,
  onToggleSubmodule,
  onCycleStatus,
  onStatusChange,
  onSave,
}) {
  const selectedCount = Object.keys(selected).length;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Montessori Assessment
            </p>
            <h3 className="mt-1 text-xl font-black text-foreground">
              Select activities and mark progress
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Use the triangle indicator or status dropdown to mark each selected submodule.
            </p>
          </div>
          <div className="rounded-full border border-emerald-500/30 bg-background px-3 py-1.5 text-xs font-bold text-emerald-700">
            Observation #{observationId || "-"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormGroup label="Subject">
          <Select value={subjectId} onValueChange={onSubjectChange} disabled={isSubjectsLoading}>
            <SelectTrigger className="h-12 rounded-xl bg-muted/30">
              <SelectValue
                placeholder={
                  isSubjectsLoading ? "Loading subjects..." : "Select Montessori subject"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={String(subject.id)}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormGroup>

        <FormGroup label="Module">
          <Select
            value={moduleId}
            onValueChange={onModuleChange}
            disabled={!subjectId || isModulesLoading}
          >
            <SelectTrigger className="h-12 rounded-xl bg-muted/30">
              <SelectValue
                placeholder={
                  !subjectId
                    ? "Select subject first"
                    : isModulesLoading
                      ? "Loading modules..."
                      : "Select module"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module.id} value={String(module.id)}>
                  {module.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormGroup>
      </div>

      <MontessoriLegend />

      <div className="rounded-2xl border border-border bg-muted/10">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <h4 className="text-sm font-bold text-foreground">Submodules</h4>
            <p className="text-xs text-muted-foreground">
              {selectedCount} selected for this observation
            </p>
          </div>
          <Button onClick={onSave} disabled={isSaving || selectedCount === 0}>
            {isSaving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            Save Montessori
          </Button>
        </div>

        <div className="max-h-[460px] overflow-y-auto p-3">
          {isSubmodulesLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading submodules...
            </div>
          ) : !moduleId ? (
            <EmptyAssessmentState label="Select a subject and module to see submodules." />
          ) : submodules.length === 0 ? (
            <EmptyAssessmentState label="No submodules found for this module." />
          ) : (
            <div className="grid gap-2">
              {submodules.map((submodule) => {
                const key = String(submodule.id);
                const uiStatus = selected[key] || "introduced";
                const isSelected = Boolean(selected[key]);
                return (
                  <div
                    key={submodule.id}
                    className={`grid gap-3 rounded-xl border bg-card p-3 transition md:grid-cols-[auto_1fr_auto] md:items-center ${
                      isSelected ? "border-primary/40 shadow-sm" : "border-border"
                    }`}
                  >
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSubmodule(submodule.id)}
                        className="h-4 w-4 accent-primary"
                      />
                      <StatusTriangle
                        status={uiStatus}
                        onClick={() =>
                          isSelected ? onCycleStatus(submodule.id) : onToggleSubmodule(submodule.id)
                        }
                        size={42}
                      />
                    </label>

                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">
                        {submodule.title}
                      </p>
                      <p className="text-[11px] font-medium text-muted-foreground">
                        Submodule ID: {submodule.id}
                      </p>
                    </div>

                    <Select
                      value={UI_TO_API_ASSESSMENT[uiStatus]}
                      onValueChange={(value) => {
                        if (!isSelected) onToggleSubmodule(submodule.id);
                        onStatusChange(submodule.id, value);
                      }}
                    >
                      <SelectTrigger className="h-10 w-full rounded-xl md:w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Introduced">Introduced</SelectItem>
                        <SelectItem value="Working">Working</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MontessoriLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-3 text-sm">
      <span className="font-semibold text-muted-foreground">Legend:</span>
      <div className="flex items-center gap-2">
        <StatusTriangle status="introduced" onClick={() => {}} size={28} />
        <span>Introduced</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusTriangle status="practicing" onClick={() => {}} size={28} />
        <span>Working</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusTriangle status="completed" onClick={() => {}} size={28} />
        <span>Completed</span>
      </div>
    </div>
  );
}

function EmptyAssessmentState({ label }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-background p-10 text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}

function DevelopmentMilestonePanel({
  observationId,
  ageGroups,
  modules,
  submodules,
  ageId,
  moduleId,
  selected,
  isAgeGroupsLoading,
  isModulesLoading,
  isSubmodulesLoading,
  isSaving,
  onAgeChange,
  onModuleChange,
  onStatusChange,
  onClear,
  onSave,
}) {
  const selectedCount = Object.keys(selected).length;
  const moduleTitle =
    modules.find((module) => String(module.id) === String(moduleId))?.name ||
    "Developmental Milestones";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-orange-600">
              Developmental Milestone
            </p>
            <h3 className="mt-1 text-xl font-black text-foreground">
              Select milestones and mark assessment
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Choose an age group and developmental area, then mark each milestone status.
            </p>
          </div>
          <div className="rounded-full border border-orange-500/30 bg-background px-3 py-1.5 text-xs font-bold text-orange-700">
            Observation #{observationId || "-"}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormGroup label="Age Group">
          <Select value={ageId} onValueChange={onAgeChange} disabled={isAgeGroupsLoading}>
            <SelectTrigger className="h-12 rounded-xl bg-muted/30">
              <SelectValue
                placeholder={isAgeGroupsLoading ? "Loading age groups..." : "Select age group"}
              />
            </SelectTrigger>
            <SelectContent>
              {ageGroups.map((ageGroup) => (
                <SelectItem key={ageGroup.id} value={String(ageGroup.id)}>
                  {ageGroup.ageGroup}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormGroup>

        <FormGroup label="Development Area">
          <Select
            value={moduleId}
            onValueChange={onModuleChange}
            disabled={!ageId || isModulesLoading}
          >
            <SelectTrigger className="h-12 rounded-xl bg-muted/30">
              <SelectValue
                placeholder={
                  !ageId
                    ? "Select age group first"
                    : isModulesLoading
                      ? "Loading areas..."
                      : "Select development area"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {modules.map((module) => (
                <SelectItem key={module.id} value={String(module.id)}>
                  {module.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormGroup>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-4 py-3">
          <div>
            <h4 className="text-sm font-black text-orange-600">{moduleTitle}</h4>
            <p className="text-xs text-muted-foreground">
              {selectedCount} selected for this observation
            </p>
          </div>
          <Button onClick={onSave} disabled={isSaving || selectedCount === 0}>
            {isSaving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 h-4 w-4" />
            )}
            Save Milestones
          </Button>
        </div>

        <div className="max-h-[560px] overflow-y-auto bg-muted/10 p-3">
          {isSubmodulesLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading milestones...
            </div>
          ) : !moduleId ? (
            <EmptyAssessmentState label="Select an age group and development area to see milestones." />
          ) : submodules.length === 0 ? (
            <EmptyAssessmentState label="No milestones found for this development area." />
          ) : (
            <div className="space-y-2">
              {submodules.map((submodule) => (
                <DevelopmentMilestoneRow
                  key={submodule.id}
                  submodule={submodule}
                  value={selected[String(submodule.id)]}
                  onChange={(status) => onStatusChange(submodule.id, status)}
                  onClear={() => onClear(submodule.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DevelopmentMilestoneRow({ submodule, value, onChange, onClear }) {
  return (
    <div className="grid gap-3 rounded-xl border-l-4 border-orange-400 bg-background px-4 py-3 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
      <p className="text-sm font-bold leading-snug text-foreground">{submodule.name}</p>
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3">
        {DEV_MILESTONE_STATUSES.map((status) => (
          <label
            key={status}
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-foreground"
          >
            <input
              type="radio"
              name={`dev-milestone-${submodule.id}`}
              value={status}
              checked={value === status}
              onChange={() => onChange(status)}
              className="h-5 w-5 accent-blue-500"
            />
            {status}
          </label>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onClear}
          disabled={!value}
          className="border-red-300 text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <X className="mr-1 h-3.5 w-3.5" />
          Clear
        </Button>
      </div>
    </div>
  );
}

function AssessmentPlaceholder({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-12 text-center">
      <ListChecks className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function DoorOpen(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M13 4h3a2 2 0 0 1 2 2v14" />
      <path d="M2 20h3" />
      <path d="M13 20h9" />
      <path d="M10 12v.01" />
      <path d="M13 4H6a2 2 0 0 0-2 2v14h9V4Z" />
    </svg>
  );
}

function User(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MultiPickerModal({
  open,
  title,
  items,
  selected,
  onClose,
  onSave,
  isLoading,
  searchQuery,
  onSearchChange,
  onLoadMore,
  hasMore,
  emptyMessage,
}) {
  const [local, setLocal] = useState(selected || []);
  const [internalSearch, setInternalSearch] = useState("");
  const activeSearch = searchQuery ?? internalSearch;

  useEffect(() => {
    if (open) {
      setLocal(selected || []);
      setInternalSearch("");
      onSearchChange?.("");
    }
  }, [open, selected, onSearchChange]);

  const filteredItems = useMemo(() => {
    if (onSearchChange) return items;
    if (!activeSearch) return items;
    return items.filter((it) => it.label.toLowerCase().includes(activeSearch.toLowerCase()));
  }, [items, activeSearch, onSearchChange]);

  if (!open) return null;

  const toggle = (id) => {
    setLocal((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleScroll = (event) => {
    const target = event.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 16) {
      onLoadMore?.();
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border px-8 py-6">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-6 py-3 bg-muted/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={activeSearch}
              onChange={(e) =>
                onSearchChange ? onSearchChange(e.target.value) : setInternalSearch(e.target.value)
              }
              placeholder={`Search ${title.toLowerCase()}...`}
              className="h-10 pl-9 border-none bg-background focus-visible:ring-primary/50"
            />
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto px-6 py-4" onScroll={handleScroll}>
          {isLoading && filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-2 text-sm font-medium">Fetching list...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Info className="h-10 w-10 opacity-20 mb-3" />
              <p className="text-sm px-10 font-medium">
                {activeSearch ? "No results found" : emptyMessage || "No items available"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {filteredItems.map((it) => (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => toggle(it.id)}
                  className={`flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                    local.includes(it.id)
                      ? "bg-primary/10 text-primary border-primary"
                      : "border-transparent hover:bg-muted"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={it.label} imageUrl={it.imageUrl} />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold">{it.label}</div>
                      {it.meta && (
                        <div className="truncate text-xs text-muted-foreground">{it.meta}</div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                      local.includes(it.id)
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30"
                    }`}
                  >
                    {local.includes(it.id) && <ListChecks className="h-3.5 w-3.5" />}
                  </span>
                </button>
              ))}
              {isLoading && (
                <div className="flex items-center justify-center py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                </div>
              )}
              {!isLoading && hasMore && (
                <button
                  type="button"
                  onClick={onLoadMore}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-border bg-muted/20 px-8 py-6">
          <Button variant="ghost" onClick={onClose} className="rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={() => onSave(local)}
            className="rounded-xl bg-primary px-8 shadow-lg shadow-primary/20"
            disabled={isLoading || items.length === 0}
          >
            Save Selection
          </Button>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, imageUrl }) {
  const url = avatarUrl(imageUrl);
  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-primary/10 text-xs font-bold text-primary">
      {url ? (
        <img src={url} alt={name} className="h-full w-full object-cover" loading="lazy" />
      ) : (
        name
          .split(/\s+/)
          .map((part) => part[0])
          .filter(Boolean)
          .join("")
          .toUpperCase()
          .slice(0, 2)
      )}
    </div>
  );
}
