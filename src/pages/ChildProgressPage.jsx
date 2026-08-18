import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { STATUS_MAP, nextStatus } from "@/components/lessonplan/progressData";
import { StatusTriangle } from "@/components/lessonplan/StatusTriangle";
import { cn } from "@/lib/utils";
import { learningProgressService } from "@/services/learning/learningProgressService";

const STATUS_BADGE = {
  introduced: "border-amber-300 text-amber-600 bg-amber-50",
  practicing: "border-sky-300 text-sky-600 bg-sky-50",
  completed: "border-emerald-300 text-emerald-600 bg-emerald-50",
};

const API_STATUS_TO_UI = {
  Introduced: "introduced",
  Working: "practicing",
  Completed: "completed",
};

const UI_STATUS_TO_API = {
  introduced: "Introduced",
  practicing: "Practicing",
  completed: "Completed",
};

export default function ChildProgressPage() {
  const { childId } = useParams();
  const navigate = useNavigate();

  const [child, setChild] = useState(null);
  const [plan, setPlan] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!childId) return;
    setIsLoading(true);
    try {
      const response = await learningProgressService.getChildProgress(childId);
      if (response.status && response.data) {
        setChild(response.data.child);

        // Transform progress_plan to UI structure
        const rawPlan = response.data.progress_plan || [];
        const grouped = rawPlan.reduce((acc, item) => {
          const subAct = item.sub_activity || {};
          const act = subAct.activity || {};
          const subject = act.subject || {};
          const categoryName = subject.name || "General";

          if (!acc[categoryName]) {
            acc[categoryName] = {
              category: categoryName,
              items: [],
            };
          }

          acc[categoryName].items.push({
            id: item.id,
            subId: item.subid,
            group: act.title || "Misc",
            title: subAct.title || "No Title",
            status: API_STATUS_TO_UI[item.status] || "introduced",
          });

          return acc;
        }, {});

        setPlan(Object.values(grouped));
      }
    } catch (error) {
      console.error("Failed to fetch child progress:", error);
      toast.error("Failed to load progress plan");
    } finally {
      setIsLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const cycleStatus = async (categoryIdx, itemIdx) => {
    const item = plan[categoryIdx].items[itemIdx];
    const newUIStatus = nextStatus(item.status);
    const newAPIStatus = UI_STATUS_TO_API[newUIStatus];

    // Optimistic update
    const updatedPlan = [...plan];
    updatedPlan[categoryIdx].items[itemIdx].status = newUIStatus;
    setPlan(updatedPlan);

    try {
      await learningProgressService.updateProgressStatus(item.id, newAPIStatus);
      toast.success(`Updated ${item.title} status`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to sync status with server");
      // Revert if failed
      loadData();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading progress plan...</p>
      </div>
    );
  }

  if (!child) {
    return (
      <div>
        <PageHeader
          title="Child not found"
          breadcrumbs={[
            { label: "Learning & Progress", to: "/learning-progress" },
            { label: "Not found" },
          ]}
        />
        <Button variant="outline" onClick={() => navigate("/learning-progress")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`${child.name} — Progress Plan`}
        description="Click the triangle to cycle status: Introduced → Practicing → Completed."
        breadcrumbs={[
          { label: "Learning & Progress", to: "/learning-progress" },
          { label: `${child.name}'s Plan` },
        ]}
        actions={
          <Button variant="outline" asChild>
            <Link to="/learning-progress">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        }
      />

      <Legend />

      <div className="space-y-8">
        {plan.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
            No items in progress plan yet.
          </div>
        ) : (
          plan.map((cat, ci) => (
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
                          // onClick={() => cycleStatus(ci, ii)}
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
                        {meta?.label || item.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}

function Legend() {
  const items = [
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
