import {
  ArrowLeft,
  Download,
  Send,
  FileText,
  User2,
  Baby,
  AlertTriangle,
  Activity,
  CheckCircle2,
  Bell,
  StickyNote,
  Pencil,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useChildrenStore } from "@/stores/childrenStore";
import { toast } from "sonner";
import { IMG_BASE_API } from "../../api/imageapi";
import { cn } from "@/lib/utils";

const SECTIONS = [
  { key: "recorder", title: "Details of person completing this record", icon: User2 },
  { key: "child", title: "Child Details", icon: Baby },
  { key: "incident", title: "Incident Details", icon: AlertTriangle },
  { key: "nature", title: "Nature of Injury / Trauma / Illness", icon: Activity },
  { key: "action", title: "Action Taken", icon: CheckCircle2 },
  { key: "parent", title: "Step 3: Parent/Guardian Notifications", icon: Bell },
  { key: "internal", title: "Internal Notifications", icon: Bell },
  { key: "external", title: "External Notifications", icon: Bell },
  { key: "ack", title: "Parental acknowledgement", icon: CheckCircle2 },
  { key: "notes", title: "Additional notes", icon: StickyNote },
];

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  return imageUrl.startsWith("http") ? imageUrl : `${IMG_BASE_API}${imageUrl}`;
};

