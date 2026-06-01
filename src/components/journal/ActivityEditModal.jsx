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
  Loader2,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

function nowHHMM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

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

// Define schema generator
const getValidationSchema = (key) => {
  const baseSchema = {
    comments: z.string().optional(),
  };

  if (key === "sleep") {
    return z.object({
      ...baseSchema,
      sleepTime: z.string().min(1, "Sleep time is required"),
      wakeTime: z.string().optional(),
    });
  }

  const schema = {
    ...baseSchema,
    time: z.string().min(1, "Time is required"),
  };

  if (["breakfast", "lunch", "late_snacks", "bottle"].includes(key)) {
    schema.item = z.string().min(1, `${key === "bottle" ? "Bottle details" : "Item"} is required`);
  }

  if (key === "lunch") {
    schema.serve = z.string().min(1, "Serve is required");
  }

  if (["sunscreen", "toileting"].includes(key)) {
    schema.signature = z.string().optional();
  }

  if (key === "toileting") {
    schema.status = z.string().min(1, "Status is required");
  }

  return z.object(schema);
};

export function ActivityEditModal({ open, onOpenChange, activityLabel, initial, onSave }) {
  const [isSaving, setIsSaving] = useState(false);

  const key = activityLabel?.toLowerCase().replace(/\s+/g, "_");
  const meta = activityMeta[key] || { icon: ClipboardEditIcon, hint: "Activity details" };
  const Icon = meta.icon;
  const isEdit = Boolean(initial?.id);

  const schema = getValidationSchema(key);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const watchServe = watch("serve");
  const watchStatus = watch("status");

  useEffect(() => {
    if (open) {
      const currentTime = nowHHMM();
      reset({
        time: initial?.time || currentTime,
        item: initial?.item || "",
        comments: initial?.comments || "",
        serve: String(initial?.serve ?? initial?.server ?? initial?.noOfServe ?? "1"),
        sleepTime: initial?.sleepTime || currentTime,
        wakeTime: initial?.wakeTime || "",
        signature: initial?.signature || "",
        status: initial?.status || "clean",
      });
    }
  }, [open, initial, reset]);

  const onSubmitForm = async (data) => {
    const payload = {
      comments: data.comments,
      ...(initial?.id ? { id: initial.id } : {}),
    };

    if (key === "sleep") {
      payload.sleepTime = data.sleepTime;
      payload.wakeTime = data.wakeTime;
    } else {
      payload.time = data.time;
    }

    if (["breakfast", "lunch", "late_snacks", "bottle"].includes(key)) {
      payload.item = data.item;
    }

    if (key === "lunch") {
      payload.serve = data.serve;
    }

    if (["sunscreen", "toileting"].includes(key)) {
      payload.signature = data.signature;
    }

    if (key === "toileting") {
      payload.status = data.status;
    }

    if (onSave) {
      setIsSaving(true);
      try {
        await onSave(payload);
        onOpenChange(false);
      } catch (error) {
        // Keep modal open on error
      } finally {
        setIsSaving(false);
      }
    } else {
      onOpenChange(false);
    }
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
          <form id="activity-form" onSubmit={handleSubmit(onSubmitForm)}>
            <section className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <ClipboardEditIcon className="h-4 w-4 text-primary" />
                Activity Details
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {key === "sleep" ? (
                  <>
                    <div className="space-y-1.5">
                      <Label>
                        Sleep Time <span className="text-red-500">*</span>
                      </Label>
                      <Input type="time" {...register("sleepTime")} />
                      {errors.sleepTime && (
                        <p className="text-red-500 text-xs">{errors.sleepTime.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label>Wake Time</Label>
                      <Input type="time" {...register("wakeTime")} />
                      {errors.wakeTime && (
                        <p className="text-red-500 text-xs">{errors.wakeTime.message}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="space-y-1.5">
                    <Label>
                      Time <span className="text-red-500">*</span>
                    </Label>
                    <Input type="time" {...register("time")} />
                    {errors.time && <p className="text-red-500 text-xs">{errors.time.message}</p>}
                  </div>
                )}

                {["breakfast", "lunch", "late_snacks", "bottle"].includes(key) && (
                  <div className="space-y-1.5">
                    <Label>
                      {key === "bottle" ? "Bottle Details" : "Item"}{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      {...register("item")}
                      placeholder={
                        key === "bottle" ? "e.g. 120ml formula" : "e.g. Toast with butter"
                      }
                    />
                    {errors.item && <p className="text-red-500 text-xs">{errors.item.message}</p>}
                  </div>
                )}
              </div>

              {key === "lunch" && (
                <div className="mt-4 space-y-2">
                  <Label>
                    No of Serve <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setValue("serve", String(val))}
                        className={cn(
                          "h-9 rounded-full border px-4 text-sm font-medium transition",
                          watchServe === String(val)
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-primary",
                        )}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  {errors.serve && <p className="text-red-500 text-xs">{errors.serve.message}</p>}
                </div>
              )}

              {key === "toileting" && (
                <div className="mt-4 space-y-2">
                  <Label>
                    Nappy Status <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {["clean", "wet", "soiled", "successfully"].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setValue("status", s)}
                        className={cn(
                          "h-9 rounded-full border px-4 text-sm font-medium capitalize transition",
                          watchStatus === s
                            ? "border-primary bg-primary text-primary-foreground shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/60 hover:text-primary",
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {errors.status && <p className="text-red-500 text-xs">{errors.status.message}</p>}
                </div>
              )}
            </section>

            <section className="mt-4 rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-foreground">
                <CheckIcon className="h-4 w-4 text-primary" />
                Family Note
              </div>

              {["sunscreen", "toileting"].includes(key) && (
                <div className="mb-4 space-y-1.5">
                  <Label>Signature (Optional)</Label>
                  <Input {...register("signature")} placeholder="Enter your name" />
                  {errors.signature && (
                    <p className="text-red-500 text-xs">{errors.signature.message}</p>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>Comments (Optional)</Label>
                <Textarea
                  rows={4}
                  {...register("comments")}
                  placeholder="Anything to share with families..."
                />
                {errors.comments && (
                  <p className="text-red-500 text-xs">{errors.comments.message}</p>
                )}
              </div>
            </section>
          </form>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border bg-card px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" form="activity-form" disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <CheckIcon className="mr-1.5 h-4 w-4" />
            )}
            Save {activityLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ActivityEditModal;
