import { create } from "zustand";

export const PALETTES = [
  {
    id: "teal",
    name: "Teal (Default)",
    swatch: "#0FB5A4",
    tokens: {
      primary: "oklch(0.72 0.125 184)",
      primaryForeground: "oklch(1 0 0)",
      primaryDeep: "oklch(0.59 0.105 184)",
      primarySoft: "oklch(0.96 0.025 184)",
      accent: "oklch(0.95 0.04 184)",
      accentForeground: "oklch(0.30 0.07 184)",
      ring: "oklch(0.72 0.125 184)",
      sidebar: "oklch(0.24 0.035 220)",
      sidebarPrimary: "oklch(0.72 0.125 184)",
      chart1: "oklch(0.72 0.125 184)",
    },
  },
  {
    id: "indigo",
    name: "Indigo",
    swatch: "#6366F1",
    tokens: {
      primary: "oklch(0.62 0.18 280)",
      primaryForeground: "oklch(1 0 0)",
      primaryDeep: "oklch(0.50 0.18 280)",
      primarySoft: "oklch(0.96 0.03 280)",
      accent: "oklch(0.95 0.04 280)",
      accentForeground: "oklch(0.32 0.10 280)",
      ring: "oklch(0.62 0.18 280)",
      sidebar: "oklch(0.24 0.04 280)",
      sidebarPrimary: "oklch(0.62 0.18 280)",
      chart1: "oklch(0.62 0.18 280)",
    },
  },
  {
    id: "rose",
    name: "Rose",
    swatch: "#F43F5E",
    tokens: {
      primary: "oklch(0.66 0.20 18)",
      primaryForeground: "oklch(1 0 0)",
      primaryDeep: "oklch(0.55 0.19 18)",
      primarySoft: "oklch(0.96 0.03 18)",
      accent: "oklch(0.95 0.04 18)",
      accentForeground: "oklch(0.35 0.12 18)",
      ring: "oklch(0.66 0.20 18)",
      sidebar: "oklch(0.24 0.04 18)",
      sidebarPrimary: "oklch(0.66 0.20 18)",
      chart1: "oklch(0.66 0.20 18)",
    },
  },
  {
    id: "amber",
    name: "Amber",
    swatch: "#F5B14C",
    tokens: {
      primary: "oklch(0.78 0.15 75)",
      primaryForeground: "oklch(0.25 0.05 75)",
      primaryDeep: "oklch(0.65 0.14 75)",
      primarySoft: "oklch(0.97 0.03 75)",
      accent: "oklch(0.95 0.05 75)",
      accentForeground: "oklch(0.32 0.08 75)",
      ring: "oklch(0.78 0.15 75)",
      sidebar: "oklch(0.24 0.03 75)",
      sidebarPrimary: "oklch(0.78 0.15 75)",
      chart1: "oklch(0.78 0.15 75)",
    },
  },
  {
    id: "emerald",
    name: "Emerald",
    swatch: "#22C55E",
    tokens: {
      primary: "oklch(0.72 0.18 145)",
      primaryForeground: "oklch(1 0 0)",
      primaryDeep: "oklch(0.58 0.16 145)",
      primarySoft: "oklch(0.96 0.04 145)",
      accent: "oklch(0.95 0.05 145)",
      accentForeground: "oklch(0.32 0.10 145)",
      ring: "oklch(0.72 0.18 145)",
      sidebar: "oklch(0.24 0.04 145)",
      sidebarPrimary: "oklch(0.72 0.18 145)",
      chart1: "oklch(0.72 0.18 145)",
    },
  },
  {
    id: "violet",
    name: "Violet",
    swatch: "#8B5CF6",
    tokens: {
      primary: "oklch(0.62 0.20 300)",
      primaryForeground: "oklch(1 0 0)",
      primaryDeep: "oklch(0.50 0.19 300)",
      primarySoft: "oklch(0.96 0.03 300)",
      accent: "oklch(0.95 0.04 300)",
      accentForeground: "oklch(0.34 0.12 300)",
      ring: "oklch(0.62 0.20 300)",
      sidebar: "oklch(0.24 0.04 300)",
      sidebarPrimary: "oklch(0.62 0.20 300)",
      chart1: "oklch(0.62 0.20 300)",
    },
  },
  {
    id: "sky",
    name: "Sky",
    swatch: "#0EA5E9",
    tokens: {
      primary: "oklch(0.70 0.14 230)",
      primaryForeground: "oklch(1 0 0)",
      primaryDeep: "oklch(0.56 0.13 230)",
      primarySoft: "oklch(0.96 0.03 230)",
      accent: "oklch(0.95 0.04 230)",
      accentForeground: "oklch(0.32 0.10 230)",
      ring: "oklch(0.70 0.14 230)",
      sidebar: "oklch(0.24 0.04 230)",
      sidebarPrimary: "oklch(0.70 0.14 230)",
      chart1: "oklch(0.70 0.14 230)",
    },
  },
  {
    id: "slate",
    name: "Slate",
    swatch: "#475569",
    tokens: {
      primary: "oklch(0.45 0.04 250)",
      primaryForeground: "oklch(1 0 0)",
      primaryDeep: "oklch(0.35 0.04 250)",
      primarySoft: "oklch(0.96 0.01 250)",
      accent: "oklch(0.94 0.01 250)",
      accentForeground: "oklch(0.30 0.04 250)",
      ring: "oklch(0.45 0.04 250)",
      sidebar: "oklch(0.22 0.02 250)",
      sidebarPrimary: "oklch(0.55 0.04 250)",
      chart1: "oklch(0.45 0.04 250)",
    },
  },
];

