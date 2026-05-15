import { Printer, X, User, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { formatDob, formatSubmittedAt, sessionOptions, kinderOptions } from "./reEnrollmentData";

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-background/50 p-3 shadow-sm ring-1 ring-border/50 transition-colors hover:bg-background/80">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value || "--"}</span>
    </div>
  );
}

export default function ReEnrollmentDetailsModal({ open, onOpenChange, submission, onPrint, meta }) {
  const [isPrinting, setIsPrinting] = useState(false);
  if (!submission) return null;
  const submitted = formatSubmittedAt(submission.submittedAt);
  const sessionLabel = meta?.session_options[submission.session] || sessionOptions.find((s) => s.value === submission.session)?.label || submission.session;
  const kinderLabel = meta?.kinder_programs[submission.kinder] || kinderOptions.find((k) => k.value === submission.kinder)?.label || submission.kinder;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-[2rem] border-0 p-0 shadow-2xl">
        <DialogHeader className="bg-gradient-to-br from-slate-800 to-slate-900 px-8 py-6 text-white">
          <DialogTitle className="flex items-center gap-3 text-xl font-bold tracking-tight text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 shadow-inner backdrop-blur-md">
              <User className="h-5 w-5" />
            </span>
            Re-Enrollment Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 bg-muted/20 p-8 md:grid-cols-2">
          <div className="space-y-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/50">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <User className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold tracking-tight text-primary">Child Information</h3>
            </div>
            <div className="grid gap-3">
              <Field label="Name" value={submission.childName} />
              <Field label="Date of Birth" value={formatDob(submission.dob)} />
              <Field label="Parent Email" value={submission.parentEmail} />
            </div>
          </div>
          
          <div className="space-y-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/50">
            <div className="flex items-center gap-2 border-b border-border/50 pb-3">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold tracking-tight text-primary">Enrollment Details</h3>
            </div>
            <div className="grid gap-3">
              <Field
                label="Session"
                value={sessionLabel}
              />
              <Field
                label="Kinder"
                value={kinderLabel}
              />
              <Field
                label="Submitted"
                value={submitted ? `${submitted.date} ${submitted.time}` : "--"}
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4 rounded-2xl bg-card p-5 shadow-sm ring-1 ring-border/50">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Current Days (2025)</h3>
                <div className="flex flex-wrap gap-2">
                  {submission.currentDays?.length
                    ? submission.currentDays.map((d) => (
                        <span key={d} className="rounded-md bg-muted px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-foreground shadow-sm">
                          {d}
                        </span>
                      ))
                    : <span className="text-sm text-muted-foreground">--</span>}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Requested Days (2026)</h3>
                <div className="flex flex-wrap gap-2">
                  {submission.requestedDays?.length
                    ? submission.requestedDays.map((d) => (
                        <span key={d} className="rounded-md bg-warning/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-warning-foreground shadow-sm ring-1 ring-warning/30">
                          {d}
                        </span>
                      ))
                    : <span className="text-sm text-muted-foreground">--</span>}
                </div>
              </div>
            </div>
          </div>

          {submission.holidayPlans && (
            <div className="md:col-span-2 space-y-3 rounded-2xl bg-primary/5 p-5 ring-1 ring-primary/20">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-primary">Holiday Plans</h3>
              <p className="text-sm leading-relaxed text-foreground/90">{submission.holidayPlans}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3 bg-card px-8 py-4 sm:justify-end">
          <Button variant="outline" className="rounded-full px-6" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            className="rounded-full bg-primary px-6 hover:bg-primary/90" 
            disabled={isPrinting}
            onClick={async () => {
              if (onPrint) {
                setIsPrinting(true);
                await onPrint(submission.id);
                setIsPrinting(false);
              } else {
                window.print();
              }
            }}
          >
            {isPrinting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Printer className="mr-2 h-4 w-4" />
            )}
            Print Details
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}