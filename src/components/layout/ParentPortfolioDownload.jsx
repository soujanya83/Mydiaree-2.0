import { useState, useEffect } from "react";
import { Download, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { parentDashboardService } from "@/services/parent/parentDashboardService";

export function ParentPortfolioDownload({ selectedChildId }) {
  const [modules, setModules] = useState([]);
  const [dateFilters, setDateFilters] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeDownloadModuleId, setActiveDownloadModuleId] = useState(null);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const res = await parentDashboardService.getPortfolioOptions();
        if (res.status && res.data) {
          setModules(res.data.modules || []);
          setDateFilters(res.data.date_filters || []);
        }
      } catch (err) {
        console.error("Error fetching portfolio options:", err);
      } finally {
        setLoadingOptions(false);
      }
    }
    fetchOptions();
  }, []);

  const handleFilterSelect = (module, filter) => {
    if (filter.id === "custom") {
      setCurrentModule(module);
      setFromDate("");
      setToDate("");
      setIsCustomOpen(true);
    } else {
      triggerDownload(module, filter.id);
    }
  };

  const triggerDownload = async (module, filterId, customFrom, customTo) => {
    if (!selectedChildId) {
      toast.error("Please select a child first.");
      return;
    }

    setIsDownloading(true);
    setActiveDownloadModuleId(module.id);
    const toastId = toast.loading(`Preparing your ${module.name} download...`);

    try {
      const formData = new FormData();
      formData.append("child_id", String(selectedChildId));
      formData.append("date_filter", filterId);
      formData.append("module_id", module.id);

      if (filterId === "custom") {
        if (customFrom) formData.append("from_date", customFrom);
        if (customTo) formData.append("to_date", customTo);
      }

      const response = await parentDashboardService.downloadPortfolio(formData);

      // Handle server error returned as JSON inside blob
      if (response.data && response.data.type === "application/json") {
        const text = await response.data.text();
        const json = JSON.parse(text);
        throw new Error(json.message || `Failed to download ${module.name} portfolio.`);
      }

      // Convert blob to file and trigger download
      const blob = new Blob([response.data], {
        type: response.headers["content-type"] || "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Extract filename from Content-Disposition header
      const disposition = response.headers["content-disposition"];
      let filename = `${module.name.toLowerCase()}_portfolio_${filterId}.pdf`;
      if (disposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success(`${module.name} downloaded successfully!`, { id: toastId });
    } catch (error) {
      console.error("Download error:", error);
      toast.error(error.message || `Failed to download ${module.name} portfolio.`, {
        id: toastId,
      });
    } finally {
      setIsDownloading(false);
      setActiveDownloadModuleId(null);
    }
  };

  const handleCustomDownload = () => {
    if (!fromDate || !toDate) {
      toast.error("Please select both From and To dates.");
      return;
    }

    if (new Date(toDate) <= new Date(fromDate)) {
      toast.error("To Date must be ahead of From Date.");
      return;
    }

    setIsCustomOpen(false);
    triggerDownload(currentModule, "custom", fromDate, toDate);
  };

  if (loadingOptions || modules.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {modules.map((module) => (
          <DropdownMenu key={module.id}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={!selectedChildId || isDownloading}
                className="h-9 px-2 sm:px-3 sm:gap-1.5 font-medium transition-all"
                title={`Download ${module.name}`}
              >
                {activeDownloadModuleId === module.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Download className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="hidden md:inline">Download {module.name}</span>
                <span className="hidden sm:inline md:hidden">{module.name}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {dateFilters.map((filter) => (
                <DropdownMenuItem
                  key={filter.id}
                  onClick={() => handleFilterSelect(module, filter)}
                  className="cursor-pointer"
                >
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{filter.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ))}
      </div>

      {/* Custom Date Dialog */}
      <Dialog open={isCustomOpen} onOpenChange={setIsCustomOpen}>
        <DialogContent className="sm:max-w-[420px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Download {currentModule?.name} Portfolio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="from_date" className="text-sm font-medium text-foreground">
                From Date
              </label>
              <Input
                id="from_date"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="to_date" className="text-sm font-medium text-foreground">
                To Date
              </label>
              <Input
                id="to_date"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsCustomOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCustomDownload} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                "Download"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
