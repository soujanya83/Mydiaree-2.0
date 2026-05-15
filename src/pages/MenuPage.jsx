import { useMemo, useState, useEffect } from "react";
import { PageHeader } from "@/components/common/PageHeader";

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
      setModal((m) => ({ ...m, open: false }));
    } catch (error) {

      toast.error(error?.message || "Failed to update menu");
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    setIsDeleting(true);
    try {
      await deleteMenuItem(confirmDelete.id, activeCentreId, formatForAPI(date));
      toast.success("Item removed from menu");
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error?.message || "Failed to remove item");
    } finally {
      setIsDeleting(false);
    }
  };


  const grouped = useMemo(() => {
    const map = {}; // { mealId: { dayId: items[] } }
    menuData.forEach((item) => {
      const mealId = item.mealType?.toLowerCase();
      const dayId = item.day?.toLowerCase().slice(0, 3); // Tuesday -> tue
      if (!map[mealId]) map[mealId] = {};
      if (!map[mealId][dayId]) map[mealId][dayId] = [];
      map[mealId][dayId].push(item);
    });
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
        <div className="mt-4">
          <Select value={currentWeekMon} onValueChange={setDate}>
            <SelectTrigger className="mx-auto w-auto min-w-[300px] border-0 bg-white/20 text-white backdrop-blur hover:bg-white/30 focus:ring-0">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue />
              </div>
            </SelectTrigger>
            <SelectContent className="max-w-[400px]">
              {monthWeeks.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  const items = grouped[meal.id]?.[day.id] || [];
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
                          {can(perms.add) && (
                            <button
                              type="button"
                              onClick={() => openModal(meal.id, day.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                              aria-label="Add items"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {items.map((it) => (
                            <div
                              key={it.id}
                              className="rounded-md border bg-background px-3 py-2 shadow-sm group"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-sm font-semibold text-foreground">
                                  {it.name}
                                </div>
                                {can(perms.delete) && (
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDelete(it)}
                                    className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Remove"
                                  >


                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                )}
                              </div>
                              {it.note && (
                                <div className="mt-1 text-xs text-muted-foreground">
                                  {it.note}
                                </div>
                              )}
                            </div>
                          ))}
                          {can(perms.add) && (
                            <button
                              type="button"
                              onClick={() => openModal(meal.id, day.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                              aria-label="Add items"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
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
        recipes={allRecipes.filter(r => r.type?.toLowerCase() === modal.mealId || r.type === activeMeal?.label.toUpperCase())}
        onSave={handleSave}
      />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from menu?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{confirmDelete?.name}" from the menu?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>

  );
}
