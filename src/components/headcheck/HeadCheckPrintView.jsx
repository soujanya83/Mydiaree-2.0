import { Fragment, useEffect, useMemo } from "react";
import { Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
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
    [monday]
  );

  const pickedDate = new Date(date);
  pickedDate.setHours(0, 0, 0, 0);
  const pickedIdx = weekDates.findIndex(
    (d) => d.toDateString() === pickedDate.toDateString()
  );

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
    <div className="fixed inset-0 z-50 overflow-auto bg-background">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-4 py-3 print:hidden">
        <h2 className="text-lg font-semibold">Head Check — Print Preview</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="mr-1.5 h-4 w-4" />
            Print
          </Button>
          <Button size="sm" variant="outline" onClick={onClose}>
            <X className="mr-1.5 h-4 w-4" />
            Close
          </Button>
        </div>
      </div>

      <div className="mx-auto my-6 max-w-5xl rounded-lg border border-border bg-white p-8 text-black shadow-sm print:my-0 print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <div className="text-center">
          <h1 className="text-2xl font-bold underline">Children Head Checks</h1>
          <p className="mt-2 text-sm">
            <span className="font-semibold">Week:</span> {fmtNice(monday)} – {fmtNice(friday)}
          </p>
        </div>

        <div className="mt-5 flex justify-center gap-10 text-sm">
          <div>
            <span className="font-semibold">Room Name:</span>{" "}
            <span>{roomName || "—"}</span>
          </div>
          <div>
            <span className="font-semibold">Month:</span> <span>{month}</span>
          </div>
        </div>

        <table className="mt-5 w-full border-collapse text-sm">
          <thead>
            <tr>
              <th rowSpan={2} className="w-[120px] border border-gray-400 px-3 py-3 text-center align-middle font-semibold">
                Time
              </th>
              {DAYS.map((day, i) => (
                <th key={day} colSpan={2} className="border border-gray-400 px-3 py-2 text-center font-semibold">
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
            <tr>
              {DAYS.map((day) => (
                <Fragment key={day}>
                  <th className="border border-gray-400 px-2 py-1.5 text-xs font-bold">No.</th>
                  <th className="border border-gray-400 px-2 py-1.5 text-xs font-bold">Sign</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="border border-gray-400 px-3 py-6 text-center text-gray-500">
                  No entries
                </td>
              </tr>
            ) : (
              sortedRows.map((r) => (
                <tr key={r.id}>
                  <td className="border border-gray-400 px-3 py-2 text-center">{fmtTime(r.time)}</td>
                  {DAYS.map((_, i) => {
                    const isActive = i === pickedIdx;
                    return (
                      <Fragment key={`${r.id}-${i}`}>
                        <td className="border border-gray-400 px-2 py-2 text-center">
                          {isActive ? r.count : ""}
                        </td>
                        <td className="border border-gray-400 px-2 py-2 text-center">
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

        <p className="mt-5 text-sm">
          <span className="font-semibold">Note:</span>{" "}
          <span className="text-gray-600">
            Staff needs to complete the head checks every half hour and sign off.
          </span>
        </p>
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
