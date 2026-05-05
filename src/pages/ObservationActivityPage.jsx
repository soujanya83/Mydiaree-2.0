import { useMemo, useState } from "react";
import { ChevronRight, Plus, PlusCircle, Building2, DoorOpen, ArrowLeft, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { OBSERVATION_TREE, slugify } from "@/components/observation/data";
import { AddActivityModal } from "@/components/observation/AddActivityModal";
import { AddSubActivityModal } from "@/components/observation/AddSubActivityModal";

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

export default function ObservationActivityPage() {
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();

  const [tree, setTree] = useState(OBSERVATION_TREE);

  // Drill-down state
  const [subjectKey, setSubjectKey] = useState(null);
  const [activityKey, setActivityKey] = useState(null);

  // Modals
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [addSubActivityOpen, setAddSubActivityOpen] = useState(false);

  const breadcrumbs = useMemo(() => {
    const crumbs = [
      { label: "Observation", to: "/observation" },
      { label: "Activities", to: subjectKey ? "/observation/activity" : null },
    ];
    if (subjectKey) {
      crumbs.push({
        label: tree[subjectKey].label,
        to: null,
      });
    }
    if (activityKey && subjectKey) {
      crumbs.push({
        label: tree[subjectKey].activities[activityKey].label,
      });
    }
    return crumbs;
  }, [subjectKey, activityKey, tree]);

  const handleAddActivity = ({ subject, title }) => {
    setTree((prev) => {
      const next = { ...prev };
      const subj = { ...next[subject] };
      const key = slugify(title) || `act-${Date.now()}`;
      subj.activities = { ...subj.activities, [key]: { label: title, subActivities: [] } };
      next[subject] = subj;
      return next;
    });
    setAddActivityOpen(false);
  };

  const handleAddSubActivity = ({ subject, activity, title }) => {
    setTree((prev) => {
      const next = { ...prev };
      const subj = { ...next[subject] };
      const act = { ...subj.activities[activity] };
      act.subActivities = [...act.subActivities, title];
      subj.activities = { ...subj.activities, [activity]: act };
      next[subject] = subj;
      return next;
    });
    setAddSubActivityOpen(false);
  };

  // ===== Render helpers =====

  const Tile = ({ label, onClick, accent = "primary" }) => (
    <button
      onClick={onClick}
      className={`group relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br from-amber-50/60 to-amber-100/40 px-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:from-amber-950/20 dark:to-amber-900/10 ${PATTERN_BG}`}
    >
      <span
        className={`relative z-10 text-base font-bold tracking-wide ${
          accent === "primary" ? "text-primary" : "text-emerald-600 dark:text-emerald-400"
        }`}
      >
        {label}
      </span>
      <ChevronRight className="absolute right-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground/60 transition group-hover:translate-x-0.5 group-hover:text-foreground" />
    </button>
  );

  const SubjectGrid = () => (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {Object.entries(tree).map(([key, subject]) => (
        <Tile key={key} label={subject.label} onClick={() => { setSubjectKey(key); setActivityKey(null); }} />
      ))}
    </div>
  );

  const ActivityGrid = () => {
    const subject = tree[subjectKey];
    const entries = Object.entries(subject.activities);
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setSubjectKey(null)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to subjects
          </Button>
          <span className="text-sm text-muted-foreground">{entries.length} activities</span>
        </div>
        {entries.length === 0 ? (
          <EmptyBlock label="No activities yet — add one to get started." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {entries.map(([key, a]) => (
              <Tile key={key} label={a.label} onClick={() => setActivityKey(key)} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const SubActivityGrid = () => {
    const activity = tree[subjectKey].activities[activityKey];
    return (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setActivityKey(null)}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to activities
          </Button>
          <span className="text-sm text-muted-foreground">
            {activity.subActivities.length} sub-activities
          </span>
        </div>
        {activity.subActivities.length === 0 ? (
          <EmptyBlock label="No sub-activities yet — add one using the button above." />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activity.subActivities.map((label) => (
              <Tile key={label} label={label} accent="success" onClick={() => {}} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const EmptyBlock = ({ label }) => (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
      <Sparkles className="mb-3 h-8 w-8 text-muted-foreground/60" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Activities"
        description="Browse Montessori subjects, activities, and sub-activities"
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <Button variant="outline" onClick={() => setAddActivityOpen(true)}>
              <PlusCircle className="mr-1.5 h-4 w-4 text-emerald-500" /> Add Activity
            </Button>
            <Button onClick={() => setAddSubActivityOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Sub-Activity
            </Button>
          </>
        }
      />

      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Select value={activeCentreId} onValueChange={setActiveCentre}>
            <SelectTrigger className="h-9 w-[260px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {centres.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DoorOpen className="h-4 w-4 text-muted-foreground" />
          <Select value={activeRoomId} onValueChange={setActiveRoom}>
            <SelectTrigger className="h-9 w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Body */}
      {!subjectKey && <SubjectGrid />}
      {subjectKey && !activityKey && <ActivityGrid />}
      {subjectKey && activityKey && <SubActivityGrid />}

      <AddActivityModal
        open={addActivityOpen}
        defaultSubject={subjectKey || ""}
        onClose={() => setAddActivityOpen(false)}
        onSave={handleAddActivity}
      />
      <AddSubActivityModal
        open={addSubActivityOpen}
        tree={tree}
        defaultSubject={subjectKey || ""}
        defaultActivity={activityKey || ""}
        onClose={() => setAddSubActivityOpen(false)}
        onSave={handleAddSubActivity}
      />
    </div>
  );
}
