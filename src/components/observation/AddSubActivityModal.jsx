import { useEffect, useMemo, useState } from "react";
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

export function AddSubActivityModal({ open, onClose, onSave, tree, defaultSubject, defaultActivity }) {
  const [subject, setSubject] = useState(defaultSubject || "");
  const [activity, setActivity] = useState(defaultActivity || "");
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) {
      setSubject(defaultSubject || "");
      setActivity(defaultActivity || "");
      setTitle("");
    }
  }, [open, defaultSubject, defaultActivity]);

  const activities = useMemo(() => {
    if (!subject || !tree[subject]) return [];
    return Object.entries(tree[subject].activities);
  }, [subject, tree]);

  if (!open) return null;

  const canSave = subject && activity && title.trim();

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
              value={subject}
              onValueChange={(v) => { setSubject(v); setActivity(""); }}
            >
              <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
              <SelectContent>
                {Object.entries(tree).map(([key, s]) => (
                  <SelectItem key={key} value={key}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-foreground">Activity</label>
            <Select value={activity} onValueChange={setActivity} disabled={!subject}>
              <SelectTrigger>
                <SelectValue placeholder={subject ? "Select an activity" : "Select a subject first"} />
              </SelectTrigger>
              <SelectContent>
                {activities.map(([key, a]) => (
                  <SelectItem key={key} value={key}>{a.label}</SelectItem>
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
          <Button disabled={!canSave} onClick={() => onSave({ subject, activity, title: title.trim() })}>
            Save Sub-Activity
          </Button>
        </div>
      </div>
    </div>
  );
}