export function AccidentReadOnlyView({ record, onBack, onEdit }) {
  const children = useChildrenStore((s) => s.children);
  const child = children.find((c) => String(c.id) === String(record.childId));
  const childDisplay = child?.name || record.childName || "—";

  return (
    <div className="pb-12">
      <PageHeader
        title="View accident record"
        description={childDisplay !== "—" ? `Record for ${childDisplay}` : "Read-only incident record"}
        breadcrumbs={[{ label: "Accident Forms", onClick: onBack }, { label: "View" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success("PDF download started.")}>
              <Download className="mr-1.5 h-4 w-4" />
              Download PDF
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => toast.success("Sent to parent.")}
            >
              <Send className="mr-1.5 h-4 w-4" />
              Send to parent
            </Button>
            {onEdit && (
              <Button size="sm" onClick={onEdit}>
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            )}
          </div>
        }
      />

      <div className="mx-auto max-w-4xl space-y-5">
        <div className="overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 to-transparent p-6 text-center shadow-sm">
          <FileText className="mx-auto h-8 w-8 text-primary" />
          <h2 className="mt-3 text-lg font-bold tracking-tight sm:text-xl">
            Incident, Injury, Trauma &amp; Illness Record
          </h2>
          {record.incidentDate && (
            <p className="mt-2 text-sm text-muted-foreground">
              Incident date: <span className="font-semibold text-foreground">{record.incidentDate}</span>
              {record.incidentTime ? ` · ${record.incidentTime}` : ""}
            </p>
          )}
        </div>

        <ViewSection step={1} title={SECTIONS[0].title} icon={SECTIONS[0].icon}>
          <Field label="Name" value={record.recorderName} required />
          <Field label="Position Role" value={record.recorderPosition} />
          <Field label="Date Record was made" value={record.recordDate} />
          <Field label="Time" value={record.recordTime} />
          <Field label="Signature" value={record.recorderSignature} isImage className="sm:col-span-2" />
        </ViewSection>

        <ViewSection step={2} title={SECTIONS[1].title} icon={SECTIONS[1].icon}>
          <Field label="Child" value={childDisplay} required />
          <Field label="Date of Birth" value={record.childDob} />
          <Field label="Age" value={record.childAge} />
          <Field label="Gender" value={record.childGender} />
        </ViewSection>

        <ViewSection step={3} title={SECTIONS[2].title} icon={SECTIONS[2].icon}>
          <Field label="Incident Date" value={record.incidentDate} />
          <Field label="Time" value={record.incidentTime} />
          <Field label="Location" value={record.location || record.serviceLocation} className="sm:col-span-2" />
          <Field label="Name of Witness" value={record.witnessName} />
          <Field label="Date" value={record.witnessDate} />
          <Field label="Witness Signature" value={record.witnessSignature} isImage className="sm:col-span-2" />
          <Field
            label="General activity at the time of incident/ injury/ trauma/ illness:"
            value={record.generalActivity || record.details}
            full
          />
          <Field label="Cause of injury/ trauma:" value={record.causeOfInjury || record.circumstances} full />
          <Field
            label="Circumstances surrounding any illness, including apparent symptoms:"
            value={record.circumstancesIllness}
            full
          />
          <Field
            label="Circumstances if child appeared to be missing or otherwise unaccounted for (incl duration, who found child etc.):"
            value={record.missingCircumstances}
            full
          />
          <Field
            label="Circumstances if child appeared to have been taken or removed from service or was locked in/out of service (incl who took the child, duration):"
            value={record.removedCircumstances}
            full
          />
        </ViewSection>

        <ViewSection step={4} title={SECTIONS[3].title} icon={SECTIONS[3].icon}>
          <div className="sm:col-span-2 mb-4">
            {record.bodyInjuryImage ? (
              <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                  Body Injury Diagram
                </p>
                <img
                  src={resolveImageUrl(record.bodyInjuryImage)}
                  alt="Body injury diagram with marked areas"
                  className="max-w-full h-auto rounded-lg border border-border bg-white"
                />
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-center">
                <p className="text-sm text-muted-foreground">No body injury diagram recorded.</p>
              </div>
            )}
          </div>
          <div className="sm:col-span-2">
            {record.natures?.length ? (
              <div className="flex flex-wrap gap-2">
                {record.natures.map((n) => (
                  <Badge key={n} variant="secondary" className="font-medium">
                    {n}
                  </Badge>
                ))}
              </div>
            ) : (
              <EmptyValue />
            )}
          </div>
          {(record.natureOtherRemarks || record.natureOther) && (
            <Field label="Remarks (Other)" value={record.natureOtherRemarks || record.natureOther} full />
          )}
        </ViewSection>

        <ViewSection step={5} title={SECTIONS[4].title} icon={SECTIONS[4].icon}>
          <Field label="Details of action taken:" value={record.actionDetails} full />
          <Field label="Did emergency services attend:" value={record.emergencyAttended} yesNo />
          <Field label="Medical attention sought?" value={record.medicalSought} yesNo />
          <Field
            label="Medical attention details:"
            value={record.medicalAttentionDetails || record.yesDetails}
            full
          />
          <Field label="Step 1:" value={record.preventionStep1 || record.preventionSteps} full />
          <Field label="Step 2:" value={record.preventionStep2} full />
        </ViewSection>

        <ViewSection step={6} title={SECTIONS[5].title} icon={SECTIONS[5].icon}>
          <ParentNotifyCard
            index={1}
            name={record.parent1Name || record.parentName}
            method={record.parent1Method}
            date={record.parent1Date || record.parentDate}
            time={record.parent1Time || record.parentTime}
            contactMade={record.parent1ContactMade}
            messageLeft={record.parent1MessageLeft}
          />
          <ParentNotifyCard
            index={2}
            name={record.parent2Name}
            method={record.parent2Method}
            date={record.parent2Date}
            time={record.parent2Time}
            contactMade={record.parent2ContactMade}
            messageLeft={record.parent2MessageLeft}
          />
        </ViewSection>

        <ViewSection step={7} title={SECTIONS[6].title} icon={SECTIONS[6].icon}>
          <SubBlock title="Responsible person in charge">
            <Field label="Responsible Person in Charge Name:" value={record.responsiblePersonName || record.directorName} />
            <Field label="Signature:" value={record.responsiblePersonSignature} isImage />
            <Field label="Date" value={record.responsiblePersonDate} />
            <Field label="Time" value={record.responsiblePersonTime} />
          </SubBlock>
          <SubBlock title="Nominated Supervisor">
            <Field label="Nominated Supervisor Name:" value={record.nominatedSupervisorName} />
            <Field label="Signature:" value={record.nominatedSupervisorSignature} isImage />
            <Field label="Date" value={record.nominatedSupervisorDate || record.directorDate} />
            <Field label="Time" value={record.nominatedSupervisorTime || record.directorTime} />
          </SubBlock>
        </ViewSection>

        <ViewSection step={8} title={SECTIONS[7].title} icon={SECTIONS[7].icon}>
          <SubBlock title="Other agency:">
            <Field label="Date" value={record.otherAgencyDate} />
            <Field label="Time" value={record.otherAgencyTime} />
          </SubBlock>
          <SubBlock title="Regulatory authority:">
            <Field label="Date" value={record.regulatoryAuthorityDate || record.regDate} />
            <Field label="Time" value={record.regulatoryAuthorityTime || record.regTime} />
          </SubBlock>
        </ViewSection>

        <ViewSection step={9} title={SECTIONS[8].title} icon={SECTIONS[8].icon}>
          <Field label="Parental acknowledgement" value={record.ackName} full />
          <p className="rounded-lg border border-dashed border-border/80 bg-muted/20 px-4 py-3 text-sm italic text-muted-foreground sm:col-span-2">
            (name of parent / guardian) have been notified of my child&apos;s incident / injury / trauma /
            illness.
          </p>
          <Field label="Date" value={record.ackDate} />
        </ViewSection>

        <ViewSection step={10} title={SECTIONS[9].title} icon={SECTIONS[9].icon}>
          <Field label="Additional notes" value={record.additionalNotes} full />
          <Field label="Time" value={record.additionalNotesTime || record.ackTime} />
        </ViewSection>
      </div>
    </div>
  );
}

