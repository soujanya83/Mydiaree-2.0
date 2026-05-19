import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Calendar, 
  IdCard, 
  DoorOpen, 
  Users, 
  Loader2, 
  Phone, 
  Home, 
  UserRound, 
  Mail, 
  Baby,
  ArrowLeft
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { childrenService } from "@/services/centre/childrenService";
import { toast } from "sonner";

const resolveImageUrl = (imageUrl) => {
  if (!imageUrl) return "";
  return imageUrl.startsWith("http") ? imageUrl : `https://mydiaree.com.au/${imageUrl}`;
};

const textOrDash = (value) => value || "—";

function fmtDate(s) {
  if (!s) return "—";
  const d = new Date(s);
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

export default function ChildDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [child, setChild] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const res = await childrenService.getChildDetails(id);
        setChild(res.data || res);
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load child details");
        navigate("/children");
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary/60" />
        <p className="text-sm font-medium">Loading child details...</p>
      </div>
    );
  }

  if (!child) return null;

  const fullName = `${child.name || ""} ${child.lastname || ""}`.trim();
  const imageUrl = resolveImageUrl(child?.imageUrl);
  const isActive = child?.status?.toLowerCase() === "active";

  return (
    <div className="space-y-6">
      <PageHeader
        title={
          <span className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Child Profile Details
          </span>
        }
        description="Complete profile information and family contacts"
        breadcrumbs={[
          { label: "Children", to: "/children" },
          { label: fullName || "Details" },
        ]}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate("/children")}
            className="h-10 gap-2 rounded-xl bg-card/60 backdrop-blur border-border/60 shadow-sm font-medium transition-all hover:bg-card/80"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Children
          </Button>
        }
      />

      <div className="rounded-3xl border border-border/60 bg-card/60 p-8 shadow-sm backdrop-blur relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-6 sm:flex-row mb-8">
          <div className="flex flex-col items-center relative shrink-0">
            <div className="relative mb-2">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary/40 to-indigo-500/40 opacity-70 blur-md"></div>
              <div className="relative h-32 w-32 shrink-0 overflow-hidden rounded-full border-2 border-background bg-muted shadow-md">
                {imageUrl ? (
                  <img src={imageUrl} alt={fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted/50">
                    <Users className="h-10 w-10 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            </div>
            <span
              className={`mt-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide shadow-sm ${
                isActive
                  ? "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-400"
                  : "border-orange-200 bg-orange-50 text-orange-600 dark:border-orange-800 dark:bg-orange-950/50 dark:text-orange-400"
              }`}
            >
              {child.status || "Inactive"}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-4">
              <h3 className="text-3xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                {textOrDash(fullName)}
              </h3>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <IdCard className="h-4 w-4" /> ID: {child.id}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <DetailItem icon={Calendar} label="Date of Birth" value={fmtDate(child.dob)} />
              <DetailItem icon={Calendar} label="Start Date" value={fmtDate(child.startDate)} />
              <DetailItem icon={DoorOpen} label="Room" value={child.room} />
              <DetailItem icon={UserRound} label="Gender" value={child.gender} />
            </div>
          </div>
        </div>

        {(child.address || child.other_details) && (
           <div className="mb-8 grid gap-5 lg:grid-cols-2">
             {child.address && (
               <DetailSection title="Contact Details">
                 <DetailItem icon={Home} label="Address" value={child.address} />
               </DetailSection>
             )}

             {child.other_details && (
               <DetailSection title="Other Details">
                 <p className="text-sm font-medium leading-6 text-muted-foreground">{child.other_details}</p>
               </DetailSection>
             )}
           </div>
        )}

        {child.parents?.length > 0 && (
          <DetailSection title="Parents / Guardians" className="mb-8">
            <div className="grid gap-4 sm:grid-cols-2">
              {child.parents.map((parent) => (
                <div 
                  key={parent.id} 
                  onClick={() => navigate(`/parent-settings/${parent.parent_id || parent.id}`)}
                  className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/50 p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30 cursor-pointer"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Users className="h-10 w-10" />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between">
                      <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{textOrDash(parent.name)}</p>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {textOrDash(parent.relation)}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex flex-col gap-2.5 text-sm font-medium text-muted-foreground">
                      {parent.email && (
                        <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-2.5 py-1.5 transition-colors group-hover:bg-muted/60">
                          <Mail className="h-4 w-4 shrink-0 text-primary/60" />
                          <span className="break-all">{textOrDash(parent.email)}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2.5 rounded-lg bg-muted/40 px-2.5 py-1.5 transition-colors group-hover:bg-muted/60">
                        <Phone className="h-4 w-4 shrink-0 text-primary/60" />
                        <span>{textOrDash(parent.phone || parent.contactNo)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        )}

        {child.siblings?.length > 0 && (
          <DetailSection title="Siblings">
            <div className="flex flex-wrap gap-2.5">
              {child.siblings.map((sibling) => (
                <div
                  key={sibling.id || sibling.childname || sibling.name}
                  className="flex items-center gap-2 rounded-xl border border-border/60 bg-muted/30 px-3 py-1.5 shadow-sm transition-colors hover:bg-muted/50"
                >
                  <UserRound className="h-4 w-4 text-muted-foreground/70" />
                  <span className="text-sm font-semibold text-foreground">
                    {sibling.childname ||
                      sibling.name ||
                      `${sibling.firstname || ""} ${sibling.lastname || ""}`.trim()}
                    {sibling.lastname ? ` ${sibling.lastname}` : ""}
                  </span>
                </div>
              ))}
            </div>
          </DetailSection>
        )}
      </div>
    </div>
  );
}

function DetailSection({ title, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-border/60 bg-muted/10 p-5 shadow-sm ${className}`}>
      <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground opacity-90">
        {title}
      </h4>
      {children}
    </section>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-background/60 border border-border/40 p-3 shadow-sm transition-colors hover:bg-background/80">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-bold text-foreground">{textOrDash(value)}</p>
      </div>
    </div>
  );
}
