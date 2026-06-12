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
  Loader2,
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
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { childrenService } from "@/services/centre/childrenService";
import { SignatureField } from "./SignaturePad";
import { NATURE_OPTIONS } from "./accidentFormConstants";
import { BodyInjuryDiagram } from "./BodyInjuryDiagram";
import { generateMarkedBodyImage } from "@/utils/bodyInjuryImageGenerator";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { IMG_BASE_API } from "../../api/imageapi";

const INPUT_CLASS =
  "h-11 rounded-lg border-border/80 bg-background/80 focus-visible:ring-primary/25";
const TEXTAREA_CLASS =
  "min-h-[88px] resize-y rounded-lg border-border/80 bg-background/80 focus-visible:ring-primary/25";

const avatarUrl = (url) => {
  if (!url) return null;
  return url.startsWith("http") ? url : `${IMG_BASE_API}${url}`;
};

const calculateAgeFromDob = (dob) => {
  if (!dob) return "";
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age.toString();
};

const empty = () => ({
  recorderName: "",
  recorderPosition: "",
  serviceName: "",
  recordDate: new Date().toISOString().slice(0, 10),
  recordTime: "",
  recorderSignature: "",
  childId: "",
  childName: "",
  childDob: "",
  childAge: "",
  childGender: "",
  incidentDate: new Date().toISOString().slice(0, 10),
  incidentTime: "",
  location: "",
  locationDetails: "",
  witnessName: "",
  witnessDate: "",
  witnessSignature: "",
  detailsInjury: "",
  causeOfInjury: "",
  missingCircumstances: "",
  removedCircumstances: "",
  natures: [],
  natureOtherRemarks: "",
  bodyInjuryMarkers: [],
  actionDetails: "",
  emergencyAttended: "no",
  emergencyContactedTime: "",
  emergencyArrivedTime: "",
  medicalSought: "no",
  medicalAttentionDetails: "",
  preventionStep1: "",
  otherAgency: "",
  regulatoryAuthority: "",
  injuryImageResponsib: "",
  parent1Name: "",
  parent1Date: "",
  parent1Time: "",
  nominatedSupervisorName: "",
  nominatedSupervisorDate: "",
  nominatedSupervisorTime: "",
  otherAgencyDate: "",
  otherAgencyTime: "",
  regulatoryAuthorityDate: "",
  regulatoryAuthorityTime: "",
  ackName: "",
  ackDate: "",
  ackIncident: false,
  ackInjury: false,
  ackTrauma: false,
  ackIllness: false,
  ackSignature: "",
  additionalNotes: "",
  additionalNotesTime: "",
});

function normalizeInitial(initial) {
  if (!initial) return {};
  return {
    ...initial,
    location: initial.location ?? initial.serviceLocation ?? initial.incidentLocation ?? "",
    locationDetails: initial.locationDetails ?? "",
    detailsInjury: initial.detailsInjury ?? "",
    causeOfInjury: initial.causeOfInjury ?? initial.circumstances ?? "",
    natureOtherRemarks: initial.natureOtherRemarks ?? initial.natureOther ?? "",
    medicalAttentionDetails: initial.medicalAttentionDetails ?? initial.yesDetails ?? "",
    preventionStep1: initial.preventionStep1 ?? initial.preventionSteps ?? "",
    parent1Name: initial.parent1Name ?? initial.parentName ?? "",
    parent1Date: initial.parent1Date ?? initial.parentDate ?? "",
    parent1Time: initial.parent1Time ?? initial.parentTime ?? "",
    emergencyContactedTime: initial.emergencyContactedTime ?? initial.emergencyServiceTime ?? "",
    emergencyArrivedTime: initial.emergencyArrivedTime ?? initial.emergencyServiceDetails ?? "",
    nominatedSupervisorName: initial.nominatedSupervisorName ?? initial.directorName ?? "",
    otherAgencyDate: initial.otherAgencyDate ?? "",
    otherAgencyTime: initial.otherAgencyTime ?? "",
    regulatoryAuthorityDate: initial.regulatoryAuthorityDate ?? initial.regDate ?? "",
    regulatoryAuthorityTime: initial.regulatoryAuthorityTime ?? initial.regTime ?? "",
    ackName: initial.ackName ?? "",
    ackSignature: initial.ackSignature ?? "",
    additionalNotesTime: initial.additionalNotesTime ?? initial.ackTime ?? "",
  };
}

