import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { observationService } from "@/services/learning/observationService";

/**
 * @param {{ idSubActivity: number|string, title: string, idActivity?: number|string }|null} props.editingSubActivity
 */
export function AddSubActivityModal({
  open,
  onClose,
  subjects = [],
  defaultSubjectId,
  defaultActivityId,
  centerId,
  editingSubActivity = null,
  onSuccess,
}) {
  const isEdit = Boolean(editingSubActivity?.idSubActivity);
  const [subjectId, setSubjectId] = useState("");
  const [activityId, setActivityId] = useState("");
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open || isEdit) return;
    setSubjectId(defaultSubjectId != null ? String(defaultSubjectId) : "");
    setActivityId(defaultActivityId != null ? String(defaultActivityId) : "");
    setTitle("");
    setErrors({});
  }, [open, isEdit, defaultSubjectId, defaultActivityId]);

  useEffect(() => {
    if (!open || !isEdit || !editingSubActivity) return;
    setTitle(editingSubActivity.title || "");
    setActivityId(editingSubActivity.idActivity != null ? String(editingSubActivity.idActivity) : "");
    setErrors({});
  }, [open, isEdit, editingSubActivity]);

  useEffect(() => {
    if (!open || isEdit || !subjectId) {
      if (!isEdit) setActivities([]);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoadingActivities(true);
      try {
        const response = await observationService.getActivitiesBySubject(subjectId);
        if (cancelled) return;
        if (response.status) {
          setActivities(Array.isArray(response.data) ? response.data : []);
        } else {
          setActivities([]);
        }
      } catch {
        if (!cancelled) setActivities([]);
      } finally {
        if (!cancelled) setLoadingActivities(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, isEdit, subjectId]);

  const handleSubmit = async () => {
    setErrors({});
    if (isEdit) {
      if (!title.trim()) {
        setErrors({ title: "Title is required." });
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await observationService.updateSubActivity({
          idSubActivity: editingSubActivity.idSubActivity,
          title: title.trim(),
        });
        if (res.status === true || res.status === "true") {
          toast.success(res.message || "Sub-activity updated");
          onSuccess?.();
          onClose();
        } else if (res.errors) {
          setErrors({
            idSubActivity: res.errors.idSubActivity?.[0],
            title: res.errors.title?.[0],
          });
          toast.error(res.message || "Validation failed");
        } else {
          toast.error(res.message || "Update failed");
        }
      } catch (error) {
        const apiErrors = error?.response?.data?.errors;
        if (apiErrors) {
          setErrors({
            idSubActivity: apiErrors.idSubActivity?.[0],
            title: apiErrors.title?.[0],
          });
          toast.error(error?.response?.data?.message || "Validation failed");
        } else {
          toast.error(error?.response?.data?.message || "Update failed");
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!centerId) {
      toast.error("Please select a centre");
      return;
    }
    if (!activityId) {
      setErrors({ idActivity: "Activity ID is required." });
      return;
    }
    if (!title.trim()) {
      setErrors({ title: "Title is required." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await observationService.addSubActivity({
        idActivity: activityId,
        title: title.trim(),
        center_id: String(centerId),
      });
      if (res.status === true || res.status === "true") {
        toast.success(res.message || "Sub-activity added");
        onSuccess?.();
        onClose();
      } else if (res.errors) {
        setErrors({
          idActivity: res.errors.idActivity?.[0],
          title: res.errors.title?.[0],
          center_id: res.errors.center_id?.[0],
        });
        toast.error(res.message || "Validation failed");
      } else {
        toast.error(res.message || "Failed to add sub-activity");
      }
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors) {
        setErrors({
          idActivity: apiErrors.idActivity?.[0],
          title: apiErrors.title?.[0],
          center_id: apiErrors.center_id?.[0],
        });
        toast.error(error?.response?.data?.message || "Validation failed");
      } else {
        toast.error(error?.response?.data?.message || "Failed to add sub-activity");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const activityTitle =
    isEdit &&
    activities.find((a) => String(a.idActivity) === String(activityId))?.title;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit sub-activity" : "Add new sub-activity"}</DialogTitle>
          <DialogDescription>
            Fields marked with <span className="text-red-600">*</span> are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isEdit && (
            <>
              <div className="space-y-1.5">
                <Label>
                  Montessori subject <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={subjectId || undefined}
                  onValueChange={(v) => {
                    setSubjectId(v);
                    setActivityId("");
                    setErrors((e) => ({ ...e, idActivity: null }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.idSubject} value={String(s.idSubject)}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>
                  Activity <span className="text-red-600">*</span>
                </Label>
                <Select
                  value={activityId || undefined}
                  onValueChange={(v) => {
                    setActivityId(v);
                    setErrors((e) => ({ ...e, idActivity: null }));
                  }}
                  disabled={!subjectId || loadingActivities}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !subjectId
                          ? "Select a subject first"
                          : loadingActivities
                            ? "Loading activities…"
                            : "Select an activity"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {activities.map((a) => (
                      <SelectItem key={a.idActivity} value={String(a.idActivity)}>
                        {a.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.idActivity && <p className="text-sm text-destructive">{errors.idActivity}</p>}
              </div>
            </>
          )}

          {isEdit && (
            <div className="space-y-1">
              <Label className="text-muted-foreground">Activity</Label>
              <p className="text-sm font-medium">
                {editingSubActivity?.parentActivityTitle ||
                  (editingSubActivity?.idActivity ? `Activity #${editingSubActivity.idActivity}` : "—")}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="sub-activity-title">
              Sub-activity title <span className="text-red-600">*</span>
            </Label>
            <Input
              id="sub-activity-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              placeholder="e.g. Folding napkins"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          {!isEdit && errors.center_id && (
            <p className="text-sm text-destructive">{errors.center_id}</p>
          )}
          {errors.idSubActivity && <p className="text-sm text-destructive">{errors.idSubActivity}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEdit ? "Save changes" : "Add sub-activity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
