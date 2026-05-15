import { useEffect, useState } from "react";
import {
  Baby as BabyIcon,
  BedDouble as BedDoubleIcon,
  Check as CheckIcon,
  ClipboardEdit as ClipboardEditIcon,
  Coffee as CoffeeIcon,
  Cookie as CookieIcon,
  Milk as MilkIcon,
  Sun as SunIcon,
  Utensils as UtensilsIcon,
  CupSoda as CupSodaIcon,
  Apple as AppleIcon,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const activityMeta = {
  breakfast: { icon: CoffeeIcon, hint: "Meal details and family notes" },
  morning_tea: { icon: CupSodaIcon, hint: "Morning snack update" },
  lunch: { icon: UtensilsIcon, hint: "Lunch time, item and serves" },
  sleep: { icon: BedDoubleIcon, hint: "Rest period start and wake time" },
  afternoon_tea: { icon: CookieIcon, hint: "Afternoon snack update" },
  late_snacks: { icon: AppleIcon, hint: "Late snack details" },
  sunscreen: { icon: SunIcon, hint: "Application time and signature" },
  toileting: { icon: BabyIcon, hint: "Toileting status and notes" },
  bottle: { icon: MilkIcon, hint: "Bottle time and volume details" },
};

export function ActivityEditModal({ open, onOpenChange, activityLabel, initial, onSave }) {
  const [time, setTime] = useState("");
  const [item, setItem] = useState("");
  const [comments, setComments] = useState("");
  const [serve, setServe] = useState("1");
  const [sleepTime, setSleepTime] = useState("");
  const [wakeTime, setWakeTime] = useState("");
  const [signature, setSignature] = useState("");
  const [status, setStatus] = useState("clean");

  const key = activityLabel?.toLowerCase().replace(/\s+/g, "_");
  const meta = activityMeta[key] || { icon: ClipboardEditIcon, hint: "Activity details" };
  const Icon = meta.icon;
  const isEdit = Boolean(initial?.id);

  useEffect(() => {
    if (open) {
      setTime(initial?.time || "");
      setItem(initial?.item || "");
      setComments(initial?.comments || "");
      setServe(String(initial?.serve ?? initial?.server ?? initial?.noOfServe ?? "1"));
      setSleepTime(initial?.sleepTime || "");
      setWakeTime(initial?.wakeTime || "");
      setSignature(initial?.signature || "");
      setStatus(initial?.status || "clean");
    }
  }, [open, initial]);

  const handleSave = () => {
    const payload = {
      comments,
      ...(initial?.id ? { id: initial.id } : {}),
    };

    if (key === "sleep") {
      payload.sleepTime = sleepTime;
      payload.wakeTime = wakeTime;
    } else {
      payload.time = time;
    }

    if (["breakfast", "lunch", "late_snacks", "bottle"].includes(key)) {
      payload.item = item;
    }

    if (key === "lunch") {
      payload.serve = serve;
    }

    if (["sunscreen", "toileting"].includes(key)) {
      payload.signature = signature;
    }

    if (key === "toileting") {
      payload.status = status;
    }

    onSave?.(payload);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <div className="border-b border-border bg-card px-6 py-5 pr-12">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {isEdit ? "Edit activity" : "Add activity"}
              </p>
              <h2 className="text-xl font-bold text-foreground">{activityLabel}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{meta.hint}</p>
            </div>
          </div>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto bg-muted/20 p-6">
          <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <ClipboardEditIcon className="h-4 w-4 text-primary" />
              Activity Details
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {key === "sleep" ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Sleep Time</Label>
                    <Input
                      type="time"
                      value={sleepTime}
                      onChange={(e) => setSleepTime(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Wake Time</Label>
                    <Input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <Label>Time</Label>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </div>
              )}

              {["breakfast", "lunch", "late_snacks", "bottle"].includes(key) && (
                <div className="space-y-1.5">
                  <Label>{key === "bottle" ? "Bottle Details" : "Item"}</Label>
                  <Input
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    placeholder={key === "bottle" ? "e.g. 120ml formula" : "e.g. Toast with butter"}
                  />
                </div>
              )}
            </div>

            {key === "lunch" && (
              <div className="mt-4 space-y-2">
                <Label>No of Serve</Label>
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setServe(String(val))}
                      className={cn(
                        "h-9 rounded-full border px-4 text-sm font-medium transition",
                        serve === String(val)
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-primary",
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {key === "toileting" && (
              <div className="mt-4 space-y-2">
                <Label>Nappy Status</Label>
                <div className="flex flex-wrap gap-2">
                  {["clean", "wet", "solid", "successfully"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(s)}
                      className={cn(
                        "h-9 rounded-full border px-4 text-sm font-medium capitalize transition",
                        status === s
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-primary",
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
              <CheckIcon className="h-4 w-4 text-primary" />
              Family Note
            </div>

            {["sunscreen", "toileting"].includes(key) && (
              <div className="mb-4 space-y-1.5">
                <Label>Signature (Optional)</Label>
                <Input
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label>Comments (Optional)</Label>
              <Textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Anything to share with families..."
              />
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-card px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <CheckIcon className="mr-1.5 h-4 w-4" />
            Save {activityLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ActivityEditModal;
