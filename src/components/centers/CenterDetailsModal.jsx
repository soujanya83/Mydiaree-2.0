import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Building, MapPin, Loader2, Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LogoUploadModal } from "./LogoUploadModal";

export function CenterDetailsModal({ open, onOpenChange, centerId }) {
  const [centerDetails, setCenterDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logoModalOpen, setLogoModalOpen] = useState(false);

  useEffect(() => {
    if (!open || !centerId) return;
    fetchCenterDetails();
  }, [open, centerId]);

  const fetchCenterDetails = async () => {
    setIsLoading(true);
    try {
      const { centerService } = await import("@/services/admin/centerService");
      const res = await centerService.getCenterDetails(centerId);
      if (res.status && res.data?.center) {
        setCenterDetails(res.data.center);
      } else {
        toast.error(res.message || "Failed to fetch center details.");
      }
    } catch (error) {
      const res = error?.response?.data || error;
      toast.error(res.message || "An error occurred while fetching center details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUploadSuccess = (logoUrl) => {
    setCenterDetails((prev) => ({
      ...prev,
      center_logo_url: logoUrl,
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="px-6 pb-2 pt-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                  Center Details
                </DialogTitle>
                <p className="text-sm font-medium text-muted-foreground mt-0.5">
                  View and manage center information
                </p>
              </div>
            </div>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : centerDetails ? (
            <div className="px-6 py-6 space-y-6">
              {/* Logo Section */}
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider opacity-80">
                    Center Logo
                  </h3>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogoModalOpen(true)}
                    className="gap-2 rounded-xl font-semibold text-primary hover:bg-primary/10"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Logo
                  </Button>
                </div>
                <div className="flex items-center justify-center p-6 rounded-xl border border-border/40 bg-background/50">
                  {centerDetails.center_logo_url ? (
                    <img
                      src={centerDetails.center_logo_url}
                      alt={centerDetails.centerName}
                      className="h-32 w-auto max-w-[280px] object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-center">
                      <Building className="h-12 w-12 text-muted-foreground/50 mb-2" />
                      <p className="text-sm font-medium text-muted-foreground">No logo uploaded</p>
                      <p className="text-xs text-muted-foreground mt-1">Upload a logo to personalize your center</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Center Information */}
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider opacity-80">
                  Center Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Center Name
                    </label>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {centerDetails.centerName || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Address
                    </label>
                    <div className="mt-1 flex items-start gap-2 text-sm text-foreground">
                      <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary/60" />
                      <p className="font-medium">
                        {centerDetails.adressStreet || "N/A"}
                        {centerDetails.addressCity && `, ${centerDetails.addressCity}`}
                        {centerDetails.addressState && `, ${centerDetails.addressState}`}
                        {centerDetails.addressZip && ` ${centerDetails.addressZip}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Information */}
              {centerDetails.center_admin && (
                <div className="rounded-2xl border border-border/60 bg-muted/20 p-5">
                  <h3 className="text-sm font-bold text-foreground mb-4 uppercase tracking-wider opacity-80">
                    Admin Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Admin Name
                      </label>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {centerDetails.center_admin.name || "N/A"}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Admin Email
                      </label>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {centerDetails.center_admin.email || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-muted-foreground">No center details available.</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <LogoUploadModal
        open={logoModalOpen}
        onOpenChange={setLogoModalOpen}
        centerId={centerId}
        currentLogo={centerDetails?.center_logo_url}
        onSuccess={handleLogoUploadSuccess}
      />
    </>
  );
}
