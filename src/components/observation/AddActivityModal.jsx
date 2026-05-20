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
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {{ idSubject: number|string, name?: string }[]} props.subjects
 * @param {number|string|null|undefined} props.defaultSubjectId
 * @param {number|string|null|undefined} props.centerId — required for create
 * @param {{ idActivity: number|string, title: string, idSubject?: number|string }|null} props.editingActivity — when set, update mode
 * @param {() => void} [props.onSuccess]
 */
export function AddActivityModal({
  open,
  onClose,
  subjects = [],
  defaultSubjectId,
  centerId,
  editingActivity = null,
  onSuccess,
}) {
  const isEdit = Boolean(editingActivity?.idActivity);
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    if (isEdit) {
      setSubjectId(editingActivity.idSubject != null ? String(editingActivity.idSubject) : "");
      setTitle(editingActivity.title || "");
    } else {
      setSubjectId(defaultSubjectId != null ? String(defaultSubjectId) : "");
      setTitle("");
    }
  }, [open, isEdit, editingActivity, defaultSubjectId]);

  const handleSubmit = async () => {
    setErrors({});
    if (isEdit) {
      if (!title.trim()) {
        setErrors({ title: "Title is required." });
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await observationService.updateActivity({
          idActivity: editingActivity.idActivity,
          title: title.trim(),
        });
        if (res.status === true || res.status === "true") {
          toast.success(res.message || "Activity updated");
          onSuccess?.();
          onClose();
        } else if (res.errors) {
          setErrors({
            idActivity: res.errors.idActivity?.[0],
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
            idActivity: apiErrors.idActivity?.[0],
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
    if (!subjectId) {
      setErrors({ idSubject: "Subject ID is required." });
      return;
    }
    if (!title.trim()) {
      setErrors({ title: "Title is required." });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await observationService.addActivity({
        idSubject: subjectId,
        title: title.trim(),
        center_id: String(centerId),
      });
      if (res.status === true || res.status === "true") {
        toast.success(res.message || "Activity added");
        onSuccess?.();
        onClose();
      } else if (res.errors) {
        setErrors({
          idSubject: res.errors.idSubject?.[0],
          title: res.errors.title?.[0],
          center_id: res.errors.center_id?.[0],
        });
        toast.error(res.message || "Validation failed");
      } else {
        toast.error(res.message || "Failed to add activity");
      }
    } catch (error) {
      const apiErrors = error?.response?.data?.errors;
      if (apiErrors) {
        setErrors({
          idSubject: apiErrors.idSubject?.[0],
          title: apiErrors.title?.[0],
          center_id: apiErrors.center_id?.[0],
        });
        toast.error(error?.response?.data?.message || "Validation failed");
      } else {
        toast.error(error?.response?.data?.message || "Failed to add activity");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit activity" : "Add new activity"}</DialogTitle>
          <DialogDescription>
            Fields marked with <span className="text-red-600">*</span> are required.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {!isEdit && (
            <div className="space-y-1.5">
              <Label>
                Montessori subject <span className="text-red-600">*</span>
              </Label>
              <Select value={subjectId || undefined} onValueChange={(v) => { setSubjectId(v); setErrors((e) => ({ ...e, idSubject: null })); }}>
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
              {errors.idSubject && <p className="text-sm text-destructive">{errors.idSubject}</p>}
            </div>
          )}

          {isEdit && editingActivity?.idSubject != null && (
            <div className="space-y-1">
              <Label className="text-muted-foreground">Subject</Label>
              <p className="text-sm font-medium">
                {subjects.find((s) => String(s.idSubject) === String(editingActivity.idSubject))?.name ||
                  `Subject #${editingActivity.idSubject}`}
              </p>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="activity-title">
              Activity title <span className="text-red-600">*</span>
            </Label>
            <Input
              id="activity-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
              }}
              placeholder="e.g. Polishing brass"
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          {!isEdit && errors.center_id && (
            <p className="text-sm text-destructive">{errors.center_id}</p>
          )}
          {errors.idActivity && <p className="text-sm text-destructive">{errors.idActivity}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isEdit ? "Save changes" : "Add activity"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
