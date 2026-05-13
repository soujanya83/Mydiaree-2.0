import {
  Plus,
  Trash2,
  PencilLine,
  Eye,
  CheckCircle2,
  Settings,
  CheckCircle,
  Shield,
  Printer,
  Download,
  Mail,
  Calendar,
  Lock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const getPermissionIcon = (name = "", label = "") => {
  const n = name.toLowerCase();
  const l = label.toLowerCase();

  if (n.includes("add") || l.includes("add") || n.includes("create") || l.includes("create")) return Plus;
  if (n.includes("edit") || l.includes("edit") || n.includes("update") || l.includes("update")) return PencilLine;
  if (n.includes("delete") || l.includes("delete") || n.includes("remove") || l.includes("remove")) return Trash2;
  if (n.includes("view") || l.includes("view") || n.includes("list") || l.includes("list")) return Eye;
  if (n.includes("approve") || l.includes("approve")) return CheckCircle2;
  if (n.includes("print") || l.includes("print")) return Printer;
  if (n.includes("download") || l.includes("download")) return Download;
  if (n.includes("mail") || l.includes("mail")) return Mail;
  if (n.includes("ptm") || l.includes("calendar")) return Calendar;
  if (n.includes("permission") || l.includes("permission")) return Lock;

  return Settings;
};

export function PermissionCard({
  group,
  selectedKeys,
  onToggle,
  onToggleAll,
  readOnly = false,
}) {
  const GroupIcon = group.icon || Shield;

  // Flatten all permissions in this group (including submodules) to calculate selected count
  const allPermissionsInGroup = [];
  if (group.permissions) allPermissionsInGroup.push(...group.permissions);
  if (group.submodules) {
    group.submodules.forEach((sub) => {
      if (sub.permissions) allPermissionsInGroup.push(...sub.permissions);
    });
  }

  const total = allPermissionsInGroup.length;
  const selectedInGroup = allPermissionsInGroup.filter((p) => selectedKeys.includes(p.name)).length;
  const allOn = total > 0 && selectedInGroup === total;

  const renderPermissionItem = (p) => {
    const Icon = getPermissionIcon(p.name, p.label);
    const checked = selectedKeys.includes(p.name);

    return (
      <div
        key={p.name}
        className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
            checked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium text-foreground">{p.label}</span>
        </div>
        <Switch
          checked={checked}
          disabled={readOnly}
          onCheckedChange={() => onToggle(group.module, p.name)}
        />
      </div>
    );
  };

  return (
    <div className="flex h-[500px] flex-col overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b bg-gradient-to-r from-primary/5 to-transparent px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GroupIcon className="h-5.5 w-5.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground line-clamp-1">{group.module}</h3>
            <p className="text-xs text-muted-foreground">
              {selectedInGroup} of {total} enabled
            </p>
          </div>
        </div>
        {!readOnly && total > 0 && (
          <button
            type="button"
            onClick={() => onToggleAll(group.module, !allOn)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
              allOn
                ? "bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            {allOn ? "Deselect" : "Select All"}
          </button>
        )}
      </div>

      {/* Permissions List (Scrollable) */}
      <div className="flex-1 overflow-y-auto divide-y scrollbar-thin scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/30">
        {/* Direct Permissions */}
        {group.permissions && group.permissions.map(renderPermissionItem)}

        {/* Submodules */}
        {group.submodules &&
          group.submodules.map((sub) => (
            <div key={sub.name} className="flex flex-col">
              <div className="sticky top-0 z-10 bg-muted/90 px-5 py-2 backdrop-blur-sm border-y">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">
                  {sub.name}
                </span>
              </div>
              <div className="divide-y">
                {sub.permissions && sub.permissions.map(renderPermissionItem)}
              </div>
            </div>
          ))}

        {total === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <Shield className="mb-2 h-10 w-10 text-muted/30" />
            <p className="text-sm text-muted-foreground">No permissions defined</p>
          </div>
        )}
      </div>
    </div>
  );
}