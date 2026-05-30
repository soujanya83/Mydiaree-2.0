import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { CentreSelect } from "@/components/common/CentreSelect";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, UtensilsCrossed, Calendar, ClipboardList, CalendarDays, Loader2 } from "lucide-react";
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
import {
  MEAL_TIMES,
  WEEKDAYS,
  dailyRequirements,
  fortnightlyRequirements,
} from "@/components/menu/menuData";
import { AddMenuItemsModal } from "@/components/menu/AddMenuItemsModal";
import { toast } from "sonner";
import { useMenuStore } from "@/stores/menuStore";
import { useRecipeStore } from "@/stores/recipeStore";
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import { recipeService } from "@/services/nutrition/recipeService";


function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// API expects DD-MM-YYYY
function formatForAPI(dateStr) {
  if (!dateStr) return "";
  const [y, m, d] = dateStr.split("-");
  return `${d}-${m}-${y}`;
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

function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getWeeksOfMonth(dateStr) {
  if (!dateStr) return [];
  const d = parseLocalDate(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth();
  
  const weeks = [];
  // Start from the 1st of the month
  let current = new Date(year, month, 1);
  
  // Find all Mondays that fall in this month
  while (current.getMonth() === month || weeks.length < 1) {
    if (current.getDay() === 1) { // Monday
      const mon = new Date(current);
      const fri = new Date(current);
      fri.setDate(mon.getDate() + 4);
      
      const fmt = (x) => x.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      const iso = mon.getFullYear() + "-" + 
                  String(mon.getMonth() + 1).padStart(2, "0") + "-" + 
                  String(mon.getDate()).padStart(2, "0");
      
      weeks.push({
        id: iso,
        label: `Week ${weeks.length + 1} - ${fmt(mon)} to ${fmt(fri)}`,
        monday: iso
      });
    }
    current.setDate(current.getDate() + 1);
    // Stop if we passed the month and have enough weeks, or reached next month's 2nd Monday
    if (current.getMonth() !== month && current.getDay() === 1) break;
  }
  return weeks;
}



export default function MenuPage() {
  const activeCentreId = useCentreStore((s) => s.activeCentreId);
  const centres = useCentreStore((s) => s.centres);
  const setActiveCentre = useCentreStore((s) => s.setActiveCentre);

  const { menuData, isLoading: isMenuLoading, fetchMenu, addRecipes, deleteMenuItem } = useMenuStore();
  const { fetchRecipes, recipesGrouped } = useRecipeStore();
  const { can } = usePermissions();
  const perms = ACTION_PERMISSIONS.menu;
  const [allRecipes, setAllRecipes] = useState([]);

  const [date, setDate] = useState(todayISO());
  const [modal, setModal] = useState({ open: false, mealId: null, dayId: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);


  useEffect(() => {
    if (activeCentreId && date) {
      fetchMenu(activeCentreId, formatForAPI(date));
    }
  }, [activeCentreId, date, fetchMenu]);

  useEffect(() => {
    const loadRecipes = async () => {
      if (activeCentreId) {
        try {
          const data = await recipeService.getRecipes(activeCentreId);
          // Flatten grouped recipes for the library
          const flat = Object.values(data.recipes || {}).flat();
          setAllRecipes(flat);
        } catch (error) {
          console.error("Failed to load recipes library", error);
        }
      }
    };
    loadRecipes();
  }, [activeCentreId]);

  const openModal = (mealId, dayId) => setModal({ open: true, mealId, dayId });

  const handleSave = async (recipeIds) => {
    try {
      const dayLabel = WEEKDAYS.find(d => d.id === modal.dayId)?.label;
      const mealLabel = MEAL_TIMES.find(m => m.id === modal.mealId)?.label;
      
      await addRecipes({
        centerId: activeCentreId,
        selectedDate: formatForAPI(date),
        day: dayLabel,
        mealType: mealLabel,
        recipeIds: recipeIds,
      });
      toast.success("Menu updated");
    } catch (error) {
      toast.error(error?.message || "Failed to update menu");
      throw error;
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await deleteMenuItem(confirmDelete.id, activeCentreId, formatForAPI(date));
      toast.success("Item removed from menu");
    } catch (error) {
      toast.error(error?.message || "Failed to remove item");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };


  const grouped = useMemo(() => {
    const map = {}; // { mealId: { dayId: items[] } }
    
    // Initialize map structure to prevent empty key errors
    MEAL_TIMES.forEach(m => {
      map[m.id] = {};
      WEEKDAYS.forEach(d => {
        map[m.id][d.id] = [];
      });
    });

    if (Array.isArray(menuData)) {
      menuData.forEach((mealGroup) => {
        // e.g. "Breakfast" -> "breakfast", "Morning Tea" -> "morning_tea"
        const mealId = mealGroup.mealType?.toLowerCase().replace(/\s+/g, "_");
        if (!map[mealId]) {
          map[mealId] = {};
        }

        if (Array.isArray(mealGroup.days)) {
          mealGroup.days.forEach((dayGroup) => {
            const dayId = dayGroup.day?.toLowerCase().slice(0, 3); // Monday -> mon
            if (!map[mealId][dayId]) {
              map[mealId][dayId] = [];
            }
            if (Array.isArray(dayGroup.items)) {
              dayGroup.items.forEach((item) => {
                map[mealId][dayId].push({
                  id: item.id,
                  name: item.name,
                  note: item.note || "",
                  mealType: item.mealType,
                  mediaUrl: item.mediaUrl,
                });
              });
            }
          });
        }
      });
    }
    return map;
  }, [menuData]);


  const weekLabel = useMemo(() => weekRangeLabel(date), [date]);
  const monthWeeks = useMemo(() => getWeeksOfMonth(date), [date.slice(0, 7)]); // Re-calc only if month changes

  // Find the current week's Monday ISO to match against monthWeeks
  const currentWeekMon = useMemo(() => {
    const d = parseLocalDate(date);
    const day = d.getDay();
    const offsetToMon = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + offsetToMon);
    return d.getFullYear() + "-" + 
           String(d.getMonth() + 1).padStart(2, "0") + "-" + 
           String(d.getDate()).padStart(2, "0");
  }, [date]);



  const todayId = useMemo(() => todayDayIdInWeek(date), [date]);
  const activeMeal = MEAL_TIMES.find((m) => m.id === modal.mealId);
  const activeDay = WEEKDAYS.find((d) => d.id === modal.dayId);

  return (
    <div className="space-y-6">

      <PageHeader
        title={
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Healthy Eating Menu
          </span>
        }
        description="Plan weekly meals across all meal times with precision"
        breadcrumbs={[{ label: "Healthy Eating Menu" }]}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <CentreSelect
              icon={null}
              triggerClassName="h-10 w-[220px] rounded-xl border-border/70 bg-background/70 backdrop-blur"
              placeholder="Select centre"
            />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 w-[170px] rounded-xl border-border/70 bg-background/70 backdrop-blur"
            />
          </div>
        }
      />

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary/10 via-background to-background p-8 text-center shadow-sm">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col items-center justify-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-amber-500 text-white shadow-lg shadow-primary/20">
            <UtensilsCrossed className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Seasonal Menu
          </h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Nutritious meals crafted for growing minds and bodies
          </p>
          <div className="mt-6">
            <Select value={currentWeekMon} onValueChange={setDate}>
              <SelectTrigger className="mx-auto h-11 w-auto min-w-[320px] rounded-xl border border-primary/20 bg-background/50 font-semibold text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background/80 focus:ring-primary/30">
                <div className="flex items-center gap-2.5">
                  <Calendar className="h-4 w-4 text-primary" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl max-w-[400px]">
                {monthWeeks.map((w) => (
                  <SelectItem key={w.id} value={w.id} className="py-2.5">
                    {w.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Menu grid */}
      <div className="overflow-x-auto rounded-3xl border border-border/60 bg-card/60 shadow-sm backdrop-blur">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="bg-muted/40">
              <th className="w-40 border-b border-border/50 border-r px-5 py-4 text-left font-bold tracking-tight text-primary uppercase text-xs">
                Meal Times
              </th>
              {WEEKDAYS.map((d) => (
                <th
                  key={d.id}
                  className={cn(
                    "border-b border-border/50 border-r px-5 py-4 text-left font-bold tracking-tight uppercase text-xs last:border-r-0 transition-colors",
                    todayId === d.id ? "bg-primary/5 text-primary" : "text-muted-foreground"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    {d.label}
                    {todayId === d.id && (
                      <span className="ml-auto flex items-center justify-center rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary ring-1 ring-primary/30">
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
              <tr key={meal.id} className="border-b border-border/50 last:border-b-0">
                <td className="border-r border-border/50 bg-muted/20 px-5 py-5 text-center font-bold text-muted-foreground align-middle text-xs uppercase tracking-wider">
                  {meal.label}
                </td>
                {WEEKDAYS.map((day) => {
                  const items = grouped[meal.id]?.[day.id] || [];
                  return (
                    <td
                      key={day.id}
                      className={cn(
                        "border-r border-border/50 px-4 py-4 align-top last:border-r-0 transition-colors",
                        todayId === day.id ? "bg-primary/[0.02]" : ""
                      )}
                    >
                      {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-background/30 p-4 text-center">
                          <span className="text-xs font-medium text-muted-foreground/70">
                            No items
                          </span>
                          {can(perms.add) && (
                            <button
                              type="button"
                              onClick={() => openModal(meal.id, day.id)}
                              className="group flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-all hover:scale-110 hover:bg-primary hover:text-white hover:shadow-lg hover:shadow-primary/30"
                              aria-label="Add items"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="max-h-[142px] overflow-y-auto pr-1 space-y-2 scrollbar-thin">
                            {items.map((it) => (
                              <div
                                key={it.id}
                                className="group relative flex flex-col gap-1 rounded-xl border border-border/60 bg-background p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="text-sm font-bold text-foreground leading-snug">
                                    {it.name}
                                  </div>
                                  {can(perms.delete) && (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDelete(it)}
                                      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive opacity-0 transition-all hover:bg-destructive hover:text-white group-hover:opacity-100"
                                      aria-label="Remove"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}
                                </div>
                                {it.note && (
                                  <div className="text-xs font-medium text-muted-foreground">
                                    {it.note}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          {can(perms.add) && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => openModal(meal.id, day.id)}
                                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-primary/30 bg-primary/5 py-2 text-xs font-semibold text-primary transition-all hover:bg-primary/10 hover:border-primary/50"
                              >
                                <Plus className="h-3.5 w-3.5" /> Add more
                              </button>
                            </div>
                          )}
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
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur transition-all hover:shadow-lg hover:shadow-primary/5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity group-hover:bg-primary/10" />
          <div className="relative mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">Daily Requirements</h3>
          </div>
          <ul className="relative space-y-3 text-sm font-medium text-muted-foreground">
            {dailyRequirements.map((r, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-6 shadow-sm backdrop-blur transition-all hover:shadow-lg hover:shadow-primary/5">
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/5 blur-3xl transition-opacity group-hover:bg-primary/10" />
          <div className="relative mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
              <CalendarDays className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-bold tracking-tight text-foreground">Fortnightly Requirements</h3>
          </div>
          <ul className="relative space-y-3 text-sm font-medium text-muted-foreground">
            {fortnightlyRequirements.map((r, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span className="mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
                <span className="leading-relaxed">{r}</span>
              </li>
            ))}
          </ul>
          <div className="relative mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs font-medium leading-relaxed text-primary/80">
            <span className="font-bold text-primary">Note:</span> This menu follows Long
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
        recipes={allRecipes.filter(r => {
          const rType = (r.type || r.mealType || "").toLowerCase().replace(/\s+/g, '_');
          const targetType = (modal.mealId || "").toLowerCase().replace(/\s+/g, '_');
          return rType === targetType;
        })}
        onSave={handleSave}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent className="rounded-3xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">Remove from menu?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground font-medium">
              Are you sure you want to remove <span className="font-bold text-foreground">"{confirmDelete?.name}"</span> from the menu?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isDeleting} className="rounded-xl font-semibold">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="rounded-xl bg-gradient-to-r from-rose-500 to-red-500 text-white font-semibold shadow-md shadow-rose-500/20 hover:shadow-lg hover:shadow-rose-500/30"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Item"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );
}
