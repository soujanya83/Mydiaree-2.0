import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Sparkles } from "lucide-react";

export default function LessonPlanPage() {
  return (
    <div>
      <PageHeader
        title="Lesson Plan"
        description="Weekly learning experiences"
        breadcrumbs={[{ label: "Lesson Plan" }]}
      />
      <EmptyState
        icon={Sparkles}
        title="Lesson Plan coming soon"
        description="This page is scaffolded and ready. Send me the content and I'll build it out."
      />
    </div>
  );
}
