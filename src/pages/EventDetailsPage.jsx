import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, User, Users, FileText, Image as ImageIcon, BadgeCheck, Pencil } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { announcementService } from "@/services/centre/announcementService";
import { toast } from "sonner";
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
  const [eventData, setEventData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
            <Button variant="outline" onClick={() => navigate(`/events/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
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
                className="h-full w-full object-cover"
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
    </div>
  );
}
