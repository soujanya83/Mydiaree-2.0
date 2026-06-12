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
  Clock,
  Calendar,
  MapPin,
  Check,
  X,
  AlertCircle,
  FileSignature,
  Building,
  UserCheck,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { accidentService } from "@/services/daily-operations/accidentService";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChildrenStore } from "@/stores/childrenStore";
import { toast } from "sonner";
import { IMG_BASE_API } from "../../api/imageapi";
import { cn } from "@/lib/utils";

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  return imageUrl.startsWith("http") ? imageUrl : `${IMG_BASE_API}${imageUrl}`;
};

export function AccidentReadOnlyView({ record, onBack, onEdit }) {
  const children = useChildrenStore((s) => s.children);
  const child = children.find((c) => String(c.id) === String(record.childId));
  const childDisplay = child?.name || record.childName || "—";
  const childLastName = child?.lastname || "";
  const childFullName = `${childDisplay} ${childLastName}`.trim();

  const [isDownloading, setIsDownloading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleDownloadPdf = async () => {
    setIsDownloading(true);
    try {
      const res = await accidentService.downloadPdf(record.id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `accident-record-${record.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDF downloaded successfully.");
    } catch (error) {
      console.error("Failed to download PDF", error);
      toast.error("Failed to download PDF");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      const res = await accidentService.sendEmail(record.id, record.childId);
      if (res.data.success || res.data.status) {
        toast.success("Email sent to parent successfully.");
      } else {
        toast.error(res.data.message || "Failed to send email");
      }
    } catch (error) {
      console.error("Failed to send email", error);
      toast.error("Failed to send email");
    } finally {
      setIsSending(false);
    }
  };

  // Determine acknowledgement status
  const isAcknowledged = !!record.ackSignature || !!record.ackName;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 dark:bg-slate-950/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Accident Record Details"
          description={
            childDisplay !== "—" ? `Official report for ${childFullName}` : "Read-only incident record"
          }
          breadcrumbs={[{ label: "Accident Forms", onClick: onBack }, { label: "Details" }]}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={onBack} className="bg-white hover:bg-slate-50 border-slate-200">
                <ArrowLeft className="mr-1.5 h-4 w-4" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadPdf}
                disabled={isDownloading}
                className="bg-white hover:bg-slate-50 border-slate-200"
              >
                {isDownloading ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-4 w-4" />
                )}
                Download PDF
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSendEmail}
                disabled={isSending}
                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100 border"
              >
                {isSending ? (
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-1.5 h-4 w-4" />
                )}
                Send to parent
              </Button>
              {onEdit && (
                <Button size="sm" onClick={onEdit} className="bg-primary hover:bg-primary/90">
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit Record
                </Button>
              )}
            </div>
          }
        />

        {/* Top Overview Cards Grid */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Child Profile Card */}
          <Card className="overflow-hidden border-slate-200/80 shadow-md transition-shadow hover:shadow-lg lg:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
            <CardContent className="p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                    {childFullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      <Baby className="h-3 w-3" /> Child Details
                    </span>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {childFullName}
                    </h2>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-sm text-slate-500">
                      {record.childDob && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" /> DOB: {record.childDob}
                        </span>
                      )}
                      {record.childAge && (
                        <span className="flex items-center gap-1">
                          <User2 className="h-3.5 w-3.5" /> Age: {record.childAge} yrs
                        </span>
                      )}
                      {record.childGender && (
                        <span className="flex items-center gap-1 capitalize">
                          <span className="font-semibold">{record.childGender}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {record.incidentDate && (
                  <div className="bg-slate-100 dark:bg-slate-900 px-4 py-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-right shrink-0">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Incident Occurrence</p>
                    <p className="text-base font-bold text-slate-700 dark:text-slate-300 mt-0.5 flex items-center justify-end gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" /> {record.incidentDate}
                    </p>
                    {record.incidentTime && (
                      <p className="text-sm font-semibold text-slate-500 mt-0.5 flex items-center justify-end gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {record.incidentTime}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acknowledgement Status Card */}
          <Card className={cn(
            "overflow-hidden border shadow-md transition-shadow hover:shadow-lg",
            isAcknowledged ? "border-emerald-200 bg-emerald-50/10" : "border-amber-200 bg-amber-50/10"
          )}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    isAcknowledged ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  )}>
                    {isAcknowledged ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
                    {isAcknowledged ? "Acknowledged" : "Pending Signature"}
                  </span>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-2">
                    Parent Acknowledgement
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {isAcknowledged
                      ? `Signed by ${record.ackName || "Parent"} on ${record.ackDate || "N/A"}`
                      : "Awaiting parent review and digital signature"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2">
                {[
                  { label: "Incident", checked: record.ackIncident },
                  { label: "Injury", checked: record.ackInjury },
                  { label: "Trauma", checked: record.ackTrauma },
                  { label: "Illness", checked: record.ackIllness },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border p-2 text-xs font-medium",
                      item.checked
                        ? "border-emerald-200 bg-emerald-50/40 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-900/50"
                    )}
                  >
                    {item.checked ? (
                      <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                    ) : (
                      <X className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                    )}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column (Main details: Incident, Injury, Action) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Incident Description */}
            <Card className="border-slate-200/80 shadow-md">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  1. Incident & Circumstances
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Service Location</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-primary shrink-0" />
                      {record.location || record.serviceLocation || "—"}
                    </span>
                  </div>
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-900 p-3.5 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Specific Location of Incident</span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      {record.locationDetails || "—"}
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Details of incident / injury / trauma / illness</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200/40">
                      {record.detailsInjury || record.details || <span className="italic text-slate-400">No details recorded</span>}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Circumstances leading to the incident (including apparent symptoms)</h4>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200/40">
                      {record.causeOfInjury || record.circumstances || <span className="italic text-slate-400">No circumstances recorded</span>}
                    </p>
                  </div>

                  {record.missingCircumstances && (
                    <div className="border border-red-100 bg-red-50/10 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" /> Circumstances if child appeared to be missing
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {record.missingCircumstances}
                      </p>
                    </div>
                  )}

                  {record.removedCircumstances && (
                    <div className="border border-red-100 bg-red-50/10 p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4" /> Circumstances if child was taken or removed
                      </h4>
                      <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {record.removedCircumstances}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Nature of Injury & Body Diagram */}
            <Card className="border-slate-200/80 shadow-md">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  2. Nature of Injury & Visual Mapping
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-start">
                  {/* Body diagram image */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">Injury Location Map</h4>
                    {record.bodyInjuryImage ? (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-inner flex items-center justify-center max-w-sm mx-auto">
                        <img
                          src={resolveImageUrl(record.bodyInjuryImage)}
                          alt="Body injury diagram"
                          className="max-h-[380px] w-auto max-w-full rounded-lg object-contain"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-slate-200/80 bg-slate-50/50 p-8 text-center text-slate-400">
                        <Activity className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                        <p className="text-sm">No body injury diagram recorded.</p>
                      </div>
                    )}
                  </div>

                  {/* Badges / list */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Nature of Injury/Illness Tags</h4>
                      {record.natures?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {record.natures.map((n) => (
                            <Badge
                              key={n}
                              variant="secondary"
                              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-100/50 border px-3 py-1.5 text-xs font-semibold rounded-lg"
                            >
                              {n}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm italic text-slate-400">No specific nature checked</span>
                      )}
                    </div>

                    {(record.natureOtherRemarks || record.natureOther) && (
                      <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Remarks (Other Specifics)</h4>
                        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                          {record.natureOtherRemarks || record.natureOther}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Taken */}
            <Card className="border-slate-200/80 shadow-md">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  3. Actions & First Aid
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Details of action taken (first aid, medication, comfort)</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-slate-200/40">
                    {record.actionDetails || <span className="italic text-slate-400">No details recorded</span>}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Emergency Services</h5>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        record.emergencyAttended?.toLowerCase() === "yes" ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"
                      )}>
                        {record.emergencyAttended || "No"}
                      </span>
                    </div>
                    {record.emergencyAttended?.toLowerCase() === "yes" && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-2 text-slate-500">
                        <div>
                          <span className="block font-medium">Contacted</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{record.emergencyContactedTime || "—"}</span>
                        </div>
                        <div>
                          <span className="block font-medium">Arrived</span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">{record.emergencyArrivedTime || "—"}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white dark:bg-slate-900 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Medical Attention Sought</h5>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold",
                        record.medicalSought?.toLowerCase() === "yes" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                      )}>
                        {record.medicalSought || "No"}
                      </span>
                    </div>
                    {record.medicalAttentionDetails && (
                      <div className="mt-2 text-xs border-t border-slate-100 pt-2 text-slate-500">
                        <span className="block font-medium mb-0.5">Practitioner / Hospital Details:</span>
                        <p className="font-medium text-slate-700 dark:text-slate-300 line-clamp-2">{record.medicalAttentionDetails}</p>
                      </div>
                    )}
                  </div>
                </div>

                {record.preventionStep1 && (
                  <div className="border border-indigo-100 bg-indigo-50/5 p-4 rounded-xl">
                    <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Steps taken to prevent / minimise recurrence</h4>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                      {record.preventionStep1}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column (Notifications, Signatures, and notes) */}
          <div className="space-y-6">
            {/* Timeline of Notifications */}
            <Card className="border-slate-200/80 shadow-md">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <Bell className="h-5 w-5 text-rose-500" />
                  Notifications Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative border-l border-slate-200 pl-4 space-y-6">
                  {/* Parent notification node */}
                  <TimelineNode
                    title="Parent/Guardian"
                    name={record.parent1Name || record.parentName}
                    date={record.parent1Date || record.parentDate}
                    time={record.parent1Time || record.parentTime}
                  />

                  {/* Director/supervisor notification node */}
                  <TimelineNode
                    title="Director/Educator/Coordinator"
                    name={record.nominatedSupervisorName || record.directorName}
                    date={record.nominatedSupervisorDate || record.directorDate}
                    time={record.nominatedSupervisorTime || record.directorTime}
                  />

                  {/* Other Agency node */}
                  <TimelineNode
                    title="Other Agency"
                    name={record.otherAgency}
                    date={record.otherAgencyDate}
                    time={record.otherAgencyTime}
                  />

                  {/* Regulatory Authority node */}
                  <TimelineNode
                    title="Regulatory Authority"
                    name={record.regulatoryAuthority}
                    date={record.regulatoryAuthorityDate || record.regDate}
                    time={record.regulatoryAuthorityTime || record.regTime}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Signature Blocks */}
            <Card className="border-slate-200/80 shadow-md">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                  <FileSignature className="h-5 w-5 text-slate-600" />
                  Signatures & Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Recorder signature */}
                <div className="border-b border-slate-100 pb-5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Completed & Signed By</span>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                      <User2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{record.recorderName || "Unknown"}</p>
                      <p className="text-xs text-slate-400">{record.recorderPosition || "Staff"} · {record.serviceName || "Child Care Service"}</p>
                    </div>
                  </div>
                  {record.recordDate && (
                    <div className="mt-2 text-xs text-slate-400 flex items-center gap-3">
                      <span>Date: <span className="font-semibold text-slate-600 dark:text-slate-300">{record.recordDate}</span></span>
                      {record.recordTime && <span>Time: <span className="font-semibold text-slate-600 dark:text-slate-300">{record.recordTime}</span></span>}
                    </div>
                  )}
                  {record.recorderSignature && (
                    <div className="mt-3 rounded-lg border border-slate-100 bg-white p-2.5 shadow-inner inline-block">
                      <img
                        src={resolveImageUrl(record.recorderSignature)}
                        alt="Recorder signature"
                        className="max-h-16 w-auto object-contain dark:invert"
                      />
                    </div>
                  )}
                </div>

                {/* Witness Signature if exists */}
                {(record.witnessName || record.witnessSignature) && (
                  <div className="border-b border-slate-100 pb-5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Witness Verification</span>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{record.witnessName || "Witness"}</p>
                        {record.witnessDate && <p className="text-xs text-slate-400">Date: {record.witnessDate}</p>}
                      </div>
                    </div>
                    {record.witnessSignature && (
                      <div className="mt-3 rounded-lg border border-slate-100 bg-white p-2.5 shadow-inner inline-block">
                        <img
                          src={resolveImageUrl(record.witnessSignature)}
                          alt="Witness signature"
                          className="max-h-16 w-auto object-contain dark:invert"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Parent Signature if exists */}
                {isAcknowledged && (
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Parental Acknowledgement Signature</span>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{record.ackName || "Parent / Guardian"}</p>
                        {record.ackDate && <p className="text-xs text-slate-400">Date: {record.ackDate}</p>}
                      </div>
                    </div>
                    {record.ackSignature && (
                      <div className="mt-3 rounded-lg border border-slate-100 bg-white p-2.5 shadow-inner inline-block">
                        <img
                          src={resolveImageUrl(record.ackSignature)}
                          alt="Parent acknowledgement signature"
                          className="max-h-16 w-auto object-contain dark:invert"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Notes */}
            {record.additionalNotes && (
              <Card className="border-amber-200/80 bg-amber-50/5 shadow-md overflow-hidden relative">
                <div className="absolute top-0 right-0 h-16 w-16 bg-amber-100/30 rounded-bl-full pointer-events-none" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-bold flex items-center gap-1.5 text-amber-800">
                    <StickyNote className="h-4 w-4" />
                    Additional Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-2">
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-medium">
                    {record.additionalNotes}
                  </p>
                  {(record.additionalNotesTime || record.ackTime) && (
                    <p className="text-xs text-slate-400 mt-2.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Logged at: {record.additionalNotesTime || record.ackTime}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineNode({ title, name, date, time }) {
  const hasData = [name, date, time].some(
    (v) => v !== undefined && v !== null && String(v).trim() !== "",
  );

  return (
    <div className="relative">
      {/* Timeline indicator node */}
      <span className={cn(
        "absolute -left-[22px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-950",
        hasData ? "bg-indigo-600" : "bg-slate-300"
      )} />

      <div>
        <h4 className={cn("text-xs font-bold uppercase tracking-wider", hasData ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400")}>
          {title}
        </h4>
        {hasData ? (
          <div className="mt-1.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 shadow-sm">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{name}</p>
            <div className="mt-1 flex gap-3 text-xs text-slate-500 font-medium">
              {date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3 text-slate-400" /> {date}</span>}
              {time && <span className="flex items-center gap-1"><Clock className="h-3 w-3 text-slate-400" /> {time}</span>}
            </div>
          </div>
        ) : (
          <p className="text-xs italic text-slate-400 mt-1">Not notified / no log recorded</p>
        )}
      </div>
    </div>
  );
}
