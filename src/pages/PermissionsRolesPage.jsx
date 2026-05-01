import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Eye, PencilLine, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { AddRoleModal } from "@/components/permissions/AddRoleModal";

const seedRoles = [
  { id: "r1", name: "Fasgda", createdAt: "30 Apr 2026" },
];

export default function PermissionsRolesPage() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState(seedRoles);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const filtered = useMemo(
    () =>
      roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase())),
    [roles, search]
  );

  const today = () =>
    new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const handleSave = (name) => {
    if (editing) {
      setRoles((prev) => prev.map((r) => (r.id === editing.id ? { ...r, name } : r)));
      toast.success("Role updated");
    } else {
      setRoles((prev) => [
        ...prev,
        { id: `r${Date.now()}`, name, createdAt: today() },
      ]);
      toast.success("Role added");
    }
    setEditing(null);
  };

  const handleDelete = () => {
    setRoles((prev) => prev.filter((r) => r.id !== deleteId));
    toast.success("Role deleted");
    setDeleteId(null);
  };

  return (
    <div>
      <PageHeader
        title="Permissions Role List"
        breadcrumbs={[
          { label: "Permissions Assign", to: "/permissions" },
          { label: "Role List" },
        ]}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate("/permissions")}>
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={() => {
                setEditing(null);
                setModalOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Role
            </Button>
          </>
        }
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-end border-b p-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search Role Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-16 px-4">S.No</TableHead>
              <TableHead>Role Name</TableHead>
              <TableHead>Created on</TableHead>
              <TableHead className="text-right pr-4">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r, i) => (
                <TableRow key={r.id}>
                  <TableCell className="px-4">{i + 1}</TableCell>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell>{r.createdAt}</TableCell>
                  <TableCell className="pr-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        className="h-8 rounded-full bg-blue-600 px-3 text-white hover:bg-blue-700"
                        onClick={() => navigate(`/permissions/roles/${r.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 rounded-full bg-teal-500 px-3 text-white hover:bg-teal-600"
                        onClick={() => {
                          setEditing(r);
                          setModalOpen(true);
                        }}
                      >
                        <PencilLine className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 rounded-full px-3"
                        onClick={() => setDeleteId(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AddRoleModal
        open={modalOpen}
        onOpenChange={(o) => {
          setModalOpen(o);
          if (!o) setEditing(null);
        }}
        onSave={handleSave}
        initialName={editing?.name || ""}
        mode={editing ? "edit" : "add"}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this role?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
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