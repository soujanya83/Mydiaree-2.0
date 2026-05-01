import { ArrowLeft, Pencil, Calendar, DoorOpen, Building2, Users, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useCentreStore } from "@/stores/centreStore";
import { ACTIVITY_SUBJECTS, SUBJECT_TREE, RICH_SUBJECTS, ADDITIONAL_FIELDS, EYLF_OUTCOMES } from "./data";

const SUBJECT_FIELDS = {
  "practical-life": "practicalLife",
  sensorial: "sensorial",
  math: "math",
  language: "language",
  culture: "culture",
};

export function ProgramPlanView({ record, onBack, onEdit }) {
  const centres = useCentreStore((s) => s.centres);
  const centreName = centres.find((c) => c.id === record.centreId)?.name || "—";

  return (
    <div>
      <PageHeader
        title={`${record.month} ${record.year} Program Plan`}
        description={`${centreName} • ${record.roomId}`}
        breadcrumbs={[
          { label: "Program Plan", to: "/program-plan" },
          { label: "View" },
        ]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
            </Button>
            <Button onClick={onEdit}>
              <Pencil className="mr-1.5 h-4 w-4" /> Edit
            </Button>
          </div>
        }
      />

      <div className="space-y-6">
        <Card title="Plan Details" icon={Calendar}>
          <Grid>
            <Stat icon={Building2} label="Centre" value={centreName} />
            <Stat icon={DoorOpen} label="Room" value={record.roomId} />
            <Stat icon={Calendar} label="Month" value={record.month} />
            <Stat icon={Calendar} label="Year" value={record.year} />
          </Grid>
        </Card>

        <Card title="Team & Children" icon={Users}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ChipList label="Educators" items={record.educators} />
            <ChipList label="Children" items={record.children} />
          </div>
        </Card>

        {record.focusArea && (
          <Card title="Focus Areas" icon={Sparkles}>
            <p className="whitespace-pre-wrap text-sm text-foreground">{record.focusArea}</p>
          </Card>
        )}

        <Card title="Subject Activities" icon={Sparkles}>
          <div className="space-y-3">
            {ACTIVITY_SUBJECTS.map((key) => {
              const items = record[SUBJECT_FIELDS[key]] || [];
              return (
                <div key={key} className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="mb-1.5 text-xs font-semibold text-primary">
                    {SUBJECT_TREE[key].label}
                  </div>
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No activities.</p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {items.map((i) => (
                        <span key={i} className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                          {i}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            {RICH_SUBJECTS.map((s) =>
              record[s.key] ? (
                <div key={s.key} className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="mb-1.5 text-xs font-semibold text-primary">{s.label}</div>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{record[s.key]}</p>
                </div>
              ) : null
            )}
          </div>
        </Card>

        {record.eylf?.length > 0 && (
          <Card title="EYLF Outcomes" icon={Sparkles}>
            <div className="space-y-2">
              {record.eylf.map((code) => {
                const o = EYLF_OUTCOMES.find((x) => x.code === code);
                return (
                  <div key={code} className="rounded-lg border border-border bg-muted/20 p-3">
                    <div className="text-sm font-semibold text-primary">EYLF {code}</div>
                    <div className="mt-0.5 text-sm text-muted-foreground">{o?.label}</div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card title="Additional Experiences" icon={Sparkles}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {ADDITIONAL_FIELDS.map((f) =>
              record[f.key] ? (
                <div key={f.key} className="rounded-lg border border-border bg-muted/20 p-3">
                  <div className="mb-1 text-xs font-semibold text-primary">{f.label}</div>
                  <p className="whitespace-pre-wrap text-sm text-foreground">{record[f.key]}</p>
                </div>
              ) : null
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, children }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-bold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{children}</div>;
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm font-semibold text-foreground">{value || "—"}</div>
    </div>
  );
}

function ChipList({ label, items }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="mb-2 text-xs font-semibold text-primary">{label}</div>
      {!items || items.length === 0 ? (
        <p className="text-xs text-muted-foreground">None selected.</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((i) => (
            <span key={i} className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
              {i}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}