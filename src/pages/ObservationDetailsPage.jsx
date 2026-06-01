import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Baby,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Edit,
  Eye,
  FileText,
  Image as ImageIcon,
  Inbox,
  Layers,
  Link2,
  ListChecks,
  Loader2,
  MessageSquare,
  Send,
  Sparkles,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageLoader } from "@/components/common/PageLoader";
import { Textarea } from "@/components/ui/textarea";
import { useRoomStore } from "@/stores/roomStore";
import { formatObsDate, statusBadgeClasses } from "@/components/observation/observationsData";
import { observationService } from "@/services/learning/observationService";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { IMG_BASE_API } from "../api/imageapi";

const IMG_BASE = IMG_BASE_API;

const TAB_ITEMS = [
  { id: "overview", label: "Overview", Icon: Eye },
  { id: "children", label: "Children", Icon: Users },
  { id: "assessments", label: "Assessments", Icon: ListChecks },
  { id: "linking", label: "Linking", Icon: Link2 },
];

const LINK_TYPES = {
  programPlan: {
    label: "Program Plans",
    Icon: ClipboardList,
    accent: "emerald",
    empty: "No program plans linked.",
  },
  observation: {
    label: "Observations",
    Icon: Eye,
    accent: "sky",
    empty: "No observations linked.",
  },
  reflection: {
    label: "Reflections",
    Icon: Sparkles,
    accent: "amber",
    empty: "No reflections linked.",
  },
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

function mediaUrl(raw) {
  if (!raw) return "";
  return String(raw).startsWith("http")
    ? String(raw)
    : `${IMG_BASE}${String(raw).replace(/^\/+/, "")}`;
}

function fullName(person, fallback = "Unknown") {
  return [person?.name, person?.lastname].filter(Boolean).join(" ").trim() || fallback;
}

function getLinkedRows(type, response) {
  if (type === "programPlan") {
    return (
      response?.program_plans ??
      response?.data?.program_plans ??
      response?.programPlans ??
      response?.data?.programPlans ??
      []
    );
  }
  if (type === "reflection") {
    return response?.reflections ?? response?.data?.reflections ?? response?.reflection ?? [];
  }
  return response?.observations ?? response?.data?.observations ?? response?.observation ?? [];
}

function groupBy(items, getKey) {
  return (items || []).reduce((groups, item) => {
    const key = getKey(item) || "Other";
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {});
}

export default function ObservationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms: allRooms } = useRoomStore();
  const { isParent } = usePermissions();

  const [obs, setObs] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [tab, setTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [isCommenting, setIsCommenting] = useState(false);
  const [linkedItems, setLinkedItems] = useState({
    programPlan: [],
    observation: [],
    reflection: [],
  });
  const [linksLoading, setLinksLoading] = useState({
    programPlan: false,
    observation: false,
    reflection: false,
  });
  const [linksLoaded, setLinksLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [detailRes, commentRes] = await Promise.all([
        observationService.getObservationDetails(id),
        observationService.getComments(id),
      ]);

      if (detailRes.status) {
        setObs(detailRes.data);
      } else {
        toast.error(detailRes.message || "Observation not found");
      }

      if (commentRes.status) {
        setComments(commentRes.comments || []);
      }
    } catch (error) {
      console.error("Error fetching observation details:", error);
      toast.error("Error fetching observation details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const loadLinkedItems = useCallback(async () => {
    if (!id || linksLoaded) return;
    const types = Object.keys(LINK_TYPES);
    setLinksLoading({ programPlan: true, observation: true, reflection: true });

    try {
      const loaders = {
        programPlan: observationService.getLinkedProgramPlans,
        reflection: observationService.getLinkedReflections,
        observation: observationService.getLinkedObservations,
      };
      const results = await Promise.allSettled(
        types.map(async (type) => ({
          type,
          rows: getLinkedRows(type, await loaders[type](id)),
        })),
      );

      const failed = [];
      const next = { programPlan: [], observation: [], reflection: [] };
      results.forEach((result, index) => {
        const type = types[index];
        if (result.status === "fulfilled") {
          next[type] = Array.isArray(result.value.rows) ? result.value.rows : [];
        } else {
          failed.push(type);
          console.error(`Failed to load ${type} links:`, result.reason);
        }
      });
      setLinkedItems(next);
      setLinksLoaded(true);

      if (failed.length) {
        toast.error("Some linked records could not be loaded");
      }
    } finally {
      setLinksLoading({ programPlan: false, observation: false, reflection: false });
    }
  }, [id, linksLoaded]);

  useEffect(() => {
    if (tab === "linking") loadLinkedItems();
  }, [loadLinkedItems, tab]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsCommenting(true);
    try {
      const res = await observationService.saveComment(id, newComment);
      if (res.status) {
        toast.success("Comment added");
        setNewComment("");
        const commentRes = await observationService.getComments(id);
        if (commentRes.status) setComments(commentRes.comments || []);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    } finally {
      setIsCommenting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;
    try {
      const res = await observationService.deleteComment(id, commentId);
      if (res.status) {
        toast.success("Comment deleted");
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const normalized = useMemo(() => normalizeObservation(obs, allRooms), [allRooms, obs]);

  if (isLoading) {
    return <PageLoader label="Loading observation details..." />;
  }

  if (!obs) {
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-20 text-center">
        <Inbox className="mb-3 h-10 w-10 text-muted-foreground/50" />
        <h2 className="text-lg font-bold text-foreground">Observation not found</h2>
        <Link to="/observation" className="mt-3 text-sm font-semibold text-primary hover:underline">
          Back to observations
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/observation")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back
          </Button>
          <nav className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <Link to="/observation" className="hover:text-foreground">
              Observations
            </Link>
            <span>/</span>
            <span className="text-foreground">#{obs.id}</span>
          </nav>
        </div>
        {!isParent && (
          <Button onClick={() => navigate(`/observation/${obs.id}/edit`)}>
            <Edit className="mr-1.5 h-4 w-4" />
            Edit Observation
          </Button>
        )}
      </div>

      <ObservationHero observation={normalized} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <main className="min-w-0 space-y-5">
          <TabBar active={tab} onChange={setTab} />

          {tab === "overview" && <OverviewTab observation={normalized} />}
          {tab === "children" && <ChildrenTab observation={normalized} />}
          {tab === "assessments" && <AssessmentsTab observation={obs} />}
          {tab === "linking" && (
            <LinkingTab linkedItems={linkedItems} loadingByType={linksLoading} />
          )}
        </main>

        <aside className="space-y-5">
          <QuickFacts observation={normalized} />
          <CommentsPanel
            comments={comments}
            newComment={newComment}
            isCommenting={isCommenting}
            onChange={setNewComment}
            onSend={handleAddComment}
            onDelete={handleDeleteComment}
          />
        </aside>
      </div>
    </div>
  );
}

function normalizeObservation(obs, allRooms) {
  if (!obs) return null;
  const roomIds = String(obs.room || "")
    .split(",")
    .map((roomId) => roomId.trim())
    .filter(Boolean);
  const roomNames = roomIds.map(
    (roomId) => allRooms.find((room) => String(room.id) === String(roomId))?.name || roomId,
  );
  const media = (obs.media || []).map((item) => ({
    id: item.id,
    url: mediaUrl(item.mediaUrl || item.url),
    type: item.mediaType || "",
    caption: stripHtml(item.caption),
  }));

  return {
    raw: obs,
    id: obs.id,
    title: stripHtml(obs.obestitle) || "Untitled observation",
    notes: stripHtml(obs.title),
    learningAnalysis: stripHtml(obs.notes),
    criticalReflection: stripHtml(obs.reflection || obs.critical_reflection),
    futurePlan: stripHtml(obs.future_plan),
    implementation: stripHtml(obs.implementation),
    childVoice: stripHtml(obs.child_voice),
    status: obs.status || "Draft",
    createdAt: obs.created_at || obs.date_added,
    updatedAt: obs.updated_at || obs.date_modified,
    rooms: roomNames,
    roomIds,
    children: obs.child || [],
    taggedStaff: String(obs.tagged_staff || "")
      .split(",")
      .map((staffId) => staffId.trim())
      .filter(Boolean),
    media,
  };
}

function ObservationHero({ observation }) {
  const cover = observation.media[0];
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="grid lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-5 p-6 lg:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide ${statusBadgeClasses(
                observation.status.toLowerCase(),
              )}`}
            >
              {observation.status}
            </span>
            <span className="rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-bold text-muted-foreground">
              Observation #{observation.id}
            </span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground lg:text-4xl">
              {observation.title}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {observation.notes || "No observation notes recorded."}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric icon={Calendar} label="Created" value={formatObsDate(observation.createdAt)} />
            <Metric icon={Baby} label="Children" value={String(observation.children.length)} />
            <Metric icon={Layers} label="Rooms" value={String(observation.rooms.length)} />
          </div>
        </div>
        <div className="min-h-[260px] border-t border-border bg-muted/20 lg:border-l lg:border-t-0">
          {cover ? (
            <MediaFrame media={cover} title={observation.title} className="h-full min-h-[260px]" />
          ) : (
            <div className="flex h-full min-h-[260px] items-center justify-center">
              <ImageIcon className="h-14 w-14 text-muted-foreground/35" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-foreground">{value}</p>
    </div>
  );
}

function TabBar({ active, onChange }) {
  return (
    <div className="grid gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:grid-cols-4">
      {TAB_ITEMS.map((item) => {
        const Icon = item.Icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black transition ${
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function OverviewTab({ observation }) {
  const textSections = [
    { label: "Observation", value: observation.notes, Icon: FileText },
    { label: "Learning Analysis", value: observation.learningAnalysis, Icon: Sparkles },
    { label: "Child Voice", value: observation.childVoice, Icon: MessageSquare },
    { label: "Future Plan", value: observation.futurePlan, Icon: TrendingUp },
    { label: "Implementation", value: observation.implementation, Icon: CheckCircle2 },
    { label: "Critical Reflection", value: observation.criticalReflection, Icon: Sparkles },
  ];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <SectionHeading icon={ImageIcon} title="Media" description="Observation media files" />
        {observation.media.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {observation.media.map((media) => (
              <div
                key={media.id || media.url}
                className="overflow-hidden rounded-xl border border-border bg-muted/20"
              >
                <MediaFrame media={media} title={observation.title} className="aspect-video" />
              </div>
            ))}
          </div>
        ) : (
          <EmptyBlock label="No media attached." />
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {textSections.map((section) => (
          <InfoCard key={section.label} {...section} />
        ))}
      </div>
    </div>
  );
}

function MediaFrame({ media, title, className = "" }) {
  const isVideo = String(media.type || "").startsWith("video/");
  if (isVideo) {
    return (
      <video src={media.url} controls className={`w-full bg-black object-contain ${className}`} />
    );
  }
  return (
    <img
      src={media.url}
      alt={media.caption || title || "Observation media"}
      className={`w-full object-cover ${className}`}
    />
  );
}

function InfoCard({ label, value, Icon }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <SectionHeading icon={Icon} title={label} />
      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-foreground">
        {value || "Not recorded."}
      </p>
    </section>
  );
}

function ChildrenTab({ observation }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <SectionHeading
        icon={Users}
        title="Tagged Children"
        description={`${observation.children.length} children linked to this observation`}
      />
      {observation.children.length ? (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {observation.children.map((item) => {
            const child = item.child || item;
            return <ChildCard key={item.id || child.id} child={child} />;
          })}
        </div>
      ) : (
        <EmptyBlock label="No children tagged." />
      )}
    </section>
  );
}

function ChildCard({ child }) {
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-muted/10 p-4">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {child.imageUrl ? (
          <img
            src={mediaUrl(child.imageUrl)}
            alt={fullName(child)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-7 w-7 text-muted-foreground/45" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-base font-black text-foreground">{fullName(child)}</p>
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          ID #{child.id} {child.room ? `・ Room ${child.room}` : ""}
        </p>
        <span className="mt-2 inline-flex rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-700">
          {child.status || "Active"}
        </span>
      </div>
    </div>
  );
}

function AssessmentsTab({ observation }) {
  return (
    <div className="space-y-5">
      <AssessmentPanel
        accent="emerald"
        icon={ClipboardList}
        title="Montessori"
        count={observation.montessori_links?.length || 0}
      >
        <MontessoriAssessments items={observation.montessori_links || []} />
      </AssessmentPanel>
      <AssessmentPanel
        accent="sky"
        icon={ListChecks}
        title="EYLF"
        count={observation.eylf_links?.length || 0}
      >
        <EylfAssessments items={observation.eylf_links || []} />
      </AssessmentPanel>
      <AssessmentPanel
        accent="orange"
        icon={TrendingUp}
        title="Developmental Milestones"
        count={observation.dev_milestone_subs?.length || 0}
      >
        <DevelopmentAssessments items={observation.dev_milestone_subs || []} />
      </AssessmentPanel>
    </div>
  );
}

function AssessmentPanel({ accent, icon, title, count, children }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/20 px-5 py-4">
        <SectionHeading icon={icon} title={title} description={`${count} selected`} />
        <span className={`rounded-full px-3 py-1 text-xs font-black ${accentClasses(accent)}`}>
          {count}
        </span>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function MontessoriAssessments({ items }) {
  if (!items.length) return <EmptyBlock label="No Montessori assessments recorded." />;
  const groups = groupBy(
    items,
    (item) => item.sub_activity?.activity?.subject?.name || item.sub_activity?.activity?.title,
  );
  return (
    <GroupedAssessmentList groups={groups} renderItem={(item) => <MontessoriRow item={item} />} />
  );
}

function MontessoriRow({ item }) {
  return (
    <AssessmentRow
      title={item.sub_activity?.title || `Subactivity #${item.idSubActivity}`}
      subtitle={item.sub_activity?.activity?.title}
      badge={item.assesment || item.assessment || "Introduced"}
    />
  );
}

function EylfAssessments({ items }) {
  if (!items.length) return <EmptyBlock label="No EYLF assessments recorded." />;
  const groups = groupBy(items, (item) => item.sub_activity?.activity?.outcome?.title);
  return <GroupedAssessmentList groups={groups} renderItem={(item) => <EylfRow item={item} />} />;
}

function EylfRow({ item }) {
  return (
    <AssessmentRow
      title={item.sub_activity?.title || `Subactivity #${item.eylfSubactivityId}`}
      subtitle={item.sub_activity?.activity?.title}
      badge={item.sub_activity?.activity?.outcome?.name || "EYLF"}
    />
  );
}

function DevelopmentAssessments({ items }) {
  if (!items.length) return <EmptyBlock label="No developmental milestones recorded." />;
  const groups = groupBy(items, (item) => item.dev_milestone?.milestone?.ageGroup);
  return (
    <GroupedAssessmentList groups={groups} renderItem={(item) => <DevelopmentRow item={item} />} />
  );
}

function DevelopmentRow({ item }) {
  return (
    <AssessmentRow
      title={item.dev_milestone?.name || `Milestone #${item.devMilestoneId}`}
      subtitle={item.dev_milestone?.main?.name}
      badge={item.assessment || "Introduced"}
    />
  );
}

function GroupedAssessmentList({ groups, renderItem }) {
  return (
    <div className="space-y-4">
      {Object.entries(groups).map(([groupName, items]) => (
        <div key={groupName} className="rounded-xl border border-border bg-muted/10 p-3">
          <h4 className="text-sm font-black text-foreground">{groupName}</h4>
          <div className="mt-3 space-y-2">
            {items.map((item, index) => renderItem(item, index))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AssessmentRow({ title, subtitle, badge }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-background p-3">
      <div className="min-w-0">
        <p className="text-sm font-bold leading-snug text-foreground">{stripHtml(title)}</p>
        {subtitle && <p className="mt-1 text-xs text-muted-foreground">{stripHtml(subtitle)}</p>}
      </div>
      <span className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-xs font-black text-primary">
        {stripHtml(badge)}
      </span>
    </div>
  );
}

function LinkingTab({ linkedItems, loadingByType }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {Object.entries(LINK_TYPES).map(([type, meta]) => (
        <LinkedCard
          key={type}
          type={type}
          meta={meta}
          items={linkedItems[type] || []}
          isLoading={loadingByType[type]}
        />
      ))}
    </div>
  );
}

function LinkedCard({ type, meta, items, isLoading }) {
  const Icon = meta.Icon;
  return (
    <section className="min-h-[360px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 p-4">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl border p-2.5 ${accentClasses(meta.accent)}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">{meta.label}</h3>
            <p className="text-xs text-muted-foreground">{items.length} linked</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            Loading {meta.label.toLowerCase()}...
          </div>
        ) : items.length ? (
          <div className="max-h-[392px] space-y-3 overflow-y-auto pr-1">
            {items.map((item) => (
              <LinkedPreview key={`${type}-${item.id}`} type={type} item={item} />
            ))}
          </div>
        ) : (
          <EmptyBlock label={meta.empty} />
        )}
      </div>
    </section>
  );
}

function LinkedPreview({ type, item }) {
  if (type === "programPlan") {
    return (
      <div className="rounded-xl border border-border bg-background p-3">
        <p className="text-sm font-black text-foreground">
          {item.month_name || item.month || "Program Plan"} {item.years || item.year || ""}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{item.room_name || "No room set"}</p>
        <p className="mt-2 text-[11px] font-bold text-muted-foreground">
          Created by {item.created_by || item.creator_name || "-"} ・ #{item.id}
        </p>
      </div>
    );
  }
  const media = item.media?.[0];
  const title = stripHtml(item.title || item.obestitle || item.about) || `Record #${item.id}`;
  return (
    <div className="flex gap-3 rounded-xl border border-border bg-background p-3">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
        {media ? (
          <img
            src={mediaUrl(media.mediaUrl || media.url)}
            alt={title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-5 w-5 text-muted-foreground/45" />
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-bold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {item.created_by || item.creator?.name || "-"} ・ #{item.id}
        </p>
      </div>
    </div>
  );
}

function QuickFacts({ observation }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <SectionHeading icon={InfoIcon} title="Details" />
      <div className="mt-4 space-y-3">
        <Fact label="Date" value={formatObsDate(observation.createdAt)} />
        <Fact
          label="Time"
          value={
            observation.createdAt
              ? new Date(observation.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "-"
          }
        />
        <Fact label="Rooms" value={observation.rooms.join(", ") || "-"} />
        <Fact label="Staff IDs" value={observation.taggedStaff.join(", ") || "-"} />
      </div>
    </section>
  );
}

function InfoIcon(props) {
  return <FileText {...props} />;
}

function Fact({ label, value }) {
  return (
    <div className="rounded-xl border border-border bg-muted/10 p-3">
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function CommentsPanel({ comments, newComment, isCommenting, onChange, onSend, onDelete }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-4">
        <SectionHeading icon={MessageSquare} title={`Comments (${comments.length})`} />
      </div>

      <div className="max-h-[460px] space-y-3 overflow-y-auto p-4">
        {comments.length ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className="group rounded-xl border border-border bg-background p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-black text-foreground">
                  {comment.user?.name || "Unknown"}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(comment.id)}
                  className="rounded-lg p-1 text-rose-500 opacity-0 transition hover:bg-rose-500/10 group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-5 text-foreground">
                {stripHtml(comment.comments)}
              </p>
              <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                {comment.created_at ? new Date(comment.created_at).toLocaleString() : ""}
              </p>
            </div>
          ))
        ) : (
          <EmptyBlock label="No comments yet." />
        )}
      </div>

      <div className="border-t border-border bg-muted/10 p-4">
        <Textarea
          placeholder="Write a comment..."
          value={newComment}
          onChange={(event) => onChange(event.target.value)}
          className="mb-3 min-h-[100px] resize-none bg-background text-sm"
        />
        <Button
          onClick={onSend}
          disabled={isCommenting || !newComment.trim()}
          className="h-10 w-full font-bold"
        >
          {isCommenting ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-1.5 h-4 w-4" />
          )}
          Send Comment
        </Button>
      </div>
    </section>
  );
}

function SectionHeading({ icon: Icon, title, description }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-black text-foreground">{title}</h2>
        {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
      </div>
    </div>
  );
}

function EmptyBlock({ label }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/10 p-6 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground/35" />
      <p className="mt-2 text-sm font-bold text-muted-foreground">{label}</p>
    </div>
  );
}

function accentClasses(accent) {
  const classes = {
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
    sky: "border-sky-500/20 bg-sky-500/10 text-sky-700",
    amber: "border-amber-500/20 bg-amber-500/10 text-amber-700",
    orange: "border-orange-500/20 bg-orange-500/10 text-orange-700",
  };
  return classes[accent] || classes.sky;
}
