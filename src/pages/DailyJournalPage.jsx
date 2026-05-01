import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Sparkles } from "lucide-react";

export default function DailyJournalPage() {
  return (
    <div>
      <PageHeader
        title="Daily Journal"
        description="Log meals, sleep, and routines"
        breadcrumbs={[{ label: "Daily Journal" }]}
      />
      <EmptyState
        icon={Sparkles}
        title="Daily Journal coming soon"
        description="This page is scaffolded and ready. Send me the content and I'll build it out."
      />
    </div>
  );
}
