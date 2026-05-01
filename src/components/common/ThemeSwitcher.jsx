import { useEffect } from "react";
import { Check, Palette } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BACKGROUNDS, PALETTES, useThemeStore } from "@/stores/themeStore";
import { cn } from "@/lib/utils";

export function ThemeSwitcher() {
  const paletteId = useThemeStore((s) => s.paletteId);
  const backgroundId = useThemeStore((s) => s.backgroundId);
  const setPalette = useThemeStore((s) => s.setPalette);
  const setBackground = useThemeStore((s) => s.setBackground);
  const init = useThemeStore((s) => s.init);

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
        <DropdownMenuLabel className="px-1 text-xs uppercase tracking-wider text-muted-foreground">
          Accent color
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-4 gap-1.5 py-2">
          {PALETTES.map((p) => {
            const active = p.id === paletteId;
            return (
              <button
                key={p.id}
                onClick={() => setPalette(p.id)}
                className={cn(
                  "group flex flex-col items-center gap-1 rounded-md p-2 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground"
                )}
                title={p.name}
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
          Page background
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid grid-cols-4 gap-1.5 py-2">
          {BACKGROUNDS.map((b) => {
            const active = b.id === backgroundId;
            return (
              <button
                key={b.id}
                onClick={() => setBackground(b.id)}
                className={cn(
                  "group flex flex-col items-center gap-1 rounded-md p-2 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground",
                  active && "bg-muted text-foreground"
                )}
                title={b.name}
              >
                <div
                  className="relative h-7 w-full rounded-md ring-2 ring-border"
                  style={{ backgroundColor: b.swatch }}
                >
                  {active && (
                    <Check
                      className={cn(
                        "absolute inset-0 m-auto h-3.5 w-3.5",
                        b.mode === "dark" ? "text-white" : "text-foreground"
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
