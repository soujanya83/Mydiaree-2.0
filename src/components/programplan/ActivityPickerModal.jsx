import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { ChevronRight, ChevronDown, Search, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { observationService } from "@/services/learning/observationService";
import { cn } from "@/lib/utils";

const SUBJECT_MAP = {
  "practical-life": "Practical Life",
  math: "Maths",
  sensorial: "Sensorial",
  culture: "Cultural",
  language: "Language",
};

const norm = (str) => (str ? String(str).trim().toLowerCase() : "");

export function ActivityPickerModal({ open, subjectKey, initial = [], onClose, onSave }) {
  // Extract all initial titles
  const extractInitialTitles = useCallback((initialData) => {
    const titles = [];
    (initialData || []).forEach((group) => {
      if (typeof group === "string") {
        titles.push(group);
      } else if (group && group.items) {
        group.items.forEach((item) => {
          const title = typeof item === "string" ? item : item?.title || "";
          if (title) titles.push(title);
        });
      }
    });
    return titles;
  }, []);

  const [selected, setSelected] = useState(() => new Set(extractInitialTitles(initial)));
  const [openGroups, setOpenGroups] = useState({});
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activities, setActivities] = useState([]);
  const [subActivitiesMap, setSubActivitiesMap] = useState({});
  const [loadingGroups, setLoadingGroups] = useState({});

  const initialRef = useRef(initial);
  useEffect(() => {
    initialRef.current = initial;
  }, [initial]);

  // Sync selected state when modal opens
  useEffect(() => {
    if (open) {
      setSelected(new Set(extractInitialTitles(initialRef.current)));
    }
  }, [open, extractInitialTitles]);

  // Initial group map for lookup (activity title -> items)
  const initialMap = useMemo(() => {
    const map = new Map();
    (initial || []).forEach((group) => {
      if (typeof group === "string") {
        map.set(norm(group), { activity: group, items: [group] });
      } else if (group && group.activity) {
        const key = norm(group.activity);
        const rawItems = Array.isArray(group.items) ? group.items : [];
        const items = rawItems.map((item) => (typeof item === "string" ? item : item?.title || "")).filter(Boolean);
        map.set(key, { activity: group.activity, items });
      }
    });
    return map;
  }, [initial]);

  // Load subject activities and auto-expand / pre-fetch subactivities for pre-added items
  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        const subjectsRes = await observationService.getSubjects();
        if (subjectsRes.status && isMounted) {
          const targetName = SUBJECT_MAP[subjectKey];
          const subject = subjectsRes.data.find((s) => s.name === targetName);

          if (subject) {
            const activitiesRes = await observationService.getActivitiesBySubject(subject.idSubject);
            if (activitiesRes.status && isMounted) {
              const loadedActivities = activitiesRes.data || [];
              setActivities(loadedActivities);

              // Auto-expand activities that have pre-added subactivities
              const autoOpenMap = {};
              const toFetch = [];

              loadedActivities.forEach((act) => {
                const actNorm = norm(act.title);
                const currentInitial = initialRef.current || [];
                const hasMatchingInitial = currentInitial.some((g) => {
                  const gActNorm = norm(g?.activity);
                  const gItems = g?.items || (typeof g === "string" ? [g] : []);
                  return (
                    (gActNorm && gActNorm === actNorm && gItems.length > 0) ||
                    gItems.some((item) => norm(item) === actNorm)
                  );
                });

                if (hasMatchingInitial) {
                  autoOpenMap[act.idActivity] = true;
                  toFetch.push(act.idActivity);
                }
              });

              if (Object.keys(autoOpenMap).length > 0) {
                setOpenGroups((prev) => ({ ...prev, ...autoOpenMap }));
              }

              // Pre-fetch subactivities for pre-opened activities so checkboxes show as selected immediately
              toFetch.forEach(async (activityId) => {
                setLoadingGroups((p) => ({ ...p, [activityId]: true }));
                try {
                  const res = await observationService.getSubactivities(activityId);
                  if (res.status && isMounted) {
                    setSubActivitiesMap((p) => ({ ...p, [activityId]: res.data || [] }));
                  }
                } catch (error) {
                  console.error("Failed to load sub-activities for pre-added activity", error);
                } finally {
                  if (isMounted) {
                    setLoadingGroups((p) => ({ ...p, [activityId]: false }));
                  }
                }
              });
            }
          }
        }
      } catch (error) {
        console.error("Failed to load activities", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [open, subjectKey]);

  const toggleGroup = async (activityId) => {
    const isNowOpen = !openGroups[activityId];
    setOpenGroups((p) => ({ ...p, [activityId]: isNowOpen }));

    if (isNowOpen && !subActivitiesMap[activityId]) {
      setLoadingGroups((p) => ({ ...p, [activityId]: true }));
      try {
        const res = await observationService.getSubactivities(activityId);
        if (res.status) {
          setSubActivitiesMap((p) => ({ ...p, [activityId]: res.data || [] }));
        }
      } catch (error) {
        console.error("Failed to load sub-activities", error);
      } finally {
        setLoadingGroups((p) => ({ ...p, [activityId]: false }));
      }
    }
  };

  const isSelected = useCallback(
    (itemTitle) => {
      const targetNorm = norm(itemTitle);
      for (const val of selected) {
        if (norm(val) === targetNorm) return true;
      }
      return false;
    },
    [selected],
  );

  const toggleItem = (itemTitle) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const targetNorm = norm(itemTitle);
      let found = null;
      for (const val of next) {
        if (norm(val) === targetNorm) {
          found = val;
          break;
        }
      }
      if (found !== null) {
        next.delete(found);
      } else {
        next.add(itemTitle);
      }
      return next;
    });
  };

  const getSelectedCountForActivity = (activity) => {
    const actId = activity.idActivity;
    if (subActivitiesMap[actId]) {
      return (subActivitiesMap[actId] || []).filter((s) => isSelected(s.title)).length;
    }
    const initGroup = initialMap.get(norm(activity.title));
    if (initGroup) {
      return (initGroup.items || []).filter((item) => isSelected(item)).length;
    }
    return 0;
  };

  const filteredActivities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter((a) => a.title.toLowerCase().includes(q));
  }, [activities, search]);

  const handleSave = async () => {
    const result = [];
    const processedActivities = new Set();

    // 1. Process all activities from the subject
    activities.forEach((a) => {
      const actNorm = norm(a.title);
      processedActivities.add(actNorm);

      if (subActivitiesMap[a.idActivity]) {
        // Subactivities were loaded: user had visibility to check/uncheck
        const subItems = subActivitiesMap[a.idActivity] || [];
        const selectedInThisGroup = subItems.filter((s) => isSelected(s.title)).map((s) => s.title);
        if (selectedInThisGroup.length > 0) {
          result.push({
            activity: a.title,
            items: selectedInThisGroup,
          });
        }
      } else if (initialMap.has(actNorm)) {
        // Subactivities were NOT loaded (accordion remained closed):
        // Keep initial items that are still in `selected`
        const initGroup = initialMap.get(actNorm);
        const remaining = (initGroup.items || []).filter((item) => isSelected(item));
        if (remaining.length > 0) {
          result.push({
            activity: a.title,
            items: remaining,
          });
        }
      }
    });

    // 2. Preserve any initial group not found in activities list (custom / renamed)
    (initial || []).forEach((group) => {
      if (group && group.activity) {
        const actNorm = norm(group.activity);
        if (!processedActivities.has(actNorm)) {
          const rawItems = Array.isArray(group.items) ? group.items : [];
          const remaining = rawItems
            .map((item) => (typeof item === "string" ? item : item?.title || ""))
            .filter((item) => isSelected(item));

          if (remaining.length > 0) {
            result.push({
              activity: group.activity,
              items: remaining,
            });
          }
        }
      }
    });

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(result);
      }
    } catch (err) {
      console.error("Save selections error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSaving) onClose();
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">
            Select {SUBJECT_MAP[subjectKey] || "Subject"} Activities
          </h2>
          <button
            onClick={onClose}
            disabled={isSaving}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-border px-6 py-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search activities…"
              className="h-9 pl-9"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex h-32 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Loading activities...</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center text-muted-foreground">
              <p className="text-sm">No activities found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map((activity) => {
                const isOpen = !!openGroups[activity.idActivity];
                const subItems = subActivitiesMap[activity.idActivity] || [];
                const isLoadingSub = !!loadingGroups[activity.idActivity];
                const selectedCount = getSelectedCountForActivity(activity);

                return (
                  <div key={activity.idActivity} className="rounded-lg border border-border overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleGroup(activity.idActivity)}
                      className="flex w-full items-center gap-2 bg-muted/40 px-4 py-2.5 text-left hover:bg-muted/60 transition-colors"
                    >
                      {isOpen ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm font-semibold text-foreground">{activity.title}</span>
                      {selectedCount > 0 && (
                        <span className="ml-auto inline-flex items-center rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                          {selectedCount} selected
                        </span>
                      )}
                    </button>

                    {isOpen && (
                      <div className="bg-muted/10 px-8 py-2">
                        {isLoadingSub ? (
                          <div className="flex items-center gap-2 py-2 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Loading sub-activities...
                          </div>
                        ) : subItems.length === 0 ? (
                          <div className="py-2 text-xs text-muted-foreground">No sub-activities available.</div>
                        ) : (
                          <div className="space-y-1 py-1">
                            {subItems.map((sub) => {
                              const checked = isSelected(sub.title);
                              return (
                                <label
                                  key={sub.idSubActivity}
                                  className={cn(
                                    "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-primary/5 transition-colors",
                                    checked && "bg-primary/10 font-medium text-primary",
                                  )}
                                >
                                  <Checkbox
                                    checked={checked}
                                    onCheckedChange={() => toggleItem(sub.title)}
                                  />
                                  <span className="text-sm">{sub.title}</span>
                                </label>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save selections"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}