function ViewSection({ step, title, icon: Icon, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b border-border/60 bg-muted/25 px-5 py-3.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          {step}
        </span>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-primary" />}
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </header>
      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 sm:p-6">{children}</div>
    </section>
  );
}

function SubBlock({ title, children }) {
  return (
    <div className="space-y-3 rounded-xl border border-border/70 bg-muted/15 p-4 sm:col-span-2">
      <p className="text-sm font-bold text-primary">{title}</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function ParentNotifyCard({ index, name, method, date, time, contactMade, messageLeft }) {
  const hasData = [name, method, date, time, contactMade, messageLeft].some(
    (v) => v !== undefined && v !== null && String(v).trim() !== "",
  );
  if (!hasData) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 px-4 py-6 text-center sm:col-span-2">
        <p className="text-sm text-muted-foreground">Parent/ Guardian {index} — no details recorded</p>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-border/80 bg-muted/10 p-4 sm:col-span-2">
      <p className="mb-3 flex items-center gap-2 text-sm font-bold">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs text-primary">
          {index}
        </span>
        Parent/ Guardian
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Parent/ Guardian name:" value={name} />
        <Field label="Method of Contact:" value={method} />
        <Field label="Date" value={date} />
        <Field label="Time" value={time} />
        <Field label="Contact Made:" value={contactMade} />
        <Field label="Message Left:" value={messageLeft} />
      </div>
    </div>
  );
}

function Field({ label, value, full, isImage, yesNo, required, className }) {
  const empty = value === undefined || value === null || String(value).trim() === "";
  const display = empty ? null : String(value);

  return (
    <div className={cn(full ? "sm:col-span-2" : "", className)}>
      <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </dt>
      <dd className="mt-1.5">
        {empty ? (
          <EmptyValue />
        ) : yesNo ? (
          <Badge variant={display?.toLowerCase() === "yes" ? "default" : "outline"} className="capitalize">
            {display}
          </Badge>
        ) : isImage ? (
          <img
            src={display}
            alt={label}
            className="max-h-28 rounded-lg border border-border bg-white object-contain p-1 dark:bg-muted"
          />
        ) : (
          <p className="text-sm font-medium leading-relaxed text-foreground whitespace-pre-wrap">{display}</p>
        )}
      </dd>
    </div>
  );
}

function EmptyValue() {
  return <span className="text-sm italic text-muted-foreground/70">Not provided</span>;
}
