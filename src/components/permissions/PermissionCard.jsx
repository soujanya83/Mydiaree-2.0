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
  Lock,
  RefreshCw,
  FileText,
  FileSearch,
  FileDown,
  Calendar,
  ListChecks,
  CircleDashed,
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
  if (n.includes("reschedule") || l.includes("reschedule")) return RefreshCw;
  if (n.includes("pdf") || l.includes("pdf")) return FileText;
  if (n.includes("assessment") || l.includes("assessment")) return FileSearch;
  if (n.includes("download") || l.includes("download")) return FileDown;

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

  // Calculate totals and selection state
  const total = group.permissions?.length || 0;
  const selectedInGroup = (group.permissions || []).filter((p) => selectedKeys.includes(p.name)).length;
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
    <div className="flex h-[450px] flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/50 shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-2xl">
      {/* Header */}
      <div className="relative flex shrink-0 items-center justify-between gap-3 border-b border-border/40 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 ring-4 ring-primary/10">
            <GroupIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold tracking-tight text-foreground line-clamp-1">{group.module}</h3>
            <div className="mt-0.5 flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              <p className="text-xs font-bold text-muted-foreground/80 uppercase tracking-wider">
                {selectedInGroup} / {total} ACTIVE
              </p>
            </div>
          </div>
        </div>
        {!readOnly && total > 0 && (
          <button
            type="button"
            onClick={() => onToggleAll(group.module, !allOn)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all border",
              allOn
                ? "bg-primary/10 text-primary border-primary/20 shadow-sm"
                : "bg-muted/50 text-muted-foreground border-transparent hover:bg-primary/10 hover:text-primary hover:border-primary/20"
            )}
          >
            {allOn ? (
              <>
                <CircleDashed className="h-3.5 w-3.5" />
                Deselect
              </>
            ) : (
              <>
                <ListChecks className="h-3.5 w-3.5" />
                Select All
              </>
            )}
          </button>
        )}
      </div>
 
      {/* Permissions List (Scrollable) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-border/30">
          {group.permissions && group.permissions.map(renderPermissionItem)}
        </div>
 
        {total === 0 && (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center px-6">
            <div className="mb-4 rounded-full bg-muted/50 p-6">
              <Shield className="h-12 w-12 text-muted-foreground/20" />
            </div>
            <h4 className="text-sm font-bold text-muted-foreground">No Permissions</h4>
            <p className="mt-1 text-xs text-muted-foreground/60 italic">No access rules defined for this module.</p>
          </div>
        )}
      </div>
    </div>
  );
}