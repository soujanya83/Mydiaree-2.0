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
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockChildren } from "@/services/mocks/data";
import { SignatureField } from "./SignaturePad";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NATURE_LEFT = [
  "Abrasion / Scrape",
  "Allergic Reaction",
  "Amputation",
  "Anaphylaxis",
  "Asthma / Respiratory",
  "Bite Wound",
  "Broken Bone / Fracture / Dislocation",
  "Burn / Sunburn",
  "Choking",
  "Concussion",
  "Crush / Jam",
  "Cut / Open Wound",
  "Drowning (Nonfatal)",
  "Eye Injury",
];

const NATURE_RIGHT = [
  "Electric Shock",
  "High Temperature",
  "Infectious Disease",
  "Ingestion / Inhalation / Insertion",
  "Internal Injury / Infection",
  "Poisoning",
  "Rash",
  "Respiratory",
  "Seizure / Unconscious / Convulsion",
  "Sprain / Swelling",
  "Stabbing / Piercing",
  "Tooth",
  "Venomous Bite / Sting",
  "Other (Please specify)",
];

const ACK_TYPES = ["Incident", "Injury", "Trauma", "Illness"];

const empty = () => ({
  // person
  recorderName: "",
  recorderPosition: "",
  serviceName: "",
  recordDate: new Date().toISOString().slice(0, 10),
  recordTime: "",
  recorderSignature: "",
  // child
  childId: "",
  childDob: "",
  childAge: "",
  childGender: "",
  // incident
  incidentDate: new Date().toISOString().slice(0, 10),
  incidentTime: "",
  serviceLocation: "",
  incidentLocation: "",
  witnessName: "",
  witnessDate: "",
  witnessSignature: "",
  details: "",
  circumstances: "",
  missingCircumstances: "",
  removedCircumstances: "",
  // nature
  natures: [],
  natureOther: "",
  bodyDiagramNote: "",
  // action
  actionDetails: "",
  emergencyAttended: "no",
  emergencyContactedTime: "",
  emergencyArrivedTime: "",
  medicalSought: "no",
  yesDetails: "",
  preventionSteps: "",
  // notifications
  parentName: "",
  parentDate: "",
  parentTime: "",
  directorName: "",
  directorDate: "",
  directorTime: "",
  otherAgency: "",
  otherAgencyDate: "",
  otherAgencyTime: "",
  regulatoryAuthority: "",
  regDate: "",
  regTime: "",
  // acknowledgement
  ackName: "",
  ackTypes: [],
  ackDate: "",
  ackTime: "",
  finalSignature: "",
  // notes
  additionalNotes: "",
});

