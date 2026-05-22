import { useEffect, useState } from "react";
import { SunSmartUvAlert } from "@/components/dashboard/SunSmartUvAlert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  AUSTRALIAN_CITIES,
  DEFAULT_CITY_ID,
  getSunSmartLocationId,
} from "@/constants/australianCities";

const STORAGE_KEY = "dashboard-weather-city";

export function DashboardWeather({ className }) {
  const [cityId, setCityId] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_CITY_ID;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_CITY_ID;
  });

  const sunSmartLocationId = getSunSmartLocationId(cityId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, cityId);
  }, [cityId]);

  return (
    // <section
    //   className={cn(
    //     "flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card",
    //     className,
    //   )}
    // >
    //   <div className="shrink-0 border-b border-border px-3 py-2">
    //     <Select value={cityId} onValueChange={setCityId}>
    //       <SelectTrigger className="h-8 w-full text-xs">
    //         <SelectValue placeholder="Location" />
    //       </SelectTrigger>
    //       <SelectContent className="max-h-[280px]">
    //         {AUSTRALIAN_CITIES.map((c) => (
    //           <SelectItem key={c.id} value={c.id}>
    //             {c.name}
    //           </SelectItem>
    //         ))}
    //       </SelectContent>
    //     </Select>
    //   </div>

     
    // </section>

    <div className="min-h-0 flex-1">
    <SunSmartUvAlert locationId={sunSmartLocationId} className="h-full" />
  </div>
  );
}
