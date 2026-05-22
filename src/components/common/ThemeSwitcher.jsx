import { useEffect } from "react";
import { Check, Link2, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BACKGROUNDS,
  PAIRED_BACKGROUNDS,
  PALETTES,
  THEME_PAIRINGS,
  getPairedBackgroundId,
  isPairedTheme,
  useThemeStore,
} from "@/stores/themeStore";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const paletteId = useThemeStore((s) => s.paletteId);
  const backgroundId = useThemeStore((s) => s.backgroundId);
  const setPalette = useThemeStore((s) => s.setPalette);
  const setBackground = useThemeStore((s) => s.setBackground);
  const init = useThemeStore((s) => s.init);

  const isPaired = isPairedTheme(paletteId, backgroundId);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
          aria-label="Theme"
        >
          <Palette className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-3">
        <p className="mb-2 px-1 text-[11px] text-muted-foreground">
          Accent and background are paired. Click either to apply both. Hold{" "}
          <kbd className="rounded border border-border bg-muted px-1 font-sans text-[10px]">
            Shift
          </kbd>{" "}
          to change only that side.
        </p>

        {!isPaired && (
          <p className="mb-2 flex items-center gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-[11px] font-medium text-amber-800 dark:text-amber-200">
            <Link2 className="h-3 w-3 shrink-0" />
            Custom combination (not a default pair)
          </p>
        )}

        <DropdownMenuLabel className="px-1 text-xs uppercase tracking-wider text-muted-foreground">
          Theme pairs — accent
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-4 gap-1.5 py-2">
          {PALETTES.map((p) => {
            const active = p.id === paletteId;
            const pairedBg = BACKGROUNDS.find((b) => b.id === getPairedBackgroundId(p.id));
            return (
              <button
                key={p.id}
                onClick={(e) =>
                  setPalette(p.id, { syncPair: !e.shiftKey })
                }
                className={cn(
                  "group flex flex-col items-center gap-1 rounded-md p-2 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground",
                )}
                title={`${p.name} ↔ ${pairedBg?.name ?? "background"}`}
              >
                <div
                  className="relative h-7 w-7 rounded-full ring-2 ring-border"
                  style={{ backgroundColor: p.swatch }}
                >
                  {active && (
                    <Check className="absolute inset-0 m-auto h-3.5 w-3.5 text-white drop-shadow" />
                  )}
                </div>
                {p.name.split(" ")[0]}
              </button>
            );
          })}
        </div>

        <DropdownMenuLabel className="mt-2 px-1 text-xs uppercase tracking-wider text-muted-foreground">
          Theme pairs — background
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-4 gap-1.5 py-2">
          {PAIRED_BACKGROUNDS.map((b) => {
            const active = b.id === backgroundId;
            const pair = THEME_PAIRINGS.find((item) => item.backgroundId === b.id);
            const pairedPalette = PALETTES.find((p) => p.id === pair?.paletteId);
            return (
              <button
                key={b.id}
                onClick={(e) =>
                  setBackground(b.id, { syncPair: !e.shiftKey })
                }
                className={cn(
                  "group flex flex-col items-center gap-1 rounded-md p-2 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground",
                )}
                title={`${b.name} ↔ ${pairedPalette?.name ?? "accent"}`}
              >
                <div
                  className="relative h-7 w-full rounded-md ring-2 ring-border"
                  style={{ backgroundColor: b.swatch }}
                >
                  {active && (
                    <Check
                      className={cn(
                        "absolute inset-0 m-auto h-3.5 w-3.5",
                        b.mode === "dark" ? "text-white" : "text-foreground",
                      )}
                    />
                  )}
                </div>
                {b.name.split(" ")[0]}
              </button>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