export function AccidentFormView({ initial, mode, onCancel, onSubmit, isSaving }) {
  const isEdit = mode === "edit";
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const activeRoomId = useRoomStore((s) => s.activeRoomId);
  const [data, setData] = useState(() => ({ ...empty(), ...normalizeInitial(initial) }));
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isFetchingChildDetails, setIsFetchingChildDetails] = useState(false);
  const [children, setChildren] = useState([]);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);
  const childOptions =
    data.childId && !children.some((child) => String(child.id) === String(data.childId))
      ? [
          {
            id: data.childId,
            name: data.childName || "Selected child",
            dob: data.childDob,
            age: data.childAge,
            gender: data.childGender,
          },
          ...children,
        ]
      : children;

  useEffect(() => {
    if (initial) setData({ ...empty(), ...normalizeInitial(initial) });
  }, [initial]);

  // Fetch children using filterChildren API
  useEffect(() => {
    const fetchChildren = async () => {
      if (!activeCentreId || !activeRoomId) {
        setChildren([]);
        return;
      }
      setIsLoadingChildren(true);
      try {
        const response = await childrenService.filterChildren({
          room_id: activeRoomId,
          status: "Active",
          center_id: activeCentreId,
          page: 1,
          per_page: 100,
        });
        const childrenData = response.data?.data || response.data || [];
        setChildren(Array.isArray(childrenData) ? childrenData : []);
      } catch (error) {
        console.error("Failed to load children:", error);
        setChildren([]);
      } finally {
        setIsLoadingChildren(false);
      }
    };
    fetchChildren();
  }, [activeCentreId, activeRoomId]);

  // Auto-calculate age when DOB changes
  useEffect(() => {
    if (data.childDob) {
      const calculatedAge = calculateAgeFromDob(data.childDob);
      set({ childAge: calculatedAge });
    }
  }, [data.childDob]);

  const set = (patch) => setData((p) => ({ ...p, ...patch }));

  const toggleNature = (label) => {
    set({
      natures: data.natures.includes(label)
        ? data.natures.filter((n) => n !== label)
        : [...data.natures, label],
    });
  };

  const handleChildSelect = async (id) => {
    const child = childOptions.find((c) => String(c.id) === String(id));
    if (!child) return;

    const dob = child.dob || data.childDob;
    const calculatedAge = dob ? calculateAgeFromDob(dob) : child.age || data.childAge;

    set({
      childId: id,
      childName: `${child.name || ""} ${child.lastname || ""}`.trim(),
      childDob: dob,
      childAge: calculatedAge,
      childGender: child.gender || data.childGender,
    });

    // Fetch child details to auto-fill
    if (id) {
      setIsFetchingChildDetails(true);
      try {
        const res = await childrenService.getChildDetails(id);
        const childDetails = res.data || res;
        if (childDetails) {
          const detailsDob = childDetails.dob || dob;
          const detailsAge = detailsDob
            ? calculateAgeFromDob(detailsDob)
            : childDetails.age || calculatedAge;
          set({
            childDob: detailsDob,
            childAge: detailsAge,
            childGender: childDetails.gender || data.childGender,
          });
        }
      } catch (error) {
        console.error("Failed to fetch child details:", error);
      } finally {
        setIsFetchingChildDetails(false);
      }
    }
  };

  const handleSave = async () => {
    if (!data.recorderName.trim()) {
      toast.error("Please enter Name under Details of person completing this record.");
      return;
    }
    if (!data.childId) {
      toast.error("Please select a child.");
      return;
    }
    if (!data.incidentDate) {
      toast.error("Please select the incident date.");
      return;
    }
    if (!data.incidentTime) {
      toast.error("Please select the incident time.");
      return;
    }

    // Generate marked body diagram image if there are markers
    let bodyInjuryImageBase64 = null;
    if (!isEdit && data.bodyInjuryMarkers && data.bodyInjuryMarkers.length > 0) {
      setIsGeneratingImage(true);
      try {
        bodyInjuryImageBase64 = await generateMarkedBodyImage(data.bodyInjuryMarkers);
      } catch (error) {
        console.error("Failed to generate body injury image:", error);
        toast.error("Failed to generate body injury diagram image");
        return;
      } finally {
        setIsGeneratingImage(false);
      }
    }

    // Remove bodyInjuryMarkers from the data being sent
    const { bodyInjuryMarkers, ...dataToSend } = data;
    onSubmit({ ...dataToSend, bodyInjuryImageBase64 });
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
              <p className="text-xs font-bold uppercase tracking-widest text-primary">
                Official record
              </p>
              <h2 className="mt-1 text-xl font-bold tracking-tight text-foreground">
                Incident, Injury, Trauma &amp; Illness Record
              </h2>
              <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
                Placeholders show examples only — labels stay as on the paper form. Fields with *
                are required.
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
            <FormField label="Service Name">
              <Input
                className={INPUT_CLASS}
                value={data.serviceName}
                onChange={(e) => set({ serviceName: e.target.value })}
                placeholder="Child care service name"
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
                actionLabel={isEdit ? "Update" : undefined}
              />
            </FormField>
          </Grid2>
        </Section>

        <Section icon={Baby} title="Child Details" step={2}>
          <Grid2>
            <FormField label="Child" required hint="Select the child involved in this incident">
              <Select
                value={data.childId ? String(data.childId) : undefined}
                onValueChange={handleChildSelect}
                disabled={isFetchingChildDetails || isLoadingChildren}
              >
                <SelectTrigger className={INPUT_CLASS}>
                  <SelectValue
                    placeholder={isLoadingChildren ? "Loading children..." : "Select child…"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {!activeCentreId || !activeRoomId ? (
                    <SelectItem value="_none" disabled>
                      Please select centre and room first
                    </SelectItem>
                  ) : isLoadingChildren ? (
                    <SelectItem value="_none" disabled>
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading children...
                      </div>
                    </SelectItem>
                  ) : childOptions.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      No children found
                    </SelectItem>
                  ) : (
                    childOptions.map((c) => {
                      const img = avatarUrl(c.imageUrl);
                      const fullName = `${c.name} ${c.lastname || ""}`.trim();
                      return (
                        <SelectItem key={c.id} value={String(c.id)}>
                          <div className="flex items-center gap-2">
                            {img ? (
                              <img
                                src={img}
                                alt={fullName}
                                className="h-5 w-5 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-5 w-5 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center">
                                {fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </div>
                            )}
                            <span>{fullName}</span>
                          </div>
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              {isFetchingChildDetails && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading child details...
                </p>
              )}
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
                {["Female", "Male"].map((g) => (
                  <label
                    key={g}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium transition",
                      data.childGender === g &&
                        "border-primary bg-primary/10 text-primary shadow-sm",
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

        <Section icon={AlertTriangle} title="Incident / injury / trauma / illness details" step={3}>
          <Grid2>
            <FormField label="Date" required hint="Date the incident occurred">
              <Input
                className={INPUT_CLASS}
                type="date"
                value={data.incidentDate}
                onChange={(e) => set({ incidentDate: e.target.value })}
              />
            </FormField>
            <FormField label="Time" required hint="Time the incident occurred">
              <Input
                className={INPUT_CLASS}
                type="time"
                value={data.incidentTime}
                onChange={(e) => set({ incidentTime: e.target.value })}
              />
            </FormField>
            <FormField label="Location of service">
              <Input
                className={INPUT_CLASS}
                value={data.location}
                onChange={(e) => set({ location: e.target.value })}
                placeholder="Service address"
              />
            </FormField>
            <FormField label="Location of incident/injury/trauma/illness">
              <Input
                className={INPUT_CLASS}
                value={data.locationDetails}
                onChange={(e) => set({ locationDetails: e.target.value })}
                placeholder="Specific area where the incident happened"
              />
            </FormField>
            <FormField label="Name of person who witnessed the incident/injury/trauma/illness">
              <Input
                className={INPUT_CLASS}
                value={data.witnessName}
                onChange={(e) => set({ witnessName: e.target.value })}
                placeholder="Full name, or N/A"
              />
            </FormField>
            <FormField label="Date" required hint="Witness signature date">
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
                actionLabel={isEdit ? "Update" : undefined}
              />
            </FormField>
          </Grid2>

          <div className="mt-5 space-y-4 rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
            <FormField
              label="Details of incident/injury/trauma/illness"
              placeholder="Describe what happened or was observed"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={6}
                value={data.detailsInjury}
                onChange={(e) => set({ detailsInjury: e.target.value })}
                placeholder="Record the details of the incident, injury, trauma or illness"
              />
            </FormField>
            <FormField
              label="Circumstances leading to the incident/injury/trauma/illness, including any apparent symptoms"
              placeholder="Describe the circumstances and symptoms"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={6}
                value={data.causeOfInjury}
                onChange={(e) => set({ causeOfInjury: e.target.value })}
                placeholder="What led to the event? Include any apparent symptoms."
              />
            </FormField>
            <FormField
              label="Circumstances if child appeared to be missing or otherwise unaccounted for (incl duration, who found child etc.):"
              placeholder="Leave blank if not applicable"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={5}
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
                rows={5}
                value={data.removedCircumstances}
                onChange={(e) => set({ removedCircumstances: e.target.value })}
                placeholder="Who removed child, how long, how resolved…"
              />
            </FormField>
          </div>
        </Section>

        <Section icon={Activity} title="Nature of Injury / Trauma / Illness" step={4}>
          <div className="mb-6">
            {isEdit ? (
              <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
                <div className="bg-amber-400 px-4 py-2.5">
                  <h4 className="text-sm font-bold text-white">Injury image</h4>
                </div>
                <div className="bg-muted/20 p-4">
                  {data.bodyInjuryImage ? (
                    <img
                      src={data.bodyInjuryImage}
                      alt="Recorded injury"
                      className="mx-auto max-h-[520px] w-auto max-w-full rounded-xl border border-border bg-white object-contain"
                    />
                  ) : (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No injury image was recorded.
                    </p>
                  )}
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    The injury image is read-only and cannot be updated.
                  </p>
                </div>
              </div>
            ) : (
              <BodyInjuryDiagram
                markers={data.bodyInjuryMarkers}
                onChange={(markers) => set({ bodyInjuryMarkers: markers })}
              />
            )}
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
                  <span
                    className={cn(
                      "leading-snug",
                      checked ? "font-semibold text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {opt}
                  </span>
                  <Switch checked={checked} onCheckedChange={() => toggleNature(opt)} />
                </label>
              );
            })}
          </div>
          {data.natures.includes("Other (please specify)") && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
              <FormField
                label="Other (please specify)"
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
              label="Details of action taken (including first aid, administration of medication, etc.)"
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
              <FormField label="Did emergency services attend?">
                <YesNo
                  value={data.emergencyAttended}
                  onChange={(v) => set({ emergencyAttended: v })}
                />
              </FormField>
              <FormField label="Time emergency services contacted">
                <Input
                  className={INPUT_CLASS}
                  type="time"
                  value={data.emergencyContactedTime}
                  onChange={(e) => set({ emergencyContactedTime: e.target.value })}
                />
              </FormField>
              <FormField label="Time emergency services arrived">
                <Input
                  className={INPUT_CLASS}
                  type="time"
                  value={data.emergencyArrivedTime}
                  onChange={(e) => set({ emergencyArrivedTime: e.target.value })}
                />
              </FormField>
              <FormField label="Was medical attention sought from a registered practitioner / hospital?">
                <YesNo value={data.medicalSought} onChange={(v) => set({ medicalSought: v })} />
              </FormField>
            </Grid2>
            <FormField
              label="If yes to either of the above, provide details"
              placeholder="Emergency services, practitioner, hospital, treatment — leave blank if N/A"
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
              label="Have any steps been taken to prevent or minimise this type of incident in the future? If yes, provide details."
              placeholder="Steps taken to prevent or minimise recurrence"
            >
              <Textarea
                className={TEXTAREA_CLASS}
                rows={3}
                value={data.preventionStep1}
                onChange={(e) => set({ preventionStep1: e.target.value })}
                placeholder="Describe future prevention or minimisation steps"
              />
            </FormField>
          </div>
        </Section>

        <Section icon={Bell} title="Notifications (including attempted notifications)" step={6}>
          <NotificationBlock
            title="Parent/guardian/carer"
            nameLabel="Parent/guardian/carer"
            nameValue={data.parent1Name}
            onNameChange={(value) => set({ parent1Name: value })}
            dateValue={data.parent1Date}
            onDateChange={(value) => set({ parent1Date: value })}
            timeValue={data.parent1Time}
            onTimeChange={(value) => set({ parent1Time: value })}
          />
          <NotificationBlock
            title="Director/educator/coordinator"
            nameLabel="Director/educator/coordinator"
            nameValue={data.nominatedSupervisorName}
            onNameChange={(value) => set({ nominatedSupervisorName: value })}
            dateValue={data.nominatedSupervisorDate}
            onDateChange={(value) => set({ nominatedSupervisorDate: value })}
            timeValue={data.nominatedSupervisorTime}
            onTimeChange={(value) => set({ nominatedSupervisorTime: value })}
          />
          <SubSection title="Other agency:">
            <Grid2>
              <FormField label="Other agency (if applicable)">
                <Input
                  className={INPUT_CLASS}
                  value={data.otherAgency}
                  onChange={(e) => set({ otherAgency: e.target.value })}
                  placeholder="Name of other agency"
                />
              </FormField>
              <FormField label="Date">
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
              <FormField label="Regulatory authority (if applicable)">
                <Input
                  className={INPUT_CLASS}
                  value={data.regulatoryAuthority}
                  onChange={(e) => set({ regulatoryAuthority: e.target.value })}
                  placeholder="Name of regulatory authority"
                />
              </FormField>
              <FormField label="Date">
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

        <Section icon={CheckCircle2} title="Parental acknowledgement" step={7}>
          <div className="space-y-6 rounded-xl border border-border/80 bg-muted/15 p-5">
            <div className="text-sm text-foreground space-y-4">
              <div className="flex flex-wrap items-center gap-2 leading-loose">
                <span className="text-base font-semibold">I,</span>
                <Input
                  className="h-10 w-full sm:w-[350px] inline-block border-b-2 border-t-0 border-x-0 rounded-none border-slate-300 bg-transparent px-2 focus-visible:ring-0 focus-visible:border-primary placeholder:text-muted-foreground/50 placeholder:italic"
                  value={data.ackName}
                  onChange={(e) => set({ ackName: e.target.value })}
                  placeholder="name of parent/guardian/carer"
                />
                <span className="text-xs text-muted-foreground italic shrink-0">(name of parent/guardian/carer)</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pt-2">
                <span className="text-sm font-medium">have been notified of my child's</span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    ["Incident", "ackIncident"],
                    ["Injury", "ackInjury"],
                    ["Trauma", "ackTrauma"],
                    ["Illness", "ackIllness"],
                  ].map(([label, key]) => {
                    const checked = data[key];
                    return (
                      <label
                        key={key}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer select-none transition-all",
                          checked
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-background text-muted-foreground hover:border-primary/30"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => set({ [key]: e.target.checked })}
                          className="h-3.5 w-3.5 rounded border-slate-300 text-primary focus:ring-primary/20 cursor-pointer"
                        />
                        <span>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground italic mt-1.5">
                (Please select either incident/injury/trauma/illness)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/60">
              <FormField label="Signature" hint="Sign using the pad below">
                <SignatureField
                  value={data.ackSignature}
                  onChange={(v) => set({ ackSignature: v })}
                  label="Final signature"
                  actionLabel={isEdit ? "Update" : undefined}
                />
              </FormField>

              <FormField label="Date" hint="Date of parental acknowledgement">
                <Input
                  className={INPUT_CLASS}
                  type="date"
                  value={data.ackDate}
                  onChange={(e) => set({ ackDate: e.target.value })}
                />
              </FormField>
            </div>
          </div>
        </Section>

        <Section icon={StickyNote} title="Additional notes" step={8}>
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
            <Button variant="outline" onClick={onCancel} disabled={isGeneratingImage || isSaving}>
              <X className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isGeneratingImage || isSaving}>
              {isGeneratingImage || isSaving ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  {isGeneratingImage ? "Generating image..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="mr-1.5 h-4 w-4" />
                  {isEdit ? "Save changes" : "Save record"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotificationBlock({
  title,
  nameLabel,
  nameValue,
  onNameChange,
  dateValue,
  onDateChange,
  timeValue,
  onTimeChange,
}) {
  return (
    <SubSection title={title}>
      <Grid2>
        <FormField label={nameLabel}>
          <Input
            className={INPUT_CLASS}
            value={nameValue}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Full name"
          />
        </FormField>
        <FormField label="Date">
          <Input
            className={INPUT_CLASS}
            type="date"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </FormField>
        <FormField label="Time">
          <Input
            className={INPUT_CLASS}
            type="time"
            value={timeValue}
            onChange={(e) => onTimeChange(e.target.value)}
          />
        </FormField>
      </Grid2>
    </SubSection>
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
