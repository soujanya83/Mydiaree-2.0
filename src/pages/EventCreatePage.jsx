import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  FileText,
  CalendarDays,
  Users,
  Tag,
  Image as ImageIcon,
  AlignLeft,
  Save,
  Megaphone,
  MapPin,
  Loader2,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eventTypes, accessOptions } from "@/components/events/eventsData";
import { SelectChildrenModal } from "@/components/events/SelectChildrenModal";
import { announcementService } from "@/services/centre/announcementService";
import { holidayService } from "@/services/centre/holidayService";
import { childrenService } from "@/services/centre/childrenService";
import { useCentreStore } from "@/stores/centreStore";
import { mapAnnouncementRecord, toApiAudience, toApiType } from "@/components/events/eventMappers";
import { IMG_BASE_API } from "../api/imageapi";

const IMG_BASE = IMG_BASE_API;

function stripHtml(value = "") {
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

function mediaUrl(raw) {
  if (!raw) return "";
  return String(raw).startsWith("http")
    ? String(raw)
    : `${IMG_BASE}${String(raw).replace(/^\/+/, "")}`;
}

function getInitials(name, lastname) {
  const nameInitial = name ? name.charAt(0).toUpperCase() : "";
  const lastnameInitial = lastname ? lastname.charAt(0).toUpperCase() : "";
  return (nameInitial + lastnameInitial).slice(0, 2);
}

export default function EventCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { activeCentreId } = useCentreStore();
  const isEdit = Boolean(id) && location.pathname.endsWith("/edit");
  const isView = Boolean(id) && !isEdit;

  const searchParams = new URLSearchParams(location.search);
  const presetType = searchParams.get("type");
  const defaultType = eventTypes.includes(presetType) ? presetType : "Announcement";
  const isHoliday = defaultType === "Public Holiday";

  const [form, setForm] = useState({
    type: defaultType,
    title: "",
    date: new Date().toISOString().slice(0, 10),
    access: "All",
    description: "",
    eventColor: "#0d6efd",
    media: null,
    children: [],
    childrenData: [],
    state: "",
    status: "Draft",
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  // Fetch children data when children IDs change
  useEffect(() => {
    const fetchChildrenData = async () => {
      if (!form.children.length || !activeCentreId) {
        setForm((f) => ({ ...f, childrenData: [] }));
        return;
      }
      setIsLoadingChildren(true);
      try {
        const res = await childrenService.filterChildren({
          center_id: activeCentreId,
          status: "Active",
          per_page: 100,
        });
        if (res.status && res.data?.data) {
          const selectedChildren = res.data.data.filter((child) =>
            form.children.includes(String(child.id)),
          );
          setForm((f) => ({ ...f, childrenData: selectedChildren }));
        }
      } catch (error) {
        console.error("Failed to fetch children data:", error);
      } finally {
        setIsLoadingChildren(false);
      }
    };

    fetchChildrenData();
  }, [form.children, activeCentreId]);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        if (isHoliday) {
          // For holidays, we might need to fetch the specific holiday
          // Since there's no getHolidayById, we fetch the month's holidays and find it
          // Or just fetch all if possible. The API example shows month:5.
          // For now, let's try to fetch all or use a default month.
          // Better: If we came from the holiday list, we might already have the data?
          // No, we need to fetch it.
          const res = await holidayService.getHolidays("");
          if (res.status) {
            const existing = (res.holidays || []).find((h) => String(h.id) === String(id));
            if (existing) {
              setForm({
                type: "Public Holiday",
                title: existing.occasion,
                date: existing.Holiday_date
                  ? existing.Holiday_date.split("T")[0]
                  : new Date(new Date().getFullYear(), existing.month - 1, existing.date + 1)
                      .toISOString()
                      .split("T")[0],
                access: "All",
                description: "",
                eventColor: "#0d6efd",
                media: null,
                children: [],
                childrenData: [],
                state: existing.state || "",
                status: "Draft",
              });
            }
          }
        } else {
          const res = await announcementService.getAnnouncementByAnnId(id);
          const ok =
            res.status === true ||
            res.status === "true" ||
            String(res.status).toLowerCase() === "true";
          if (ok && res.data?.info) {
            const mapped = mapAnnouncementRecord(res.data.info);
            const childIds = (res.data.children || []).map((c) => String(c.id));
            const rawDate = mapped.date || "";
            const dateForInput = rawDate.includes("T")
              ? rawDate.split("T")[0]
              : rawDate.slice(0, 10);
            setForm({
              type: mapped.type,
              title: stripHtml(mapped.title),
              date: dateForInput || new Date().toISOString().slice(0, 10),
              access: mapped.access,
              description: stripHtml(mapped.description || ""),
              eventColor: mapped.eventColor || "#0d6efd",
              media: mapped.media || null,
              children: childIds,
              childrenData: [],
              state: "",
              status: mapped.status === "published" ? "Published" : "Draft",
            });
          } else {
            toast.error(res.message || "Failed to load announcement");
          }
        }
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, isHoliday]);

  useEffect(() => {
    if (id) return;
    if (presetType && eventTypes.includes(presetType)) {
      setForm({
        type: presetType,
        title: "",
        date: new Date().toISOString().slice(0, 10),
        access: "All",
        description: "",
        eventColor: "#0d6efd",
        media: null,
        children: [],
        state: "",
        status: "Draft",
      });
    }
  }, [presetType, id]);

  const update = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (k === "description" && formErrors.text) {
      setFormErrors((prev) => ({ ...prev, text: null }));
    } else if (k === "children" && formErrors.childId) {
      setFormErrors((prev) => ({ ...prev, childId: null }));
    } else if (k === "date" && formErrors.eventDate) {
      setFormErrors((prev) => ({ ...prev, eventDate: null }));
    } else if (formErrors[k]) {
      setFormErrors((prev) => ({ ...prev, [k]: null }));
    }
  };

  /** Backend expects PHP date format d-m-Y (e.g. 05-05-2026), not yyyy-mm-dd from <input type="date"> */
  const toApiEventDate = (isoDate) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split("-");
    if (!year || !month || !day) return isoDate;
    return `${day}-${month}-${year}`;
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File must be ≤ 2MB");
      return;
    }
    const isPdf = file.type === "application/pdf";
    const url = URL.createObjectURL(file);
    update("media", { type: isPdf ? "pdf" : "image", url, name: file.name, file });
  };

  const buildFormData = () => {
    const formData = new FormData();
    if (isEdit) formData.append("annId", id);
    formData.append("centerid", activeCentreId);
    formData.append("title", form.title.trim());
    formData.append("eventDate", toApiEventDate(form.date));
    formData.append("text", form.description || "");
    form.children.forEach((childId) => formData.append("childId[]", childId));
    if (form.media?.file) formData.append("media[]", form.media.file);
    formData.append("type", toApiType(form.type));
    formData.append("audience", toApiAudience(form.access));
    formData.append("eventColor", form.type === "Events" ? form.eventColor : "");
    if (form.status === "Published") {
      formData.append("status", "Sent");
    }
    return formData;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormErrors({});
    if (!form.title.trim()) {
      setFormErrors((prev) => ({ ...prev, title: "The title field is required." }));
      toast.error("Title is required");
      return;
    }
    if (!activeCentreId && form.type !== "Public Holiday") {
      toast.error("Please select a centre first");
      return;
    }
    if (form.type !== "Public Holiday") {
      const nextErrors = {};
      if (!form.description.trim()) nextErrors.text = "Description is required.";
      if (!form.children.length) nextErrors.childId = "Children are required.";
      if (Object.keys(nextErrors).length > 0) {
        setFormErrors((prev) => ({ ...prev, ...nextErrors }));
        toast.error("Please fill all required fields");
        return;
      }
    }
    const label = form.type === "Public Holiday" ? "Holiday" : "Event";
    setIsSubmitting(true);
    try {
      if (form.type === "Public Holiday") {
        // Format date to DD/MM/YYYY for holiday API
        const d = new Date(form.date);
        const formattedDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;

        const payload = {
          centerid: activeCentreId || "1",
          date: formattedDate,
          state: form.state,
          occasion: form.title,
          status: form.status,
        };
        if (isEdit) payload.id = id;

        const res = await holidayService.saveHoliday(payload);
        if (res.status === "success" || res.status === true) {
          toast.success(res.message || `${label} ${isEdit ? "updated" : "created"}`);
          navigate("/events/holidays");
          return;
        } else {
          toast.error(res.message || `Failed to ${isEdit ? "update" : "create"} holiday`);
        }
      } else {
        const res = await announcementService.saveAnnouncement(buildFormData());
        if (res.status === false || res.status === "error") {
          if (res.errors) {
            setFormErrors({
              title: res.errors.title?.[0],
              text: res.errors.text?.[0],
              childId: res.errors.childId?.[0],
              eventDate: res.errors.eventDate?.[0],
            });
            toast.error(res.message || "Validation failed");
            return;
          }
          toast.error(res.message || `Failed to ${isEdit ? "update" : "create"} event`);
          return;
        }
        toast.success(res.message || (isEdit ? `${label} updated` : `${label} created`));
        navigate("/events");
      }
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors) {
        setFormErrors({
          title: apiErrors.title?.[0],
          text: apiErrors.text?.[0],
          childId: apiErrors.childId?.[0],
          eventDate: apiErrors.eventDate?.[0],
        });
        toast.error(error?.response?.data?.message || "Validation failed");
        return;
      }
      toast.error(
        error?.response?.data?.message ||
          `Failed to ${isEdit ? "update" : "create"} ${label.toLowerCase()}`,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const noun = isHoliday || form.type === "Public Holiday" ? "Holiday" : "Event";
  const title = isView ? `View ${noun}` : isEdit ? `Edit ${noun}` : `Create ${noun}`;

  const backTo = isHoliday ? "/events/holidays" : "/events";
  const breadcrumbs = isHoliday
    ? [
        { label: "Events", to: "/events" },
        { label: "Public Holidays", to: "/events/holidays" },
        { label: title },
      ]
    : [{ label: "Events", to: "/events" }, { label: title }];

  return (
    <div className="pb-24">
      <PageHeader
        title={title}
        description={
          isHoliday
            ? "Mark statutory holidays and centre closures"
            : "Share announcements, events and notices with parents and staff"
        }
        breadcrumbs={breadcrumbs}
        actions={
          <Button variant="outline" onClick={() => navigate(backTo)}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      {isLoading ? (
        <div className="rounded-lg border bg-card p-10 text-center text-muted-foreground">
          Loading event...
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Type — accent banner */}
          <SectionCard icon={<Tag className="h-4 w-4" />} title="Type" tone="accent">
            <Select value={form.type} onValueChange={(v) => update("type", v)} disabled={isView}>
              <SelectTrigger className="h-11 bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {eventTypes.map((t) => (
                  <SelectItem key={t} value={t}>
                    <span className="flex items-center gap-2">
                      <Megaphone className="h-3.5 w-3.5 text-primary" />
                      {t}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.type === "Events" && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Event color
                </Label>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    value={form.eventColor}
                    onChange={(e) => update("eventColor", e.target.value)}
                    disabled={isView}
                    className="h-11 w-16 p-1"
                  />
                  <Input
                    value={form.eventColor}
                    onChange={(e) => update("eventColor", e.target.value)}
                    disabled={isView}
                    placeholder="#0d6efd"
                    className="h-11"
                  />
                </div>
              </div>
            )}
          </SectionCard>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
            {/* Left column - 3/5 */}
            <div className="space-y-6 lg:col-span-3">
              <SectionCard icon={<AlignLeft className="h-4 w-4" />} title="Event details">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    disabled={isView}
                    placeholder="Enter a clear, descriptive title"
                    className="h-11"
                  />
                  {formErrors.title && (
                    <p className="text-sm text-destructive">{formErrors.title}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" /> Date
                    </Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => update("date", e.target.value)}
                      disabled={isView}
                      className="h-11"
                    />
                    {formErrors.eventDate && (
                      <p className="text-sm text-destructive">{formErrors.eventDate}</p>
                    )}
                  </div>
                  {form.type === "Public Holiday" ? (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" /> State
                      </Label>
                      <Input
                        value={form.state}
                        onChange={(e) => update("state", e.target.value)}
                        disabled={isView}
                        placeholder="e.g. Victoria"
                        className="h-11"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Users className="h-3.5 w-3.5" /> Access
                      </Label>
                      <Select
                        value={form.access}
                        onValueChange={(v) => update("access", v)}
                        disabled={isView}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accessOptions.map((a) => (
                            <SelectItem key={a} value={a}>
                              {a}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </SectionCard>

              {form.type !== "Public Holiday" && (
                <>
                  <SectionCard icon={<ImageIcon className="h-4 w-4" />} title="Media upload">
                    <label
                      className={`group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-primary/40 bg-gradient-to-b from-primary/5 to-transparent p-8 text-center transition-all hover:border-primary hover:bg-primary/10 ${isView ? "pointer-events-none opacity-60" : ""}`}
                    >
                      {form.media ? (
                        form.media.type === "pdf" ? (
                          <div className="flex items-center gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm">
                            <FileText className="h-10 w-10 text-primary" />
                            <div className="text-left">
                              <p className="text-sm font-semibold">{form.media.name}</p>
                              <p className="text-xs text-muted-foreground">PDF document</p>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={form.media.url}
                            alt="preview"
                            className="max-h-44 rounded-md shadow-sm"
                          />
                        )
                      ) : (
                        <>
                          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110">
                            <Upload className="h-7 w-7" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">
                              Select Image (png, jpeg, jpg) or PDF
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Only image and PDF allowed, up to 2MB per file
                            </p>
                          </div>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,application/pdf"
                        className="hidden"
                        onChange={handleFile}
                        disabled={isView}
                      />
                    </label>
                    {form.media && !isView && (
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => update("media", null)}
                        >
                          <X className="h-3.5 w-3.5" /> Remove file
                        </Button>
                      </div>
                    )}
                  </SectionCard>

                  <SectionCard icon={<Users className="h-4 w-4" />} title="Recipients">
                    <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Children <span className="text-destructive">*</span>
                    </Label>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                      <div>
                        <p className="text-sm font-medium">
                          {form.children.length === 0
                            ? "No children selected"
                            : `${form.children.length} children selected`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Pick specific children, groups or rooms
                        </p>
                      </div>
                      <Button type="button" disabled={isView} onClick={() => setPickerOpen(true)}>
                        <Plus className="h-4 w-4" /> Add Children
                      </Button>
                    </div>

                    {/* Display selected children with avatars */}
                    {form.childrenData?.length > 0 && (
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {form.childrenData.map((child) => (
                          <div
                            key={child.id}
                            className="flex items-center gap-3 rounded-xl border border-border bg-muted/10 p-3"
                          >
                            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center">
                              {child.imageUrl ? (
                                <img
                                  src={mediaUrl(child.imageUrl)}
                                  alt={`${child.name} ${child.lastname}`}
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    e.target.nextSibling.style.display = "flex";
                                  }}
                                />
                              ) : null}
                              <span
                                className="text-xs font-black text-primary"
                                style={{ display: child.imageUrl ? "none" : "flex" }}
                              >
                                {getInitials(child.name, child.lastname)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">
                                {child.name} {child.lastname}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {isLoadingChildren && (
                      <div className="mt-4 flex items-center justify-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        <span className="ml-2 text-sm text-muted-foreground">
                          Loading children...
                        </span>
                      </div>
                    )}

                    {formErrors.childId && (
                      <p className="text-sm text-destructive">{formErrors.childId}</p>
                    )}
                  </SectionCard>
                </>
              )}
            </div>

            {/* Right column - 2/5 - Description */}
            <div className="lg:col-span-2">
              <SectionCard
                icon={<AlignLeft className="h-4 w-4" />}
                title={form.type === "Public Holiday" ? "Holiday Status" : "Description"}
                className="lg:sticky lg:top-4"
              >
                {form.type === "Public Holiday" ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Status
                      </Label>
                      <Select
                        value={form.status}
                        onValueChange={(v) => update("status", v)}
                        disabled={isView}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Active</SelectItem>
                          <SelectItem value="0">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Marking a holiday as inactive will hide it from the calendar and list for
                      parents/staff.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Status
                        </Label>
                        <Select
                          value={form.status}
                          onValueChange={(v) => update("status", v)}
                          disabled={isView}
                        >
                          <SelectTrigger className="h-11">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Published">Published</SelectItem>
                            <SelectItem value="Draft">Draft</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {form.status === "Draft" 
                          ? "This event will be saved as a draft and won't be sent to parents/staff." 
                          : "This event will be published and sent to parents/staff."}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Description <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        value={form.description}
                        onChange={(e) => update("description", e.target.value)}
                        disabled={isView}
                        rows={18}
                        placeholder="Describe the event in detail…"
                        className="resize-none"
                      />
                      {formErrors.text && (
                        <p className="text-sm text-destructive">{formErrors.text}</p>
                      )}
                      <p className="text-right text-xs text-muted-foreground">
                        {form.description.length} characters
                      </p>
                    </div>
                  </>
                )}
              </SectionCard>
            </div>
          </div>

          {/* Sticky action bar */}
          {!isView && (
            <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <div className="mx-auto flex max-w-(--breakpoint-2xl) items-center justify-end gap-2 px-6 py-3">
                <Button type="button" variant="outline" onClick={() => navigate("/events")}>
                  Cancel
                </Button>
                <Button type="button" onClick={handleSave} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting
                    ? "Saving..."
                    : isEdit
                      ? `Update ${noun.toLowerCase()}`
                      : `Save ${noun.toLowerCase()}`}
                </Button>
              </div>
            </div>
          )}
        </form>
      )}

      <SelectChildrenModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        initial={form.children}
        onSubmit={(ids) => {
          update("children", ids);
          toast.success(`${ids.length} children selected`);
        }}
      />
    </div>
  );
}

function SectionCard({ icon, title, children, tone, className = "" }) {
  const isAccent = tone === "accent";
  return (
    <section className={`overflow-hidden rounded-xl border bg-card shadow-sm ${className}`}>
      <header
        className={`flex items-center gap-2 border-b px-5 py-3 ${
          isAccent ? "bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" : "bg-muted/30"
        }`}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          {icon}
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </header>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}
