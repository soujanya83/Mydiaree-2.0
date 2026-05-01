import { useState } from "react";
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
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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
        tinted && "bg-accent/40"
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

function Field({ label, children, full = false }) {
  return (
    <div className={cn("space-y-1.5", full && "md:col-span-2")}>
      <Label className="text-xs font-semibold text-primary">{label}</Label>
      {children}
    </div>
  );
}

const initialData = {
  serviceName: "service1234",
  serviceApprovalNumber: "1234567",
  physStreet: "Noida1",
  physSuburb: "Sector 31",
  physState: "Sector 31",
  physPostcode: "111111",
  telephone: "123456",
  mobilePhone: "7093838054",
  fax: "123567",
  email: "qwerty@gmail.com",
  apPrimaryContact: "NAaA",
  apTelephone: "NA",
  apMobile: "NAA",
  apFax: "NA",
  apEmail: "NA",
  nsName: "service1234",
  nsTelephone: "",
  nsMobile: "9949670984",
  nsFax: "fax",
  nsEmail: "1234567",
  postalStreet: "sreeet",
  postalSuburb: "suburb",
  postalState: "state",
  postalPostcode: "",
  elName: "",
  elTelephone: "",
  elEmail: "",
  strengths: "addddd",
  groupedHow: "how",
  responsiblePerson: "writ",
  educatorsRegistered: "dddddd.\nddffc\nfcf we we",
  philosophy: "hey ffc\ndfgghh as",
};

export default function ServiceDetailsPage() {
  const [data, setData] = useState(initialData);
  const set = (k) => (e) => setData((d) => ({ ...d, [k]: e.target.value }));

  const handleSave = () => {
    toast.success("Service details saved");
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Update Service Details"
        description="Maintain your centre's profile, contacts and statement of philosophy"
        breadcrumbs={[{ label: "Update Service Details" }]}
      />

      <Section icon={Info} title="Service Information">
        <Field label="Service Name">
          <Textarea rows={2} value={data.serviceName} onChange={set("serviceName")} />
        </Field>
        <Field label="Service Approval Number">
          <Textarea rows={2} value={data.serviceApprovalNumber} onChange={set("serviceApprovalNumber")} />
        </Field>
      </Section>

      <Section icon={MapPin} title="Physical Location of Service">
        <Field label="Street Address">
          <Input value={data.physStreet} onChange={set("physStreet")} />
        </Field>
        <Field label="Suburb">
          <Input value={data.physSuburb} onChange={set("physSuburb")} />
        </Field>
        <Field label="State/Territory">
          <Input value={data.physState} onChange={set("physState")} />
        </Field>
        <Field label="Postcode">
          <Input value={data.physPostcode} onChange={set("physPostcode")} />
        </Field>
      </Section>

      <Section icon={Phone} title="Physical Location Contact Details">
        <Field label="Telephone">
          <Input value={data.telephone} onChange={set("telephone")} />
        </Field>
        <Field label="Mobile Phone">
          <Input value={data.mobilePhone} onChange={set("mobilePhone")} />
        </Field>
        <Field label="Fax">
          <Input value={data.fax} onChange={set("fax")} />
        </Field>
        <Field label="Email Address">
          <Input type="email" value={data.email} onChange={set("email")} />
        </Field>
      </Section>

      <Section icon={UserCheck} title="Approved Provider">
        <Field label="Primary Contact">
          <Input value={data.apPrimaryContact} onChange={set("apPrimaryContact")} />
        </Field>
        <Field label="Telephone">
          <Input value={data.apTelephone} onChange={set("apTelephone")} />
        </Field>
        <Field label="Mobile">
          <Input value={data.apMobile} onChange={set("apMobile")} />
        </Field>
        <Field label="Fax">
          <Input value={data.apFax} onChange={set("apFax")} />
        </Field>
        <Field label="Email Address" full>
          <Input type="email" value={data.apEmail} onChange={set("apEmail")} />
        </Field>
      </Section>

      <Section icon={UserCog} title="Nominated Supervisor">
        <Field label="Name">
          <Input value={data.nsName} onChange={set("nsName")} />
        </Field>
        <Field label="Telephone">
          <Input placeholder="Enter telephone number" value={data.nsTelephone} onChange={set("nsTelephone")} />
        </Field>
        <Field label="Mobile">
          <Input value={data.nsMobile} onChange={set("nsMobile")} />
        </Field>
        <Field label="Fax">
          <Input value={data.nsFax} onChange={set("nsFax")} />
        </Field>
        <Field label="Email Address" full>
          <Input value={data.nsEmail} onChange={set("nsEmail")} />
        </Field>
      </Section>

      <Section icon={Mail} title="Postal Address (if different from physical)">
        <Field label="Street Address">
          <Input value={data.postalStreet} onChange={set("postalStreet")} />
        </Field>
        <Field label="Suburb">
          <Input value={data.postalSuburb} onChange={set("postalSuburb")} />
        </Field>
        <Field label="State/Territory">
          <Input value={data.postalState} onChange={set("postalState")} />
        </Field>
        <Field label="Postcode">
          <Input placeholder="Enter postal postcode" value={data.postalPostcode} onChange={set("postalPostcode")} />
        </Field>
      </Section>

      <Section icon={GraduationCap} title="Educational Leader">
        <Field label="Name">
          <Input placeholder="Enter educational leader name" value={data.elName} onChange={set("elName")} />
        </Field>
        <Field label="Telephone">
          <Input placeholder="Enter telephone number" value={data.elTelephone} onChange={set("elTelephone")} />
        </Field>
        <Field label="Email Address" full>
          <Input placeholder="Enter email address" value={data.elEmail} onChange={set("elEmail")} />
        </Field>
      </Section>

      <Section icon={ClipboardList} title="Additional Information About Your Service">
        <Field label="Summary of strengths for Educational Program and practice">
          <Textarea rows={4} value={data.strengths} onChange={set("strengths")} />
        </Field>
        <Field label="How are the children grouped at your service?">
          <Textarea rows={4} value={data.groupedHow} onChange={set("groupedHow")} />
        </Field>
        <Field label="Name and position of person(s) responsible for submitting">
          <Textarea rows={4} value={data.responsiblePerson} onChange={set("responsiblePerson")} />
        </Field>
        <Field label="Number of educators registered">
          <Textarea rows={4} value={data.educatorsRegistered} onChange={set("educatorsRegistered")} />
        </Field>
      </Section>

      <section className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary to-primary-glow p-6 shadow-lg">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-primary-foreground" />
          <h2 className="text-base font-semibold text-primary-foreground">Service Statement of Philosophy</h2>
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
      </section>

      <div className="flex justify-center pt-2">
        <Button
          onClick={handleSave}
          size="lg"
          className="rounded-full bg-gradient-to-r from-primary to-primary-glow px-10 shadow-glow"
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
    </div>
  );
}
