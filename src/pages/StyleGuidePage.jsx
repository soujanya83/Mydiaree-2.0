import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { Sparkles } from "lucide-react";

export default function StyleGuidePage() {
  return (
    <div>
      <PageHeader
        title="Style Guide"
        description="Design system reference"
        breadcrumbs={[{ label: "Style Guide" }]}
      />
      <EmptyState
        icon={Sparkles}
        title="Style Guide coming soon"
        description="This page is scaffolded and ready. Send me the content and I'll build it out."
      />
    </div>
  );
}
