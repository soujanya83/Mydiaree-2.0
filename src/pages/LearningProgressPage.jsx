import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, LineChart, Baby, Cake, VenetianMask } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCentreStore } from "@/stores/centreStore";
import { useRoomStore } from "@/stores/roomStore";
import { useChildrenStore } from "@/stores/childrenStore";
import {
  ageFromDob,
  childPhoto,
  formatDob,
} from "@/components/lessonplan/progressData";

export default function LearningProgressPage() {
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom } = useRoomStore();
  const { children, isLoading } = useChildrenStore();
  
  const [query, setQuery] = useState("");

  const filteredChildren = useMemo(() => {
    return children.filter((c) => {
      if (query) {
        const q = query.toLowerCase();
        const fn = (c.name || "").toLowerCase();
        if (!fn.includes(q)) return false;
      }
      return true;
    });
  }, [children, query]);

  return (
    <div>
      <PageHeader
        title="Learning & Progress"
        description="Browse children by centre and room and dive into their progress plan."
        breadcrumbs={[{ label: "Learning & Progress" }]}
      />

      <div className="mb-6 flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Centre</label>
          <Select value={activeCentreId} onValueChange={setActiveCentre}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {centres.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Room</label>
          <Select value={activeRoomId} onValueChange={setActiveRoom}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-[2]">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Search</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search children by name…"
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <h2 className="mb-4 text-center text-2xl font-semibold text-primary">Children Directory</h2>

      {isLoading ? (
        <div className="py-20 text-center text-muted-foreground">Loading children...</div>
      ) : filteredChildren.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No children found for the selected centre and room.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredChildren.map((c) => (
            <ChildCard key={c.id} child={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChildCard({ child }) {
  const dob = child.dob;
  const gender = child.gender || "—";
  const photo = child.image || childPhoto(child.id);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
        <img src={photo} alt={child.name} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Baby className="h-5 w-5 text-primary" />
          {child.name}
        </div>
        <div className="space-y-2 text-sm">
          <Row icon={Cake} label="DOB" value={formatDob(dob)} />
          <Row
            icon={Baby}
            label="Age"
            value={
              <span className="flex items-center gap-2">
                {ageFromDob(dob)}
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {parseInt(ageFromDob(dob) || "0", 10)}y
                </Badge>
              </span>
            }
          />
          <Row
            icon={VenetianMask}
            label="Gender"
            value={
              <Badge
                variant="secondary"
                className={
                  gender.toLowerCase() === "female"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-sky-100 text-sky-700"
                }
              >
                {gender}
              </Badge>
            }
          />
        </div>
        <Button asChild className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">
          <Link to={`/learning-progress/${child.id}`}>
            <LineChart className="mr-2 h-4 w-4" />
            View Progress
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <span className="font-semibold text-foreground">{label}:</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}