const LIGHT_FG = "oklch(0.21 0.04 256)";
const LIGHT_MUTED_FG = "oklch(0.55 0.03 250)";
const DARK_FG = "oklch(0.96 0.012 230)";
const DARK_MUTED_FG = "oklch(0.74 0.02 230)";

export const BACKGROUNDS = [
  {
    id: "mint",
    name: "Mint",
    swatch: "#F6FBFA",
    mode: "light",
    tokens: {
      background: "oklch(0.985 0.012 180)",
      foreground: LIGHT_FG,
      card: "oklch(1 0 0)",
      cardForeground: LIGHT_FG,
      popover: "oklch(1 0 0)",
      popoverForeground: LIGHT_FG,
      muted: "oklch(0.965 0.012 180)",
      mutedForeground: LIGHT_MUTED_FG,
      secondary: "oklch(0.96 0.014 180)",
      secondaryForeground: LIGHT_FG,
      border: "oklch(0.92 0.012 200)",
      input: "oklch(0.92 0.012 200)",
    },
  },
  {
    id: "white",
    name: "Pure White",
    swatch: "#FFFFFF",
    mode: "light",
    tokens: {
      background: "oklch(1 0 0)",
      foreground: LIGHT_FG,
      card: "oklch(1 0 0)",
      cardForeground: LIGHT_FG,
      popover: "oklch(1 0 0)",
      popoverForeground: LIGHT_FG,
      muted: "oklch(0.97 0 0)",
      mutedForeground: LIGHT_MUTED_FG,
      secondary: "oklch(0.965 0 0)",
      secondaryForeground: LIGHT_FG,
      border: "oklch(0.91 0 0)",
      input: "oklch(0.91 0 0)",
    },
  },
  {
    id: "paper",
    name: "Paper",
    swatch: "#FAFAFA",
    mode: "light",
    tokens: {
      background: "oklch(0.98 0 0)",
      foreground: LIGHT_FG,
      card: "oklch(1 0 0)",
      cardForeground: LIGHT_FG,
      popover: "oklch(1 0 0)",
      popoverForeground: LIGHT_FG,
      muted: "oklch(0.955 0 0)",
      mutedForeground: LIGHT_MUTED_FG,
      secondary: "oklch(0.95 0 0)",
      secondaryForeground: LIGHT_FG,
      border: "oklch(0.90 0 0)",
      input: "oklch(0.90 0 0)",
    },
  },
  {
    id: "slate",
    name: "Cool Slate",
    swatch: "#F1F5F9",
    mode: "light",
    tokens: {
      background: "oklch(0.97 0.01 250)",
      foreground: LIGHT_FG,
      card: "oklch(1 0 0)",
      cardForeground: LIGHT_FG,
      popover: "oklch(1 0 0)",
      popoverForeground: LIGHT_FG,
      muted: "oklch(0.95 0.012 250)",
      mutedForeground: LIGHT_MUTED_FG,
      secondary: "oklch(0.945 0.014 250)",
      secondaryForeground: LIGHT_FG,
      border: "oklch(0.90 0.014 250)",
      input: "oklch(0.90 0.014 250)",
    },
  },
  {
    id: "stone",
    name: "Warm Stone",
    swatch: "#F5F5F4",
    mode: "light",
    tokens: {
      background: "oklch(0.965 0.005 60)",
      foreground: LIGHT_FG,
      card: "oklch(1 0 0)",
      cardForeground: LIGHT_FG,
      popover: "oklch(1 0 0)",
      popoverForeground: LIGHT_FG,
      muted: "oklch(0.945 0.006 60)",
      mutedForeground: LIGHT_MUTED_FG,
      secondary: "oklch(0.94 0.008 60)",
      secondaryForeground: LIGHT_FG,
      border: "oklch(0.89 0.008 60)",
      input: "oklch(0.89 0.008 60)",
    },
  },
  {
    id: "warm",
    name: "Warm Sand",
    swatch: "#FAF7F2",
    mode: "light",
    tokens: {
      background: "oklch(0.975 0.014 80)",
      foreground: LIGHT_FG,
      card: "oklch(1 0 0)",
      cardForeground: LIGHT_FG,
      popover: "oklch(1 0 0)",
      popoverForeground: LIGHT_FG,
      muted: "oklch(0.955 0.016 80)",
      mutedForeground: LIGHT_MUTED_FG,
      secondary: "oklch(0.95 0.016 80)",
      secondaryForeground: LIGHT_FG,
      border: "oklch(0.90 0.018 80)",
      input: "oklch(0.90 0.018 80)",
    },
  },
  {
    id: "lavender",
    name: "Lavender",
    swatch: "#F6F5FC",
    mode: "light",
    tokens: {
      background: "oklch(0.975 0.014 295)",
      foreground: LIGHT_FG,
      card: "oklch(1 0 0)",
      cardForeground: LIGHT_FG,
      popover: "oklch(1 0 0)",
      popoverForeground: LIGHT_FG,
      muted: "oklch(0.955 0.016 295)",
      mutedForeground: LIGHT_MUTED_FG,
      secondary: "oklch(0.95 0.016 295)",
      secondaryForeground: LIGHT_FG,
      border: "oklch(0.90 0.018 295)",
      input: "oklch(0.90 0.018 295)",
    },
  },
  {
    id: "rose",
    name: "Rose Petal",
    swatch: "#FDF5F5",
    mode: "light",
    tokens: {
      background: "oklch(0.975 0.014 18)",
      foreground: LIGHT_FG,
      card: "oklch(1 0 0)",
      cardForeground: LIGHT_FG,
      popover: "oklch(1 0 0)",
      popoverForeground: LIGHT_FG,
      muted: "oklch(0.955 0.016 18)",
      mutedForeground: LIGHT_MUTED_FG,
      secondary: "oklch(0.95 0.016 18)",
      secondaryForeground: LIGHT_FG,
      border: "oklch(0.90 0.018 18)",
      input: "oklch(0.90 0.018 18)",
    },
  },
  {
    id: "sky-light",
    name: "Sky Mist",
    swatch: "#F0F7FE",
    mode: "light",
    tokens: {
      background: "oklch(0.975 0.018 230)",
      foreground: LIGHT_FG,
      card: "oklch(1 0 0)",
      cardForeground: LIGHT_FG,
      popover: "oklch(1 0 0)",
      popoverForeground: LIGHT_FG,
      muted: "oklch(0.955 0.02 230)",
      mutedForeground: LIGHT_MUTED_FG,
      secondary: "oklch(0.95 0.02 230)",
      secondaryForeground: LIGHT_FG,
      border: "oklch(0.90 0.022 230)",
      input: "oklch(0.90 0.022 230)",
    },
  },
  {
    id: "midnight",
    name: "Midnight",
    swatch: "#0F172A",
    mode: "dark",
    tokens: {
      background: "oklch(0.22 0.03 250)",
      foreground: DARK_FG,
      card: "oklch(0.27 0.03 250)",
      cardForeground: DARK_FG,
      popover: "oklch(0.27 0.03 250)",
      popoverForeground: DARK_FG,
      muted: "oklch(0.30 0.03 250)",
      mutedForeground: DARK_MUTED_FG,
      secondary: "oklch(0.30 0.03 250)",
      secondaryForeground: DARK_FG,
      border: "oklch(0.36 0.03 250)",
      input: "oklch(0.36 0.03 250)",
    },
  },
  {
    id: "graphite",
    name: "Graphite",
    swatch: "#1F2937",
    mode: "dark",
    tokens: {
      background: "oklch(0.27 0.018 250)",
      foreground: DARK_FG,
      card: "oklch(0.32 0.02 250)",
      cardForeground: DARK_FG,
      popover: "oklch(0.32 0.02 250)",
      popoverForeground: DARK_FG,
      muted: "oklch(0.35 0.02 250)",
      mutedForeground: DARK_MUTED_FG,
      secondary: "oklch(0.35 0.02 250)",
      secondaryForeground: DARK_FG,
      border: "oklch(0.40 0.022 250)",
      input: "oklch(0.40 0.022 250)",
    },
  },
  {
    id: "obsidian",
    name: "Obsidian",
    swatch: "#0A0A0A",
    mode: "dark",
    tokens: {
      background: "oklch(0.16 0 0)",
      foreground: DARK_FG,
      card: "oklch(0.22 0 0)",
      cardForeground: DARK_FG,
      popover: "oklch(0.22 0 0)",
      popoverForeground: DARK_FG,
      muted: "oklch(0.26 0 0)",
      mutedForeground: DARK_MUTED_FG,
      secondary: "oklch(0.26 0 0)",
      secondaryForeground: DARK_FG,
      border: "oklch(0.32 0 0)",
      input: "oklch(0.32 0 0)",
    },
  },
  {
    id: "forest",
    name: "Forest",
    swatch: "#0E2422",
    mode: "dark",
    tokens: {
      background: "oklch(0.24 0.03 180)",
      foreground: DARK_FG,
      card: "oklch(0.29 0.03 180)",
      cardForeground: DARK_FG,
      popover: "oklch(0.29 0.03 180)",
      popoverForeground: DARK_FG,
      muted: "oklch(0.32 0.03 180)",
      mutedForeground: DARK_MUTED_FG,
      secondary: "oklch(0.32 0.03 180)",
      secondaryForeground: DARK_FG,
      border: "oklch(0.38 0.03 180)",
      input: "oklch(0.38 0.03 180)",
    },
  },
];

