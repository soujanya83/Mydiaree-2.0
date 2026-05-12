import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Info,
  MapPin,
  Phone,
  UserCheck,
  UserCog,
  Mail,
  GraduationCap,
  ClipboardList,
  Lightbulb,
  Save,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { serviceDetailsService } from "@/services/centre/serviceDetailsService";
import { useCentreStore } from "@/stores/centreStore";

function Section({ icon: Icon, title, children, accent = "primary", tinted = false }) {
  const accentBar = {
    primary: "bg-primary",
    success: "bg-success",
    warning: "bg-warning",
    info: "bg-info",
  }[accent];
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm",
        tinted && "bg-accent/40",
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-primary" />}
        <h2 className="text-base font-semibold text-primary">{title}</h2>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">{children}</div>
      <span className={cn("absolute inset-x-0 bottom-0 h-1", accentBar)} />
    </section>
  );
}

function Field({ label, children, full = false, error }) {
  return (
    <div className={cn("space-y-1.5", full && "md:col-span-2")}>
      <Label className={cn("text-xs font-semibold text-primary", error && "text-destructive")}>
        {label}
      </Label>
      {children}
      {error && (
        <p className="text-[10px] font-medium text-destructive animate-in fade-in slide-in-from-top-1">
          {error}
        </p>
      )}
    </div>
  );
}

const initialData = {
  serviceName: "",
  serviceApprovalNumber: "",
  physStreet: "",
  physSuburb: "",
  physState: "",
  physPostcode: "",
  telephone: "",
  mobilePhone: "",
  fax: "",
  email: "",
  apPrimaryContact: "",
  apTelephone: "",
  apMobile: "",
  apFax: "",
  apEmail: "",
  nsName: "",
  nsTelephone: "",
  nsMobile: "",
  nsFax: "",
  nsEmail: "",
  postalStreet: "",
  postalSuburb: "",
  postalState: "",
  postalPostcode: "",
  elName: "",
  elTelephone: "",
  elEmail: "",
  strengths: "",
  groupedHow: "",
  responsiblePerson: "",
  educatorsRegistered: "",
  philosophy: "",
};

const mapServiceDetails = (details = {}) => ({
  serviceName: details.serviceName || "",
  serviceApprovalNumber: details.serviceApprovalNumber || "",
  physStreet: details.serviceStreet || "",
  physSuburb: details.serviceSuburb || "",
  physState: details.serviceState || "",
  physPostcode: details.servicePostcode || "",
  telephone: details.contactTelephone || "",
  mobilePhone: details.contactMobile || "",
  fax: details.contactFax || "",
  email: details.contactEmail || "",
  apPrimaryContact: details.providerContact || "",
  apTelephone: details.providerTelephone || "",
  apMobile: details.providerMobile || "",
  apFax: details.providerFax || "",
  apEmail: details.providerEmail || "",
  nsName: details.supervisorName || "",
  nsTelephone: details.supervisorTelephone || "",
  nsMobile: details.supervisorMobile || "",
  nsFax: details.supervisorFax || "",
  nsEmail: details.supervisorEmail || "",
  postalStreet: details.postalStreet || "",
  postalSuburb: details.postalSuburb || "",
  postalState: details.postalState || "",
  postalPostcode: details.postalPostcode || "",
  elName: details.eduLeaderName || "",
  elTelephone: details.eduLeaderTelephone || "",
  elEmail: details.eduLeaderEmail || "",
  strengths: details.strengthSummary || "",
  groupedHow: details.childGroupService || "",
  responsiblePerson: details.personSubmittingQip || "",
  educatorsRegistered: details.educatorsData || "",
  philosophy: details.philosophyStatement || "",
});

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.msg || error?.message || fallback;

