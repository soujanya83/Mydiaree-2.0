import { Printer, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { formatDob, formatSubmittedAt, sessionOptions, kinderOptions } from "./reEnrollmentData";

function Field({ label, value }) {
  return (
    <div className="grid grid-cols-[110px_1fr] gap-2 text-sm">
      <span className="font-semibold text-foreground">{label}</span>
      <span className="text-foreground/90">{value || "--"}</span>
    </div>
  );
}

export default function ReEnrollmentDetailsModal({ open, onOpenChange, submission }) {
  if (!submission) return null;
  const submitted = formatSubmittedAt(submission.submittedAt);
  const sessionLabel = sessionOptions.find((s) => s.value === submission.session);
  const kinderLabel = kinderOptions.find((k) => k.value === submission.kinder);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="bg-gradient-to-r from-primary/90 to-primary px-6 py-4 text-primary-foreground">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-primary-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
              <User className="h-4 w-4" />
            </span>
            Re-Enrollment Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary">Child Information</h3>
            <Field label="Name:" value={submission.childName} />
            <Field label="Date of Birth:" value={formatDob(submission.dob)} />
            <Field label="Parent Email:" value={submission.parentEmail} />
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-primary">Enrollment Details</h3>
            <Field
              label="Session:"
              value={sessionLabel ? `${sessionLabel.label} (${sessionLabel.time})` : submission.session}
            />
            <Field
              label="Kinder:"
              value={kinderLabel?.label || submission.kinder}
            />
            <Field
              label="Submitted:"
              value={submitted ? `${submitted.date} ${submitted.time}` : "--"}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <h3 className="text-sm font-bold text-primary">Current Days (2025)</h3>
            <p className="text-sm text-foreground/90">
              {submission.currentDays?.length
                ? submission.currentDays.map((d) => d.toLowerCase()).join(", ")
                : "--"}
            </p>
          </div>

          <div className="md:col-span-2 space-y-2">
            <h3 className="text-sm font-bold text-primary">Requested Days (2026)</h3>
            <p className="text-sm text-foreground/90">
              {submission.requestedDays?.length
                ? submission.requestedDays.map((d) => d.toLowerCase()).join(", ")
                : "--"}
            </p>
          </div>

          {submission.holidayPlans && (
            <div className="md:col-span-2 space-y-2">
              <h3 className="text-sm font-bold text-primary">Holiday Plans</h3>
              <p className="text-sm text-foreground/90">{submission.holidayPlans}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 border-t bg-muted/30 px-6 py-3">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            <X className="h-4 w-4" /> Close
          </Button>
          <Button onClick={() => window.print()}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}