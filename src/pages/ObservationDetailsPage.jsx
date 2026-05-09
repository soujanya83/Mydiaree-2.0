import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Edit,
  Eye,
  User,
  ClipboardList,
  ListChecks,
  TrendingUp,
  Image as ImageIcon,
  Info,
  ArrowLeft,
  MessageSquare,
  Send,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import { useCentreStore } from "@/stores/centreStore";
import {
  formatObsDate,
  statusBadgeClasses,
} from "@/components/observation/observationsData";
import { observationService } from "@/services/learning/observationService";
import { toast } from "sonner";

const TABS = [
  { id: "observation", label: "Observation", Icon: Eye },
  { id: "child", label: "Child", Icon: User },
  { id: "montessori", label: "Montessori", Icon: ClipboardList },
  { id: "eylf", label: "EYLF", Icon: ListChecks },
  { id: "development", label: "Development", Icon: TrendingUp },
];

export default function ObservationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeCentreId } = useCentreStore();
  const { rooms: allRooms } = useRoomStore();
  const { children: allChildren } = useChildrenStore();

  const [obs, setObs] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [tab, setTab] = useState("observation");
  const [isLoading, setIsLoading] = useState(true);
  const [isCommenting, setIsCommenting] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch specific observation details
      const res = await observationService.getObservationDetails(id);
      if (res.status) {
        setObs(res.data);
      } else {
        toast.error(res.message || "Observation not found");
      }

      // Fetch comments
      const commRes = await observationService.getComments(id);
      if (commRes.status) {
        setComments(commRes.comments || []);
      }
    } catch (error) {
      toast.error("Error fetching observation details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsCommenting(true);
    try {
      const res = await observationService.saveComment(id, newComment);
      if (res.status) {
        toast.success("Comment added");
        setNewComment("");
        // Refresh comments
        const commRes = await observationService.getComments(id);
        if (commRes.status) setComments(commRes.comments || []);
      }
    } catch (error) {
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
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (error) {
      toast.error("Failed to delete comment");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="mb-3 h-10 w-10 animate-spin text-primary opacity-40" />
        <h2 className="text-lg font-bold text-foreground">Loading details...</h2>
      </div>
    );
  }

  if (!obs) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-20 text-center">
        <Info className="mb-3 h-10 w-10 text-muted-foreground/60" />
        <h2 className="text-lg font-bold text-foreground">Observation not found</h2>
        <Link to="/observation" className="mt-3 text-sm text-primary hover:underline">
          Back to observations
        </Link>
      </div>
    );
  }

  const room = allRooms.find((r) => String(r.id) === String(obs.room));

  return (
    <div>
      {/* Top */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/observation")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/observation" className="hover:text-foreground">Observations</Link>
            <span>/</span>
            <span className="text-foreground">Observation Details</span>
          </nav>
        </div>
        <Button onClick={() => navigate(`/observation/${obs.id}/edit`)} className="bg-emerald-600 hover:bg-emerald-700">
          <Edit className="mr-1.5 h-4 w-4" /> Edit
        </Button>
      </div>

      {/* Title bar */}
      <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-amber-50/40 p-4 dark:bg-amber-950/10">
        <Eye className="h-6 w-6 text-sky-500" />
        <h1 className="text-xl font-bold text-sky-600" dangerouslySetInnerHTML={{ __html: obs.obestitle }} />
        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          #{obs.id}
        </span>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-border bg-card p-2">
        {TABS.map((t) => {
          const Icon = t.Icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition ${
                active ? "bg-foreground text-background shadow" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {tab === "observation" && (
            <div className="space-y-6">
              <DetailSection title="Basic Information">
                <Row label="Date">{formatObsDate(obs.created_at)}</Row>
                <Row label="Time">{new Date(obs.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Row>
                <Row label="Status">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${statusBadgeClasses(obs.status.toLowerCase())}`}>
                    {obs.status}
                  </span>
                </Row>
              </DetailSection>

              <DetailSection title="Observation Information">
                <Row label="Title"><div dangerouslySetInnerHTML={{ __html: obs.obestitle }} /></Row>
                <Row label="Notes">{obs.notes || "Not Update"}</Row>
                <Row label="Reflection">{obs.reflection || "Not Update"}</Row>
                <Row label="Future Plan">{obs.future_plan || "Not Update"}</Row>
                <Row label="Child Voice">{obs.child_voice || "Not Update"}</Row>
                <Row label="Implementation">{obs.implementation || "Not Update"}</Row>
              </DetailSection>

              <DetailSection title="Media Files">
                <div className="flex flex-wrap gap-3 p-4">
                  {obs.media?.length ? (
                    obs.media.map((m) => (
                      <div key={m.id} className="h-28 w-40 overflow-hidden rounded-md border border-border bg-muted/20">
                        <img src={m.mediaUrl} className="h-full w-full object-cover transition-transform hover:scale-110" alt="media" />
                      </div>
                    ))
                  ) : (
                    <div className="flex h-28 w-40 items-center justify-center rounded-md border border-border bg-muted/40">
                      <ImageIcon className="h-10 w-10 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              </DetailSection>
            </div>
          )}

          {tab === "child" && (
            <DetailSection title="Child Information">
              <div className="p-4 space-y-4">
                {obs.child?.length ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {obs.child.map((item) => {
                      const c = item.child;
                      return (
                        <div key={item.id} className="flex items-center gap-3 rounded-xl border border-border p-3 transition-colors hover:bg-muted/30">
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-muted">
                            {c.imageUrl ? (
                              <img src={c.imageUrl} className="h-full w-full object-cover" alt={c.name} />
                            ) : (
                              <User className="h-full w-full p-2 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{c.name} {c.lastname}</p>
                            <p className="text-[10px] text-muted-foreground">ID: {c.id} • Room: {c.room}</p>
                            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${c.status === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                              {c.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No children tagged.</p>
                )}
              </div>
              <div className="border-t border-border">
                <Row label="Tagged Staff IDs">{obs.tagged_staff || "—"}</Row>
              </div>
            </DetailSection>
          )}

          {tab === "montessori" && (
            <DetailSection title="Montessori Assessment">
              <AssessmentList items={obs.montessori_links} empty="No Montessori assessment recorded." />
            </DetailSection>
          )}

          {tab === "eylf" && (
            <DetailSection title="EYLF Assessment">
              <AssessmentList items={obs.eylf_links} empty="No EYLF assessment recorded." />
            </DetailSection>
          )}

          {tab === "development" && (
            <DetailSection title="Developmental Milestones">
              <AssessmentList items={obs.dev_milestone_subs} empty="No developmental milestones recorded." />
            </DetailSection>
          )}
        </div>

        {/* Comments Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border bg-muted/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold">Comments ({comments.length})</h2>
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-10 opacity-40">
                  <MessageSquare className="h-10 w-10 mx-auto mb-2" />
                  <p className="text-xs font-medium">No comments yet</p>
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="group relative rounded-lg border border-border bg-muted/20 p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-foreground">{c.user?.name || "Unknown"}</span>
                      <button 
                        onClick={() => handleDeleteComment(c.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded-md transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                    <p className="text-xs text-foreground leading-relaxed">{c.comments}</p>
                    <span className="mt-2 block text-[10px] text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString()} at {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-border p-4 bg-muted/5">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[100px] text-xs resize-none mb-3 border-border bg-white"
              />
              <Button 
                onClick={handleAddComment} 
                disabled={isCommenting || !newComment.trim()}
                className="w-full h-9 text-xs bg-[#0084ff] hover:bg-[#0073e6]"
              >
                {isCommenting ? <Loader2 className="h-3 w-3 animate-spin mr-1.5" /> : <Send className="h-3 w-3 mr-1.5" />}
                Send Message
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div className="overflow-hidden rounded-xl border-l-4 border-sky-500 bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3 bg-muted/5">
        <Info className="h-4 w-4 text-sky-500" />
        <h2 className="text-sm font-bold text-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-1 gap-2 px-5 py-3 sm:grid-cols-[180px_1fr]">
      <div className="text-sm font-semibold text-foreground">{label}:</div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

function AssessmentList({ items, empty }) {
  if (!items?.length) return <p className="p-4 text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="p-4 space-y-2">
      {items.map((it, idx) => (
        <div key={idx} className="rounded-md border border-border p-2 text-xs text-foreground bg-muted/10">
          {JSON.stringify(it)}
        </div>
      ))}
    </div>
  );
}