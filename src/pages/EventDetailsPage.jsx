import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Users, FileText, Image as ImageIcon, BadgeCheck, Pencil, ChevronLeft, ChevronRight, X } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { announcementService } from "@/services/centre/announcementService";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { IMG_BASE_API } from "../api/imageapi";

const IMG_BASE = IMG_BASE_API;

function stripHtml(value = "") {
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

function mediaUrl(raw) {
  if (!raw) return "";
  return String(raw).startsWith("http")
    ? String(raw)
    : `${IMG_BASE}${String(raw).replace(/^\/+/, "")}`;
}

function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
}

function getInitials(name, lastname) {
  const nameInitial = name ? name.charAt(0).toUpperCase() : "";
  const lastnameInitial = lastname ? lastname.charAt(0).toUpperCase() : "";
  return (nameInitial + lastnameInitial).slice(0, 2);
}

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isParent } = usePermissions();
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const fetchEventDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const res = await announcementService.getAnnouncementByAnnId(id);
      if (res.status) {
        setEventData(res.data);
      } else {
        toast.error(res.message || "Failed to fetch event details");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch event details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEventDetails();
  }, [fetchEventDetails]);

  if (isLoading) {
    return <PageLoader label="Loading event details..." />;
  }

  if (!eventData?.info) {
    return (
      <div>
        <PageHeader 
          title="Event Not Found" 
          breadcrumbs={[{ label: "Events", to: "/events" }, { label: "Not Found" }]} 
        />
        <Button onClick={() => navigate("/events")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Events
        </Button>
      </div>
    );
  }

  const info = eventData.info;
  const children = eventData.children || [];
  const mediaUrls = info.announcementMedia ? JSON.parse(info.announcementMedia) : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event Details"
        breadcrumbs={[{ label: "Events", to: "/events" }, { label: stripHtml(info.title) }]}
        actions={
          <div className="flex items-center gap-2">
            {!isParent && (
              <Button variant="outline" onClick={() => navigate(`/events/${id}/edit`)}>
                <Pencil className="h-4 w-4 mr-2" /> Edit
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/events")}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
          </div>
        }
      />

      {/* Hero Card */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="space-y-5 p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-primary/80 hover:bg-primary">
                {info.type || "Event"}
              </Badge>
              <Badge variant="outline" className="border-primary/30">
                {info.status || "Sent"}
              </Badge>
            </div>
            
            <div>
              <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
                {stripHtml(info.title)}
              </h1>
              <p className="mt-3 text-sm text-muted-foreground">
                Audience: {info.audience || "All"}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <Calendar className="h-4 w-4 text-primary" />
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Event Date
                </p>
                <p className="mt-1 text-lg font-black text-foreground">{formatDate(info.eventDate)}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <User className="h-4 w-4 text-primary" />
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Created By
                </p>
                <p className="mt-1 text-lg font-black text-foreground">{info.username || "Unknown"}</p>
              </div>
            </div>
          </div>

          <div className="min-h-[300px] border-t border-border bg-muted/20 lg:border-l lg:border-t-0">
            {mediaUrls.length > 0 ? (
              <img
                src={mediaUrl(mediaUrls[0])}
                alt={stripHtml(info.title)}
                className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setIsImageModalOpen(true)}
              />
            ) : (
              <div className="flex h-full min-h-[300px] items-center justify-center">
                <ImageIcon className="h-14 w-14 text-muted-foreground/35" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
            <FileText className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-black text-foreground">Description</h2>
        </div>
        <div className="prose prose-sm max-w-none text-foreground">
          <p className="whitespace-pre-wrap text-sm leading-6">{stripHtml(info.text)}</p>
        </div>
      </div>

      {/* Children */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-foreground">Children</h2>
              <p className="text-xs text-muted-foreground">{children.length} children linked</p>
            </div>
          </div>
          <Badge className="bg-primary/80 hover:bg-primary">
            {children.length}
          </Badge>
        </div>

        {children.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {children.map((child) => (
              <div key={child.id} className="flex items-center gap-3 rounded-xl border border-border bg-muted/10 p-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-primary/10 flex items-center justify-center">
                  {child.imageUrl ? (
                    <img
                      src={mediaUrl(child.imageUrl)}
                      alt={`${child.name} ${child.lastname}`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <span
                    className="text-sm font-black text-primary"
                    style={{ display: child.imageUrl ? "none" : "flex" }}
                  >
                    {getInitials(child.name, child.lastname)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {child.name} {child.lastname}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-8">
            No children linked to this event.
          </div>
        )}
      </div>

      {isImageModalOpen && mediaUrls.length > 0 && (
        <EventGalleryModal 
          mediaUrls={mediaUrls} 
          title={info.title} 
          onClose={() => setIsImageModalOpen(false)} 
        />
      )}
    </div>
  );
}

function EventGalleryModal({ mediaUrls, title, onClose }) {
  const images = mediaUrls || [];
  const [idx, setIdx] = useState(0);
  const timerRef = useRef(null);

  // Auto-scroll every 10 seconds
  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setIdx((prev) => (prev + 1) % images.length);
    }, 10000);
    return () => clearInterval(timerRef.current);
  }, [images.length]);

  // Reset timer on manual navigation
  const goTo = useCallback(
    (newIdx) => {
      setIdx(newIdx);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setIdx((prev) => (prev + 1) % images.length);
      }, 10000);
    },
    [images.length]
  );

  const goPrev = useCallback(
    () => goTo((idx - 1 + images.length) % images.length),
    [goTo, idx, images.length]
  );
  const goNext = useCallback(() => goTo((idx + 1) % images.length), [goTo, idx, images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev, onClose]);

  const cleanTitle = stripHtml(title) || "Event Gallery";

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-2xl">
          <ImageIcon className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
          <h3 className="text-lg font-bold text-foreground">No Images</h3>
          <p className="mt-1 text-sm text-muted-foreground">This event has no media attached.</p>
          <Button onClick={onClose} className="mt-5 rounded-full" variant="outline">
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-950 shadow-2xl animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">{cleanTitle}</h2>
            <p className="text-xs font-medium text-white/50">
              {idx + 1} of {images.length} images
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Image area */}
        <div
          className="relative flex items-center justify-center bg-black p-6"
          style={{ minHeight: "420px" }}
        >
          <img
            key={idx}
            src={mediaUrl(images[idx])}
            alt={`${cleanTitle} - ${idx + 1}`}
            className="max-h-[70vh] w-full object-contain transition-opacity duration-500 animate-in fade-in rounded-lg"
          />

          {/* Prev/Next buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition-all hover:scale-110 hover:bg-black/70"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goNext}
                className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white shadow-lg transition-all hover:scale-110 hover:bg-black/70"
                aria-label="Next image"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>

        {/* Dot indicators + thumbnail strip */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 border-t border-white/10 px-6 py-4">
            {images.map((m, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`overflow-hidden rounded-lg border-2 transition-all ${
                  i === idx
                    ? "border-emerald-400 shadow-lg shadow-emerald-500/30 scale-110"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img
                  src={mediaUrl(m)}
                  alt={`Thumb ${i + 1}`}
                  className="h-12 w-12 object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
