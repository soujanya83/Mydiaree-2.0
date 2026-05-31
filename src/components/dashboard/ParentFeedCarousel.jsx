import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ImageIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { IMG_BASE_API } from "../../api/imageapi";

const IMG_BASE = IMG_BASE_API;

function mediaUrl(item) {
  const raw = item?.media?.[0]?.mediaUrl || item?.mediaUrl || "";
  if (!raw) return null;
  return raw.startsWith("http") ? raw : `${IMG_BASE}${raw.replace(/^\/+/, "")}`;
}

function stripHtml(value = "") {
  return String(value)
    .replace(/<[^>]*>/g, "")
    .trim();
}

function itemTitle(item) {
  return stripHtml(item.title || item.obestitle || item.about || "Untitled");
}

function itemDate(item) {
  const raw = item.createdAt || item.created_at || item.date_added || "";
  if (!raw) return "";
  try {
    return format(parseISO(String(raw).slice(0, 10)), "MMM d, yyyy");
  } catch {
    return String(raw).slice(0, 10);
  }
}

export function ParentFeedCarousel({
  title,
  icon: Icon,
  accentClass,
  viewAllTo,
  items = [],
  getItemLink,
  emptyLabel = "Nothing to show yet.",
}) {
  const trackRef = useRef(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || items.length < 2) return;

    let frame;
    let position = 0;
    const speed = 0.35;

    const tick = () => {
      position += speed;
      if (position >= track.scrollWidth / 2) position = 0;
      track.scrollLeft = position;
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [items.length]);

  const loopItems = items.length > 1 ? [...items, ...items] : items;

  return (
    <article
      className={cn(
        "relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm",
        accentClass,
      )}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/40" />
      <header className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{items.length} recent</p>
          </div>
        </div>
        {viewAllTo && (
          <Link
            to={viewAllTo}
            className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/10"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </header>

      <div className="relative min-h-0 flex-1 px-3 py-4">
        {items.length === 0 ? (
          <p className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
            {emptyLabel}
          </p>
        ) : (
          <>
            <div className="pointer-events-none absolute inset-y-4 left-0 z-10 w-8 bg-gradient-to-r from-card to-transparent" />
            <div className="pointer-events-none absolute inset-y-4 right-0 z-10 w-8 bg-gradient-to-l from-card to-transparent" />
            <div
              ref={trackRef}
              className="flex h-full gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {loopItems.map((item, index) => {
                const img = mediaUrl(item);
                const detailTo = getItemLink ? getItemLink(item) : null;
                const CardWrapper = detailTo ? Link : "div";
                return (
                  <CardWrapper
                    key={`${item.id}-${index}`}
                    to={detailTo || undefined}
                    className={cn(
                      "w-[220px] shrink-0 snap-start overflow-hidden rounded-xl border border-border/80 bg-background/80 shadow-sm transition",
                      detailTo && "hover:border-primary/40 hover:shadow-md",
                    )}
                  >
                    <div className="relative aspect-[4/3] bg-muted/30">
                      {img ? (
                        <img src={img} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground/40">
                          <ImageIcon className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 p-3">
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">
                        {itemTitle(item)}
                      </p>
                      {itemDate(item) && (
                        <p className="text-[11px] text-muted-foreground">{itemDate(item)}</p>
                      )}
                    </div>
                  </CardWrapper>
                );
              })}
            </div>
          </>
        )}
      </div>
    </article>
  );
}
