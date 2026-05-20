import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ChevronRight,
  Plus,
  PlusCircle,
  Building2,
  DoorOpen,
  ArrowLeft,
  Sparkles,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const { rooms, activeRoomId, setActiveRoom, fetchRooms } = useRoomStore();

  const [subjects, setSubjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [subActivities, setSubActivities] = useState([]);

  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingSubActivities, setLoadingSubActivities] = useState(false);

  const [selectedSubjectId, setSelectedSubjectId] = useState(null);
  const [selectedActivityId, setSelectedActivityId] = useState(null);

  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const [addSubActivityOpen, setAddSubActivityOpen] = useState(false);
  const [editingSubActivity, setEditingSubActivity] = useState(null);

  const [deleteActivityId, setDeleteActivityId] = useState(null);
  const [deleteSubActivityId, setDeleteSubActivityId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeCentreId) fetchRooms(activeCentreId);
  }, [activeCentreId, fetchRooms]);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const response = await observationService.getSubjects();
        if (response.status) {
          setSubjects(response.data || []);
        } else {
          toast.error(response.message || "Failed to fetch subjects");
        }
      } catch {
        toast.error("Error fetching subjects");
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  const refetchActivities = useCallback(async () => {
    if (!selectedSubjectId) return;
    setLoadingActivities(true);
    try {
      const response = await observationService.getActivitiesBySubject(selectedSubjectId);
      if (response.status) {
        setActivities(Array.isArray(response.data) ? response.data : []);
      }
    } catch {
      toast.error("Error fetching activities");
    } finally {
      setLoadingActivities(false);
    }
  }, [selectedSubjectId]);

  const refetchSubActivities = useCallback(async () => {
    if (!selectedActivityId) return;
    setLoadingSubActivities(true);
    try {
      const response = await observationService.getSubactivities(selectedActivityId);
      if (response.status) {
        const raw = response.data;
        setSubActivities(Array.isArray(raw) ? raw : raw?.data || []);
      }
    } catch {
      toast.error("Error fetching sub-activities");
    } finally {
      setLoadingSubActivities(false);
    }
  }, [selectedActivityId]);

  useEffect(() => {
    if (!selectedSubjectId) {
      setActivities([]);
      return;
    }
    refetchActivities();
  }, [selectedSubjectId, refetchActivities]);

  useEffect(() => {
    if (!selectedActivityId) {
      setSubActivities([]);
      return;
    }
    refetchSubActivities();
  }, [selectedActivityId, refetchSubActivities]);

  const breadcrumbs = useMemo(() => {
    const crumbs = [
      { label: "Observation", to: "/observation" },
      { label: "Activities", to: selectedSubjectId ? "/observation/activity" : null },
    ];

    if (selectedSubjectId) {
      const subject = subjects.find((s) => String(s.idSubject) === String(selectedSubjectId));
      crumbs.push({
        label: subject ? subject.name : "Subject",
        to: null,
        onClick: () => {
          setSelectedSubjectId(selectedSubjectId);
          setSelectedActivityId(null);
        },
      });
    }

    if (selectedActivityId) {
      const activity = activities.find((a) => String(a.idActivity) === String(selectedActivityId));
      crumbs.push({
        label: activity ? activity.title : "Activity",
        to: null,
      });
    }
    return crumbs;
  }, [selectedSubjectId, selectedActivityId, subjects, activities]);

  const openAddActivity = () => {
    setEditingActivity(null);
    setAddActivityOpen(true);
  };

  const openEditActivity = (a) => {
    setEditingActivity({
      idActivity: a.idActivity,
      title: a.title,
      idSubject: selectedSubjectId,
    });
    setAddActivityOpen(true);
  };

  const openAddSubActivity = () => {
    setEditingSubActivity(null);
    setAddSubActivityOpen(true);
  };

  const openEditSubActivity = (sub) => {
    const parentTitle = activities.find((a) => String(a.idActivity) === String(selectedActivityId))?.title;
    setEditingSubActivity({
      idSubActivity: sub.idSubActivity,
      title: sub.title,
      idActivity: selectedActivityId,
      parentActivityTitle: parentTitle,
    });
    setAddSubActivityOpen(true);
  };

  const handleDeleteActivity = async () => {
    if (!deleteActivityId) return;
    setIsDeleting(true);
    try {
      const res = await observationService.deleteActivity(deleteActivityId);
      if (res.status === true || res.status === "true") {
        toast.success(res.message || "Activity deleted");
        if (String(deleteActivityId) === String(selectedActivityId)) {
          setSelectedActivityId(null);
        }
        await refetchActivities();
      } else {
        toast.error(res.message || "Delete failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteActivityId(null);
    }
  };

  const handleDeleteSubActivity = async () => {
    if (!deleteSubActivityId) return;
    setIsDeleting(true);
    try {
      const res = await observationService.deleteSubActivity(deleteSubActivityId);
      if (res.status === true || res.status === "true") {
        toast.success(res.message || "Sub-activity deleted");
        await refetchSubActivities();
      } else {
        toast.error(res.message || "Delete failed");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setIsDeleting(false);
      setDeleteSubActivityId(null);
    }
  };

  const Tile = ({ label, onClick, accent = "primary" }) => (
    <button
      type="button"
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
          <Tile
            key={subject.idSubject}
            label={subject.name}
            onClick={() => {
              setSelectedSubjectId(subject.idSubject);
              setSelectedActivityId(null);
            }}
          />
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
            <div
              key={a.idActivity}
              className="flex overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <button
                type="button"
                className={`flex min-h-24 flex-1 items-center justify-center px-4 text-center transition hover:bg-muted/40 ${PATTERN_BG}`}
                onClick={() => setSelectedActivityId(a.idActivity)}
              >
                <span className="text-base font-bold text-primary">{a.title}</span>
                <ChevronRight className="ml-2 h-5 w-5 shrink-0 text-muted-foreground/60" />
              </button>
              <div className="flex shrink-0 flex-col border-l border-border bg-muted/20">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-none"
                  title="Edit activity"
                  onClick={() => openEditActivity(a)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-none text-destructive hover:text-destructive"
                  title="Delete activity"
                  onClick={() => setDeleteActivityId(a.idActivity)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
        <span className="text-sm text-muted-foreground">{subActivities.length} sub-activities</span>
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
            <div
              key={sub.idSubActivity}
              className="flex overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <div
                className={`flex min-h-24 flex-1 items-center justify-center px-4 text-center ${PATTERN_BG}`}
              >
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">{sub.title}</span>
              </div>
              <div className="flex shrink-0 flex-col border-l border-border bg-muted/20">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-none"
                  title="Edit sub-activity"
                  onClick={() => openEditSubActivity(sub)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 rounded-none text-destructive hover:text-destructive"
                  title="Delete sub-activity"
                  onClick={() => setDeleteSubActivityId(sub.idSubActivity)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
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

  const activityModalOpen = addActivityOpen;
  const closeActivityModal = () => {
    setAddActivityOpen(false);
    setEditingActivity(null);
  };

  const subActivityModalOpen = addSubActivityOpen;
  const closeSubActivityModal = () => {
    setAddSubActivityOpen(false);
    setEditingSubActivity(null);
  };

  return (
    <div>
      <PageHeader
        title="Activities"
        description="Browse Montessori subjects, activities, and sub-activities"
        breadcrumbs={breadcrumbs}
        actions={
          <>
            <Button variant="outline" onClick={openAddActivity}>
              <PlusCircle className="mr-1.5 h-4 w-4 text-emerald-500" /> Add Activity
            </Button>
            <Button onClick={openAddSubActivity}>
              <Plus className="mr-1.5 h-4 w-4" /> Add Sub-Activity
            </Button>
          </>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <Select value={String(activeCentreId || "")} onValueChange={setActiveCentre}>
            <SelectTrigger className="h-9 w-[260px]">
              <SelectValue placeholder="Centre" />
            </SelectTrigger>
            <SelectContent>
              {centres.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <DoorOpen className="h-4 w-4 text-muted-foreground" />
          <Select value={activeRoomId != null ? String(activeRoomId) : ""} onValueChange={setActiveRoom}>
            <SelectTrigger className="h-9 w-[200px]">
              <SelectValue placeholder="Room" />
            </SelectTrigger>
            <SelectContent>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!selectedSubjectId && <SubjectGrid />}
      {selectedSubjectId && !selectedActivityId && <ActivityGrid />}
      {selectedSubjectId && selectedActivityId && <SubActivityGrid />}

      <AddActivityModal
        open={activityModalOpen}
        subjects={subjects}
        defaultSubjectId={selectedSubjectId}
        centerId={activeCentreId}
        editingActivity={editingActivity}
        onClose={closeActivityModal}
        onSuccess={() => {
          refetchActivities();
        }}
      />

      <AddSubActivityModal
        open={subActivityModalOpen}
        subjects={subjects}
        defaultSubjectId={selectedSubjectId}
        defaultActivityId={selectedActivityId}
        centerId={activeCentreId}
        editingSubActivity={editingSubActivity}
        onClose={closeSubActivityModal}
        onSuccess={() => {
          refetchSubActivities();
        }}
      />

      <AlertDialog open={!!deleteActivityId} onOpenChange={(o) => !o && !isDeleting && setDeleteActivityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this activity?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the activity and its related sub-activities. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteActivity}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteSubActivityId} onOpenChange={(o) => !o && !isDeleting && setDeleteSubActivityId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this sub-activity?</AlertDialogTitle>
            <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSubActivity}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
