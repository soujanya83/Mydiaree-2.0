import { useEffect, useRef, useState } from "react";
import { Eraser, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function SignatureField({ value, onChange, label = "Signature" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-14 w-full items-center justify-between rounded-md border border-input bg-muted/40 px-3 text-left text-sm transition hover:bg-muted"
      >
        {value ? (
          <img src={value} alt="signature" className="h-12 max-w-[60%] object-contain" />
        ) : (
          <span className="text-muted-foreground">Click to add signature</span>
        )}
        <span className="text-xs font-medium text-primary">
          {value ? "Change" : "Sign"}
        </span>
      </button>

      <SignatureModal
        open={open}
        onClose={() => setOpen(false)}
        title={label}
        onSave={(dataUrl) => {
          onChange(dataUrl);
          setOpen(false);
        }}
      />
    </>
  );
}

function SignatureModal({ open, onClose, onSave, title }) {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    if (!open) return;
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    setHasInk(false);
  }, [open]);

  const pos = (e) => {
    const c = canvasRef.current;
    const r = c.getBoundingClientRect();
    const t = e.touches?.[0];
    const x = (t ? t.clientX : e.clientX) - r.left;
    const y = (t ? t.clientY : e.clientY) - r.top;
    return { x: x * (c.width / r.width), y: y * (c.height / r.height) };
  };

  const start = (e) => {
    e.preventDefault();
    drawing.current = true;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (e) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasInk(true);
  };
  const end = () => {
    drawing.current = false;
  };

  const clear = () => {
    const c = canvasRef.current;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
    setHasInk(false);
  };

  const save = () => {
    if (!hasInk) return;
    onSave(canvasRef.current.toDataURL("image/png"));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="rounded-md border border-border bg-white">
          <canvas
            ref={canvasRef}
            width={560}
            height={220}
            className="h-[220px] w-full touch-none rounded-md"
            onMouseDown={start}
            onMouseMove={move}
            onMouseUp={end}
            onMouseLeave={end}
            onTouchStart={start}
            onTouchMove={move}
            onTouchEnd={end}
          />
        </div>
        <p className="text-xs text-muted-foreground">Draw your signature in the box above.</p>
        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="ghost" size="sm" onClick={clear}>
            <Eraser className="mr-1.5 h-4 w-4" />
            Clear
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="mr-1.5 h-4 w-4" />
              Cancel
            </Button>
            <Button size="sm" onClick={save} disabled={!hasInk}>
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}