export function AccidentFormView({ initial, mode, onCancel, onSubmit }) {
  const isEdit = mode === "edit";
  const [data, setData] = useState(() => ({ ...empty(), ...(initial || {}) }));

  useEffect(() => {
    if (initial) setData({ ...empty(), ...initial });
  }, [initial]);

  const set = (patch) => setData((p) => ({ ...p, ...patch }));

  const toggleNature = (label) => {
    set({
      natures: data.natures.includes(label)
        ? data.natures.filter((n) => n !== label)
        : [...data.natures, label],
    });
  };

  const toggleAckType = (label, value) => {
    set({
      ackTypes: value
        ? [...new Set([...data.ackTypes, label])]
        : data.ackTypes.filter((t) => t !== label),
    });
  };

  const handleChildSelect = (id) => {
    const child = mockChildren.find((c) => c.id === id);
    if (!child) return;
    set({
      childId: id,
      childAge: child.age,
    });
  };

  const handleSave = () => {
    if (!data.recorderName.trim()) {
      toast.error("Please enter your name in 'Details of person completing this record'.");
      return;
    }
    if (!data.childId) {
      toast.error("Please select a child.");
      return;
    }
    onSubmit(data);
  };

  return (
    <div>
      <PageHeader
        title={isEdit ? "Edit Accident Form" : "New Accident Form"}
        description="Incident, Injury, Trauma & Illness Record"
        breadcrumbs={[
          { label: "Accident Forms", to: "/accident-form" },
          { label: isEdit ? "Edit" : "Create" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={onCancel}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
        }
      />

      <div className="space-y-5">
        {/* Title strip */}
        <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/15 p-2.5 text-primary">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">
                Incident, Injury, Trauma & Illness Record
              </h2>
              <p className="text-sm text-muted-foreground">
                Complete every section. Fields marked with * are required.
              </p>
            </div>
          </div>
        </div>

        {/* Section 1: Person completing */}
        <Section icon={User2} title="Details of person completing this record">
          <Grid2>
            <FormField label="Name *">
              <Input
                value={data.recorderName}
                onChange={(e) => set({ recorderName: e.target.value })}
              />
            </FormField>
            <FormField label="Position / Role">
              <Input
                value={data.recorderPosition}
                onChange={(e) => set({ recorderPosition: e.target.value })}
              />
            </FormField>
            <FormField label="Service Name">
              <Input
                value={data.serviceName}
                onChange={(e) => set({ serviceName: e.target.value })}
              />
            </FormField>
            <FormField label="Date Record was made">
              <Input
                type="date"
                value={data.recordDate}
                onChange={(e) => set({ recordDate: e.target.value })}
              />
            </FormField>
            <FormField label="Time Record was made">
              <Input
                type="time"
                value={data.recordTime}
                onChange={(e) => set({ recordTime: e.target.value })}
              />
            </FormField>
            <FormField label="Signature">
              <SignatureField
                value={data.recorderSignature}
                onChange={(v) => set({ recorderSignature: v })}
                label="Recorder Signature"
              />
            </FormField>
          </Grid2>
        </Section>

        {/* Section 2: Child details */}
        <Section icon={Baby} title="Child Details">
          <Grid2>
            <FormField label="Select Child *">
              <Select value={data.childId} onValueChange={handleChildSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Select Children --" />
                </SelectTrigger>
                <SelectContent>
                  {mockChildren.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} · {c.roomName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Date of Birth">
              <Input
                type="date"
                value={data.childDob}
                onChange={(e) => set({ childDob: e.target.value })}
              />
            </FormField>
            <FormField label="Age">
              <Input
                value={data.childAge}
                onChange={(e) => set({ childAge: e.target.value })}
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
                      "flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm transition",
                      data.childGender === g && "border-primary bg-primary/10 text-primary"
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

        {/* Section 3: Incident details */}
        <Section icon={AlertTriangle} title="Incident / Injury / Trauma / Illness Details">
          <Grid2>
            <FormField label="Incident Date">
              <Input
                type="date"
                value={data.incidentDate}
                onChange={(e) => set({ incidentDate: e.target.value })}
              />
            </FormField>
            <FormField label="Incident Time">
              <Input
                type="time"
                value={data.incidentTime}
                onChange={(e) => set({ incidentTime: e.target.value })}
              />
            </FormField>
            <FormField label="Location of service">
              <Input
                placeholder="E.g., Playground"
                value={data.serviceLocation}
                onChange={(e) => set({ serviceLocation: e.target.value })}
              />
            </FormField>
            <FormField label="Location of incident / injury / trauma / illness">
              <Input
                value={data.incidentLocation}
                onChange={(e) => set({ incidentLocation: e.target.value })}
              />
            </FormField>
            <FormField label="Name of person who witnessed the incident">
              <Input
                value={data.witnessName}
                onChange={(e) => set({ witnessName: e.target.value })}
              />
            </FormField>
            <FormField label="Witness Date">
              <Input
                type="date"
                value={data.witnessDate}
                onChange={(e) => set({ witnessDate: e.target.value })}
              />
            </FormField>
            <FormField label="Witness Signature" className="md:col-span-2">
              <SignatureField
                value={data.witnessSignature}
                onChange={(v) => set({ witnessSignature: v })}
                label="Witness Signature"
              />
            </FormField>
          </Grid2>

          <div className="mt-4 space-y-4">
            <FormField label="Details of incident / injury / trauma / illness">
              <Textarea
                rows={3}
                value={data.details}
                onChange={(e) => set({ details: e.target.value })}
              />
            </FormField>
            <FormField label="Circumstances leading to the incident, including any apparent symptoms">
              <Textarea
                rows={3}
                value={data.circumstances}
                onChange={(e) => set({ circumstances: e.target.value })}
              />
            </FormField>
            <FormField label="Circumstances if child appeared to be missing or otherwise unaccounted for (incl. duration, who found child, etc.)">
              <Textarea
                rows={2}
                value={data.missingCircumstances}
                onChange={(e) => set({ missingCircumstances: e.target.value })}
              />
            </FormField>
            <FormField label="Circumstances if child appeared to have been taken or removed from service or was locked in/out of service">
              <Textarea
                rows={2}
                value={data.removedCircumstances}
                onChange={(e) => set({ removedCircumstances: e.target.value })}
              />
            </FormField>
          </div>
        </Section>

        {/* Section 4: Nature */}
        <Section icon={Activity} title="Nature of Injury / Trauma / Illness">
          <p className="mb-3 text-xs text-muted-foreground">
            Toggle each that applies. Use “Other” to describe anything not listed.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <NatureColumn options={NATURE_LEFT} selected={data.natures} onToggle={toggleNature} />
            <NatureColumn options={NATURE_RIGHT} selected={data.natures} onToggle={toggleNature} />
          </div>
          {data.natures.includes("Other (Please specify)") && (
            <div className="mt-4">
              <FormField label="Please specify">
                <Input
                  value={data.natureOther}
                  onChange={(e) => set({ natureOther: e.target.value })}
                />
              </FormField>
            </div>
          )}
          <div className="mt-4">
            <FormField label="Indicate the part of the body affected">
              <Textarea
                rows={2}
                placeholder="e.g., Right knee, lower back…"
                value={data.bodyDiagramNote}
                onChange={(e) => set({ bodyDiagramNote: e.target.value })}
              />
            </FormField>
          </div>
        </Section>

        {/* Section 5: Action taken */}
        <Section icon={CheckCircle2} title="Action Taken">
          <div className="space-y-4">
            <FormField label="Details of action taken (including first aid, administration of medication etc.)">
              <Textarea
                rows={3}
                value={data.actionDetails}
                onChange={(e) => set({ actionDetails: e.target.value })}
              />
            </FormField>

            <Grid2>
              <FormField label="Did emergency services attend?">
                <YesNo
                  value={data.emergencyAttended}
                  onChange={(v) => set({ emergencyAttended: v })}
                />
              </FormField>
              <FormField label="Time emergency services contacted">
                <Input
                  type="time"
                  value={data.emergencyContactedTime}
                  onChange={(e) => set({ emergencyContactedTime: e.target.value })}
                />
              </FormField>
              <FormField label="Time emergency services arrived">
                <Input
                  type="time"
                  value={data.emergencyArrivedTime}
                  onChange={(e) => set({ emergencyArrivedTime: e.target.value })}
                />
              </FormField>
              <FormField label="Was medical attention sought from a registered practitioner / hospital?">
                <YesNo
                  value={data.medicalSought}
                  onChange={(v) => set({ medicalSought: v })}
                />
              </FormField>
            </Grid2>

            <FormField label="If yes to either of the above, provide details">
              <Textarea
                rows={2}
                value={data.yesDetails}
                onChange={(e) => set({ yesDetails: e.target.value })}
              />
            </FormField>

            <FormField label="Have any steps been taken to prevent or minimise this type of incident in the future? If yes, provide details.">
              <Textarea
                rows={2}
                value={data.preventionSteps}
                onChange={(e) => set({ preventionSteps: e.target.value })}
              />
            </FormField>
          </div>
        </Section>

        {/* Section 6: Notifications */}
        <Section icon={Bell} title="Parent / Guardian Notifications (including attempted notifications)">
          <NotifyRow
            label="Parent / Guardian / Carer"
            name={data.parentName}
            date={data.parentDate}
            time={data.parentTime}
            onName={(v) => set({ parentName: v })}
            onDate={(v) => set({ parentDate: v })}
            onTime={(v) => set({ parentTime: v })}
          />
          <NotifyRow
            label="Director / Educator / Coordinator"
            name={data.directorName}
            date={data.directorDate}
            time={data.directorTime}
            onName={(v) => set({ directorName: v })}
            onDate={(v) => set({ directorDate: v })}
            onTime={(v) => set({ directorTime: v })}
          />
          <NotifyRow
            label="Other agency (if applicable)"
            name={data.otherAgency}
            date={data.otherAgencyDate}
            time={data.otherAgencyTime}
            onName={(v) => set({ otherAgency: v })}
            onDate={(v) => set({ otherAgencyDate: v })}
            onTime={(v) => set({ otherAgencyTime: v })}
          />
          <NotifyRow
            label="Regulatory authority (if applicable)"
            name={data.regulatoryAuthority}
            date={data.regDate}
            time={data.regTime}
            onName={(v) => set({ regulatoryAuthority: v })}
            onDate={(v) => set({ regDate: v })}
            onTime={(v) => set({ regTime: v })}
            last
          />
        </Section>

        {/* Section 7: Parental acknowledgement */}
        <Section icon={CheckCircle2} title="Parental Acknowledgement">
          <div className="space-y-4">
            <FormField label="I,">
              <Input
                value={data.ackName}
                onChange={(e) => set({ ackName: e.target.value })}
                placeholder="Parent / guardian name"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                (name of parent / guardian) have been notified of my child's incident /
                injury / trauma / illness.
              </p>
            </FormField>

            <div className="flex flex-wrap gap-4">
              {ACK_TYPES.map((t) => {
                const checked = data.ackTypes.includes(t);
                return (
                  <label key={t} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => toggleAckType(t, !!v)}
                    />
                    <span className="font-medium">{t}</span>
                  </label>
                );
              })}
            </div>

            <Grid2>
              <FormField label="Date">
                <Input
                  type="date"
                  value={data.ackDate}
                  onChange={(e) => set({ ackDate: e.target.value })}
                />
              </FormField>
              <FormField label="Time">
                <Input
                  type="time"
                  value={data.ackTime}
                  onChange={(e) => set({ ackTime: e.target.value })}
                />
              </FormField>
            </Grid2>

            <FormField label="Final Signature">
              <SignatureField
                value={data.finalSignature}
                onChange={(v) => set({ finalSignature: v })}
                label="Final Signature"
              />
            </FormField>
          </div>
        </Section>

        {/* Section 8: Additional notes */}
        <Section icon={StickyNote} title="Additional Notes">
          <Textarea
            rows={4}
            value={data.additionalNotes}
            onChange={(e) => set({ additionalNotes: e.target.value })}
          />
        </Section>

        {/* Footer */}
        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background/95 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:px-5">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-1.5 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-1.5 h-4 w-4" />
            {isEdit ? "Save Changes" : "Save & Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center gap-2 bg-primary/10 px-5 py-3 text-primary">
        {Icon && <Icon className="h-4 w-4" />}
        <h3 className="text-sm font-bold uppercase tracking-wide">{title}</h3>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Grid2({ children }) {
  return <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>;
}

function FormField({ label, children, className }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function YesNo({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Switch checked={value === "yes"} onCheckedChange={(v) => onChange(v ? "yes" : "no")} />
      <span className="text-sm font-medium">{value === "yes" ? "Yes" : "No"}</span>
    </div>
  );
}

function NatureColumn({ options, selected, onToggle }) {
  return (
    <div className="divide-y divide-border rounded-xl border border-border bg-muted/20">
      {options.map((opt) => {
        const checked = selected.includes(opt);
        return (
          <label
            key={opt}
            className="flex cursor-pointer items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/40"
          >
            <span className={cn("font-medium", checked ? "text-foreground" : "text-muted-foreground")}>
              {opt}
            </span>
            <Switch checked={checked} onCheckedChange={() => onToggle(opt)} />
          </label>
        );
      })}
    </div>
  );
}

function NotifyRow({ label, name, date, time, onName, onDate, onTime, last }) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 py-3 md:grid-cols-3", !last && "border-b border-dashed border-border")}>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
        <Input value={name} onChange={(e) => onName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date</Label>
        <Input type="date" value={date} onChange={(e) => onDate(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time</Label>
        <Input type="time" value={time} onChange={(e) => onTime(e.target.value)} />
      </div>
    </div>
  );
}