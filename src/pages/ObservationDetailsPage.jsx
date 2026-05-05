import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Edit,
  Eye,
  User,
  ClipboardList,
  ListChecks,
  TrendingUp,
  Image as ImageIcon,
  Info,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import {
  mockObservations,
  formatObsDate,
  statusBadgeClasses,
} from "@/components/observation/observationsData";

const TABS = [
  { id: "observation", label: "Observation", Icon: Eye },
  { id: "child", label: "Child", Icon: User },
  { id: "montessori", label: "Montessori", Icon: ClipboardList },
  { id: "eylf", label: "EYLF", Icon: ListChecks },
  { id: "development", label: "Development", Icon: TrendingUp },
];

export default function ObservationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms: allRooms } = useRoomStore();
  const { children: allChildren } = useChildrenStore();

  const obs = useMemo(() => mockObservations.find((o) => o.id === id), [id]);
  const [tab, setTab] = useState("observation");

  if (!obs) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-20 text-center">
        <Info className="mb-3 h-10 w-10 text-muted-foreground/60" />
        <h2 className="text-lg font-bold text-foreground">Observation not found</h2>
        <Link to="/observation" className="mt-3 text-sm text-primary hover:underline">
          Back to observations
        </Link>
      </div>
    );
  }

  const child = allChildren.find((c) => String(c.id) === String(obs.childId));
  const room = allRooms.find((r) => String(r.id) === String(obs.roomId));

  return (
    <div>
      {/* Top */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/observation")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/observation" className="hover:text-foreground">Observations</Link>
            <span>/</span>
            <span className="text-foreground">Observation Details</span>
          </nav>
        </div>
        <Button onClick={() => navigate(`/observation/${obs.id}/edit`)} className="bg-emerald-600 hover:bg-emerald-700">
          <Edit className="mr-1.5 h-4 w-4" /> Edit
        </Button>
      </div>

      {/* Title bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-amber-50/40 p-4 dark:bg-amber-950/10">
        <Eye className="h-6 w-6 text-sky-500" />
        <h1 className="text-xl font-bold text-sky-600">Observation Details</h1>
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          #{obs.number}
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">
        {TABS.map((t) => {
          const Icon = t.Icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition ${
                active ? "bg-foreground text-background shadow" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "observation" && (
        <div className="space-y-6">
          <DetailSection title="Basic Information">
            <Row label="Date">{formatObsDate(obs.createdAt)}</Row>
            <Row label="Time">07:43 AM</Row>
            <Row label="Status">
              <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadgeClasses(obs.status)}`}>
                {obs.status}
              </span>
            </Row>
          </DetailSection>

          <DetailSection title="Observation Information">
            <Row label="Title">{obs.title}</Row>
            <Row label="Observation">{obs.observation}</Row>
            <Row label="Notes">{obs.notes || "Not Update"}</Row>
            <Row label="Reflection">{obs.reflection || "Not Update"}</Row>
            <Row label="Future Plan">{obs.futurePlan || "Not Update"}</Row>
            <Row label="Child Voice">{obs.childVoice || "Not Update"}</Row>
          </DetailSection>

          <DetailSection title="Media Files">
            {obs.media?.length ? null : (
              <div className="flex h-28 w-40 items-center justify-center rounded-md border border-border bg-muted/40">
                <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
              </div>
            )}
          </DetailSection>
        </div>
      )}

      {tab === "child" && (
        <DetailSection title="Child Information">
          <Row label="Name">{child ? child.name : obs.childName}</Row>
          <Row label="Room">{room?.name || "—"}</Row>
          <Row label="Age">{child?.age || "—"}</Row>
          <Row label="Author">{obs.author}</Row>
        </DetailSection>
      )}

      {tab === "montessori" && (
        <DetailSection title="Montessori Assessment">
          {obs.montessori ? (
            <>
              <Row label="Subject">{obs.montessori.subject}</Row>
              <Row label="Items">{obs.montessori.items.join(", ")}</Row>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No Montessori assessment recorded.</p>
          )}
        </DetailSection>
      )}

      {tab === "eylf" && (
        <DetailSection title="EYLF Assessment">
          {obs.eylf ? (
            <>
              <Row label="Outcome">{obs.eylf.outcome}</Row>
              <Row label="Items">{obs.eylf.items.join(", ")}</Row>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">No EYLF assessment recorded.</p>
          )}
        </DetailSection>
      )}

      {tab === "development" && (
        <DetailSection title="Developmental Milestones">
          {obs.development ? (
            <p className="text-sm text-foreground">{JSON.stringify(obs.development)}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No development milestones recorded.</p>
          )}
        </DetailSection>
      )}
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="overflow-hidden rounded-xl border-l-4 border-sky-500 bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <Info className="h-4 w-4 text-sky-500" />
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-[180px_1fr]">
      <div className="text-sm font-semibold text-foreground">{label}:</div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}