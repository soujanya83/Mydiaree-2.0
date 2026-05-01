import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, CircleDot, Target, Eye, X, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PtmDetailsModal({ open, onOpenChange, ptm }) {
  const navigate = useNavigate();
  if (!ptm) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden [&>button]:hidden">
        <div className="flex items-center justify-between bg-primary px-5 py-3 text-primary-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            <DialogTitle className="text-base font-semibold">PTM Details</DialogTitle>
          </div>
          <button onClick={() => onOpenChange(false)} className="rounded-md p-1 hover:bg-white/10">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-center gap-2 border-b pb-3">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-base font-semibold">{ptm.title}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CircleDot className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Status:</span>
            <span>{ptm.status}</span>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-muted-foreground" />
              Objective
            </div>
            <div className="rounded-md border bg-card px-3 py-2 text-sm">{ptm.objective}</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 border-t bg-muted/30 px-5 py-3">
          <Button
            onClick={() => {
              onOpenChange(false);
              navigate(`/ptm/${ptm.id}`);
            }}
          >
            <Eye className="h-4 w-4" /> View Full Details
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-destructive text-destructive hover:bg-destructive/10">
            <X className="h-4 w-4" /> Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}