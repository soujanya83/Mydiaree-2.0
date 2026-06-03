import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  FileText,
  Sparkles,
  X,
  Search,
  Loader2,
  Calendar,
  DoorOpen,
  User,
  Plus,
  ListChecks,
  Info,
  Upload,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageLoader } from "@/components/common/PageLoader";
import { useCentreStore } from "@/stores/centreStore";
import { childrenService } from "@/services/centre/childrenService";
import { reflectionService } from "@/services/learning/reflectionService";
import { staffService } from "@/services/admin/staffService";
import { DailyReflectionEylfModal } from "@/components/reflection/DailyReflectionEylfModal";
import { toast } from "sonner";
import { IMG_BASE_API } from "../api/imageapi";

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.15)_1px,transparent_0)] [background-size:16px_16px]";
const IMG_BASE = IMG_BASE_API;

const avatarUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${IMG_BASE}${url.replace(/^\/+/, "")}`;
};

const mediaUrl = (url) => avatarUrl(url) || "";

const isVideoMedia = (item) => {
  const type = String(item?.file?.type || item?.mediaType || "").toLowerCase();
  const url = String(item?.url || item?.preview || "").toLowerCase();
  return type.startsWith("video/") || /\.(mp4|mov|webm|m4v|avi)(\?|#|$)/i.test(url);
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

export default function DailyReflectionCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [search] = useSearchParams();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);
  const mediaPreviewUrlsRef = useRef(new Set());

  const { activeCentreId } = useCentreStore();

  const [isSaving, setIsSaving] = useState(false);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(false);
  const [isEditLoading, setIsEditLoading] = useState(isEdit);

  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [availableChildren, setAvailableChildren] = useState([]);
  const [childrenList, setChildrenList] = useState([]);
  const [childrenSearch, setChildrenSearch] = useState("");
  const [childrenPage, setChildrenPage] = useState(1);
  const [childrenTotalPages, setChildrenTotalPages] = useState(1);
  const [isChildrenLoading, setIsChildrenLoading] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [staffSearch, setStaffSearch] = useState("");
  const [staffPage, setStaffPage] = useState(1);
  const [staffTotalPages, setStaffTotalPages] = useState(1);
  const [isStaffLoading, setIsStaffLoading] = useState(false);

  // Form state
  const [rooms, setRooms] = useState([]);
  const [children, setChildren] = useState([]);
  const [staff, setStaff] = useState([]);
  const [eylf, setEylf] = useState([]);
  const [title, setTitle] = useState(search.get("title") || "");
  const [reflection, setReflection] = useState("");
  const [status, setStatus] = useState("draft");
  const [media, setMedia] = useState([]); // { file, preview, isExisting, url, id }

  const [showRoomsPicker, setShowRoomsPicker] = useState(false);
  const [showChildrenPicker, setShowChildrenPicker] = useState(false);
  const [showStaffPicker, setShowStaffPicker] = useState(false);
  const [showEylfPicker, setShowEylfPicker] = useState(false);

  // 1. Fetch Rooms and Staff on Centre Change
  useEffect(() => {
    const loadInitialData = async () => {
      if (!activeCentreId) {
        setAvailableRooms([]);
        setIsInitialDataLoading(false);
        return;
      }
      setIsInitialDataLoading(true);
      try {
        const roomsData = await reflectionService.getRoomsAndStaff(activeCentreId);
        if (roomsData.status) {
          setAvailableRooms(roomsData.rooms || roomsData.data?.rooms || []);
        }
      } catch (error) {
        console.error("Failed to load rooms:", error);
      } finally {
        setIsInitialDataLoading(false);
      }
    };
    loadInitialData();
  }, [activeCentreId]);

  // 2. Fetch Reflection in Edit Mode
  useEffect(() => {
    const loadReflection = async () => {
      if (!isEdit) {
        setIsEditLoading(false);
        return;
      }
      if (!id || !activeCentreId) {
        setIsEditLoading(true);
        return;
      }
      setIsEditLoading(true);
      try {
        const reflRes = await reflectionService.getAllReflections(activeCentreId, {
          perPage: 100,
          page: 1,
        });
        const existing = reflRes.data?.reflection?.data?.find((r) => String(r.id) === String(id));
        if (existing) {
          setTitle(existing.title?.replace(/<[^>]*>/g, "") || "");
          setReflection(existing.about?.replace(/<[^>]*>/g, "") || "");
          setRooms(existing.roomids ? String(existing.roomids).split(",").filter(Boolean) : []);
          setStaff(existing.staff?.map((s) => String(s.staffid)) || []);
          setChildren(existing.children?.map((c) => String(c.childid)) || []);
          setAvailableStaff((prev) =>
            mergeById(prev, (existing.staff || []).map((item) => item.staff).filter(Boolean)),
          );
          setAvailableChildren((prev) =>
            mergeById(prev, (existing.children || []).map((item) => item.child).filter(Boolean)),
          );
          setEylf(existing.eylf ? String(existing.eylf).split(/\r?\n/).filter(Boolean) : []);
          setStatus(existing.status?.toLowerCase() === "published" ? "published" : "draft");
          if (existing.media) {
            setMedia(
              existing.media.map((m) => ({
                isExisting: true,
                url: mediaUrl(m.mediaUrl || m.url),
                id: m.id,
                mediaType: m.mediaType,
              })),
            );
          }
        } else {
          toast.error("Reflection not found");
        }
      } catch (error) {
        console.error("Failed to load reflection:", error);
        toast.error("Failed to load reflection");
      } finally {
        setIsEditLoading(false);
      }
    };
    loadReflection();
  }, [isEdit, id, activeCentreId]);

  const fetchStaff = useCallback(
    async (pageNumber, searchQuery) => {
      if (!activeCentreId) {
        setStaffList([]);
        setStaffTotalPages(1);
        return;
      }
      setIsStaffLoading(true);
      try {
        const response = await staffService.getStaffSettings({
          center_id: activeCentreId,
          search: searchQuery,
          page: pageNumber,
          per_page: 50,
        });
        if (response.status) {
          const pageData = response.data?.staff?.data || response.data?.staff || [];
          const activeStaff = pageData.filter((item) => item.status === "ACTIVE");
          const lastPage = response.data?.staff?.last_page || response.pagination?.last_page || 1;
          setStaffList((prev) => (pageNumber === 1 ? activeStaff : mergeById(prev, activeStaff)));
          setAvailableStaff((prev) => mergeById(prev, activeStaff));
          setStaffTotalPages(lastPage);
        }
      } catch (error) {
        console.error("Failed to load staff:", error);
      } finally {
        setIsStaffLoading(false);
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
              status: "Active",
              room_id: roomId,
              center_id: activeCentreId,
              search: searchQuery,
              page: pageNumber,
              per_page: 50,
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
        console.error("Failed to load children:", error);
      } finally {
        setIsChildrenLoading(false);
      }
    },
    [activeCentreId],
  );

  useEffect(() => {
    setStaffPage(1);
    fetchStaff(1, staffSearch);
  }, [fetchStaff, staffSearch]);

  useEffect(() => {
    setChildrenPage(1);
    fetchChildren(1, childrenSearch, rooms);
  }, [fetchChildren, childrenSearch, rooms]);

  const loadMoreStaff = () => {
    if (isStaffLoading || staffPage >= staffTotalPages) return;
    const nextPage = staffPage + 1;
    setStaffPage(nextPage);
    fetchStaff(nextPage, staffSearch);
  };

  const loadMoreChildren = () => {
    if (isChildrenLoading || childrenPage >= childrenTotalPages) return;
    const nextPage = childrenPage + 1;
    setChildrenPage(nextPage);
    fetchChildren(nextPage, childrenSearch, rooms);
  };

  const handleSave = async () => {
    if (!title.trim() || !rooms.length || !children.length || !staff.length || !media.length) {
      toast.error(
        "Please fill in all required fields (Rooms, Children, Title, Staff, and at least one Media)",
      );
      return;
    }
    setIsSaving(true);
    try {
      const formData = new FormData();
      if (isEdit) formData.append("id", id);
      formData.append("center_id", activeCentreId);
      formData.append("title", title);
      formData.append("about", reflection);
      formData.append("status", status.toUpperCase());
      formData.append("selected_rooms", rooms.join(","));
      formData.append("selected_children", children.join(","));
      formData.append("selected_staff", staff.join(","));
      formData.append("eylf", eylf.join("\r\n"));

      media
        .filter((item) => !item.isExisting)
        .forEach((item) => {
          formData.append("media[]", item.file);
        });

      const res = await reflectionService.storeReflection(formData);
      if (res.status) {
        toast.success(isEdit ? "Reflection updated" : "Reflection saved");
        navigate("/daily-reflections");
      } else {
        toast.error(res.message || "Failed to save");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const handleMediaSelect = (e) => {
    const files = Array.from(e.target.files);
    if (media.length + files.length > 10) {
      toast.error("Maximum 10 files allowed");
      return;
    }
    const newMedia = files.map((file) => {
      const preview = URL.createObjectURL(file);
      mediaPreviewUrlsRef.current.add(preview);
      return {
        file,
        preview,
        isExisting: false,
      };
    });
    setMedia((prev) => [...prev, ...newMedia]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeMedia = (index) => {
    setMedia((prev) => {
      const removed = prev[index];
      if (removed?.preview) {
        URL.revokeObjectURL(removed.preview);
        mediaPreviewUrlsRef.current.delete(removed.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  useEffect(() => {
    const previewUrls = mediaPreviewUrlsRef.current;
    return () => {
      previewUrls.forEach((preview) => URL.revokeObjectURL(preview));
      previewUrls.clear();
    };
  }, []);

  const today = new Date()
    .toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();

  if (isEdit && (isInitialDataLoading || isEditLoading)) {
    return (
      <div className="min-h-[60vh]">
        <PageLoader label="Loading reflection..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Premium Header */}
      <div className="sticky top-0 z-40 -mx-6 mb-6 border-b border-border bg-background/80 px-6 py-4 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/daily-reflections")}
              className="h-9 w-9 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {isEdit ? "Edit Reflection" : "New Daily Reflection"}
              </h1>
              <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Link to="/daily-reflections" className="hover:text-foreground">
                  Reflections
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
                disabled={isSaving}
              >
                {isSaving ? (
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

      <div className="mx-auto max-w-5xl space-y-8">
        {/* Banner Section */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 dark:bg-emerald-500/10">
          <div className="relative z-10">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              <Sparkles className="h-3 w-3" /> Early Learning Documentation
            </div>
            <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              Daily <span className="text-emerald-600">Reflection</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm font-medium text-muted-foreground">
              Capture the highlights, group activities, and collective learning moments of the day.
              Share the journey with parents and keep a digital diary of classroom growth.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        </section>

        {/* Tagging Section */}
        <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <User className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Tagging & Groups</h3>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <PremiumPickerField
              label="Rooms"
              required
              icon={DoorOpen}
              colour="emerald"
              actionLabel={`Manage Rooms (${rooms.length})`}
              selectedItems={rooms.map((id) => ({
                id,
                label: availableRooms.find((r) => String(r.id) === String(id))?.name || id,
              }))}
              onRemove={(id) => setRooms((prev) => prev.filter((x) => x !== id))}
              onClick={() => setShowRoomsPicker(true)}
              placeholder="Select rooms"
            />
            <PremiumPickerField
              label="Children"
              required
              icon={User}
              colour="sky"
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
              required
              icon={User}
              colour="rose"
              actionLabel={`Manage Educators (${staff.length})`}
              selectedItems={staff.map((id) => ({
                id,
                label: availableStaff.find((s) => String(s.id) === String(id))?.name || id,
              }))}
              onRemove={(id) => setStaff((prev) => prev.filter((x) => x !== id))}
              onClick={() => setShowStaffPicker(true)}
              placeholder="Select staff"
            />
          </div>
        </section>

        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-2">
                <div className="rounded-lg bg-sky-500/10 p-2 text-sky-600">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Reflection Content</h3>
              </div>

              <div className="space-y-6">
                <FormGroup label="Title" info="Descriptive title for the day's reflection" required>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., A Creative Morning in the Studio"
                    className="h-12 border-none bg-muted/30 focus-visible:ring-sky-500/50"
                  />
                </FormGroup>

                <FormGroup
                  label="What happened today?"
                  info="Describe the group activities and collective learning"
                >
                  <Textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    rows={8}
                    placeholder="Today we explored textures and colors in our new art corner..."
                    className="border-none bg-muted/30 focus-visible:ring-sky-500/50 resize-none"
                  />
                </FormGroup>
              </div>
            </section>

            {/* EYLF Section */}
            <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600">
                    <ListChecks className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">EYLF Outcomes</h3>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowEylfPicker(true)}
                  className="rounded-full border-emerald-500/30 text-emerald-600 hover:bg-emerald-50"
                >
                  <Plus className="mr-1.5 h-4 w-4" /> Select Outcomes
                </Button>
              </div>

              {eylf.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
                  <Info className="mb-2 h-8 w-8 text-muted-foreground/30" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No EYLF outcomes linked yet.
                  </p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {eylf.map((label, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100"
                    >
                      {label}
                      <button
                        onClick={() => setEylf((p) => p.filter((_, j) => j !== i))}
                        className="hover:text-emerald-900"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            {/* Media Upload */}
            <section className="rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
                  Media <span className="text-destructive font-bold ml-0.5">*</span>
                </h3>
                <span className="text-[10px] font-medium text-muted-foreground uppercase">
                  {media.length}/10 Files
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {media.map((m, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
                  >
                    {isVideoMedia(m) ? (
                      <video
                        src={m.isExisting ? m.url : m.preview}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        muted
                        playsInline
                        preload="metadata"
                      />
                    ) : (
                      <img
                        src={m.isExisting ? m.url : m.preview}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                        alt="preview"
                      />
                    )}
                    <button
                      onClick={() => removeMedia(i)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {media.length < 10 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-6 transition-colors hover:border-primary/40 hover:bg-primary/5 ${PATTERN_BG}`}
                  >
                    <Upload className="h-5 w-5 text-primary" />
                    <span className="mt-2 text-[10px] font-bold text-foreground uppercase tracking-tighter">
                      Add
                    </span>
                  </button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={handleMediaSelect}
              />
              <p className="mt-4 text-[10px] text-center text-muted-foreground leading-relaxed uppercase font-bold tracking-widest">
                Support for high-res images and 4K video clips.
              </p>
            </section>

            {/* Bottom Actions for Tab */}
            <div className="space-y-4">
              <FormGroup
                label="Status"
                info="Choose whether to keep as draft or publish to families"
              >
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger
                    className={`h-12 w-full rounded-2xl border-none font-bold uppercase tracking-wider text-xs ${status === "published" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                  >
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </FormGroup>

              <Button
                onClick={() => handleSave()}
                className="w-full h-14 rounded-2xl bg-primary text-base font-bold shadow-xl shadow-primary/20 hover:bg-primary/90"
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                {isEdit ? "Update Reflection" : "Save Reflection"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Pickers */}
      <MultiPickerModal
        open={showRoomsPicker}
        title="Select Rooms"
        items={availableRooms.map((r) => ({ id: String(r.id), label: r.name }))}
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
        open={showStaffPicker}
        title="Select Staff"
        items={staffList.map((s) => ({
          id: String(s.id),
          label: s.name || `Staff ${s.id}`,
          imageUrl: s.imageUrl,
          meta: s.title || s.userType || "Staff",
        }))}
        selected={staff}
        isLoading={isStaffLoading}
        searchQuery={staffSearch}
        onSearchChange={setStaffSearch}
        onLoadMore={loadMoreStaff}
        hasMore={staffPage < staffTotalPages}
        onClose={() => setShowStaffPicker(false)}
        onSave={(v) => {
          setStaff(v);
          setShowStaffPicker(false);
        }}
      />
      {showEylfPicker && (
        <DailyReflectionEylfModal
          open={true}
          selected={eylf}
          onClose={() => setShowEylfPicker(false)}
          onSave={(vals) => {
            setEylf(vals);
            setShowEylfPicker(false);
          }}
        />
      )}
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

function FormGroup({ label, children, info, required }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between px-1">
        <label className="text-sm font-bold text-foreground">
          {label}
          {required && <span className="text-destructive font-bold ml-0.5">*</span>}
        </label>
        {info && (
          <div className="group relative">
            <Info className="h-4 w-4 text-muted-foreground/50 cursor-help" />
            <div className="absolute bottom-full right-0 mb-2 w-48 rounded-lg bg-slate-900 p-2 text-[10px] text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100 pointer-events-none z-50">
              {info}
            </div>
          </div>
        )}
      </div>
      {children}
    </div>
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

        {/* Search Input */}
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
