import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, RefreshCw, AlertTriangle, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { dayOptions, sessionOptions, kinderOptions } from "@/components/forms/reEnrollmentData";

function SectionTitle({ children }) {
  return (
    <div className="border-b-2 border-warning/60 pb-1.5">
      <h2 className="text-xl font-bold text-primary">{children}</h2>
    </div>
  );
}

export default function ReEnrollmentFormPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    childName: "",
    dob: "",
    parentEmail: "",
    currentDays: [],
    requestedDays: [],
    session: "",
    kinder: "",
    finishingChildName: "",
    finishingLastDay: "",
    holidayPlans: "",
  });

  const setField = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const toggleDay = (group, day, on) =>
    setForm((f) => ({
      ...f,
      [group]: on ? [...f[group], day] : f[group].filter((d) => d !== day),
    }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.childName.trim() || !form.dob || !form.parentEmail.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    toast.success("Re-Enrollment submitted successfully");
    navigate("/forms");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <nav className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>Forms</span><span>/</span>
          <span className="text-foreground">Re-Enrollment Form</span>
        </nav>
      </div>

      <form onSubmit={submit} className="space-y-6 rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-center text-3xl font-bold text-foreground">Re-Enrolment 2026</h1>

        <div className="rounded-xl border-l-4 border-info bg-info/10 p-4 text-sm text-foreground/90">
          <p>
            We sincerely thank you for being part of Nextgen Montessori in 2025. As we begin planning for 2026,
            we kindly ask you to select your preferred days below. Please note that all current bookings will
            automatically end on <span className="font-semibold text-destructive">31 December 2025</span>.
          </p>
          <p className="mt-2">
            To secure your child's place at Nextgen Montessori in 2026, please complete the form below. If you
            would like to change or increase your child's days, please select them below so we can arrange this
            for the new year starting <span className="font-semibold">1 January 2026</span>.
          </p>
          <p className="mt-2">
            Even if you <span className="font-semibold italic">do not wish to make any changes</span>, we ask
            that you still select the same days to confirm your child's booking for next year.
          </p>
        </div>

        {/* Child Info */}
        <section className="space-y-4">
          <SectionTitle>Child Information</SectionTitle>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Child's Name <span className="text-destructive">*</span></Label>
              <Input value={form.childName} onChange={(e) => setField("childName", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Date of Birth <span className="text-destructive">*</span></Label>
              <Input type="date" value={form.dob} onChange={(e) => setField("dob", e.target.value)} required />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label>Parent Email ID <span className="text-destructive">*</span></Label>
              <Input type="email" value={form.parentEmail} onChange={(e) => setField("parentEmail", e.target.value)} required />
            </div>
          </div>
        </section>

        {/* Current days */}
        <section className="space-y-3">
          <SectionTitle>Current Days (2025)</SectionTitle>
          <p className="text-sm text-foreground/80">Please select the days your child currently attends:</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {dayOptions.map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.currentDays.includes(d)}
                  onCheckedChange={(on) => toggleDay("currentDays", d, !!on)}
                />
                {d}
              </label>
            ))}
          </div>
        </section>

        {/* Requested days */}
        <section className="space-y-3">
          <SectionTitle>Requested Days for 2026</SectionTitle>
          <p className="text-sm text-foreground/80">Please select the days you would like your child to attend in 2026:</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {dayOptions.map((d) => (
              <label key={d} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.requestedDays.includes(d)}
                  onCheckedChange={(on) => toggleDay("requestedDays", d, !!on)}
                />
                {d}
              </label>
            ))}
          </div>
        </section>

        {/* Sessions */}
        <section className="space-y-3">
          <SectionTitle>Requested Sessions</SectionTitle>
          <p className="text-sm text-foreground/80">Please select your preferred session:</p>
          <RadioGroup value={form.session} onValueChange={(v) => setField("session", v)} className="space-y-2">
            {sessionOptions.map((s) => (
              <label key={s.value} className="flex items-center gap-2 text-sm">
                <RadioGroupItem value={s.value} />
                <span><span className="font-semibold">{s.label}</span> ({s.time})</span>
              </label>
            ))}
          </RadioGroup>
        </section>

        {/* Kinder */}
        <section className="space-y-3">
          <SectionTitle>Kinder Program</SectionTitle>
          <p className="text-sm text-foreground/80">Please indicate if your child will be attending Kinder at Nextgen:</p>
          <RadioGroup value={form.kinder} onValueChange={(v) => setField("kinder", v)} className="space-y-2">
            {kinderOptions.map((k) => (
              <label key={k.value} className="flex items-center gap-2 text-sm">
                <RadioGroupItem value={k.value} />
                {k.label}
              </label>
            ))}
          </RadioGroup>
          <div className="flex items-start gap-2 rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>*If your child is attending the kindergarten at Nextgen Montessori, kindly fill the funded-Kinder-funding forms, available at the reception.</span>
          </div>
        </section>

        {/* Finishing up */}
        <section className="space-y-3">
          <SectionTitle>Finishing Up</SectionTitle>
          <p className="text-sm font-semibold text-foreground">
            I have a child attending Primary school in 2026, so I will be finishing up:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Child's Name</Label>
              <Input value={form.finishingChildName} onChange={(e) => setField("finishingChildName", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Last day at Nextgen Montessori</Label>
              <Input type="date" value={form.finishingLastDay} onChange={(e) => setField("finishingLastDay", e.target.value)} />
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-md border-l-4 border-warning bg-warning/10 p-3 text-xs text-foreground/90">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
            <span>Please note that your child must attend their final booked day physically or Centrelink will remove the CCS for all absences leading up to the final booked day.</span>
          </div>
        </section>

        {/* Holiday plans */}
        <section className="space-y-3">
          <SectionTitle>Holiday Plans</SectionTitle>
          <p className="text-sm text-foreground/80">
            If you are away on holidays <span className="italic">(which are more than a week)</span> between
            <span className="font-semibold text-primary"> October 2025 – January 2026</span>, kindly mention the
            dates below to organise the educator's Annual leave for that period.
          </p>
          <div className="space-y-1.5">
            <Label>Holiday Dates</Label>
            <Textarea
              rows={3}
              placeholder="Please specify the dates you will be away"
              value={form.holidayPlans}
              onChange={(e) => setField("holidayPlans", e.target.value)}
            />
          </div>
        </section>

        {/* Reminder */}
        <div className="rounded-xl border-l-4 border-warning bg-warning/10 p-4 text-sm text-foreground/90">
          <h3 className="flex items-center gap-2 font-bold text-warning-foreground">
            <RefreshCw className="h-4 w-4" /> Information Update Reminder
          </h3>
          <p className="mt-2">
            We would also like to take this opportunity to remind you to update any personal information if required.
            Updates can be made directly through the <span className="font-semibold">iParent Portal</span>, or via
            <span className="font-semibold"> Re-enrolment form</span> or by emailing the centre at
            <span className="font-semibold text-primary"> truganina@nextgenmontessori.com.au</span>.
            This includes details such as changes to your address, workplace, phone numbers, or authorised contacts.
            It is your responsibility to ensure this information is accurate and current.
          </p>
          <p className="mt-2">We look forward to continuing to support your family's needs in 2026.</p>
          <p className="mt-2">
            Please return the above form by <span className="font-semibold text-destructive">Friday, 3 October 2025</span> to confirm your child's bookings for the new year.
          </p>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
            <CheckCircle2 className="h-4 w-4" /> Submit Re-Enrolment
          </Button>
        </div>
      </form>
    </div>
  );
}