import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddSubActivityModal({
  open,
  onClose,
  onSave,
  subjects = [],
  activities = [],
  defaultSubjectId,
  defaultActivityId,
}) {
  const [subjectId, setSubjectId] = useState(defaultSubjectId || "");
  const [activityId, setActivityId] = useState(defaultActivityId || "");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) {
      setSubjectId(defaultSubjectId || "");
      setActivityId(defaultActivityId || "");
      setTitle("");
    }
  }, [open, defaultSubjectId, defaultActivityId]);

  if (!open) return null;

  const canSave = subjectId && activityId && title.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">Add New Sub-Activity</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Montessori Subject</label>
            <Select
              value={String(subjectId)}
              onValueChange={(v) => {
                setSubjectId(Number(v));
                setActivityId("");
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.idSubject} value={String(s.idSubject)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Activity</label>
            <Select
              value={String(activityId)}
              onValueChange={(v) => setActivityId(Number(v))}
              disabled={!subjectId}
            >
              <SelectTrigger>
                <SelectValue placeholder={subjectId ? "Select an activity" : "Select a subject first"} />
              </SelectTrigger>
              <SelectContent>
                {activities.map((a) => (
                  <SelectItem key={a.idActivity} value={String(a.idActivity)}>{a.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Sub-Activity Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Folding napkins" />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button disabled={!canSave} onClick={() => onSave({ subject: subjectId, activity: activityId, title: title.trim() })}>
            Save Sub-Activity
          </Button>
        </div>
      </div>
    </div>
  );
}