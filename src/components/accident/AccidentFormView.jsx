import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ClipboardList,
  User2,
  Baby,
  AlertTriangle,
  Activity,
  Bell,
  CheckCircle2,
  StickyNote,
  Save,
  X,
  Info,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChildrenStore } from "@/stores/childrenStore";
import { SignatureField } from "./SignaturePad";
import { NATURE_OPTIONS } from "./accidentFormConstants";
import { BodyInjuryDiagram } from "./BodyInjuryDiagram";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const INPUT_CLASS = "h-11 rounded-lg border-border/80 bg-background/80 focus-visible:ring-primary/25";
const TEXTAREA_CLASS = "min-h-[88px] resize-y rounded-lg border-border/80 bg-background/80 focus-visible:ring-primary/25";

const empty = () => ({
  recorderName: "",
  recorderPosition: "",
  recordDate: new Date().toISOString().slice(0, 10),
  recordTime: "",
  recorderSignature: "",
  childId: "",
  childDob: "",
  childAge: "",
  childGender: "",
  incidentDate: new Date().toISOString().slice(0, 10),
  incidentTime: "",
  location: "",
  witnessName: "",
  witnessDate: "",
  witnessSignature: "",
  generalActivity: "",
  causeOfInjury: "",
  circumstancesIllness: "",
  missingCircumstances: "",
  removedCircumstances: "",
  natures: [],
  natureOtherRemarks: "",
  bodyInjuryMarkers: [],
  actionDetails: "",
  emergencyAttended: "no",
  medicalSought: "no",
  medicalAttentionDetails: "",
  preventionStep1: "",
  preventionStep2: "",
  parent1Name: "",
  parent1Method: "",
  parent1Date: "",
  parent1Time: "",
  parent1ContactMade: "",
  parent1MessageLeft: "",
  parent2Name: "",
  parent2Method: "",
  parent2Date: "",
  parent2Time: "",
  parent2ContactMade: "",
  parent2MessageLeft: "",
  responsiblePersonName: "",
  responsiblePersonSignature: "",
  responsiblePersonDate: "",
  responsiblePersonTime: "",
  nominatedSupervisorName: "",
  nominatedSupervisorSignature: "",
  nominatedSupervisorDate: "",
  nominatedSupervisorTime: "",
  otherAgencyDate: "",
  otherAgencyTime: "",
  regulatoryAuthorityDate: "",
  regulatoryAuthorityTime: "",
  ackName: "",
  ackDate: "",
  additionalNotes: "",
  additionalNotesTime: "",
});

function normalizeInitial(initial) {
  if (!initial) return {};
  return {
    ...initial,
    location: initial.location ?? initial.serviceLocation ?? initial.incidentLocation ?? "",
    generalActivity: initial.generalActivity ?? initial.details ?? "",
    causeOfInjury: initial.causeOfInjury ?? initial.circumstances ?? "",
    circumstancesIllness: initial.circumstancesIllness ?? "",
    natureOtherRemarks: initial.natureOtherRemarks ?? initial.natureOther ?? "",
    medicalAttentionDetails: initial.medicalAttentionDetails ?? initial.yesDetails ?? "",
    preventionStep1: initial.preventionStep1 ?? initial.preventionSteps ?? "",
    parent1Name: initial.parent1Name ?? initial.parentName ?? "",
    parent1Date: initial.parent1Date ?? initial.parentDate ?? "",
    parent1Time: initial.parent1Time ?? initial.parentTime ?? "",
    responsiblePersonName: initial.responsiblePersonName ?? initial.directorName ?? "",
    responsiblePersonDate: initial.responsiblePersonDate ?? initial.directorDate ?? "",
    responsiblePersonTime: initial.responsiblePersonTime ?? initial.directorTime ?? "",
    nominatedSupervisorName: initial.nominatedSupervisorName ?? "",
    otherAgencyDate: initial.otherAgencyDate ?? "",
    otherAgencyTime: initial.otherAgencyTime ?? "",
    regulatoryAuthorityDate: initial.regulatoryAuthorityDate ?? initial.regDate ?? "",
    regulatoryAuthorityTime: initial.regulatoryAuthorityTime ?? initial.regTime ?? "",
    ackName: initial.ackName ?? "",
    additionalNotesTime: initial.additionalNotesTime ?? initial.ackTime ?? "",
  };
}

