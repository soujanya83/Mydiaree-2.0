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
import { mockChildren, mockRooms } from "@/services/mocks/data";
import { useCentreStore } from "@/stores/centreStore";
import {
  CHILD_DOB,
  CHILD_GENDER,
  ageFromDob,
  childPhoto,
  formatDob,
} from "@/components/lessonplan/progressData";

export default function LearningProgressPage() {
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const [roomId, setRoomId] = useState("all");
  const [query, setQuery] = useState("");

  const rooms = useMemo(
    () => mockRooms.filter((r) => r.centreId === activeCentreId),
    [activeCentreId],
  );

  const children = useMemo(() => {
    return mockChildren.filter((c) => {
      if (c.centreId !== activeCentreId) return false;
      if (roomId !== "all") {
        const room = mockRooms.find((r) => r.id === roomId);
        if (room && c.roomName !== room.name) return false;
      }
      if (query) {
        const q = query.toLowerCase();
        const fn = `${c.firstName} ${c.lastName}`.toLowerCase();
        if (!fn.includes(q)) return false;
      }
      return true;
    });
  }, [activeCentreId, roomId, query]);

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
          <Select value={roomId} onValueChange={setRoomId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All rooms</SelectItem>
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

      {children.length === 0 ? (
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No children found for the selected centre and room.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {children.map((c) => (
            <ChildCard key={c.id} child={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function ChildCard({ child }) {
  const dob = CHILD_DOB[child.id];
  const gender = CHILD_GENDER[child.id] || "—";
  const photo = childPhoto(child.id);

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
        <img src={photo} alt={`${child.firstName} ${child.lastName}`} className="h-full w-full object-cover" />
      </div>
      <div className="p-4">
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Baby className="h-5 w-5 text-primary" />
          {child.firstName} {child.lastName}
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
                  {parseInt(ageFromDob(dob), 10)}y
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
                  gender === "Female"
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