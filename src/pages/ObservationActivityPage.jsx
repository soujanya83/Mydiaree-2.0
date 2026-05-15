import { useEffect, useMemo, useState, useCallback } from "react";
import { ChevronRight, Plus, PlusCircle, Building2, DoorOpen, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
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
import { observationService } from "@/services/learning/observationService";
import { AddActivityModal } from "@/components/observation/AddActivityModal";
import { AddSubActivityModal } from "@/components/observation/AddSubActivityModal";
import { toast } from "sonner";

const PATTERN_BG =
  "bg-[radial-gradient(circle_at_1px_1px,hsl(var(--muted-foreground)/0.18)_1px,transparent_0)] [background-size:18px_18px]";

export default function ObservationActivityPage() {
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();

  // Data state
  const [subjects, setSubjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [subActivities, setSubActivities] = useState([]);
  
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingSubActivities, setLoadingSubActivities] = useState(false);

  // Drill-down state
  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  // Modals
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [addSubActivityOpen, setAddSubActivityOpen] = useState(false);

  // Fetch subjects on mount
  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const response = await observationService.getSubjects();
        if (response.status) {
          setSubjects(response.data);
        } else {
          toast.error(response.message || "Failed to fetch subjects");
        }
      } catch (error) {
        toast.error("Error fetching subjects");
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch activities when subject changes
  useEffect(() => {
    if (!selectedSubjectId) {
      setActivities([]);
      return;
    }

    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const response = await observationService.getActivitiesBySubject(selectedSubjectId);
        if (response.status) {
          setActivities(response.data);
        } else {
          toast.error(response.message || "Failed to fetch activities");
        }
      } catch (error) {
        toast.error("Error fetching activities");
      } finally {
        setLoadingActivities(false);
      }
    };
    fetchActivities();
  }, [selectedSubjectId]);

  // Fetch sub-activities when activity changes
  useEffect(() => {
    if (!selectedActivityId) {
      setSubActivities([]);
      return;
    }

    const fetchSubActivities = async () => {
      setLoadingSubActivities(true);
      try {
        const response = await observationService.getSubactivities(selectedActivityId);
        if (response.status) {
          setSubActivities(response.data);
        } else {
          toast.error(response.message || "Failed to fetch sub-activities");
        }
      } catch (error) {
        toast.error("Error fetching sub-activities");
      } finally {
        setLoadingSubActivities(false);
      }
    };
    fetchSubActivities();
  }, [selectedActivityId]);

  const breadcrumbs = useMemo(() => {
    const crumbs = [
      { label: "Observation", to: "/observation" },
      { label: "Activities", to: selectedSubjectId ? "/observation/activity" : null },
    ];
    
    if (selectedSubjectId) {
      const subject = subjects.find(s => s.idSubject === selectedSubjectId);
      crumbs.push({
        label: subject ? subject.name : "Subject",
        to: null,
        onClick: () => {
          setSelectedSubjectId(selectedSubjectId);
          setSelectedActivityId(null);
        }
      });
    }
    
    if (selectedActivityId) {
      const activity = activities.find(a => a.idActivity === selectedActivityId);
      crumbs.push({
        label: activity ? activity.title : "Activity",
        to: null
      });
    }
    return crumbs;
  }, [selectedSubjectId, selectedActivityId, subjects, activities]);

  const handleAddActivity = ({ subject, title }) => {
    // For now, just a placeholder as we don't have the save API integrated yet
    toast.success(`Activity "${title}" added to subject ID ${subject}`);
    setAddActivityOpen(false);
    // Ideally refetch activities if selectedSubjectId === subject
  };

  const handleAddSubActivity = ({ subject, activity, title }) => {
    // For now, just a placeholder
    toast.success(`Sub-activity "${title}" added to activity ID ${activity}`);
    setAddSubActivityOpen(false);
    // Ideally refetch sub-activities if selectedActivityId === activity
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
      {loadingSubjects ? (
        <div className="col-span-full flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        subjects.map((subject) => (
          <Tile key={subject.idSubject} label={subject.name} onClick={() => { setSelectedSubjectId(subject.idSubject); setSelectedActivityId(null); }} />
        ))
      )}
    </div>
  );

  const ActivityGrid = () => (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setSelectedSubjectId(null)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to subjects
        </Button>
        <span className="text-sm text-muted-foreground">{activities.length} activities</span>
      </div>
      {loadingActivities ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : activities.length === 0 ? (
        <EmptyBlock label="No activities yet — add one to get started." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {activities.map((a) => (
            <Tile key={a.idActivity} label={a.title} onClick={() => setSelectedActivityId(a.idActivity)} />
          ))}
        </div>
      )}
    </div>
  );

  const SubActivityGrid = () => (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => setSelectedActivityId(null)}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to activities
        </Button>
        <span className="text-sm text-muted-foreground">
          {subActivities.length} sub-activities
        </span>
      </div>
      {loadingSubActivities ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : subActivities.length === 0 ? (
        <EmptyBlock label="No sub-activities yet — add one using the button above." />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {subActivities.map((sub) => (
            <Tile key={sub.idSubActivity} label={sub.title} accent="success" onClick={() => {}} />
          ))}
        </div>
      )}
    </div>
  );

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
      {!selectedSubjectId && <SubjectGrid />}
      {selectedSubjectId && !selectedActivityId && <ActivityGrid />}
      {selectedSubjectId && selectedActivityId && <SubActivityGrid />}

      <AddActivityModal
        open={addActivityOpen}
        subjects={subjects}
        defaultSubjectId={selectedSubjectId}
        onClose={() => setAddActivityOpen(false)}
        onSave={handleAddActivity}
      />
      <AddSubActivityModal
        open={addSubActivityOpen}
        subjects={subjects}
        activities={activities}
        defaultSubjectId={selectedSubjectId}
        defaultActivityId={selectedActivityId}
        onClose={() => setAddSubActivityOpen(false)}
        onSave={handleAddSubActivity}
      />
    </div>
  );
}
