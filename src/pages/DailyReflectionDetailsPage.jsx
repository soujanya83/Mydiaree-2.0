import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Calendar,
  Image as ImageIcon,
  Users,
  UserCircle2,
  Building2,
  BookOpen,
  Loader2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/PageHeader";
import { reflectionService } from "@/services/learning/reflectionService";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { ACTION_PERMISSIONS } from "@/constants/permissionMap";
import { formatObsDate } from "@/components/reflection/reflectionsData";
import { IMG_BASE_API } from "../api/imageapi";

const getMediaUrl = (url) => {
  if (!url) return "";
  return url.startsWith("http") ? url : `${IMG_BASE_API}${url.replace(/^\/+/, "")}`;
};

const getAvatarUrl = (imageUrl, name = "User", tone = "EEF2FF", color = "4338CA") => {
  const rawUrl = String(imageUrl || "").trim();
  if (rawUrl) {
    return rawUrl.startsWith("http") ? rawUrl : `${IMG_BASE_API}${rawUrl.replace(/^\/+/, "")}`;
  }
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${tone}&color=${color}`;
};

const isVideoMedia = (type = "", url = "") => {
  const safeType = String(type).toLowerCase();
  const safeUrl = String(url).toLowerCase();
  return safeType.includes("video") || /\.(mp4|webm|ogg|mov)(\?|$)/.test(safeUrl);
};

const getPersonName = (person) => {
  if (!person) return "Unknown";
  return (
    [person.name, person.lastname].filter(Boolean).join(" ").trim() || person.name || "Unknown"
  );
};

function stripHtml(value = "") {
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function DailyReflectionDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { can } = usePermissions();
  const perms = ACTION_PERMISSIONS.reflection;

  const [reflection, setReflection] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const response = await reflectionService.getReflectionById(id);
        if (response?.status && response?.data?.reflection) {
          setReflection(response.data.reflection);
          setRooms(response.data.rooms || []);
        } else {
          toast.error("Reflection not found");
        }
      } catch (error) {
        console.error("Failed to fetch reflection:", error);
        toast.error("An error occurred while fetching details");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reflection) {
    return (
      <div>
        <PageHeader
          title="Reflection not found"
          breadcrumbs={[
            { label: "Daily Reflections", to: "/daily-reflections" },
            { label: "Not found" },
          ]}
        />
        <Button onClick={() => navigate("/daily-reflections")}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back to list
        </Button>
      </div>
    );
  }

  const childObjs = (reflection.children || []).map((tag) => tag.child).filter(Boolean);
  const staffObjs = (reflection.staff || []).map((tag) => tag.staff).filter(Boolean);
  const mediaItems = reflection.media || [];

  const statusColors =
    reflection.status?.toLowerCase() === "published"
      ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400"
      : "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400";

  return (
    <div className="pb-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/daily-reflections")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/daily-reflections" className="transition hover:text-foreground">
              Daily Reflections
            </Link>
            <span>/</span>
            <span className="text-foreground">Details</span>
          </nav>
        </div>
        {can(perms.edit) && (
          <Button onClick={() => navigate(`/daily-reflections/${reflection.id}/edit`)}>
            <Pencil className="mr-1.5 h-4 w-4" /> Edit
          </Button>
        )}
      </div>

      {/* Hero Section */}
      <div className="mb-6 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="relative flex h-56 items-center justify-center bg-primary/10">
          {mediaItems.length > 0 ? (
            <div className="absolute inset-0 flex">
              {isVideoMedia(mediaItems[0].mediaType, mediaItems[0].mediaUrl) ? (
                <div className="flex h-full w-full items-center justify-center bg-black/5">
                  <Video className="h-12 w-12 text-primary/40" />
                </div>
              ) : (
                <img
                  src={getMediaUrl(mediaItems[0].mediaUrl)}
                  alt="Hero"
                  className="h-full w-full object-cover opacity-40"
                />
              )}
            </div>
          ) : (
            <ImageIcon className="h-16 w-16 text-primary/30" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <span
              className={`mb-3 inline-flex rounded-md border px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusColors}`}
            >
              {reflection.status}
            </span>
            <h1 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
              {stripHtml(reflection.title)}
            </h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-card px-6 py-4">
          <div className="flex items-center gap-3">
            <img
              src={getAvatarUrl(reflection.creator?.imageUrl, getPersonName(reflection.creator))}
              alt={getPersonName(reflection.creator)}
              className="h-10 w-10 rounded-full border-2 border-primary/20 object-cover shadow-sm"
            />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {getPersonName(reflection.creator)}
              </p>
              <p className="text-xs text-muted-foreground">
                {reflection.creator?.userType || "Creator"}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            <Calendar className="h-4 w-4" /> {formatObsDate(reflection.createdAt)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Reflection Content & EYLF */}
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 inline-flex items-center gap-2 text-base font-bold text-foreground">
              <BookOpen className="h-5 w-5 text-primary" /> Reflection
            </h3>
            <p className="whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
              {stripHtml(reflection.about) || "No content provided."}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-base font-bold text-foreground">EYLF Outcomes</h3>
            {!reflection.eylf ? (
              <p className="text-sm text-muted-foreground">No EYLF outcomes linked.</p>
            ) : (
              <ul className="space-y-2">
                {reflection.eylf
                  .split(/\r?\n/)
                  .filter(Boolean)
                  .map((outcome, i) => (
                    <li
                      key={i}
                      className="rounded-lg border border-primary/10 bg-primary/5 px-4 py-3 text-sm font-medium text-primary shadow-sm"
                    >
                      {outcome}
                    </li>
                  ))}
              </ul>
            )}
          </section>

          {mediaItems.length > 0 && (
            <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-foreground">
                Media ({mediaItems.length})
              </h3>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {mediaItems.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="relative aspect-square overflow-hidden rounded-xl border border-border shadow-sm"
                  >
                    {isVideoMedia(item.mediaType, item.mediaUrl) ? (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <Video className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    ) : (
                      <img
                        src={getMediaUrl(item.mediaUrl)}
                        alt={`Media ${idx}`}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Tags & Info */}
        <div className="space-y-6">
          {/* Children */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-foreground">
              <UserCircle2 className="h-4 w-4 text-primary" /> Tagged Children ({childObjs.length})
            </h3>
            {childObjs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No children tagged.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {childObjs.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/10 p-2 transition-colors hover:bg-muted/30"
                  >
                    <img
                      src={getAvatarUrl(c.imageUrl, getPersonName(c), "FDF4FF", "C026D3")}
                      alt={getPersonName(c)}
                      className="h-10 w-10 rounded-full object-cover shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {getPersonName(c)}
                      </p>
                      <p className="text-xs text-muted-foreground">{c.status || "Active"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Educators */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-foreground">
              <Users className="h-4 w-4 text-primary" /> Educators ({staffObjs.length})
            </h3>
            {staffObjs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No educators tagged.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {staffObjs.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-muted/10 p-2 transition-colors hover:bg-muted/30"
                  >
                    <img
                      src={getAvatarUrl(e.imageUrl, getPersonName(e), "EEF2FF", "4338CA")}
                      alt={getPersonName(e)}
                      className="h-10 w-10 rounded-full object-cover shadow-sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {getPersonName(e)}
                      </p>
                      <p className="text-xs text-muted-foreground">{e.userType || "Staff"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Rooms */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-foreground">
              <Building2 className="h-4 w-4 text-primary" /> Rooms ({rooms.length})
            </h3>
            {rooms.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rooms.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {rooms.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
                  >
                    {r}
                  </span>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
