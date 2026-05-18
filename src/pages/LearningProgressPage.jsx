import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, LineChart, Baby, Cake, VenetianMask } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageLoader } from "@/components/common/PageLoader";
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
import {
  ageFromDob,
  formatDob,
} from "@/components/lessonplan/progressData";
import { learningProgressService } from "@/services/learning/learningProgressService";
import { Pagination } from "@/components/common/Pagination";

export default function LearningProgressPage() {
  const { centres, activeCentreId, setActiveCentre } = useCentreStore();
  const { rooms, activeRoomId, setActiveRoom, fetchRooms } = useRoomStore();
  
  const [childrenList, setChildrenList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [query, setQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const [debouncedSearch, setDebouncedSearch] = useState(query);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(query);
    }, 300);
    return () => clearTimeout(handler);
  }, [query]);

  const loadData = useCallback(async () => {
    if (!activeCentreId) return;
    setIsLoading(true);
    try {
      const response = await learningProgressService.getIndex(activeCentreId, activeRoomId, currentPage, perPage, debouncedSearch);
      if (response.status && response.data) {
        const childrenObj = response.data.children;
        const rawChildren = childrenObj.data || [];
        
        setChildrenList(rawChildren);
        setTotalPages(childrenObj.last_page || 1);
        
        // If no activeRoomId is set, and API returns a selected_room, we could set it
        if (!activeRoomId && response.data.selected_room) {
          setActiveRoom(response.data.selected_room.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch learning progress data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeCentreId, activeRoomId, currentPage, perPage, debouncedSearch, setActiveRoom]);

  // Fetch rooms when centre changes
  useEffect(() => {
    if (activeCentreId) {
      fetchRooms(activeCentreId);
    }
  }, [activeCentreId, fetchRooms]);

  // Fetch directory data when centre or room changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCentreId, activeRoomId, debouncedSearch]);

  const filteredChildren = useMemo(() => {
    return childrenList;
  }, [childrenList]);

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
          <Select value={String(activeCentreId || "")} onValueChange={setActiveCentre}>
            <SelectTrigger><SelectValue placeholder="Select Centre" /></SelectTrigger>
            <SelectContent>
              {centres.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-muted-foreground">Room</label>
          <Select value={String(activeRoomId || "")} onValueChange={setActiveRoom}>
            <SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger>
            <SelectContent>
              {rooms.map((r) => (
                <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>
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
        <PageLoader label="Loading children…" />
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

      {filteredChildren.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

function ChildCard({ child }) {
  const [imgError, setImgError] = useState(false);
  const dob = child.dob;
  const gender = child.gender || "—";
  
  // Construct image URL
  const photo = child.imageUrl 
    ? `https://mydiaree.com.au/${child.imageUrl}` 
    : null;

  const fullName = `${child.name} ${child.lastname || ""}`.trim();

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md flex flex-col h-full">
      <div className="aspect-[4/3] w-full overflow-hidden bg-muted flex items-center justify-center">
        {photo && !imgError ? (
          <img 
            src={photo} 
            alt={fullName} 
            className="h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-muted-foreground/40">
            <Baby className="h-12 w-12 mb-2" />
            <span className="text-xs font-medium uppercase tracking-wider">No Photo</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-3 flex items-center gap-2 text-lg font-semibold line-clamp-1">
          <Baby className="h-5 w-5 text-primary flex-shrink-0" />
          {fullName}
        </div>
        <div className="space-y-2 text-sm flex-1">
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