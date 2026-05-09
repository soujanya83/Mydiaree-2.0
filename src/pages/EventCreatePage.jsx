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
import { useCentreStore } from "@/stores/centreStore";
import { mapAnnouncementRecord, toApiAudience, toApiType } from "@/components/events/eventMappers";

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
    state: "",
    status: "1",
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    if (!activeCentreId && !isHoliday) return;

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
                date: existing.Holiday_date ? existing.Holiday_date.split("T")[0] : new Date(new Date().getFullYear(), existing.month - 1, existing.date + 1).toISOString().split("T")[0],
                access: "All",
                description: "",
                eventColor: "#0d6efd",
                media: null,
                children: [],
                state: existing.state || "",
                status: String(existing.status),
              });
            }
          }
        } else {
          const res = await announcementService.getAnnouncements(activeCentreId);
          if (res.status) {
            const existing = (res.data?.records || [])
              .map(mapAnnouncementRecord)
              .find((e) => e.id === String(id));
            if (existing) {
              setForm({
                type: existing.type,
                title: existing.title,
                date: existing.date,
                access: existing.access,
                description: existing.description || "",
                eventColor: existing.eventColor || "#0d6efd",
                media: existing.media || null,
                children: existing.children || [],
                state: "",
                status: "1",
              });
            }
          }
        }
      } catch (error) {
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, isHoliday, activeCentreId]);

  useEffect(() => {
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
      });
    }
  }, [presetType]);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
    formData.append("eventDate", form.date);
    formData.append("text", form.description || "");
    form.children.forEach((childId) => formData.append("childId[]", childId));
    if (form.media?.file) formData.append("media[]", form.media.file);
    formData.append("type", toApiType(form.type));
    formData.append("audience", toApiAudience(form.access));
    formData.append("eventColor", form.type === "Events" ? form.eventColor : "");
    return formData;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!activeCentreId && form.type !== "Public Holiday") {
      toast.error("Please select a centre first");
      return;
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
          toast.error(res.message || `Failed to ${isEdit ? "update" : "create"} event`);
          return;
        }
        toast.success(res.message || (isEdit ? `${label} updated` : `${label} created`));
        navigate("/events");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || `Failed to ${isEdit ? "update" : "create"} ${label.toLowerCase()}`,
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
                      <Select value={form.status} onValueChange={(v) => update("status", v)} disabled={isView}>
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
                      Marking a holiday as inactive will hide it from the calendar and list for parents/staff.
                    </p>
                  </div>
                ) : (
                  <>
                    <Textarea
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                      disabled={isView}
                      rows={18}
                      placeholder="Describe the event in detail…"
                      className="resize-none"
                    />
                    <p className="text-right text-xs text-muted-foreground">
                      {form.description.length} characters
                    </p>
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
                  {isSubmitting ? "Saving..." : isEdit ? `Update ${noun.toLowerCase()}` : `Save ${noun.toLowerCase()}`}
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
