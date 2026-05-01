import { useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockChildren } from "@/services/mocks/data";
import {
  STATUS_MAP,
  buildPlanForChild,
  nextStatus,
} from "@/components/lessonplan/progressData";
import { StatusTriangle } from "@/components/lessonplan/StatusTriangle";
import { cn } from "@/lib/utils";

const STATUS_BADGE = {
  not_started: "border-slate-300 text-slate-500 bg-slate-50",
  introduced: "border-amber-300 text-amber-600 bg-amber-50",
  practicing: "border-sky-300 text-sky-600 bg-sky-50",
  completed: "border-emerald-300 text-emerald-600 bg-emerald-50",
};

export default function ChildProgressPage() {
  const { childId } = useParams();
  const navigate = useNavigate();
  const child = mockChildren.find((c) => c.id === childId);

  const initial = useMemo(() => buildPlanForChild(childId || "x"), [childId]);
  const [plan, setPlan] = useState(initial);

  if (!child) {
    return (
      <div>
        <PageHeader title="Child not found" breadcrumbs={[{ label: "Learning & Progress", to: "/learning-progress" }, { label: "Not found" }]} />
        <Button variant="outline" onClick={() => navigate("/learning-progress")}>
          <ArrowLeft className="mr-2 h-4 w-4" />Back
        </Button>
      </div>
    );
  }

  const cycleStatus = (categoryIdx, itemIdx) => {
    setPlan((prev) =>
      prev.map((cat, ci) =>
        ci !== categoryIdx
          ? cat
          : {
              ...cat,
              items: cat.items.map((it, ii) =>
                ii !== itemIdx ? it : { ...it, status: nextStatus(it.status) },
              ),
            },
      ),
    );
  };

  return (
    <div>
      <PageHeader
        title={`${child.firstName} ${child.lastName} — Progress Plan`}
        description="Click the triangle to cycle status: Not started → Introduced → Practicing → Completed."
        breadcrumbs={[
          { label: "Learning & Progress", to: "/learning-progress" },
          { label: `${child.firstName}'s Plan` },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link to="/learning-progress">
              <ArrowLeft className="mr-2 h-4 w-4" />Back
            </Link>
          </Button>
        }
      />

      <Legend />

      <div className="space-y-8">
        {plan.map((cat, ci) => (
          <section key={cat.category}>
            <div className="mb-3 flex items-center gap-2 border-b-2 border-primary/40 pb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-primary">{cat.category}</h2>
              <Badge variant="outline" className="border-primary/40 text-primary">
                {cat.items.length} items
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {cat.items.map((item, ii) => {
                const meta = STATUS_MAP[item.status];
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-xl border bg-card p-3 shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <StatusTriangle
                        status={item.status}
                        onClick={() => cycleStatus(ci, ii)}
                        size={56}
                      />
                      <div>
                        <div className="font-semibold leading-tight">{item.group}</div>
                        <div className="text-sm text-muted-foreground">{item.title}</div>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn("uppercase tracking-wide", STATUS_BADGE[item.status])}
                    >
                      {meta.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Legend() {
  const items = [
    { key: "not_started", label: "Not started" },
    { key: "introduced", label: "Introduced" },
    { key: "practicing", label: "Practicing" },
    { key: "completed", label: "Completed" },
  ];
  return (
    <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border bg-card p-3 text-sm">
      <span className="font-semibold text-muted-foreground">Legend:</span>
      {items.map((i) => (
        <div key={i.key} className="flex items-center gap-2">
          <StatusTriangle status={i.key} onClick={() => {}} size={28} />
          <span>{i.label}</span>
        </div>
      ))}
    </div>
  );
}