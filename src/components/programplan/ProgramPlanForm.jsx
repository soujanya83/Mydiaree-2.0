import { useEffect, useState, useRef, useCallback } from "react";
import {
  ArrowLeft,
  Save,
  X,
  Search,
  Calendar,
  DoorOpen,
  Users,
  Sparkles,
  Target,
  BookOpen,
  Activity as ActivityIcon,
  Loader2,
  Check,
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { MONTHS, YEARS, ACTIVITY_SUBJECTS, RICH_SUBJECTS, ADDITIONAL_FIELDS } from "./data";
import { ActivityPickerModal } from "./ActivityPickerModal";
import { EylfPickerModal } from "./EylfPickerModal";
import { useCentreStore } from "@/stores/centreStore";
import { childrenService } from "@/services/centre/childrenService";
import { programPlanService } from "@/services/learning/programPlanService";
import { staffService } from "@/services/admin/staffService";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IMG_BASE_API } from "../../api/imageapi";
import { useAuthStore } from "@/stores/authStore";
import { useAutoSave } from "@/hooks/useAutoSave";
import { AutoSaveIndicator } from "@/components/common/AutoSaveIndicator";

const IMG_BASE = IMG_BASE_API;
const avatarUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${IMG_BASE}${url}`;
};

const SUBJECT_MAP = {
  "practical-life": "Practical Life",
  math: "Maths",
  sensorial: "Sensorial",
  culture: "Cultural",
  language: "Language",
};

const empty = (centreId) => ({
  centreId: centreId || "",
  roomIds: [],
  month: MONTHS[new Date().getMonth()],
  year: new Date().getFullYear(),
  educators: [],
  children: [],
  focusArea: "",
  practicalLife: [],
  sensorial: [],
  math: [],
  language: [],
  culture: [],
  artCraft: "",
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

const textValue = (value) => value ?? "";

const FORM_ARRAY_FIELDS = [
  "roomIds",
  "educators",
  "children",
  "practicalLife",
  "sensorial",
  "math",
  "language",
  "culture",
  "eylf",
];

const FORM_TEXT_FIELDS = [
  "centreId",
  "roomId",
  "focusArea",
  "artCraft",
  "outdoor",
  "inquiry",
  "sustainability",
  "specialEvents",
  "childrenVoices",
  "familiesInput",
  "groupExperience",
  "spontaneous",
  "mindfulness",
  "whatIsWorking",
  "whatIsNotWorking",
  "status",
];

const normalizeFormData = (value, centreId) => {
  const next = { ...empty(centreId), ...(value || {}) };

  FORM_ARRAY_FIELDS.forEach((field) => {
    next[field] = Array.isArray(next[field]) ? next[field] : [];
  });

  FORM_TEXT_FIELDS.forEach((field) => {
    next[field] = textValue(next[field]);
  });

  next.month = textValue(next.month);
  next.year = textValue(next.year);

  return next;
};

export function ProgramPlanForm({
  mode = "create",
  initial,
  record,
  centerId,
  defaultMonth,
  defaultYear,
  onCancel,
  onSubmit,
  onSaveAsNew,
  defaults,
  isSaving = false,
  isSubmitting,
}) {
  const finalInitial = initial || record;
  const finalIsSaving = isSaving || isSubmitting;

  const { activeCentreId } = useCentreStore();
  const { user } = useAuthStore();
  const finalCentreId = centerId || defaults?.centreId || activeCentreId;

  const [data, setData] = useState(() => normalizeFormData(finalInitial, finalCentreId));

  const [picker, setPicker] = useState(null); // subjectKey
  const [eylfOpen, setEylfOpen] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableEducators, setAvailableEducators] = useState([]);

  // Modals search and scroll pagination state
  const [childrenModalOpen, setChildrenModalOpen] = useState(false);
  const [childrenList, setChildrenList] = useState([]);
  const [childrenSearch, setChildrenSearch] = useState("");
  const [childrenPage, setChildrenPage] = useState(1);
  const [childrenTotalPages, setChildrenTotalPages] = useState(1);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  const [educatorsModalOpen, setEducatorsModalOpen] = useState(false);
  const [educatorsList, setEducatorsList] = useState([]);
  const [educatorsSearch, setEducatorsSearch] = useState("");
  const [educatorsPage, setEducatorsPage] = useState(1);
  const [educatorsTotalPages, setEducatorsTotalPages] = useState(1);
  const [isLoadingEducators, setIsLoadingEducators] = useState(false);

  const update = (k, v) => setData((p) => ({ ...p, [k]: v }));

  const formRef = useRef({});
  useEffect(() => {
    formRef.current = {
      planId: record?.id,
      centreId: data.centreId,
      roomId: data.roomId,
      month: data.month,
      year: data.year,
      educators: data.educators,
      children: data.children,
      status: data.status,
      focusArea: data.focusArea,
      practicalLife: data.practicalLife,
      sensorial: data.sensorial,
      math: data.math,
      language: data.language,
      culture: data.culture,
      artCraft: data.artCraft,
      eylf: data.eylf,
      outdoor: data.outdoor,
      inquiry: data.inquiry,
      sustainability: data.sustainability,
      specialEvents: data.specialEvents,
      childrenVoices: data.childrenVoices,
      familiesInput: data.familiesInput,
      groupExperience: data.groupExperience,
      spontaneous: data.spontaneous,
      mindfulness: data.mindfulness,
      whatIsWorking: data.whatIsWorking,
      whatIsNotWorking: data.whatIsNotWorking,
    };
  }, [data, record?.id]);

  const buildPayload = useCallback(() => {
    return formRef.current;
  }, []);

  const { fieldStatus, triggerAutoSave, triggerImmediateSave, cancelPendingSaves } = useAutoSave({
    reflectionId: record?.id,
    saveFn: async (_id, payload) => {
      const res = await programPlanService.saveProgramPlan(payload);
      if (res.status !== "success" && res.status !== true) {
        throw new Error(res.message || "Save failed");
      }
      return res;
    },
    debounceMs: 1500,
  });

  useEffect(() => {
    return () => cancelPendingSaves();
  }, [cancelPendingSaves]);

  const toggleArr = (k, v) => {
    setData((p) => {
      const arr = p[k] || [];
      return {
        ...p,
        [k]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
      };
    });
  };

  useEffect(() => {
    setData(normalizeFormData(finalInitial, finalCentreId));
  }, [finalInitial, finalCentreId]);

  // Load Rooms
  useEffect(() => {
    const loadRooms = async () => {
      if (!finalCentreId) return;
      try {
        const roomsResponse = await programPlanService.getRoomsAndStaff(finalCentreId);
        if (roomsResponse.status) {
          setAvailableRooms(roomsResponse.rooms || roomsResponse.data?.rooms || []);
        }
      } catch (error) {
        console.error("Failed to load program plan rooms:", error);
      }
    };
    loadRooms();
  }, [finalCentreId]);

  // Fetch children
  const fetchChildren = useCallback(async (page, search, roomId, centerId) => {
    if (!centerId || !roomId) {
      setChildrenList([]);
      setChildrenTotalPages(1);
      return;
    }
    setIsLoadingChildren(true);
    try {
      const response = await childrenService.filterChildren({
        room_id: roomId,
        status: "Active",
        center_id: centerId,
        search: search,
        page: page,
        per_page: 50,
      });
      const pageData = response.data?.data || response.data || [];
      const lastPage = response.pagination?.last_page || response.data?.last_page || 1;
      setChildrenList((prev) => (page === 1 ? pageData : [...prev, ...pageData]));
      setChildrenTotalPages(lastPage);
    } catch (err) {
      console.error("Failed to load children:", err);
    } finally {
      setIsLoadingChildren(false);
    }
  }, []);

  useEffect(() => {
    setChildrenPage(1);
    fetchChildren(1, childrenSearch, data.roomId, finalCentreId);
  }, [childrenSearch, data.roomId, finalCentreId, fetchChildren]);

  const handleLoadMoreChildren = () => {
    if (childrenPage < childrenTotalPages && !isLoadingChildren) {
      const nextPage = childrenPage + 1;
      setChildrenPage(nextPage);
      fetchChildren(nextPage, childrenSearch, data.roomId, finalCentreId);
    }
  };

  // Fetch educators
  const fetchEducators = useCallback(async (page, search, centerId, roomId) => {
    if (!centerId || !roomId) {
      setEducatorsList([]);
      setAvailableEducators([]);
      setEducatorsTotalPages(1);
      return;
    }
    setIsLoadingEducators(true);
    try {
      const response = await staffService.getStaffSettings({
        center_id: centerId,
        search: search,
        roomid: roomId,
        page: page,
        per_page: 50,
      });
      if (response.status) {
        const staffData = response.data?.staff?.data || response.data?.staff || [];
        const lastPage = response.data?.staff?.last_page || response.pagination?.last_page || 1;
        const activeStaff = staffData.filter((s) => s.status === "ACTIVE");

        setEducatorsList((prev) => (page === 1 ? activeStaff : [...prev, ...activeStaff]));
        setAvailableEducators((prev) => (page === 1 ? activeStaff : [...prev, ...activeStaff]));
        setEducatorsTotalPages(lastPage);
      }
    } catch (error) {
      console.error("Failed to load educators:", error);
    } finally {
      setIsLoadingEducators(false);
    }
  }, []);

  useEffect(() => {
    setEducatorsPage(1);
    fetchEducators(1, educatorsSearch, finalCentreId, data.roomId);
  }, [educatorsSearch, finalCentreId, fetchEducators, data.roomId]);

  const handleLoadMoreEducators = () => {
    if (educatorsPage < educatorsTotalPages && !isLoadingEducators) {
      const nextPage = educatorsPage + 1;
      setEducatorsPage(nextPage);
      fetchEducators(nextPage, educatorsSearch, finalCentreId, data.roomId);
    }
  };

  const handleScroll = (e, onLoadMore) => {
    const target = e.target;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 10) {
      onLoadMore();
    }
  };

  const handleSubmit = (status) => {
    if (!data.centreId || !data.roomId) {
      toast.error("Please select a room.");
      return;
    }
    if (data.educators.length === 0) {
      toast.error("Please select at least one educator.");
      return;
    }
    if (data.children.length === 0) {
      toast.error("Please select at least one child.");
      return;
    }
    // data.educators.push(user.id);
    onSubmit({
      ...data,
      status,
    });
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
          <Button variant="outline" onClick={onCancel} disabled={finalIsSaving}>
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

        {/* TOP: Room / Month / Year */}
        <Section icon={Calendar} title="Plan Details" status={fieldStatus.details}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Field label="Room" icon={DoorOpen}>
              <Select
                value={data.roomId ? String(data.roomId) : ""}
                onValueChange={(v) => {
                  setData((previous) => ({
                    ...previous,
                    roomId: v,
                    roomIds: [v],
                    educators: [],
                    children: [],
                  }));
                  setTimeout(() => triggerImmediateSave("details", buildPayload), 0);
                }}
              >
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue placeholder="Select room" />
                </SelectTrigger>
                <SelectContent>
                  {availableRooms.length === 0 ? (
                    <SelectItem value="__none" disabled>
                      No rooms for this centre
                    </SelectItem>
                  ) : (
                    availableRooms.map((room) => (
                      <SelectItem key={room.id} value={String(room.id)}>
                        {room.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Month" icon={Calendar}>
              <Select value={data.month} onValueChange={(v) => {
                update("month", v);
                setTimeout(() => triggerImmediateSave("details", buildPayload), 0);
              }}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Year" icon={Calendar}>
              <Select value={String(data.year)} onValueChange={(v) => {
                update("year", Number(v));
                setTimeout(() => triggerImmediateSave("details", buildPayload), 0);
              }}>
                <SelectTrigger className="h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Section>

        {/* Educators & Children */}
        <Section icon={Users} title="Team & Children" status={fieldStatus.details}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Educators */}
            <div className="rounded-xl border border-border bg-background/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-sm font-semibold text-primary">Educators</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEducatorsModalOpen(true)}
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  Manage Educators ({data.educators.length})
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[50px] p-2.5 rounded-lg border border-dashed border-border bg-muted/20">
                {data.educators.length === 0 ? (
                  <p className="text-xs text-muted-foreground self-center">
                    No educators selected.
                  </p>
                ) : (
                  data.educators.map((id) => {
                    const staff =
                      educatorsList.find((s) => String(s.id) === String(id)) ||
                      availableEducators.find((s) => String(s.id) === String(id));
                    const name = staff?.name || `Staff ${id}`;
                    const img = avatarUrl(staff?.imageUrl);
                    return (
                      <div
                        key={id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border pl-1.5 pr-2.5 py-1 text-xs font-medium text-foreground shadow-sm"
                      >
                        {img ? (
                          <img src={img} alt={name} className="h-5 w-5 rounded-full object-cover" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
                            {name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        )}
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            toggleArr("educators", id);
                            setTimeout(() => triggerImmediateSave("details", buildPayload), 0);
                          }}
                          className="hover:text-destructive text-muted-foreground ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Children */}
            <div className="rounded-xl border border-border bg-background/60 p-4">
              <div className="mb-3 flex items-center justify-between">
                <Label className="text-sm font-semibold text-primary">Children</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (!data.roomId) {
                      toast.error("Please select a room first.");
                      return;
                    }
                    setChildrenModalOpen(true);
                  }}
                  className="border-primary/30 text-primary hover:bg-primary/10"
                >
                  Manage Children ({data.children.length})
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[50px] p-2.5 rounded-lg border border-dashed border-border bg-muted/20">
                {data.children.length === 0 ? (
                  <p className="text-xs text-muted-foreground self-center">
                    {!data.roomId ? "Select room first." : "No children selected."}
                  </p>
                ) : (
                  data.children.map((id) => {
                    const childObj = childrenList.find((c) => String(c.id) === String(id));
                    const name = childObj ? `${childObj.name} ${childObj.lastname}` : `Child ${id}`;
                    const img = avatarUrl(childObj?.imageUrl);
                    return (
                      <div
                        key={id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-background border border-border pl-1.5 pr-2.5 py-1 text-xs font-medium text-foreground shadow-sm"
                      >
                        {img ? (
                          <img src={img} alt={name} className="h-5 w-5 rounded-full object-cover" />
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
                            {name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        )}
                        <span>{name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            toggleArr("children", id);
                            setTimeout(() => triggerImmediateSave("details", buildPayload), 0);
                          }}
                          className="hover:text-destructive text-muted-foreground ml-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </Section>

        {/* Focus Area */}
        <Section icon={Target} title="Focus" status={fieldStatus.experiences}>
          <Field label="Focus Areas">
            <Textarea
              value={textValue(data.focusArea)}
              onChange={(e) => {
                update("focusArea", e.target.value);
                triggerAutoSave("experiences", buildPayload);
              }}
              onBlur={() => triggerImmediateSave("experiences", buildPayload)}
              placeholder="Focus Area"
              rows={3}
            />
          </Field>
        </Section>

        {/* Activity-based subjects */}
        <Section icon={ActivityIcon} title="Subject Activities" status={fieldStatus.experiences}>
          <div className="space-y-4">
            {ACTIVITY_SUBJECTS.map((key) => {
              const field = SUBJECT_FIELDS[key];
              const selected = data[field] || []; // Array of { activity, items }
              return (
                <div key={key} className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Label className="text-sm font-semibold text-primary">{SUBJECT_MAP[key]}</Label>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setPicker(key)}
                      disabled={isSaving}
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
                      <div className="space-y-3">
                        {selected.map((group) => (
                          <div key={group.activity} className="space-y-1">
                            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                              {group.activity}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {group.items.map((item) => (
                                <span
                                  key={item}
                                  className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-1 text-xs font-medium text-primary"
                                >
                                  {item}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = selected
                                        .map((g) =>
                                          g.activity === group.activity
                                            ? { ...g, items: g.items.filter((i) => i !== item) }
                                            : g,
                                        )
                                        .filter((g) => g.items.length > 0);
                                      update(field, next);
                                      setTimeout(() => triggerImmediateSave("experiences", buildPayload), 0);
                                    }}
                                    className="hover:text-destructive ml-0.5"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
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
                  value={textValue(data[s.key])}
                  onChange={(e) => {
                    update(s.key, e.target.value);
                    triggerAutoSave("experiences", buildPayload);
                  }}
                  onBlur={() => triggerImmediateSave("experiences", buildPayload)}
                  placeholder={s.placeholder}
                  rows={3}
                />
              </Field>
            ))}
          </div>
        </Section>

        {/* Additional Experiences */}
        <Section icon={Sparkles} title="Additional Experiences" status={fieldStatus.experiences}>
          {/* EYLF picker */}
          <div className="mb-5 rounded-xl border border-border bg-background/60 p-4">
            <div className="mb-2 flex items-center justify-between">
              <Label className="text-sm font-semibold text-primary">EYLF Outcomes</Label>
              <Button type="button" size="sm" onClick={() => setEylfOpen(true)} disabled={isSaving}>
                <Search className="mr-1.5 h-4 w-4" />
                Select EYLF
              </Button>
            </div>
            <div className="min-h-[44px] rounded-md border border-dashed border-border bg-muted/20 p-2">
              {data.eylf.length === 0 ? (
                <p className="text-xs text-muted-foreground">No outcomes selected.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {data.eylf.map((label, i) => (
                    <span
                      key={`${label}-${i}`}
                      title={label}
                      className="inline-flex max-w-full items-center gap-1 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-950/30 dark:text-emerald-400"
                    >
                      <span className="truncate">{label}</span>
                      <button
                        type="button"
                        onClick={() => {
                          update(
                            "eylf",
                            data.eylf.filter((_, j) => j !== i),
                          );
                          setTimeout(() => triggerImmediateSave("experiences", buildPayload), 0);
                        }}
                        className="ml-0.5 shrink-0 hover:text-emerald-900 dark:hover:text-emerald-200"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {ADDITIONAL_FIELDS.map((f) => (
              <Field key={f.key} label={f.label}>
                <Textarea
                  value={textValue(data[f.key])}
                  onChange={(e) => {
                    update(f.key, e.target.value);
                    triggerAutoSave("experiences", buildPayload);
                  }}
                  onBlur={() => triggerImmediateSave("experiences", buildPayload)}
                  placeholder={f.placeholder || ""}
                  rows={3}
                />
              </Field>
            ))}
          </div>
        </Section>

        {/* Status */}
        <Section icon={BookOpen} title="Status" status={fieldStatus.experiences}>
          <div className="w-full max-w-xs">
            <Select
              value={data.status}
              onValueChange={(v) => {
                update("status", v);
                setTimeout(() => triggerImmediateSave("experiences", buildPayload), 0);
              }}
              disabled={isSaving}
            >
              <SelectTrigger
                className={cn(
                  "h-12 rounded-2xl border-none font-bold uppercase tracking-wider text-xs",
                  data.status === "published"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700",
                )}
              >
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-border pt-6">
          <Button
            onClick={onCancel}
            size="lg"
            className="h-12 rounded-xl bg-primary px-10 font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary/90"
          >
            Go to Program Plans
          </Button>

          {mode === "edit" && (
            <Button
              onClick={() => {
                if (!data.centreId || !data.roomId) {
                  toast.error("Please select a room.");
                  return;
                }
                if (data.educators.length === 0) {
                  toast.error("Please select at least one educator.");
                  return;
                }
                if (data.children.length === 0) {
                  toast.error("Please select at least one child.");
                  return;
                }
                onSaveAsNew?.({
                  ...data,
                  status: data.status,
                });
              }}
              disabled={finalIsSaving}
              variant="default"
              size="lg"
              className="h-12 rounded-xl bg-emerald-600 px-8 font-bold hover:bg-emerald-700"
            >
              <Save className="mr-1.5 h-4 w-4" />
              {finalIsSaving ? "Saving..." : "Save as New"}
            </Button>
          )}
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
            setTimeout(() => triggerImmediateSave("experiences", buildPayload), 0);
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
          setTimeout(() => triggerImmediateSave("experiences", buildPayload), 0);
        }}
      />

      {/* Children Selection Modal */}
      <Dialog open={childrenModalOpen} onOpenChange={setChildrenModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg p-0 overflow-hidden flex flex-col h-[80vh] max-h-[600px]">
          <div className="p-6 pb-4 border-b border-border">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Select Children
            </DialogTitle>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={childrenSearch}
                onChange={(e) => setChildrenSearch(e.target.value)}
                placeholder="Search by name..."
                className="h-10 pl-9 pr-4 rounded-xl"
              />
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-6 space-y-3"
            onScroll={(e) => handleScroll(e, handleLoadMoreChildren)}
          >
            {childrenList.length === 0 && !isLoadingChildren ? (
              <p className="text-sm text-muted-foreground text-center py-8">No children found.</p>
            ) : (
              childrenList.map((child) => {
                const childIdStr = String(child.id);
                const isSelected = data.children.includes(childIdStr);
                const img = avatarUrl(child.imageUrl);
                const fullName = `${child.name} ${child.lastname}`;

                return (
                  <button
                    key={child.id}
                    type="button"
                    onClick={() => toggleArr("children", childIdStr)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                      isSelected
                        ? "bg-primary/5 border-primary"
                        : "bg-card border-border hover:border-primary/50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {img ? (
                        <img
                          src={img}
                          alt={fullName}
                          className="h-10 w-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                          {child.name?.[0]?.toUpperCase()}
                          {child.lastname?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-sm text-foreground">{fullName}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          Room ID: {child.room}
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "h-5 w-5 rounded-md border flex items-center justify-center transition-all",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                );
              })
            )}

            {isLoadingChildren && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {data.children.length} selected
            </span>
            <Button
              onClick={() => {
                setChildrenModalOpen(false);
                setTimeout(() => triggerImmediateSave("details", buildPayload), 0);
              }}
              className="rounded-xl bg-primary text-primary-foreground px-6"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Educators Selection Modal */}
      <Dialog open={educatorsModalOpen} onOpenChange={setEducatorsModalOpen}>
        <DialogContent className="rounded-2xl sm:max-w-lg p-0 overflow-hidden flex flex-col h-[80vh] max-h-[600px]">
          <div className="p-6 pb-4 border-b border-border">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Select Educators
            </DialogTitle>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={educatorsSearch}
                onChange={(e) => setEducatorsSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="h-10 pl-9 pr-4 rounded-xl"
              />
            </div>
          </div>

          <div
            className="flex-1 overflow-y-auto p-6 space-y-3"
            onScroll={(e) => handleScroll(e, handleLoadMoreEducators)}
          >
            {educatorsList.length === 0 && !isLoadingEducators ? (
              <p className="text-sm text-muted-foreground text-center py-8">No educators found.</p>
            ) : (
              educatorsList.map((staff) => {
                const staffIdStr = String(staff.id);
                const isSelected = data.educators.includes(staffIdStr);
                const img = avatarUrl(staff.imageUrl);

                return (
                  <button
                    key={staff.id}
                    type="button"
                    onClick={() => toggleArr("educators", staffIdStr)}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left",
                      isSelected
                        ? "bg-primary/5 border-primary"
                        : "bg-card border-border hover:border-primary/50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {img ? (
                        <img
                          src={img}
                          alt={staff.name}
                          className="h-10 w-10 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center">
                          {staff.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-sm text-foreground">{staff.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {staff.title || staff.userType || "Staff"}
                        </div>
                      </div>
                    </div>
                    <div
                      className={cn(
                        "h-5 w-5 rounded-md border flex items-center justify-center transition-all",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </div>
                  </button>
                );
              })
            )}

            {isLoadingEducators && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            )}
          </div>

          <div className="p-4 bg-muted/30 border-t border-border flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">
              {data.educators.length} selected
            </span>
            <Button
              onClick={() => {
                setEducatorsModalOpen(false);
                setTimeout(() => triggerImmediateSave("details", buildPayload), 0);
              }}
              className="rounded-xl bg-primary text-primary-foreground px-6"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({ icon: Icon, title, children, status }) {
  return (
    <section className="relative mb-7">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-foreground">{title}</h3>
        </div>
        {status !== undefined && <AutoSaveIndicator status={status} />}
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
              const value = typeof opt === "string" ? opt : opt.value;
              const labelText = typeof opt === "string" ? opt : opt.label;
              const isSel = selected.includes(value);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => onToggle(value)}
                  className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                    isSel
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                  )}
                >
                  {labelText}
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
