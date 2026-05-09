import { useState, useMemo, useEffect } from "react";
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

export function ActivityPickerModal({ open, subjectKey, initial = [], onClose, onSave }) {
  const [selected, setSelected] = useState(() => {
    const titles = [];
    initial.forEach(group => {
      if (typeof group === 'string') titles.push(group);
      else if (group.items) titles.push(...group.items);
    });
    return new Set(titles);
  });
  const [openGroups, setOpenGroups] = useState({});
  const [search, setSearch] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [activities, setActivities] = useState([]);
  const [subActivitiesMap, setSubActivitiesMap] = useState({});
  const [loadingGroups, setLoadingGroups] = useState({});

  useEffect(() => {
    if (!open) return;

    async function loadData() {
      setLoading(true);
      try {
        const subjectsRes = await observationService.getSubjects();
        if (subjectsRes.status) {
          const targetName = SUBJECT_MAP[subjectKey];
          const subject = subjectsRes.data.find(s => s.name === targetName);
          
          if (subject) {
            const activitiesRes = await observationService.getActivitiesBySubject(subject.idSubject);
            if (activitiesRes.status) {
              setActivities(activitiesRes.data);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load activities", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [open, subjectKey]);

  const toggleGroup = async (activityId) => {
    const isNowOpen = !openGroups[activityId];
    setOpenGroups((p) => ({ ...p, [activityId]: isNowOpen }));

    if (isNowOpen && !subActivitiesMap[activityId]) {
      setLoadingGroups(p => ({ ...p, [activityId]: true }));
      try {
        const res = await observationService.getSubactivities(activityId);
        if (res.status) {
          setSubActivitiesMap(p => ({ ...p, [activityId]: res.data }));
        }
      } catch (error) {
        console.error("Failed to load sub-activities", error);
      } finally {
        setLoadingGroups(p => ({ ...p, [activityId]: false }));
      }
    }
  };

  const toggleItem = (itemTitle) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(itemTitle)) next.delete(itemTitle);
      else next.add(itemTitle);
      return next;
    });
  };

  const filteredActivities = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return activities;
    return activities.filter((a) => a.title.toLowerCase().includes(q));
  }, [activities, search]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">
            Select {SUBJECT_MAP[subjectKey] || "Subject"} Activities
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
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
                            {subItems.map((sub) => (
                              <label
                                key={sub.idSubActivity}
                                className={cn(
                                  "flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-primary/5 transition-colors",
                                  selected.has(sub.title) && "bg-primary/10"
                                )}
                              >
                                <Checkbox
                                  checked={selected.has(sub.title)}
                                  onCheckedChange={() => toggleItem(sub.title)}
                                />
                                <span className="text-sm text-foreground">{sub.title}</span>
                              </label>
                            ))}
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
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => {
              const result = [];
              activities.forEach(a => {
                const subItems = subActivitiesMap[a.idActivity] || [];
                const selectedInThisGroup = subItems.filter(s => selected.has(s.title)).map(s => s.title);
                if (selectedInThisGroup.length > 0) {
                  result.push({
                    activity: a.title,
                    items: selectedInThisGroup
                  });
                }
              });
              onSave(result);
            }}
          >
            Save selections
          </Button>
        </div>
      </div>
    </div>
  );
}