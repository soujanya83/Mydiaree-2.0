import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Calendar,
  Image as ImageIcon,
  Users,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { mockChildren, mockRooms } from "@/services/mocks/data";
import {
  mockReflections,
  formatObsDate,
  statusBadgeClasses,
} from "@/components/reflection/reflectionsData";

export default function DailyReflectionDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const refl = useMemo(() => mockReflections.find((r) => r.id === id), [id]);

  if (!refl) {
    return (
      <div>
        <PageHeader
          title="Reflection not found"
          breadcrumbs={[{ label: "Daily Reflections", to: "/daily-reflections" }, { label: "Not found" }]}
        />
        <Button onClick={() => navigate("/daily-reflections")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to list
        </Button>
      </div>
    );
  }

  const childObjs = (refl.childIds || []).map((cid) => mockChildren.find((c) => c.id === cid)).filter(Boolean);
  const roomObjs = (refl.roomIds || []).map((rid) => mockRooms.find((r) => r.id === rid)).filter(Boolean);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/daily-reflections")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/daily-reflections" className="hover:text-foreground">Daily Reflections</Link>
            <span>/</span>
            <span className="text-foreground">Details</span>
          </nav>
        </div>
        <Button onClick={() => navigate(`/daily-reflections/${refl.id}/edit`)}>
          <Pencil className="mr-1.5 h-4 w-4" /> Edit
        </Button>
      </div>

      {/* Hero */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="relative flex h-44 items-center justify-center bg-emerald-400/40">
          <ImageIcon className="h-12 w-12 text-white/60" />
          <span
            className={`absolute right-4 top-4 rounded-md px-3 py-1 text-xs font-bold uppercase ${statusBadgeClasses(
              refl.status
            )}`}
          >
            {refl.status}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-emerald-500/30 px-6 py-3">
          <h1 className="text-xl font-bold text-foreground">{refl.title}</h1>
          <div className="inline-flex items-center gap-1.5 rounded-md bg-card px-3 py-1.5 text-sm font-semibold text-foreground">
            <Calendar className="h-3.5 w-3.5" /> {formatObsDate(refl.createdAt)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Children */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-foreground">
            <UserCircle2 className="h-4 w-4" /> Children
          </h3>
          {childObjs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No children tagged.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {childObjs.map((c) => (
                <div key={c.id} className="flex w-32 flex-col items-center rounded-lg border border-border bg-card p-3 text-center">
                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <UserCircle2 className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{c.firstName}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Educators */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-foreground">
            <Users className="h-4 w-4" /> Educators
          </h3>
          {(refl.educators || []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No educators tagged.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {refl.educators.map((e) => (
                <div key={e} className="flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-foreground">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-700">
                    {e.charAt(0)}
                  </div>
                  {e}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Rooms */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-foreground">Rooms</h3>
          {roomObjs.length === 0 ? (
            <p className="text-xs text-muted-foreground">No rooms.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {roomObjs.map((r) => (
                <span key={r.id} className="rounded bg-emerald-500 px-3 py-1 text-xs font-bold uppercase text-white">
                  {r.name}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* EYLF */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-3 text-sm font-bold text-foreground">EYLF Outcomes</h3>
          {(refl.eylf || []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No EYLF outcomes.</p>
          ) : (
            <ul className="space-y-1.5">
              {refl.eylf.map((o, i) => (
                <li key={i} className="rounded bg-emerald-50 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/30">
                  {o}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Reflection text */}
      <section className="mt-6 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-foreground">Reflection</h3>
        <p className="whitespace-pre-line text-sm text-foreground">{refl.reflection}</p>
      </section>
    </div>
  );
}