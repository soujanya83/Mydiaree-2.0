import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Calendar, User, Users, Clock, ShieldCheck, Activity } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { parentService } from "@/services/admin/parentService";

function getImageUrl(imageUrl) {
  if (!imageUrl) return "";
  return imageUrl.startsWith("http") ? imageUrl : `https://mydiaree.com.au/${imageUrl}`;
}

function getInitials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatDate(isoString) {
  if (!isoString) return "Not provided";
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export default function ParentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const [detailsRes, childrenRes] = await Promise.all([
          parentService.getParentDetails(id),
          parentService.getGlobalParentChildren(id).catch((error) => {
            console.error("Error fetching linked children:", error);
            toast.error("Parent loaded, but linked children could not be refreshed.");
            return null;
          }),
        ]);

        if (detailsRes.status === "success" || detailsRes.status === true || detailsRes.success) {
          setData({
            ...detailsRes,
            children: childrenRes?.status === true ? childrenRes.children || [] : detailsRes.children || [],
          });
        } else {
          toast.error(detailsRes.message || "Failed to load parent details.");
          navigate("/parent-settings");
        }
      } catch (error) {
        console.error("Error fetching parent details:", error);
        toast.error("An error occurred while loading details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id, navigate]);

  if (loading) {
    return <PageLoader label="Loading parent details..." />;
  }

  if (!data || !data.parent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-sm ring-1 ring-rose-200">
          <User className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-bold tracking-tight text-foreground">Parent Not Found</h3>
        <p className="mt-2 text-sm text-muted-foreground">The requested parent details could not be found.</p>
        <Button onClick={() => navigate("/parent-settings")} variant="outline" className="mt-6 h-11 rounded-xl px-6 font-semibold">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const { parent, children } = data;
  const avatarUrl = getImageUrl(parent.imageUrl);

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Parent Profile
          </span>
        }
        description="Detailed view of the parent account and linked children."
        breadcrumbs={[
          { label: "Settings", to: "/settings" },
          { label: "Parent Settings", to: "/parent-settings" },
          { label: parent.name || "Details" },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate("/parent-settings")}
            className="h-10 gap-2 rounded-xl bg-card/60 backdrop-blur border-border/60 shadow-sm font-medium transition-all hover:bg-card/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Parents
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/60 p-8 shadow-sm backdrop-blur">
            <div
              className="absolute inset-0 -z-10 opacity-60"
              style={{
                background:
                  "radial-gradient(circle at top, color-mix(in oklab, var(--primary) 10%, transparent), transparent 70%)",
              }}
            />

            <div className="flex flex-col items-center text-center relative z-10">
              <div className="relative mb-6">
                <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-primary/30 to-indigo-500/30 opacity-70 blur-xl"></div>
                <Avatar className="relative h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={avatarUrl} alt={parent.name} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-4xl">
                    {getInitials(parent.name)}
                  </AvatarFallback>
                </Avatar>
                {parent.status === "ACTIVE" && (
                  <div className="absolute bottom-2 right-2 h-5 w-5 rounded-full border-2 border-background bg-success shadow-sm" title="Active Account"></div>
                )}
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">{parent.name}</h2>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                <ShieldCheck className="h-3.5 w-3.5" />
                {parent.userType || "Parent"}
              </div>

              <div className="mt-8 w-full space-y-4">
                <div className="flex items-center gap-3 rounded-2xl bg-background/50 p-4 shadow-sm border border-border/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-start overflow-hidden text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</span>
                    <span className="w-full truncate text-sm font-semibold text-foreground">{parent.emailid || parent.email || "No email"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl bg-background/50 p-4 shadow-sm border border-border/40">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Contact Number</span>
                    <span className="text-sm font-semibold text-foreground">{parent.contactNo || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Linked Children */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Account Details */}
          <div className="rounded-3xl border border-border/60 bg-card/60 p-8 shadow-sm backdrop-blur">
            <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-foreground">
              <Activity className="h-5 w-5 text-primary" />
              Account Details
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <User className="h-3.5 w-3.5" /> Gender
                </span>
                <p className="text-sm font-medium capitalize text-foreground">
                  {parent.gender ? parent.gender.toLowerCase() : "Not specified"}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Date of Birth
                </span>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(parent.dob)}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" /> Joined Date
                </span>
                <p className="text-sm font-medium text-foreground">
                  {formatDate(parent.created_at)}
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5" /> Notifications
                </span>
                <p className="text-sm font-medium text-foreground">
                  {parent.allow_notifications ? "Enabled" : "Disabled"}
                </p>
              </div>
            </div>
          </div>

          {/* Linked Children */}
          <div className="rounded-3xl border border-border/60 bg-card/60 p-8 shadow-sm backdrop-blur">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <Users className="h-5 w-5 text-primary" />
                Linked Children
              </h3>
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                {children?.length || 0} Total
              </span>
            </div>
            
            {(!children || children.length === 0) ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-background/40 py-12 text-center">
                <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
                <h4 className="text-sm font-semibold text-foreground">No Children Linked</h4>
                <p className="mt-1 text-xs text-muted-foreground">This parent account does not have any linked children yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {children.map((child, index) => (
                  <div
                    key={child.id || child.childid || index}
                    onClick={() => navigate(`/children/${child.id || child.childid}`)}
                    className="flex items-center gap-4 rounded-2xl border border-border/50 bg-background/50 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer group"
                  >
                    <Avatar className="h-14 w-14 shrink-0 border-2 border-background shadow-sm">
                      <AvatarImage src={getImageUrl(child.imageUrl)} alt={child.full_name || child.name} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {getInitials(child.full_name || `${child.name || ""} ${child.lastname || ""}`)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                      <span className="truncate text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {child.full_name || `${child.name || ""} ${child.lastname || ""}`.trim() || "Unnamed Child"}
                      </span>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className="inline-flex w-fit items-center rounded-md bg-secondary/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary-foreground">
                          {child.gender || "Gender unknown"}
                        </span>
                        <span className="inline-flex w-fit items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary/90">
                          {child.relation || "Unknown Relation"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
