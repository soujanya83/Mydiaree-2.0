import { useMemo, useState } from "react";
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ClipboardList,
  CalendarDays,
  UserCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import { AccidentFormView } from "@/components/accident/AccidentFormView";
import { AccidentReadOnlyView } from "@/components/accident/AccidentReadOnlyView";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";

const seedRecords = [
  {
    id: "a1",
    childId: "1",
    recorderName: "Deepti",
    incidentDate: "2026-04-25",
    createdAt: "2026-04-29",
  },
  {
    id: "a2",
    childId: "3",
    recorderName: "Mia Chen",
    incidentDate: "2026-04-12",
    createdAt: "2026-04-29",
  },
  {
    id: "a3",
    childId: "5",
    recorderName: "Daniel Park",
    incidentDate: "2026-04-03",
    createdAt: "2026-04-29",
  },
];

function fmtDDMMYYYY(iso) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  if (!y) return iso;
  return `${d}.${m}.${y}`;
}

export default function AccidentFormPage() {
  const centres = useCentreStore((s) => s.centres);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);
  
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { children, isLoading } = useChildrenStore();

  const user = useAuthStore((s) => s.user);

  const [records, setRecords] = useState(seedRecords);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState({ view: "list" }); // list | create | edit | view
  const [confirmId, setConfirmId] = useState(null);

  const enriched = useMemo(() => {
    return records.map((r) => {
      const child = children.find((c) => String(c.id) === String(r.childId));
      return {
        ...r,
        childName: child ? child.name : "Unknown child",
        roomName: child?.room || "Room",
      };
    });
  }, [records, children]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return enriched;
    return enriched.filter((r) => r.childName.toLowerCase().includes(q));
  }, [enriched, search]);

  const handleCreate = (data) => {
    const id = crypto.randomUUID();
    setRecords((p) => [
      { id, ...data, createdAt: new Date().toISOString().slice(0, 10) },
      ...p,
    ]);
    toast.success("Accident record created.");
    setMode({ view: "list" });
  };

  const handleUpdate = (data) => {
    setRecords((p) => p.map((r) => (r.id === mode.id ? { ...r, ...data } : r)));
    toast.success("Accident record updated.");
    setMode({ view: "list" });
  };

  const handleDelete = () => {
    setRecords((p) => p.filter((r) => r.id !== confirmId));
    toast.success("Record deleted.");
    setConfirmId(null);
  };

  // Form views
  if (mode.view === "create") {
    return (
      <AccidentFormView
        mode="create"
        onCancel={() => setMode({ view: "list" })}
        onSubmit={handleCreate}
      />
    );
  }
  if (mode.view === "edit") {
    const record = records.find((r) => r.id === mode.id);
    return (
      <AccidentFormView
        mode="edit"
        initial={record}
        onCancel={() => setMode({ view: "list" })}
        onSubmit={handleUpdate}
      />
    );
  }
  if (mode.view === "view") {
    const record = records.find((r) => r.id === mode.id);
    return (
      <AccidentReadOnlyView
        record={record}
        onBack={() => setMode({ view: "list" })}
        onEdit={() => setMode({ view: "edit", id: record.id })}
      />
    );
  }

  // List view
  return (
    <div>
      <PageHeader
        title="Accident Forms"
        description="Incident, injury, trauma and illness records"
        breadcrumbs={[{ label: "Accident Forms" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="h-9 w-[200px]">
                <SelectValue placeholder="Centre" />
              </SelectTrigger>
              <SelectContent>
                {centres.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeRoomId} onValueChange={setActiveRoom}>
              <SelectTrigger className="h-9 w-[180px]">
                <SelectValue placeholder="Room" />
              </SelectTrigger>
              <SelectContent>
                {rooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setMode({ view: "create" })}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add New Accident
            </Button>
          </div>
        }
      />

      {/* Search */}
      <div className="mb-5 flex max-w-md items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by child name…"
            className="h-10 pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Accident Records</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Click “Add New Accident” to create your first record.
          </p>
          <Button className="mt-5" onClick={() => setMode({ view: "create" })}>
            <Plus className="mr-1.5 h-4 w-4" />
            Add New Accident
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card to-muted/30 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl transition-opacity group-hover:opacity-100"
              />
              <h3 className="text-lg font-bold text-foreground">{r.childName}</h3>
              {r.roomName && (
                <p className="mt-0.5 text-xs text-muted-foreground">{r.roomName}</p>
              )}

              <dl className="mt-4 space-y-2 text-sm">
                <Row icon={UserCircle2} label="Created By" value={r.recorderName || user?.name || "Unknown"} />
                <Row icon={CalendarDays} label="Incident Date" value={fmtDDMMYYYY(r.incidentDate)} />
                <Row icon={CalendarDays} label="Created At" value={fmtDDMMYYYY(r.createdAt)} />
              </dl>

              <div className="mt-5 flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-9 w-9 text-primary hover:bg-primary/10"
                  onClick={() => setMode({ view: "view", id: r.id })}
                  aria-label="View"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setMode({ view: "edit", id: r.id })}
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-9 w-9"
                  onClick={() => setConfirmId(r.id)}
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <AlertDialog open={!!confirmId} onOpenChange={(o) => !o && setConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this accident record?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The record will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="font-semibold text-foreground">{label}:</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}
