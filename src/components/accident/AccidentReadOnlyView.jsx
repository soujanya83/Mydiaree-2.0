import {
  ArrowLeft,
  Download,
  Send,
  FileText,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useChildrenStore } from "@/stores/childrenStore";
import { toast } from "sonner";

export function AccidentReadOnlyView({ record, onBack, onEdit }) {
  const children = useChildrenStore((s) => s.children);
  const child = children.find((c) => String(c.id) === String(record.childId));

  return (
    <div>
      <PageHeader
        title="Accident View"
        description="Read-only record"
        breadcrumbs={[
          { label: "Accident Forms", to: "/accident-form" },
          { label: "View" },
        ]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.success("PDF download started.")}
            >
              <Download className="mr-1.5 h-4 w-4" />
              Download PDF
            </Button>
            <Button
              size="sm"
              onClick={() => toast.success("Sent to parent.")}
              className="bg-info text-info-foreground hover:bg-info/90"
            >
              <Send className="mr-1.5 h-4 w-4" />
              Send to Parent
            </Button>
            <Button size="sm" onClick={onEdit}>
              Edit
            </Button>
          </div>
        }
      />

      <div className="mx-auto max-w-4xl space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-center gap-2 border-b border-border pb-4 text-info">
          <FileText className="h-5 w-5" />
          <h2 className="text-xl font-bold">Incident, Injury, Trauma and Illness Record</h2>
        </div>

        <Block title="Details of person completing this record">
          <Pair label="Name" value={record.recorderName} />
          <Pair label="Position / role" value={record.recorderPosition} />
          <Pair label="Service name" value={record.serviceName} />
          <Pair label="Date" value={record.recordDate} />
          <Pair label="Time" value={record.recordTime} />
          <Pair label="Signature" value={record.recorderSignature} isImage />
        </Block>

        <Block title="Child details">
          <Pair
            label="Child's full name"
            value={child ? child.name : "—"}
          />
          <Pair label="Date of birth" value={record.childDob} />
          <Pair label="Age" value={record.childAge} />
          <Pair label="Gender" value={record.childGender} />
        </Block>

        <Block title="Incident / injury / trauma / illness details">
          <Pair label="Date" value={record.incidentDate} />
          <Pair label="Time" value={record.incidentTime} />
          <Pair label="Location of service" value={record.serviceLocation} full />
          <Pair label="Location of incident" value={record.incidentLocation} full />
          <Pair label="Witness name" value={record.witnessName} />
          <Pair label="Witness date" value={record.witnessDate} />
          <Pair label="Witness signature" value={record.witnessSignature} isImage full />
          <Pair label="Details" value={record.details} full />
          <Pair label="Circumstances" value={record.circumstances} full />
        </Block>

        <Block title="Nature of injury / trauma / illness">
          <div className="col-span-2">
            {record.natures?.length ? (
              <div className="flex flex-wrap gap-2">
                {record.natures.map((n) => (
                  <span
                    key={n}
                    className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {n}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </div>
          {record.natureOther && <Pair label="Other" value={record.natureOther} full />}
          {record.bodyDiagramNote && (
            <Pair label="Body part affected" value={record.bodyDiagramNote} full />
          )}
        </Block>

        <Block title="Action taken">
          <Pair label="Details" value={record.actionDetails} full />
          <Pair label="Emergency services attended" value={record.emergencyAttended} />
          <Pair label="Time contacted" value={record.emergencyContactedTime} />
          <Pair label="Time arrived" value={record.emergencyArrivedTime} />
          <Pair label="Medical sought" value={record.medicalSought} />
          <Pair label="Details" value={record.yesDetails} full />
          <Pair label="Prevention steps" value={record.preventionSteps} full />
        </Block>

        <Block title="Notifications">
          <Pair label="Parent / Guardian" value={record.parentName} />
          <Pair label="Parent date / time" value={`${record.parentDate || "—"} ${record.parentTime || ""}`} />
          <Pair label="Director" value={record.directorName} />
          <Pair label="Director date / time" value={`${record.directorDate || "—"} ${record.directorTime || ""}`} />
          <Pair label="Other agency" value={record.otherAgency} />
          <Pair label="Other date / time" value={`${record.otherAgencyDate || "—"} ${record.otherAgencyTime || ""}`} />
          <Pair label="Regulatory authority" value={record.regulatoryAuthority} />
          <Pair label="Reg date / time" value={`${record.regDate || "—"} ${record.regTime || ""}`} />
        </Block>

        <Block title="Parental acknowledgement">
          <Pair label="Parent name" value={record.ackName} full />
          <Pair label="Notified for" value={(record.ackTypes || []).join(", ")} full />
          <Pair label="Date" value={record.ackDate} />
          <Pair label="Time" value={record.ackTime} />
          <Pair label="Final signature" value={record.finalSignature} isImage full />
        </Block>

        {record.additionalNotes && (
          <Block title="Additional notes">
            <Pair label="" value={record.additionalNotes} full />
          </Block>
        )}
      </div>
    </div>
  );
}

function Block({ title, children }) {
  return (
    <section className="space-y-3">
      <h3 className="border-b border-info pb-1.5 text-base font-bold text-info">{title}</h3>
      <div className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

function Pair({ label, value, full, isImage }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      {label && (
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      )}
      {isImage ? (
        value ? (
          <img src={value} alt="signature" className="mt-1 h-14 max-w-[220px] object-contain" />
        ) : (
          <p className="mt-0.5 text-sm text-muted-foreground">—</p>
        )
      ) : (
        <p className="mt-0.5 whitespace-pre-wrap text-sm text-foreground">
          {value || <span className="text-muted-foreground">—</span>}
        </p>
      )}
    </div>
  );
}