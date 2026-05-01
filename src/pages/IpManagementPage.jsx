import { useMemo, useState } from "react";
import { Plus, Trash2, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";
import { initialIps } from "@/components/ipmanagement/ipsData";
import { AddIpModal } from "@/components/ipmanagement/AddIpModal";

export default function IpManagementPage() {
  const [ips, setIps] = useState(initialIps);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const rows = useMemo(() => ips, [ips]);

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setModalOpen(true);
  };

  const handleSave = (data) => {
    if (data.id) {
      setIps((arr) => arr.map((x) => (x.id === data.id ? { ...x, ...data } : x)));
      toast.success("IP updated");
    } else {
      setIps((arr) => [...arr, { ...data, id: `ip${Date.now()}` }]);
      toast.success("IP added");
    }
  };

  const handleDelete = () => {
    setIps((arr) => arr.filter((x) => x.id !== deleteId));
    setDeleteId(null);
    toast.success("IP deleted");
  };

  const toggleStatus = (row) => {
    const next = row.status === "active" ? "inactive" : "active";
    setIps((arr) => arr.map((x) => (x.id === row.id ? { ...x, status: next } : x)));
    toast.success(`IP marked ${next}`);
  };

  return (
    <div>
      <PageHeader
        title="IP Management"
        description="Allowed networks and restrictions"
        breadcrumbs={[{ label: "Setting" }, { label: "IP List" }]}
        actions={
          <Button onClick={openAdd} variant="outline">
            <Plus className="h-4 w-4" />
            Add New IP
          </Button>
        }
      />

      <div className="rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead className="w-12 font-semibold text-foreground">#</TableHead>
              <TableHead className="font-semibold text-foreground">IP</TableHead>
              <TableHead className="font-semibold text-foreground">IP Name</TableHead>
              <TableHead className="font-semibold text-foreground">IP Location</TableHead>
              <TableHead className="font-semibold text-foreground">IP Status</TableHead>
              <TableHead className="font-semibold text-foreground text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                  No IPs added yet.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow key={row.id}>
                  <TableCell className="font-semibold">{idx + 1}</TableCell>
                  <TableCell className="font-mono text-sm">{row.ip}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.location || "--"}</TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => toggleStatus(row)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer",
                        row.status === "active"
                          ? "bg-primary/10 text-primary hover:bg-primary/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      <Eye className="h-3 w-3" />
                      {row.status === "active" ? "Active" : "Inactive"}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => openEdit(row)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteId(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddIpModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initial={editing}
        onSave={handleSave}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this IP?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The IP will be removed from the allowed list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