export default function ServiceDetailsPage() {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const centres = useCentreStore((s) => s.centres);
  const centresLoading = useCentreStore((s) => s.isLoading);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);
  const selectedCentreId = useMemo(() => {
    if (activeCentreId) return String(activeCentreId);
    return centres[0]?.id ? String(centres[0].id) : "";
  }, [activeCentreId, centres]);
  const set = (k) => (e) => {
    setData((d) => ({ ...d, [k]: e.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: null }));
  };

  useEffect(() => {
    if (!activeCentreId && centres[0]?.id) {
      setActiveCentre(String(centres[0].id));
    }
  }, [activeCentreId, centres, setActiveCentre]);

  useEffect(() => {
    if (!selectedCentreId) return;

    let ignore = false;
    const fetchServiceDetails = async () => {
      setLoading(true);
      try {
        const res = await serviceDetailsService.getServiceDetails(selectedCentreId);
        if (!ignore) {
          setData(mapServiceDetails(res.data?.serviceDetails));
          setErrors({});
        }
      } catch (error) {
        if (!ignore) {
          setData(initialData);
          toast.error(getErrorMessage(error, "Failed to load service details"));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchServiceDetails();

    return () => {
      ignore = true;
    };
  }, [selectedCentreId]);

  const handleSave = async () => {
    if (!selectedCentreId) return;
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("user_center_id", selectedCentreId);
      formData.append("serviceName", data.serviceName);
      formData.append("serviceApprovalNumber", data.serviceApprovalNumber);
      formData.append("serviceStreet", data.physStreet);
      formData.append("serviceSuburb", data.physSuburb);
      formData.append("serviceState", data.physState);
      formData.append("servicePostcode", data.physPostcode);
      formData.append("contactTelephone", data.telephone);
      formData.append("contactMobile", data.mobilePhone);
      formData.append("contactFax", data.fax);
      formData.append("contactEmail", data.email);
      formData.append("providerContact", data.apPrimaryContact);
      formData.append("providerTelephone", data.apTelephone);
      formData.append("providerMobile", data.apMobile);
      formData.append("providerFax", data.apFax);
      formData.append("providerEmail", data.apEmail);
      formData.append("supervisorName", data.nsName);
      formData.append("supervisorTelephone", data.nsTelephone);
      formData.append("supervisorMobile", data.nsMobile);
      formData.append("supervisorFax", data.nsFax);
      formData.append("supervisorEmail", data.nsEmail);
      formData.append("postalStreet", data.postalStreet);
      formData.append("postalSuburb", data.postalSuburb);
      formData.append("postalState", data.postalState);
      formData.append("postalPostcode", data.postalPostcode);
      formData.append("eduLeaderName", data.elName);
      formData.append("eduLeaderTelephone", data.elTelephone);
      formData.append("eduLeaderEmail", data.elEmail);
      formData.append("strengthSummary", data.strengths);
      formData.append("childGroupService", data.groupedHow);
      formData.append("personSubmittingQip", data.responsiblePerson);
      formData.append("educatorsData", data.educatorsRegistered);
      formData.append("philosophyStatement", data.philosophy);

      const res = await serviceDetailsService.updateServiceDetails(formData);
      if (res.status) {
        toast.success("Service details updated successfully");
        setErrors({});
      } else {
        if (res.errors) {
          // Map API keys back to local state keys for errors
          const mappedErrors = {};
          const keyMap = {
            serviceName: "serviceName",
            serviceApprovalNumber: "serviceApprovalNumber",
            serviceStreet: "physStreet",
            serviceSuburb: "physSuburb",
            serviceState: "physState",
            servicePostcode: "physPostcode",
            contactTelephone: "telephone",
            contactMobile: "mobilePhone",
            contactFax: "fax",
            contactEmail: "email",
            providerContact: "apPrimaryContact",
            providerTelephone: "apTelephone",
            providerMobile: "apMobile",
            providerFax: "apFax",
            providerEmail: "apEmail",
            supervisorName: "nsName",
            supervisorTelephone: "nsTelephone",
            supervisorMobile: "nsMobile",
            supervisorFax: "nsFax",
            supervisorEmail: "nsEmail",
            postalStreet: "postalStreet",
            postalSuburb: "postalSuburb",
            postalState: "postalState",
            postalPostcode: "postalPostcode",
            eduLeaderName: "elName",
            eduLeaderTelephone: "elTelephone",
            eduLeaderEmail: "elEmail",
            strengthSummary: "strengths",
            childGroupService: "groupedHow",
            personSubmittingQip: "responsiblePerson",
            educatorsData: "educatorsRegistered",
            philosophyStatement: "philosophy",
          };

          Object.keys(res.errors).forEach((apiKey) => {
            const localKey = keyMap[apiKey] || apiKey;
            mappedErrors[localKey] = Array.isArray(res.errors[apiKey])
              ? res.errors[apiKey][0]
              : res.errors[apiKey];
          });
          setErrors(mappedErrors);
          toast.error("Please check the form for validation errors");
        } else {
          toast.error(res.message || "Failed to update service details");
        }
      }
    } catch (error) {
      if (error.response?.data?.errors) {
        const mappedErrors = {};
        const keyMap = {
          serviceName: "serviceName",
          serviceApprovalNumber: "serviceApprovalNumber",
          serviceStreet: "physStreet",
          serviceSuburb: "physSuburb",
          serviceState: "physState",
          servicePostcode: "physPostcode",
          contactTelephone: "telephone",
          contactMobile: "mobilePhone",
          contactFax: "fax",
          contactEmail: "email",
          providerContact: "apPrimaryContact",
          providerTelephone: "apTelephone",
          providerMobile: "apMobile",
          providerFax: "apFax",
          providerEmail: "apEmail",
          supervisorName: "nsName",
          supervisorTelephone: "nsTelephone",
          supervisorMobile: "nsMobile",
          supervisorFax: "nsFax",
          supervisorEmail: "nsEmail",
          postalStreet: "postalStreet",
          postalSuburb: "postalSuburb",
          postalState: "postalState",
          postalPostcode: "postalPostcode",
          eduLeaderName: "elName",
          eduLeaderTelephone: "elTelephone",
          eduLeaderEmail: "elEmail",
          strengthSummary: "strengths",
          childGroupService: "groupedHow",
          personSubmittingQip: "responsiblePerson",
          educatorsData: "educatorsRegistered",
          philosophyStatement: "philosophy",
        };

        Object.keys(error.response.data.errors).forEach((apiKey) => {
          const localKey = keyMap[apiKey] || apiKey;
          mappedErrors[localKey] = Array.isArray(error.response.data.errors[apiKey])
            ? error.response.data.errors[apiKey][0]
            : error.response.data.errors[apiKey];
        });
        setErrors(mappedErrors);
        toast.error("Validation failed. Please correct the errors.");
      } else {
        toast.error(getErrorMessage(error, "Error saving service details"));
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Update Service Details"
        description="Maintain your centre's profile, contacts and statement of philosophy"
        breadcrumbs={[{ label: "Update Service Details" }]}
        actions={
          <Select
            value={selectedCentreId}
            onValueChange={setActiveCentre}
            disabled={centresLoading || loading || centres.length === 0}
          >
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Select Centre" />
            </SelectTrigger>
            <SelectContent>
              {centres.map((centre) => (
                <SelectItem key={centre.id} value={String(centre.id)}>
                  {centre.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {loading ? (
        <div className="rounded-xl border bg-card">
          <Loader className="py-20" label="Loading service details..." />
        </div>
      ) : (
        <>
          <Section icon={Info} title="Service Information">
            <Field label="Service Name" error={errors.serviceName}>
              <Textarea rows={2} value={data.serviceName} onChange={set("serviceName")} />
            </Field>
            <Field label="Service Approval Number" error={errors.serviceApprovalNumber}>
              <Textarea
                rows={2}
                value={data.serviceApprovalNumber}
                onChange={set("serviceApprovalNumber")}
              />
            </Field>
          </Section>

          <Section icon={MapPin} title="Physical Location of Service">
            <Field label="Street Address" error={errors.physStreet}>
              <Input value={data.physStreet} onChange={set("physStreet")} />
            </Field>
            <Field label="Suburb" error={errors.physSuburb}>
              <Input value={data.physSuburb} onChange={set("physSuburb")} />
            </Field>
            <Field label="State/Territory" error={errors.physState}>
              <Input value={data.physState} onChange={set("physState")} />
            </Field>
            <Field label="Postcode" error={errors.physPostcode}>
              <Input value={data.physPostcode} onChange={set("physPostcode")} />
            </Field>
          </Section>

          <Section icon={Phone} title="Physical Location Contact Details">
            <Field label="Telephone" error={errors.telephone}>
              <Input value={data.telephone} onChange={set("telephone")} />
            </Field>
            <Field label="Mobile Phone" error={errors.mobilePhone}>
              <Input value={data.mobilePhone} onChange={set("mobilePhone")} />
            </Field>
            <Field label="Fax" error={errors.fax}>
              <Input value={data.fax} onChange={set("fax")} />
            </Field>
            <Field label="Email Address" error={errors.email}>
              <Input type="email" value={data.email} onChange={set("email")} />
            </Field>
          </Section>

          <Section icon={UserCheck} title="Approved Provider">
            <Field label="Primary Contact" error={errors.apPrimaryContact}>
              <Input value={data.apPrimaryContact} onChange={set("apPrimaryContact")} />
            </Field>
            <Field label="Telephone" error={errors.apTelephone}>
              <Input value={data.apTelephone} onChange={set("apTelephone")} />
            </Field>
            <Field label="Mobile" error={errors.apMobile}>
              <Input value={data.apMobile} onChange={set("apMobile")} />
            </Field>
            <Field label="Fax" error={errors.apFax}>
              <Input value={data.apFax} onChange={set("apFax")} />
            </Field>
            <Field label="Email Address" full error={errors.apEmail}>
              <Input type="email" value={data.apEmail} onChange={set("apEmail")} />
            </Field>
          </Section>

          <Section icon={UserCog} title="Nominated Supervisor">
            <Field label="Name" error={errors.nsName}>
              <Input value={data.nsName} onChange={set("nsName")} />
            </Field>
            <Field label="Telephone" error={errors.nsTelephone}>
              <Input
                placeholder="Enter telephone number"
                value={data.nsTelephone}
                onChange={set("nsTelephone")}
              />
            </Field>
            <Field label="Mobile" error={errors.nsMobile}>
              <Input value={data.nsMobile} onChange={set("nsMobile")} />
            </Field>
            <Field label="Fax" error={errors.nsFax}>
              <Input value={data.nsFax} onChange={set("nsFax")} />
            </Field>
            <Field label="Email Address" full error={errors.nsEmail}>
              <Input value={data.nsEmail} onChange={set("nsEmail")} />
            </Field>
          </Section>

          <Section icon={Mail} title="Postal Address (if different from physical)">
            <Field label="Street Address" error={errors.postalStreet}>
              <Input value={data.postalStreet} onChange={set("postalStreet")} />
            </Field>
            <Field label="Suburb" error={errors.postalSuburb}>
              <Input value={data.postalSuburb} onChange={set("postalSuburb")} />
            </Field>
            <Field label="State/Territory" error={errors.postalState}>
              <Input value={data.postalState} onChange={set("postalState")} />
            </Field>
            <Field label="Postcode" error={errors.postalPostcode}>
              <Input
                placeholder="Enter postal postcode"
                value={data.postalPostcode}
                onChange={set("postalPostcode")}
              />
            </Field>
          </Section>

          <Section icon={GraduationCap} title="Educational Leader">
            <Field label="Name" error={errors.elName}>
              <Input
                placeholder="Enter educational leader name"
                value={data.elName}
                onChange={set("elName")}
              />
            </Field>
            <Field label="Telephone" error={errors.elTelephone}>
              <Input
                placeholder="Enter telephone number"
                value={data.elTelephone}
                onChange={set("elTelephone")}
              />
            </Field>
            <Field label="Email Address" full error={errors.elEmail}>
              <Input
                placeholder="Enter email address"
                value={data.elEmail}
                onChange={set("elEmail")}
              />
            </Field>
          </Section>

          <Section icon={ClipboardList} title="Additional Information About Your Service">
            <Field label="Summary of strengths for Educational Program and practice" error={errors.strengths}>
              <Textarea rows={4} value={data.strengths} onChange={set("strengths")} />
            </Field>
            <Field label="How are the children grouped at your service?" error={errors.groupedHow}>
              <Textarea rows={4} value={data.groupedHow} onChange={set("groupedHow")} />
            </Field>
            <Field label="Name and position of person(s) responsible for submitting" error={errors.responsiblePerson}>
              <Textarea
                rows={4}
                value={data.responsiblePerson}
                onChange={set("responsiblePerson")}
              />
            </Field>
            <Field label="Number of educators registered" error={errors.educatorsRegistered}>
              <Textarea
                rows={4}
                value={data.educatorsRegistered}
                onChange={set("educatorsRegistered")}
              />
            </Field>
          </Section>

          <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary-glow p-6 shadow-lg">
            <div className="mb-3 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary-foreground" />
              <h2 className="text-base font-semibold text-primary-foreground">
                Service Statement of Philosophy
              </h2>
            </div>
            <p className="mb-3 text-xs font-medium text-primary-foreground/90">
              Insert your service's statement of philosophy here
            </p>
            <Textarea
              rows={6}
              value={data.philosophy}
              onChange={set("philosophy")}
              className="bg-card/95 text-foreground"
            />
            {errors.philosophy && (
              <p className="mt-2 text-[10px] font-medium text-white animate-in fade-in slide-in-from-top-1">
                {errors.philosophy}
              </p>
            )}
          </section>

          <div className="flex justify-center pt-2">
            <Button
              onClick={handleSave}
              size="lg"
              disabled={isSaving}
              className="rounded-full bg-gradient-to-r from-primary to-primary-glow px-10 shadow-glow"
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
