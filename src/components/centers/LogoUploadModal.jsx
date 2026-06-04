import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function LogoUploadModal({ open, onOpenChange, centerId, currentLogo, onSuccess }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !centerId) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("center_logo", file);
      formData.append("centerid", centerId);

      const { centerService } = await import("@/services/admin/centerService");
      const res = await centerService.updateCenterLogo(formData);

      if (res.status) {
        toast.success(res.message || "Logo updated successfully.");
        onSuccess?.(res.logo_url);
        onOpenChange(false);
        handleRemoveFile();
      } else {
        toast.error(res.message || "Failed to update logo.");
      }
    } catch (error) {
      const res = error?.response?.data || error;
      toast.error(res.message || "An error occurred while uploading the logo.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-border/60 bg-card/95 backdrop-blur shadow-2xl">
        <DialogHeader className="px-6 pb-2 pt-6">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            Upload Center Logo
          </DialogTitle>
          <p className="text-sm font-medium text-muted-foreground mt-0.5">
            Upload a logo for this center
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="px-6 py-5 space-y-6">
            {/* Current Logo Preview */}
            {currentLogo && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">Current Logo</label>
                <div className="flex items-center justify-center p-4 rounded-2xl border border-border/60 bg-muted/20">
                  <img
                    src={currentLogo}
                    alt="Current center logo"
                    className="h-24 w-auto max-w-[200px] object-contain"
                  />
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-foreground">
                New Logo <span className="text-destructive font-bold ml-0.5">*</span>
              </label>
              {!preview ? (
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                  />
                  <div className="flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed border-border/60 bg-muted/20 hover:bg-muted/30 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm font-medium text-foreground">Click to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF (max 5MB)</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="flex items-center justify-center p-4 rounded-2xl border border-border/60 bg-muted/20">
                    <img
                      src={preview}
                      alt="Logo preview"
                      className="h-24 w-auto max-w-[200px] object-contain"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 h-8 w-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      disabled={isUploading}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 border-t border-border/50 bg-muted/10 px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                handleRemoveFile();
              }}
              className="rounded-xl font-semibold"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!file || isUploading}
              className="rounded-xl bg-gradient-to-r from-primary to-indigo-500 text-white font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload Logo"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
