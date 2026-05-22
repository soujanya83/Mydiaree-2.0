import { cn } from "@/lib/utils";

const UV_BASE = "https://www.sunsmart.com.au/uvalert/default.asp";

export function getSunSmartUvUrl(locationId = 161) {
  return `${UV_BASE}?version=australia&locationid=${locationId}`;
}

export function SunSmartUvAlert({ locationId = 161, className }) {
  const uvUrl = getSunSmartUvUrl(locationId);

  return (
    <div className={cn("weather-shell h-full w-full text-center", className)}>
      <object
        data={uvUrl}
        type="text/html"
        className="weather-frame block h-full min-h-[280px] w-full border-0"
        aria-label="SunSmart UV alert"
      >
        <embed
          src={uvUrl}
          className="weather-frame block h-full min-h-[280px] w-full border-0"
          title="SunSmart UV alert"
        />
        <p className="px-2 py-2 text-sm text-muted-foreground">
          <a
            href={uvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Open SunSmart UV alert
          </a>
        </p>
      </object>
    </div>
  );
}
