import { useMemo, useState } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, UtensilsCrossed, Calendar, ClipboardList, CalendarDays } from "lucide-react";
import { useCentreStore } from "@/stores/centreStore";
import {
  MEAL_TIMES,
  WEEKDAYS,
  MENU_ITEM_LIBRARY,
  initialMenu,
  dailyRequirements,
  fortnightlyRequirements,
} from "@/components/menu/menuData";
import { AddMenuItemsModal } from "@/components/menu/AddMenuItemsModal";
import { toast } from "sonner";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function weekRangeLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const day = d.getDay(); // 0 Sun .. 6 Sat
  const offsetToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(d);
  mon.setDate(d.getDate() + offsetToMon);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  const fmt = (x) =>
    x.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${fmt(mon)} to ${fmt(fri)}`;
}

// Returns the weekday id (mon..fri) for "today" if today falls within the
// Mon-Fri week of the given date, otherwise null.
function todayDayIdInWeek(dateStr) {
  if (!dateStr) return null;
  const selected = new Date(dateStr);
  const day = selected.getDay();
  const offsetToMon = day === 0 ? -6 : 1 - day;
  const mon = new Date(selected);
  mon.setDate(selected.getDate() + offsetToMon);
  mon.setHours(0, 0, 0, 0);
  const fri = new Date(mon);
  fri.setDate(mon.getDate() + 4);
  fri.setHours(23, 59, 59, 999);
  const today = new Date();
  if (today < mon || today > fri) return null;
  const ids = ["mon", "tue", "wed", "thu", "fri"];
  const idx = today.getDay(); // 1..5 expected
  if (idx < 1 || idx > 5) return null;
  return ids[idx - 1];
}

export default function MenuPage() {
  const centres = useCentreStore((s) => s.centres);
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);

  const [date, setDate] = useState(todayISO());
  // menu shape: { [mealId]: { [dayId]: string[] (item ids) } }
  const [menu, setMenu] = useState(initialMenu);

  const [modal, setModal] = useState({ open: false, mealId: null, dayId: null });

  const openModal = (mealId, dayId) => setModal({ open: true, mealId, dayId });

  const handleSave = (ids) => {
    setMenu((m) => ({
      ...m,
      [modal.mealId]: { ...(m[modal.mealId] || {}), [modal.dayId]: ids },
    }));
    toast.success("Menu updated");
  };

  const removeItem = (mealId, dayId, itemId) => {
    setMenu((m) => ({
      ...m,
      [mealId]: {
        ...(m[mealId] || {}),
        [dayId]: (m[mealId]?.[dayId] || []).filter((x) => x !== itemId),
      },
    }));
  };

  const weekLabel = useMemo(() => weekRangeLabel(date), [date]);
  const todayId = useMemo(() => todayDayIdInWeek(date), [date]);

  const activeMeal = MEAL_TIMES.find((m) => m.id === modal.mealId);
  const activeDay = WEEKDAYS.find((d) => d.id === modal.dayId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Healthy Eating Menu"
        description="Plan weekly meals across all meal times"
        breadcrumbs={[{ label: "Healthy Eating Menu" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select value={activeCentreId} onValueChange={setActiveCentre}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select centre" />
              </SelectTrigger>
              <SelectContent>
                {centres.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-[170px]"
            />
          </div>
        }
      />

      {/* Hero banner */}
      <div
        className="rounded-2xl px-6 py-8 text-center text-white shadow-md"
        style={{
          backgroundImage:
            "linear-gradient(135deg, oklch(0.72 0.13 180), oklch(0.65 0.16 240))",
        }}
      >
        <div className="flex items-center justify-center gap-2 text-2xl font-bold sm:text-3xl">
          <UtensilsCrossed className="h-7 w-7" />
          <span>Summer Menu</span>
        </div>
        <p className="mt-2 text-sm opacity-90">
          Nutritious meals crafted for growing minds and bodies
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm backdrop-blur">
          <Calendar className="h-4 w-4" />
          <span>{weekLabel}</span>
        </div>
      </div>

      {/* Menu grid */}
      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="w-40 border-b border-r px-4 py-3 text-left font-semibold text-primary">
                Meal Times
              </th>
              {WEEKDAYS.map((d) => (
                <th
                  key={d.id}
                  className={`border-b border-r px-4 py-3 text-left font-semibold last:border-r-0 ${
                    todayId === d.id
                      ? "bg-primary/10 text-primary"
                      : "text-primary"
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {d.label}
                    {todayId === d.id && (
                      <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                        Today
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEAL_TIMES.map((meal) => (
              <tr key={meal.id} className="border-b last:border-b-0">
                <td className="border-r bg-muted/20 px-4 py-4 text-center font-semibold text-primary align-middle">
                  {meal.label}
                </td>
                {WEEKDAYS.map((day) => {
                  const ids = menu[meal.id]?.[day.id] || [];
                  const items = ids
                    .map((id) => MENU_ITEM_LIBRARY[meal.id]?.find((x) => x.id === id))
                    .filter(Boolean);
                  return (
                    <td
                      key={day.id}
                      className={`border-r px-3 py-3 align-top last:border-r-0 ${
                        todayId === day.id ? "bg-primary/5" : ""
                      }`}
                    >
                      {items.length === 0 ? (
                        <div className="flex flex-col items-start gap-2">
                          <span className="text-xs text-muted-foreground">
                            No menu available
                          </span>
                          <button
                            type="button"
                            onClick={() => openModal(meal.id, day.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            aria-label="Add items"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {items.map((it) => (
                            <div
                              key={it.id}
                              className="rounded-md border bg-background px-3 py-2 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-sm font-semibold text-foreground">
                                  {it.name}
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeItem(meal.id, day.id, it.id)}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                                  aria-label="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              {it.note && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {it.note}
                                </div>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => openModal(meal.id, day.id)}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                            aria-label="Add items"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Requirements */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <ClipboardList className="h-5 w-5" />
            <h3 className="text-base font-semibold">Daily Requirements</h3>
          </div>
          <ul className="space-y-2 text-sm text-foreground">
            {dailyRequirements.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-primary">
            <CalendarDays className="h-5 w-5" />
            <h3 className="text-base font-semibold">Fortnightly Requirements</h3>
          </div>
          <ul className="space-y-2 text-sm text-foreground">
            {fortnightlyRequirements.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs italic text-foreground">
            <span className="font-semibold not-italic">Note:</span> This menu follows Long
            Day Care nutritional guidelines and Australian Dietary Guidelines. Water is
            available to children with all meals.
          </div>
        </div>
      </div>

      <AddMenuItemsModal
        open={modal.open}
        onOpenChange={(o) => setModal((m) => ({ ...m, open: o }))}
        mealId={modal.mealId}
        mealLabel={activeMeal?.label || ""}
        dayLabel={activeDay?.label || ""}
        selectedIds={menu[modal.mealId]?.[modal.dayId] || []}
        onSave={handleSave}
      />
    </div>
  );
}