export function AccidentFormView({ initial, mode, onCancel, onSubmit }) {
  const isEdit = mode === "edit";
  const { children } = useChildrenStore();
  const [data, setData] = useState(() => ({ ...empty(), ...normalizeInitial(initial) }));

  useEffect(() => {
    if (initial) setData({ ...empty(), ...normalizeInitial(initial) });
  }, [initial]);

  const set = (patch) => setData((p) => ({ ...p, ...patch }));

  const toggleNature = (label) => {
    set({
      natures: data.natures.includes(label)
        ? data.natures.filter((n) => n !== label)
        : [...data.natures, label],
    });
  };

  const handleChildSelect = (id) => {
    const child = children.find((c) => String(c.id) === String(id));
    if (!child) return;
    set({
      childId: id,
      childDob: child.dob || data.childDob,
      childAge: child.age || data.childAge,
      childGender: child.gender || data.childGender,
    });
  };

  const handleSave = () => {
    if (!data.recorderName.trim()) {
      toast.error("Please enter Name under Details of person completing this record.");
      return;
    }
    if (!data.childId) {
      toast.error("Please select a child.");
      return;
    }
    onSubmit(data);
  };

  return (
    <div className="pb-28">
      <PageHeader
        title={isEdit ? "Edit Accident Form" : "New Accident Form"}
        description="Complete all sections. Required fields are marked with *"
        breadcrumbs={[
          { label: "Accident Forms", onClick: onCancel },
          { label: isEdit ? "Edit" : "Create" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={onCancel}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/12 via-primary/5 to-transparent p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-primary">Official record</p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">
                Incident, Injury, Trauma &amp; Illness Record
              </h2>
              <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                Placeholders show examples only — labels stay as on the paper form. Fields with * are required.
              </p>
            </div>
          </div>
        </div>

        <Section icon={User2} title="Details of person completing this record" step={1}>
          <Grid2>
            <FormField label="Name" required placeholder="e.g. Sangeetha Srivatsan">
              <Input
                className={INPUT_CLASS}
                value={data.recorderName}
                onChange={(e) => set({ recorderName: e.target.value })}
                placeholder="Full name of person completing this form"
              />
            </FormField>
            <FormField label="Position Role" placeholder="e.g. Early Childhood Teacher">
              <Input
                className={INPUT_CLASS}
                value={data.recorderPosition}
                onChange={(e) => set({ recorderPosition: e.target.value })}
                placeholder="Your role at the service"
              />
            </FormField>
            <FormField label="Date Record was made" hint="When this form was completed">
              <Input
                className={INPUT_CLASS}
                type="date"
                value={data.recordDate}
                onChange={(e) => set({ recordDate: e.target.value })}
              />
            </FormField>
            <FormField label="Time" hint="Time the record was completed">
              <Input
                className={INPUT_CLASS}
                type="time"
                value={data.recordTime}
                onChange={(e) => set({ recordTime: e.target.value })}
              />
            </FormField>
            <FormField label="Signature" className="md:col-span-2" hint="Sign using the pad below">
              <SignatureField
                value={data.recorderSignature}
                onChange={(v) => set({ recorderSignature: v })}
                label="Recorder signature"
              />
            </FormField>
          </Grid2>
        </Section>

        <Section icon={Baby} title="Child Details" step={2}>
          <Grid2>
            <FormField label="Child" required hint="Select the child involved in this incident">
              <Select value={data.childId || undefined} onValueChange={handleChildSelect}>
                <SelectTrigger className={INPUT_CLASS}>
                  <SelectValue placeholder="Select child…" />
                </SelectTrigger>
                <SelectContent>
                  {children.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No children loaded
                    </SelectItem>
                  ) : (
                    children.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Date of Birth" hint="Auto-filled when child is selected">
              <Input
                className={INPUT_CLASS}
                type="date"
                value={data.childDob}
                onChange={(e) => set({ childDob: e.target.value })}
              />
            </FormField>
            <FormField label="Age" placeholder="e.g. 3">
              <Input
                className={INPUT_CLASS}
                value={data.childAge}
                onChange={(e) => set({ childAge: e.target.value })}
                placeholder="Age in years"
              />
            </FormField>
            <FormField label="Gender">
              <RadioGroup
                value={data.childGender}
                onValueChange={(v) => set({ childGender: v })}
                className="flex flex-wrap gap-2 pt-1"
              >
                {["Male", "Female", "Others"].map((g) => (
                  <label
                    key={g}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium transition",
                      data.childGender === g && "border-primary bg-primary/10 text-primary shadow-sm",
                    )}
                  >
                    <RadioGroupItem value={g} className="sr-only" />
                    {g}
                  </label>
                ))}
              </RadioGroup>
            </FormField>
          </Grid2>
        </Section>

        <Section icon={AlertTriangle} title="Incident Details" step={3}>
          <Grid2>
            <FormField label="Incident Date" hint="Date the incident occurred">
              <Input
                className={INPUT_CLASS}
                type="date"
                value={data.incidentDate}
                onChange={(e) => set({ incidentDate: e.target.value })}
              />
            </FormField>
            <FormField label="Time" hint="Time the incident occurred">
              <Input
                className={INPUT_CLASS}
                type="time"
                value={data.incidentTime}
                onChange={(e) => set({ incidentTime: e.target.value })}
              />
            </FormField>
            <FormField
              label="Location"
              className="md:col-span-2"
              placeholder="e.g. 1 Capricorn Road, Truganina — outdoor playground"
            >
              <Input
                className={INPUT_CLASS}
                value={data.location}
                onChange={(e) => set({ location: e.target.value })}
                placeholder="Address or area where incident occurred"
              />
            </FormField>
            <FormField label="Name of Witness" placeholder="e.g. N/A if no witness">
              <Input
                className={INPUT_CLASS}
                value={data.witnessName}
                onChange={(e) => set({ witnessName: e.target.value })}
                placeholder="Full name, or N/A"
              />
            </FormField>
            <FormField label="Date" hint="Witness signature date">
              <Input
                className={INPUT_CLASS}
                type="date"
                value={data.witnessDate}
                onChange={(e) => set({ witnessDate: e.target.value })}
              />
            </FormField>
            <FormField label="Witness Signature" className="md:col-span-2">
              <SignatureField
                value={data.witnessSignature}
                onChange={(v) => set({ witnessSignature: v })}
                label="Witness signature"
              />
            </FormField>
          </Grid2>

          <div className="mt-5 space-y-4 rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Circumstances &amp; description
            </p>
            <FormField
              label="General activity at the time of incident/ injury/ trauma/ illness:"
              placeholder="e.g. Outdoor play, group story time, lunch routine…"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={2}
                value={data.generalActivity}
                onChange={(e) => set({ generalActivity: e.target.value })}
                placeholder="What was the child doing when the incident happened?"
              />
            </FormField>
            <FormField
              label="Cause of injury/ trauma:"
              placeholder="Describe how the injury or trauma occurred"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={2}
                value={data.causeOfInjury}
                onChange={(e) => set({ causeOfInjury: e.target.value })}
                placeholder="e.g. Tripped on mat edge while running"
              />
            </FormField>
            <FormField
              label="Circumstances surrounding any illness, including apparent symptoms:"
              placeholder="Leave blank if not applicable"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={2}
                value={data.circumstancesIllness}
                onChange={(e) => set({ circumstancesIllness: e.target.value })}
                placeholder="Symptoms observed, onset, duration…"
              />
            </FormField>
            <FormField
              label="Circumstances if child appeared to be missing or otherwise unaccounted for (incl duration, who found child etc.):"
              placeholder="Leave blank if not applicable"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={2}
                value={data.missingCircumstances}
                onChange={(e) => set({ missingCircumstances: e.target.value })}
                placeholder="Duration missing, who located the child, where found…"
              />
            </FormField>
            <FormField
              label="Circumstances if child appeared to have been taken or removed from service or was locked in/out of service (incl who took the child, duration):"
              placeholder="Leave blank if not applicable"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={2}
                value={data.removedCircumstances}
                onChange={(e) => set({ removedCircumstances: e.target.value })}
                placeholder="Who removed child, how long, how resolved…"
              />
            </FormField>
          </div>
        </Section>

        <Section icon={Activity} title="Nature of Injury / Trauma / Illness" step={4}>
          <div className="mb-6">
            <BodyInjuryDiagram
              markers={data.bodyInjuryMarkers}
              onChange={(markers) => set({ bodyInjuryMarkers: markers })}
            />
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Toggle each type that applies. Select &quot;Other&quot; to add remarks below.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {NATURE_OPTIONS.map((opt) => {
              const checked = data.natures.includes(opt);
              return (
                <label
                  key={opt}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-3 text-sm transition",
                    checked
                      ? "border-primary/50 bg-primary/8 shadow-sm"
                      : "border-border bg-background hover:border-primary/30 hover:bg-muted/30",
                  )}
                >
                  <span className={cn("leading-snug", checked ? "font-semibold text-foreground" : "text-muted-foreground")}>
                    {opt}
                  </span>
                  <Switch checked={checked} onCheckedChange={() => toggleNature(opt)} />
                </label>
              );
            })}
          </div>
          {data.natures.includes("Other (Please specify):") && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <FormField
                label="Remarks (Other)"
                placeholder="Describe the nature of injury not listed above"
              >
                <Textarea
                  className={TEXTAREA_CLASS}
                  rows={2}
                  value={data.natureOtherRemarks}
                  onChange={(e) => set({ natureOtherRemarks: e.target.value })}
                  placeholder="e.g. Small drop of blood on lip, no visible wound"
                />
              </FormField>
            </div>
          )}
        </Section>

        <Section icon={CheckCircle2} title="Action Taken" step={5}>
          <div className="space-y-4">
            <FormField
              label="Details of action taken:"
              placeholder="First aid, comfort, medication, who assisted…"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={3}
                value={data.actionDetails}
                onChange={(e) => set({ actionDetails: e.target.value })}
                placeholder="e.g. Comforted child, offered water, monitored for 15 minutes…"
              />
            </FormField>
            <Grid2>
              <FormField label="Did emergency services attend:">
                <YesNo value={data.emergencyAttended} onChange={(v) => set({ emergencyAttended: v })} />
              </FormField>
              <FormField label="Medical attention sought?">
                <YesNo value={data.medicalSought} onChange={(v) => set({ medicalSought: v })} />
              </FormField>
            </Grid2>
            <FormField
              label="Medical attention details:"
              placeholder="Practitioner, hospital, treatment — leave blank if N/A"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={2}
                value={data.medicalAttentionDetails}
                onChange={(e) => set({ medicalAttentionDetails: e.target.value })}
                placeholder="Details if medical attention was sought"
              />
            </FormField>
            <FormField
              label="Step 1:"
              placeholder="Steps taken to prevent recurrence (part 1)"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={2}
                value={data.preventionStep1}
                onChange={(e) => set({ preventionStep1: e.target.value })}
                placeholder="Prevention or follow-up step 1"
              />
            </FormField>
            <FormField label="Step 2:" placeholder="Additional prevention steps">
              <Textarea
                className={TEXTAREA_CLASS}
                rows={2}
                value={data.preventionStep2}
                onChange={(e) => set({ preventionStep2: e.target.value })}
                placeholder="Prevention or follow-up step 2"
              />
            </FormField>
          </div>
        </Section>

        <Section icon={Bell} title="Step 3: Parent/Guardian Notifications" step={6}>
          <ParentNotifyBlock
            index={1}
            data={data}
            set={set}
            fields={{
              name: "parent1Name",
              method: "parent1Method",
              date: "parent1Date",
              time: "parent1Time",
              contactMade: "parent1ContactMade",
              messageLeft: "parent1MessageLeft",
            }}
          />
          <ParentNotifyBlock
            index={2}
            data={data}
            set={set}
            fields={{
              name: "parent2Name",
              method: "parent2Method",
              date: "parent2Date",
              time: "parent2Time",
              contactMade: "parent2ContactMade",
              messageLeft: "parent2MessageLeft",
            }}
            last
          />
        </Section>

        <Section icon={Bell} title="Internal Notifications" step={7}>
          <SubSection title="Responsible person in charge">
            <Grid2>
              <FormField label="Responsible Person in Charge Name:" placeholder="Full name">
                <Input
                  className={INPUT_CLASS}
                  value={data.responsiblePersonName}
                  onChange={(e) => set({ responsiblePersonName: e.target.value })}
                  placeholder="Name of person in charge"
                />
              </FormField>
              <FormField label="Signature:">
                <SignatureField
                  value={data.responsiblePersonSignature}
                  onChange={(v) => set({ responsiblePersonSignature: v })}
                  label="Signature"
                />
              </FormField>
              <FormField label="Date">
                <Input
                  className={INPUT_CLASS}
                  type="date"
                  value={data.responsiblePersonDate}
                  onChange={(e) => set({ responsiblePersonDate: e.target.value })}
                />
              </FormField>
              <FormField label="Time">
                <Input
                  className={INPUT_CLASS}
                  type="time"
                  value={data.responsiblePersonTime}
                  onChange={(e) => set({ responsiblePersonTime: e.target.value })}
                />
              </FormField>
            </Grid2>
          </SubSection>
          <SubSection title="Nominated Supervisor">
            <Grid2>
              <FormField label="Nominated Supervisor Name:" placeholder="Supervisor full name">
                <Input
                  className={INPUT_CLASS}
                  value={data.nominatedSupervisorName}
                  onChange={(e) => set({ nominatedSupervisorName: e.target.value })}
                  placeholder="Nominated supervisor name"
                />
              </FormField>
              <FormField label="Signature:">
                <SignatureField
                  value={data.nominatedSupervisorSignature}
                  onChange={(v) => set({ nominatedSupervisorSignature: v })}
                  label="Supervisor signature"
                />
              </FormField>
              <FormField label="Date">
                <Input
                  className={INPUT_CLASS}
                  type="date"
                  value={data.nominatedSupervisorDate}
                  onChange={(e) => set({ nominatedSupervisorDate: e.target.value })}
                />
              </FormField>
              <FormField label="Time">
                <Input
                  className={INPUT_CLASS}
                  type="time"
                  value={data.nominatedSupervisorTime}
                  onChange={(e) => set({ nominatedSupervisorTime: e.target.value })}
                />
              </FormField>
            </Grid2>
          </SubSection>
        </Section>

        <Section icon={Bell} title="External Notifications" step={8}>
          <SubSection title="Other agency:">
            <Grid2>
              <FormField label="Date" hint="When other agency was notified">
                <Input
                  className={INPUT_CLASS}
                  type="date"
                  value={data.otherAgencyDate}
                  onChange={(e) => set({ otherAgencyDate: e.target.value })}
                />
              </FormField>
              <FormField label="Time">
                <Input
                  className={INPUT_CLASS}
                  type="time"
                  value={data.otherAgencyTime}
                  onChange={(e) => set({ otherAgencyTime: e.target.value })}
                />
              </FormField>
            </Grid2>
          </SubSection>
          <SubSection title="Regulatory authority:">
            <Grid2>
              <FormField label="Date" hint="When regulatory authority was notified">
                <Input
                  className={INPUT_CLASS}
                  type="date"
                  value={data.regulatoryAuthorityDate}
                  onChange={(e) => set({ regulatoryAuthorityDate: e.target.value })}
                />
              </FormField>
              <FormField label="Time">
                <Input
                  className={INPUT_CLASS}
                  type="time"
                  value={data.regulatoryAuthorityTime}
                  onChange={(e) => set({ regulatoryAuthorityTime: e.target.value })}
                />
              </FormField>
            </Grid2>
          </SubSection>
        </Section>

        <Section icon={CheckCircle2} title="Parental acknowledgement" step={9}>
          <div className="space-y-4 rounded-xl border border-border/80 bg-muted/15 p-4">
            <FormField label="Parental acknowledgement" placeholder="Parent or guardian full name">
              <Input
                className={INPUT_CLASS}
                value={data.ackName}
                onChange={(e) => set({ ackName: e.target.value })}
                placeholder="e.g. Huimin Goh"
              />
            </FormField>
            <p className="text-sm italic leading-relaxed text-muted-foreground">
              (name of parent / guardian) have been notified of my child&apos;s incident / injury / trauma /
              illness.
            </p>
            <FormField label="Date" hint="Date of parental acknowledgement">
              <Input
                className={INPUT_CLASS}
                type="date"
                value={data.ackDate}
                onChange={(e) => set({ ackDate: e.target.value })}
              />
            </FormField>
          </div>
        </Section>

        <Section icon={StickyNote} title="Additional notes" step={10}>
          <div className="space-y-4">
            <FormField label="Additional notes" placeholder="Any extra information for this record">
              <Textarea
                className={TEXTAREA_CLASS}
                rows={3}
                value={data.additionalNotes}
                onChange={(e) => set({ additionalNotes: e.target.value })}
                placeholder="Optional notes not covered above"
              />
            </FormField>
            <FormField label="Time" hint="Time notes were recorded">
              <Input
                className={INPUT_CLASS}
                type="time"
                value={data.additionalNotesTime}
                onChange={(e) => set({ additionalNotesTime: e.target.value })}
              />
            </FormField>
          </div>
        </Section>

        <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-background/95 px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:px-6">
          <p className="text-xs text-muted-foreground">
            <span className="text-destructive">*</span> Required before saving
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="mr-1.5 h-4 w-4" />
              {isEdit ? "Save changes" : "Save record"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParentNotifyBlock({ index, data, set, fields, last }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/80 bg-muted/10 p-4",
        !last && "mb-4",
      )}
    >
      <p className="mb-4 flex items-center gap-2 text-sm font-bold text-foreground">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-xs text-primary">
          {index}
        </span>
        Parent/ Guardian
      </p>
      <Grid2>
        <FormField label="Parent/ Guardian name:" placeholder="e.g. Huimin Goh">
          <Input
            className={INPUT_CLASS}
            value={data[fields.name]}
            onChange={(e) => set({ [fields.name]: e.target.value })}
            placeholder="Full name of parent or guardian"
          />
        </FormField>
        <FormField label="Method of Contact:" placeholder="e.g. Phone, Email, In person">
          <Input
            className={INPUT_CLASS}
            value={data[fields.method]}
            onChange={(e) => set({ [fields.method]: e.target.value })}
            placeholder="How contact was attempted or made"
          />
        </FormField>
        <FormField label="Date">
          <Input
            className={INPUT_CLASS}
            type="date"
            value={data[fields.date]}
            onChange={(e) => set({ [fields.date]: e.target.value })}
          />
        </FormField>
        <FormField label="Time">
          <Input
            className={INPUT_CLASS}
            type="time"
            value={data[fields.time]}
            onChange={(e) => set({ [fields.time]: e.target.value })}
          />
        </FormField>
        <FormField label="Contact Made:" placeholder="e.g. Yes — spoke with mother">
          <Input
            className={INPUT_CLASS}
            value={data[fields.contactMade]}
            onChange={(e) => set({ [fields.contactMade]: e.target.value })}
            placeholder="Was contact successfully made?"
          />
        </FormField>
        <FormField label="Message Left:" placeholder="e.g. Voicemail left at 3:45pm">
          <Input
            className={INPUT_CLASS}
            value={data[fields.messageLeft]}
            onChange={(e) => set({ [fields.messageLeft]: e.target.value })}
            placeholder="Message details if contact not made"
          />
        </FormField>
      </Grid2>
    </div>
  );
}

function Section({ title, icon: Icon, children, step }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
      <header className="flex items-center gap-3 border-b border-border/60 bg-muted/30 px-5 py-4">
        {step != null && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
            {step}
          </span>
        )}
        {Icon && <Icon className="h-5 w-5 shrink-0 text-primary" />}
        <h3 className="text-sm font-bold leading-snug text-foreground">{title}</h3>
      </header>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function SubSection({ title, children }) {
  return (
    <div className="space-y-4 border-b border-dashed border-border/70 py-5 first:pt-0 last:border-0 last:pb-0">
      <p className="text-sm font-bold text-primary">{title}</p>
      {children}
    </div>
  );
}

function Grid2({ children }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

function FormField({ label, children, className, required, hint, placeholder: _ph }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-sm font-semibold leading-snug text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

function YesNo({ value, onChange }) {
  return (
    <div className="flex h-11 items-center gap-3 rounded-lg border border-border/80 bg-muted/20 px-4">
      <Switch checked={value === "yes"} onCheckedChange={(v) => onChange(v ? "yes" : "no")} />
      <span className="text-sm font-semibold">{value === "yes" ? "Yes" : "No"}</span>
    </div>
  );
}
