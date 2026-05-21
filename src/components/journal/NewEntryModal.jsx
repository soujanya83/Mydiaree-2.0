import { useCallback, useEffect, useRef, useState } from "react";
import {
  Coffee,
  CupSoda,
  Utensils,
  BedDouble,
  Cookie,
  Apple,
  Sun,
  Baby,
  Milk,
  Search,
  Check,
  X,
  CalendarDays,
  Users,
  ClipboardEdit,
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { childrenService } from "@/services/centre/childrenService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

const ACTIVITIES = [
  { key: "breakfast", label: "Breakfast", icon: Coffee },
  { key: "morning_tea", label: "Morning Tea", icon: CupSoda },
  { key: "lunch", label: "Lunch", icon: Utensils },
  { key: "sleep", label: "Sleep", icon: BedDouble },
  { key: "afternoon_tea", label: "Afternoon Tea", icon: Cookie },
  { key: "late_snacks", label: "Late Snacks", icon: Apple },
  { key: "sunscreen", label: "Sunscreen", icon: Sun },
  { key: "toileting", label: "Toileting", icon: Baby },
  { key: "bottle", label: "Bottle", icon: Milk },
];

function childDisplayName(child) {
  const baseName = (child.first_name || child.name || "").trim();
  const familyName = (child.last_name || child.lastname || "").trim();

  if (familyName && !baseName.toLowerCase().endsWith(familyName.toLowerCase())) {
    return `${baseName} ${familyName}`.trim();
  }

  return baseName || familyName || "Child";
}

function childInitials(child) {
  return (childDisplayName(child) || "Child")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function childImageUrl(child) {
  const url = child?.imageUrl;
  if (!url) return null;
  return url.startsWith("http") ? url : `https://mydiaree.com.au/${url.replace(/^\/+/, "")}`;
}

function childFirstName(child) {
  return (child.first_name || child.name || "").trim() || "Child";
}

function childLastName(child) {
  return (child.last_name || child.lastname || "").trim();
}

const getValidationSchema = (activity) => {
  const baseSchema = {
    date: z.string().min(1, "Date is required"),
    children: z.array(z.union([z.string(), z.number()])).min(1, "Select at least one child"),
    notes: z.string().optional(),
  };

  if (activity === "sleep") {
    return z.object({
      ...baseSchema,
      time: z.string().min(1, "Sleep time is required"),
      wakeTime: z.string().optional(),
    });
  }

  const schema = {
    ...baseSchema,
    time: z.string().min(1, "Time is required"),
  };

  if (["breakfast", "lunch", "late_snacks", "bottle"].includes(activity)) {
    schema.item = z.string().min(1, `${activity === "bottle" ? "Bottle details" : "Item"} is required`);
  }

  if (activity === "lunch") {
    schema.serve = z.string().min(1, "Serve is required");
  }

  if (["sunscreen", "toileting"].includes(activity)) {
    schema.signature = z.string().optional();
  }

  if (activity === "toileting") {
    schema.status = z.string().min(1, "Status is required");
  }

  return z.object(schema);
};

const CHILDREN_PER_PAGE = 10;

function mergeById(current, next) {
  const map = new Map(current.map((c) => [c.id, c]));
  next.forEach((c) => map.set(c.id, c));
  return Array.from(map.values());
}

export function NewEntryModal({ open, onOpenChange, onSubmit, centerId: centerIdProp, roomId: roomIdProp }) {
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const activeRoomId = useRoomStore((s) => s.activeRoomId);
  const centerId = centerIdProp ?? activeCentreId;
  const roomId = roomIdProp ?? activeRoomId;

  const [children, setChildren] = useState([]);
  const [childrenPage, setChildrenPage] = useState(1);
  const [childrenTotalPages, setChildrenTotalPages] = useState(1);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const loadMoreObserver = useRef(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: (data, context, options) => {
      const schema = getValidationSchema(data.activity);
      return zodResolver(schema)(data, context, options);
    },
    defaultValues: {
      activity: "breakfast",
      date: new Date().toISOString().slice(0, 10),
      children: [],
      notes: "",
      time: nowHHMM(),
      wakeTime: "",
      item: "",
      serve: "1",
      signature: "",
      status: "clean",
    },
  });

  // Register custom fields that don't have direct ref bindings
  useEffect(() => {
    register("children");
  }, [register]);

  const activity = watch("activity");
  const selected = watch("children");
  const watchServe = watch("serve");
  const watchStatus = watch("status");

  const current = ACTIVITIES.find((a) => a.key === activity);
  const Icon = current.icon;

  const hasMoreChildren = childrenPage < childrenTotalPages;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setDebouncedSearch("");
      setChildrenPage(1);
      setChildren([]);
      setChildrenTotalPages(1);
      return;
    }
    setChildrenPage(1);
    setChildren([]);
  }, [open, debouncedSearch, centerId, roomId]);

  useEffect(() => {
    if (!open || !centerId || !roomId) return;

    let cancelled = false;

    const fetchChildrenPage = async () => {
      setIsLoadingChildren(true);
      try {
        const response = await childrenService.filterChildren({
          center_id: centerId,
          room_id: roomId,
          search: debouncedSearch || undefined,
          page: childrenPage,
          per_page: CHILDREN_PER_PAGE,
        });

        if (cancelled || !response.status) return;

        const pageData = response.data?.data || [];
        const lastPage =
          response.pagination?.last_page ?? response.data?.last_page ?? 1;

        setChildren((prev) =>
          childrenPage === 1 ? pageData : mergeById(prev, pageData),
        );
        setChildrenTotalPages(lastPage);
      } catch (error) {
        console.error("Failed to fetch children for entry modal", error);
      } finally {
        if (!cancelled) setIsLoadingChildren(false);
      }
    };

    fetchChildrenPage();
    return () => {
      cancelled = true;
    };
  }, [open, centerId, roomId, childrenPage, debouncedSearch]);

  const loadMoreChildren = useCallback(() => {
    if (isLoadingChildren || !hasMoreChildren) return;
    setChildrenPage((p) => p + 1);
  }, [isLoadingChildren, hasMoreChildren]);

  const loadMoreRef = useCallback(
    (node) => {
      if (isLoadingChildren) return;
      if (loadMoreObserver.current) loadMoreObserver.current.disconnect();
      loadMoreObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && childrenPage < childrenTotalPages) {
          loadMoreChildren();
        }
      });
      if (node) loadMoreObserver.current.observe(node);
    },
    [isLoadingChildren, childrenPage, childrenTotalPages, loadMoreChildren],
  );

  const allSelected =
    children.length > 0 && children.every((c) => selected.includes(c.id));

  const toggleChild = (id) => {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    setValue("children", next, { shouldValidate: true });
  };

  const toggleAll = () => {
    if (allSelected) {
      const next = selected.filter((id) => !children.some((c) => c.id === id));
      setValue("children", next, { shouldValidate: true });
    } else {
      const next = Array.from(new Set([...selected, ...children.map((c) => c.id)]));
      setValue("children", next, { shouldValidate: true });
    }
  };

  const handleChildrenScroll = (event) => {
    const target = event.currentTarget;
    if (target.scrollHeight - target.scrollTop <= target.clientHeight + 16) {
      loadMoreChildren();
    }
  };

  useEffect(() => {
    if (open) {
      setValue("time", nowHHMM());
      setValue("activity", "breakfast"); // Ensure it has a value on open
    }
  }, [open, setValue]);

  const onSubmitForm = async (data) => {
    const payload = {
      ...data,
      activity: activity, // Explicitly pass watched activity
    };
    console.log("Submitting NewEntryModal data:", payload);
    if (onSubmit) {
      setIsSaving(true);
      try {
        await onSubmit(payload);
        reset();
        onOpenChange(false);
      } catch (error) {
        // Keep open on error
      } finally {
        setIsSaving(false);
      }
    } else {
      reset();
      onOpenChange(false);
    }
  };

  const onValidationError = (errors) => {
    console.log("Validation Errors:", errors);
    const errorMessages = Object.values(errors)
      .map((err) => err.message)
      .join(", ");
    toast.error(`Please fix: ${errorMessages}`);
  };

  const valueLabel = activity === "bottle" ? "Volume (ml)" : `${current.label} Item`;

  const timeLabel =
    activity === "sleep"
      ? "Sleep Time"
      : activity === "sunscreen"
        ? "Applied At"
        : `${current.label} Time`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl gap-0 overflow-hidden p-0">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-5 pr-12">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary">
              <ClipboardEdit className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">Daily Diary</p>
              <h2 className="text-xl font-bold text-foreground">Add Activity Entry</h2>
              <p className="text-sm text-muted-foreground">
                Log one activity for one or more children.
              </p>
            </div>
          </div>
        </div>

        <div className="grid max-h-[75vh] grid-cols-1 bg-muted/20 md:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="border-b border-border bg-card p-4 md:border-b-0 md:border-r">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Activity Type
            </p>
            <ScrollArea className="md:h-[60vh]">
              <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
                {ACTIVITIES.map((a) => {
                  const ItemIcon = a.icon;
                  const active = a.key === activity;
                  return (
                    <button
                      key={a.key}
                      onClick={() => setValue("activity", a.key, { shouldValidate: true })}
                      className={cn(
                        "flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-all",
                        active
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-foreground/75 hover:border-primary/40 hover:text-primary",
                      )}
                    >
                      <ItemIcon className="h-4 w-4" />
                      <span className="truncate">{a.label}</span>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </aside>

          {/* Main content */}
          <ScrollArea className="md:h-[75vh]">
            <form id="new-entry-form" onSubmit={handleSubmit(onSubmitForm, onValidationError)} className="space-y-6 p-6">
              {/* Hidden inputs for custom fields to ensure they are registered and have values */}
              <input type="hidden" {...register("activity")} />
              <input type="hidden" {...register("serve")} />
              <input type="hidden" {...register("status")} />

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      Add {current.label} Entry
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Details adapt to the selected activity.
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">{selected.length} selected</Badge>
              </div>

              {/* General Info */}
              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <h4>General Information</h4>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Date <span className="text-red-500">*</span></Label>
                    <Input type="date" {...register("date")} />
                    {errors.date && (
                      <p className="text-red-500 text-xs">{errors.date.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Select Children <span className="text-red-500">*</span></Label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search children..."
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                    Select All
                  </label>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    {selected.length} selected
                  </span>
                </div>

                <div
                  className="h-[250px] overflow-y-auto rounded-xl border border-border bg-muted/20 p-2"
                  onScroll={handleChildrenScroll}
                >
                  {isLoadingChildren && children.length === 0 ? (
                    <div className="flex h-full items-center justify-center py-8 text-muted-foreground">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : children.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      {debouncedSearch
                        ? `No children match "${debouncedSearch}".`
                        : "No children found in this room."}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {children.map((c) => {
                        const isSel = selected.includes(c.id);
                        const firstName = childFirstName(c);
                        const lastName = childLastName(c);
                        const photoUrl = childImageUrl(c);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => toggleChild(c.id)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-2.5 text-left transition-all",
                              isSel
                                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                                : "border-border bg-card hover:border-primary/50",
                            )}
                          >
                            <Avatar className="h-9 w-9 shrink-0">
                              {photoUrl && (
                                <AvatarImage
                                  src={photoUrl}
                                  alt={childDisplayName(c)}
                                  className="object-cover"
                                />
                              )}
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {childInitials(c)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{firstName}</p>
                              {lastName ? (
                                <p className="truncate text-xs text-muted-foreground">{lastName}</p>
                              ) : null}
                            </div>
                            {isSel && (
                              <div className="rounded-full bg-primary p-1 text-primary-foreground">
                                <Check className="h-3 w-3" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                      {isLoadingChildren && children.length > 0 && (
                        <div className="col-span-full flex items-center justify-center py-3">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                      )}
                      {!isLoadingChildren && hasMoreChildren && (
                        <div ref={loadMoreRef} className="col-span-full py-1">
                          <button
                            type="button"
                            onClick={loadMoreChildren}
                            className="w-full rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
                          >
                            Load more
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.children && (
                  <p className="text-red-500 text-xs">{errors.children.message}</p>
                )}
              </section>

              {/* Activity Details */}
              <section className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <ClipboardEdit className="h-4 w-4 text-primary" />
                  <h4>Activity Details</h4>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>{timeLabel} <span className="text-red-500">*</span></Label>
                    <Input type="time" {...register("time")} />
                    {errors.time && (
                      <p className="text-red-500 text-xs">{errors.time.message}</p>
                    )}
                  </div>
                  {activity === "sleep" ? (
                    <div className="space-y-1.5">
                      <Label>Wake Time</Label>
                      <Input type="time" {...register("wakeTime")} />
                      {errors.wakeTime && (
                        <p className="text-red-500 text-xs">{errors.wakeTime.message}</p>
                      )}
                    </div>
                  ) : (
                    ["breakfast", "lunch", "late_snacks", "bottle"].includes(activity) && (
                      <div className="space-y-1.5">
                        <Label>{valueLabel} <span className="text-red-500">*</span></Label>
                        <Input
                          {...register("item")}
                          placeholder={`e.g. ${
                            activity === "bottle" ? "120ml formula" : "Toast with butter"
                          }`}
                        />
                        {errors.item && (
                          <p className="text-red-500 text-xs">{errors.item.message}</p>
                        )}
                      </div>
                    )
                  )}
                </div>

                {activity === "lunch" && (
                  <div className="space-y-1.5">
                    <Label>No of Serve <span className="text-red-500">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setValue("serve", String(val), { shouldValidate: true })}
                          className={cn(
                            "rounded-full border px-4 py-1.5 text-xs font-medium transition",
                            watchServe === String(val)
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
                          )}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                    {errors.serve && (
                      <p className="text-red-500 text-xs">{errors.serve.message}</p>
                    )}
                  </div>
                )}

                {activity === "toileting" && (
                  <div className="space-y-1.5">
                    <Label>Nappy Status <span className="text-red-500">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                      {["clean", "wet", "solid", "successfully"].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setValue("status", s, { shouldValidate: true })}
                          className={cn(
                            "rounded-full border px-4 py-1.5 text-xs font-medium capitalize transition",
                            watchStatus === s
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
                          )}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    {errors.status && (
                      <p className="text-red-500 text-xs">{errors.status.message}</p>
                    )}
                  </div>
                )}

                {["sunscreen", "toileting"].includes(activity) && (
                  <div className="space-y-1.5">
                    <Label>Signature (Optional)</Label>
                    <Input
                      {...register("signature")}
                      placeholder="Enter your name"
                    />
                    {errors.signature && (
                      <p className="text-red-500 text-xs">{errors.signature.message}</p>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    rows={3}
                    {...register("notes")}
                    placeholder="Anything to share with families..."
                  />
                  {errors.notes && (
                    <p className="text-red-500 text-xs">{errors.notes.message}</p>
                  )}
                </div>
              </section>
              {selected.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted/50 p-3 text-xs">
                  <span className="font-medium text-muted-foreground">Logging for:</span>
                  {selected.slice(0, 6).map((id) => {
                    const c = children.find((x) => x.id === id);
                    if (!c) return null;
                    return (
                      <Badge key={id} variant="secondary">
                        {childDisplayName(c)}
                      </Badge>
                    );
                  })}
                  {selected.length > 6 && (
                    <Badge variant="secondary">+{selected.length - 6} more</Badge>
                  )}
                </div>
              )}
            </form>
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-4">
          <p className="text-xs text-muted-foreground">
            {selected.length === 0
              ? "Select at least one child to continue."
              : `Ready to save for ${selected.length} ${
                  selected.length === 1 ? "child" : "children"
                }.`}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" form="new-entry-form" size="sm" disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-1.5 h-4 w-4" />
              )}
              Save Entry
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default NewEntryModal;
