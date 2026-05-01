import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";

export default function PermissionsRoleDetailsPage() {
  const navigate = useNavigate();
  const { roleId } = useParams();

  return (
    <div>
      <PageHeader
        title="Role Details"
        breadcrumbs={[
          { label: "Permissions Assign", to: "/permissions" },
          { label: "Role List", to: "/permissions/roles" },
          { label: "Details" },
        ]}
        actions={
          <Button variant="outline" onClick={() => navigate("/permissions/roles")}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        }
      />
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <p className="text-sm text-muted-foreground">Role ID: {roleId}</p>
        <p className="mt-2 text-sm">Permission details for this role will appear here.</p>
      </div>
    </div>
  );
}