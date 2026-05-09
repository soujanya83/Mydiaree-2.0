import { Plus, Trash2, PencilLine, Eye, CheckCircle2, Settings, CheckCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const ICONS = {
  plus: Plus,
  trash: Trash2,
  edit: PencilLine,
  eye: Eye,
  check: CheckCircle2,
  settings: Settings,
};

export function PermissionCard({
  group,
  selectedKeys,
  onToggle,
  onToggleAll,
  readOnly = false,
  showAllToggle = true,
  showCount = false,
}) {
  const GroupIcon = group.icon || Settings;
  const total = group.permissions.length;
  const selectedInGroup = group.permissions.filter((p) => selectedKeys.includes(p.key)).length;
  const allOn = total > 0 && selectedInGroup === total;

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-2 bg-primary px-4 py-3 text-primary-foreground">
        <div className="flex items-center gap-2">
          <GroupIcon className="h-5 w-5" />
          <h3 className="text-sm font-bold tracking-wide">{group.label}</h3>
        </div>
        {showAllToggle && total > 0 && !readOnly && (
          <button
            type="button"
            onClick={() => onToggleAll(group.key, !allOn)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold transition-colors",
              allOn ? "bg-primary-foreground/20" : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
            )}
          >
            <CheckCircle className="h-3.5 w-3.5" />
            All
          </button>
        )}
        {showCount && total > 0 && (
          <span className="flex items-center gap-1 rounded-md bg-primary-foreground/15 px-2 py-1 text-xs font-semibold">
            <CheckCircle className="h-3.5 w-3.5" />
            {selectedInGroup}/{total}
          </span>
        )}
      </div>

      <div className="divide-y">
        {total === 0 ? (
          <div className="px-4 py-6 text-center text-xs text-muted-foreground">No permissions</div>
        ) : (
          group.permissions.map((p) => {
            const Icon = ICONS[p.icon] || Settings;
            const checked = selectedKeys.includes(p.key);
            return (
              <div key={p.key} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm text-foreground">{p.label}</span>
                </div>
                <Switch
                  checked={checked}
                  disabled={readOnly}
                  onCheckedChange={() => onToggle(group.key, p.key)}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}