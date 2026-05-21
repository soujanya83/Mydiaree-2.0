import { useEffect, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Loader2,
  MapPin,
  Sun,
  Wind,
} from "lucide-react";
import { SectionCard } from "@/components/common/SectionCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AUSTRALIAN_CITIES, DEFAULT_CITY_ID } from "@/constants/australianCities";

const STORAGE_KEY = "dashboard-weather-city";

function getWeatherMeta(code) {
  if (code === 0) return { label: "Clear sky", Icon: Sun };
  if (code === 1) return { label: "Mainly clear", Icon: CloudSun };
  if (code === 2) return { label: "Partly cloudy", Icon: CloudSun };
  if (code === 3) return { label: "Overcast", Icon: Cloud };
  if ([45, 48].includes(code)) return { label: "Foggy", Icon: CloudFog };
  if ([51, 53, 55, 56, 57].includes(code)) return { label: "Drizzle", Icon: CloudDrizzle };
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: "Rain", Icon: CloudRain };
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: "Snow", Icon: CloudSnow };
  if ([95, 96, 99].includes(code)) return { label: "Thunderstorm", Icon: CloudRain };
  return { label: "Cloudy", Icon: Cloud };
}

async function fetchWeather(latitude, longitude) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m",
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    timezone: "auto",
    forecast_days: "1",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}

export function DashboardWeather({ className }) {
  const [cityId, setCityId] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_CITY_ID;
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_CITY_ID;
  });
  const [weather, setWeather] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const city = AUSTRALIAN_CITIES.find((c) => c.id === cityId) || AUSTRALIAN_CITIES[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, cityId);
  }, [cityId]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchWeather(city.latitude, city.longitude);
        if (!cancelled) setWeather(data);
      } catch (err) {
        console.error("Failed to fetch weather:", err);
        if (!cancelled) {
          setError("Unable to load weather");
          setWeather(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [city.latitude, city.longitude, city.id]);

  const current = weather?.current;
  const daily = weather?.daily;
  const meta = current ? getWeatherMeta(current.weather_code) : null;
  const WeatherIcon = meta?.Icon || Cloud;

  return (
    <SectionCard
      title="Weather"
      icon={MapPin}
      accentTop="warning"
      className={cn("flex h-full flex-col", className)}
      action={
        <Select value={cityId} onValueChange={setCityId}>
          <SelectTrigger className="h-9 w-[200px] text-xs">
            <SelectValue placeholder="Select city" />
          </SelectTrigger>
          <SelectContent className="max-h-[280px]">
            {AUSTRALIAN_CITIES.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      }
    >
      <div className="flex flex-1 flex-col justify-center">
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{error}</p>
        ) : current ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">{city.name}</p>
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-warning/10 p-4 text-warning">
                <WeatherIcon className="h-14 w-14" />
              </div>
              <div className="text-left">
                <p className="text-5xl font-bold tracking-tight text-foreground">
                  {Math.round(current.temperature_2m)}°
                </p>
                <p className="text-sm font-medium text-muted-foreground">{meta?.label}</p>
              </div>
            </div>
            {daily && (
              <p className="text-sm text-muted-foreground">
                H {Math.round(daily.temperature_2m_max[0])}° · L{" "}
                {Math.round(daily.temperature_2m_min[0])}°
              </p>
            )}
            <div className="mt-2 grid w-full grid-cols-2 gap-3 rounded-xl border border-border bg-muted/20 p-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Droplets className="h-4 w-4 shrink-0 text-info" />
                <span>Humidity {Math.round(current.relative_humidity_2m)}%</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Wind className="h-4 w-4 shrink-0 text-primary" />
                <span>Wind {Math.round(current.wind_speed_10m)} km/h</span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}