function applyPalette(p) {
  if (typeof document === "undefined") return;
  const r = document.documentElement.style;
  const t = p.tokens;
  r.setProperty("--primary", t.primary);
  r.setProperty("--primary-foreground", t.primaryForeground);
  r.setProperty("--primary-deep", t.primaryDeep);
  r.setProperty("--primary-soft", t.primarySoft);
  r.setProperty("--accent", t.accent);
  r.setProperty("--accent-foreground", t.accentForeground);
  r.setProperty("--ring", t.ring);
  r.setProperty("--sidebar", t.sidebar);
  r.setProperty("--sidebar-primary", t.sidebarPrimary);
  r.setProperty("--sidebar-ring", t.ring);
  r.setProperty("--chart-1", t.chart1);
}

function applyBackground(b) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const r = root.style;
  const t = b.tokens;
  r.setProperty("--background", t.background);
  r.setProperty("--foreground", t.foreground);
  r.setProperty("--card", t.card);
  r.setProperty("--card-foreground", t.cardForeground);
  r.setProperty("--popover", t.popover);
  r.setProperty("--popover-foreground", t.popoverForeground);
  r.setProperty("--muted", t.muted);
  r.setProperty("--muted-foreground", t.mutedForeground);
  r.setProperty("--secondary", t.secondary);
  r.setProperty("--secondary-foreground", t.secondaryForeground);
  r.setProperty("--border", t.border);
  r.setProperty("--input", t.input);

  if (b.mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

const STORAGE_KEY = "mydiaree:theme-palette";
const BG_STORAGE_KEY = "mydiaree:theme-background";

export const useThemeStore = create((set) => ({
  paletteId: "teal",
  backgroundId: "mint",
  setPalette: (id) => {
    const p = PALETTES.find((x) => x.id === id) ?? PALETTES[0];
    applyPalette(p);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(STORAGE_KEY, p.id);
      } catch {}
    }
    set({ paletteId: p.id });
  },
  setBackground: (id) => {
    const b = BACKGROUNDS.find((x) => x.id === id) ?? BACKGROUNDS[0];
    applyBackground(b);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(BG_STORAGE_KEY, b.id);
      } catch {}
    }
    set({ backgroundId: b.id });
  },
  init: () => {
    if (typeof window === "undefined") return;
    let pid = "teal";
    let bid = "mint";
    try {
      pid = localStorage.getItem(STORAGE_KEY) ?? "teal";
      bid = localStorage.getItem(BG_STORAGE_KEY) ?? "mint";
    } catch {}
    const p = PALETTES.find((x) => x.id === pid) ?? PALETTES[0];
    const b = BACKGROUNDS.find((x) => x.id === bid) ?? BACKGROUNDS[0];
    applyPalette(p);
    applyBackground(b);
    set({ paletteId: p.id, backgroundId: b.id });
  },
}));
