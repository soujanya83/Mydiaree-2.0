import { ShieldOff, ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      {/* Icon */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950/30">
        <ShieldOff className="h-10 w-10 text-red-500" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Access Denied
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        You don't have permission to access this page. Please contact your
        administrator if you believe this is a mistake.
      </p>

      {/* Actions */}
      <div className="mt-8 flex gap-3">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Button onClick={() => navigate("/dashboard")} className="gap-2">
          <Home className="h-4 w-4" />
          Dashboard
        </Button>
      </div>
    </div>
  );
}
