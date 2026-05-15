import { Fragment, useEffect, useMemo } from "react";
import { CalendarDays, Printer, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function startOfWeek(dateStr) {
  const d = new Date(dateStr);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function fmtDDMMYYYY(d) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function fmtNice(d) {
  return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString("en", { month: "short" })} ${d.getFullYear()}`;
}

function fmtTime(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hr = h % 12 === 0 ? 12 : h % 12;
  return `${String(hr).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`;
}

export function HeadCheckPrintView({ open, onClose, date, roomName, rows }) {
  const monday = useMemo(() => startOfWeek(date), [date]);
  const friday = useMemo(() => {
    const f = new Date(monday);
    f.setDate(f.getDate() + 4);
    return f;
  }, [monday]);

  const weekDates = useMemo(
    () =>
      DAYS.map((_, i) => {
        const d = new Date(monday);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [monday],
  );

  const pickedDate = new Date(date);
  pickedDate.setHours(0, 0, 0, 0);
  const pickedIdx = weekDates.findIndex((d) => d.toDateString() === pickedDate.toDateString());

  const sortedRows = [...rows].sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  useEffect(() => {
    if (!open) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const month = MONTHS[new Date(date).getMonth()];

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-muted/70">
      <div className="sticky top-0 z-10 border-b border-border bg-card/95 px-4 py-3 shadow-sm backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">Head Check Print Preview</h2>
              <p className="text-sm text-muted-foreground">{roomName || "Room"} safety register</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button size="sm" variant="outline" onClick={onClose} aria-label="Close print preview">
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto my-6 max-w-6xl rounded-lg border border-border bg-white p-8 text-black shadow-sm print:my-0 print:max-w-none print:rounded-none print:border-0 print:p-6 print:shadow-none">
        <div className="flex flex-wrap items-start justify-between gap-6 border-b-2 border-black pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-gray-500">
              Children safety register
            </div>
            <h1 className="mt-1 text-3xl font-bold tracking-tight">Head Checks</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-600">
              Staff must complete head checks every half hour and sign each recorded count.
            </p>
          </div>
          <div className="rounded-lg border border-gray-300 p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <CalendarDays className="h-4 w-4" />
              Week
            </div>
            <div className="mt-1 text-gray-700">
              {fmtNice(monday)} to {fmtNice(friday)}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-lg border border-gray-300 p-3">
            <div className="text-xs font-bold uppercase text-gray-500">Room name</div>
            <span>{roomName || "—"}</span>
          </div>
          <div className="rounded-lg border border-gray-300 p-3">
            <div className="text-xs font-bold uppercase text-gray-500">Month</div>
            <span>{month}</span>
          </div>
        </div>

        <table className="mt-5 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th
                rowSpan={2}
                className="w-[120px] border border-gray-500 px-3 py-3 text-center align-middle font-semibold"
              >
                Time
              </th>
              {DAYS.map((day, i) => (
                <th
                  key={day}
                  colSpan={2}
                  className="border border-gray-500 px-3 py-2 text-center font-semibold"
                >
                  <div>{day}</div>
                  <div className="text-xs font-normal">
                    {pickedIdx !== -1 && i === pickedIdx
                      ? fmtDDMMYYYY(weekDates[i])
                      : i < pickedIdx
                        ? fmtDDMMYYYY(weekDates[i])
                        : "__/__/__"}
                  </div>
                </th>
              ))}
            </tr>
            <tr className="bg-gray-50">
              {DAYS.map((day) => (
                <Fragment key={day}>
                  <th className="border border-gray-500 px-2 py-1.5 text-xs font-bold">No.</th>
                  <th className="border border-gray-500 px-2 py-1.5 text-xs font-bold">Sign</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="border border-gray-500 px-3 py-6 text-center text-gray-500"
                >
                  No entries
                </td>
              </tr>
            ) : (
              sortedRows.map((r) => (
                <tr key={r.id}>
                  <td className="border border-gray-500 px-3 py-2 text-center font-medium">
                    {fmtTime(r.time)}
                  </td>
                  {DAYS.map((_, i) => {
                    const isActive = i === pickedIdx;
                    return (
                      <Fragment key={`${r.id}-${i}`}>
                        <td className="border border-gray-500 px-2 py-2 text-center">
                          {isActive ? r.count : ""}
                        </td>
                        <td className="border border-gray-500 px-2 py-2 text-center">
                          {isActive ? r.signature : ""}
                        </td>
                      </Fragment>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-5 rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
          <span className="font-semibold text-black">Note:</span> Staff must complete head checks
          every half hour and sign off each count.
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}
