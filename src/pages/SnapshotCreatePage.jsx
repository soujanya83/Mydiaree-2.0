import { useMemo, useRef, useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  FileText,
  Sparkles,
  Image as ImageIcon,
  X,
  ArrowRight,
  Camera,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { snapshotService } from "@/services/learning-documentation/snapshotService";
import { childrenService } from "@/services/childrenService";
import { useCentreStore } from "@/stores/centreStore";
import { toast } from "sonner";

export default function SnapshotCreatePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [search] = useSearchParams();
  const isEdit = Boolean(id);

  const { activeCentreId } = useCentreStore();

  const [isLoading, setIsLoading] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [availableChildren, setAvailableChildren] = useState([]);

  const [rooms, setRooms] = useState([]);
  const [children, setChildren] = useState([]);
  const [staff, setStaff] = useState([]);
  const [title, setTitle] = useState(search.get("title") || "");
  const [details, setDetails] = useState("");
  const [media, setMedia] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);

  const [picker, setPicker] = useState(null);
  const fileInputRef = useRef(null);

  // Fetch initial data (rooms, staff)
  useEffect(() => {
    const loadInitialData = async () => {
      if (!activeCentreId) return;
      try {
        const data = await snapshotService.getRoomsAndStaff(activeCentreId);
        if (data.status) {
          setAvailableRooms(data.rooms || []);
          setAvailableStaff(data.roomStaffs || []);
        }
      } catch (error) {
        console.error("Failed to load rooms and staff:", error);
      }
    };
    loadInitialData();
  }, [activeCentreId]);

  // Fetch children when rooms change
  useEffect(() => {
    const loadChildren = async () => {
      if (rooms.length === 0) {
        setAvailableChildren([]);
        return;
      }
      try {
        const allChildren = [];
        for (const roomId of rooms) {
          const res = await childrenService.getChildrenByRoomId(roomId);
          if (res.status && res.children) {
            allChildren.push(...res.children);
          }
        }
        // De-duplicate if needed
        const uniqueChildren = Array.from(new Map(allChildren.map(c => [c.id, c])).values());
        setAvailableChildren(uniqueChildren);
      } catch (error) {
        console.error("Failed to load children:", error);
      }
    };
    loadChildren();
  }, [rooms]);

  // Fetch existing snapshot if editing
  useEffect(() => {
    const loadSnapshot = async () => {
      if (!isEdit || !id) return;
      try {
        // Since list API returns all details, we can find it there or fetch details if there was a detail API
        // For now finding in list as provided in user request
        const res = await snapshotService.getAllSnapshots(activeCentreId);
        const item = res.snapshots?.find(s => String(s.id) === String(id));
        if (item) {
          setTitle(item.title.replace(/<[^>]*>/g, ""));
          setDetails(item.about.replace(/<[^>]*>/g, ""));
          setRooms((item.rooms || []).map(r => r.id));
          setStaff((item.educators || "").split(",").filter(Boolean));
          setChildren((item.children || []).map(c => c.childid));
          setExistingMedia(item.media || []);
        }
      } catch (error) {
        console.error("Failed to load snapshot:", error);
      }
    };
    loadSnapshot();
  }, [isEdit, id, activeCentreId]);

  const handleSave = async (status) => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    setIsLoading(true);
    const formData = new FormData();
    if (isEdit) formData.append("id", id);
    formData.append("center_id", activeCentreId);
    formData.append("selected_rooms", rooms.join(","));
    formData.append("title", title);
    formData.append("selected_children", children.join(","));
    formData.append("selected_staff", staff.join(","));
    formData.append("about", details);
    formData.append("status", status === "published" ? "Published" : "Draft");

    // Add new media files
    media.forEach((m) => {
      if (m.file) {
        formData.append("media[]", m.file);
      }
    });

    try {
      const res = await snapshotService.storeSnapshot(formData);
      if (res.status) {
        toast.success(isEdit ? "Snapshot updated" : "Snapshot created");
        navigate("/snapshots");
      } else {
        toast.error(res.message || "Failed to save snapshot");
      }
    } catch (error) {
      console.error("Save error:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const remaining = 10 - media.length;
    if (remaining <= 0) {
      toast.error("Maximum 10 files allowed");
      return;
    }
    const accepted = files.slice(0, remaining).filter((f) =>
      f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    const newOnes = accepted.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(f),
      name: f.name,
      type: f.type.startsWith("video/") ? "video" : "image",
      file: f,
    }));
    setMedia((prev) => [...prev, ...newOnes]);
  };

  const removeMedia = (mid) => {
    setMedia((prev) => prev.filter((m) => m.id !== mid));
  };

  return (
    <div>
      {/* Top header strip */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => navigate("/snapshots")}>
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
          </Button>
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link to="/snapshots" className="hover:text-foreground">Snapshots</Link>
            <span>/</span>
            <span className="text-foreground">{isEdit ? "Edit" : "Store"}</span>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => handleSave("published")} className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="mr-1.5 h-4 w-4" /> Publish Now
          </Button>
          <Button onClick={() => handleSave("draft")} className="bg-amber-500 text-amber-950 hover:bg-amber-600">
            <FileText className="mr-1.5 h-4 w-4" /> Make Draft
          </Button>
        </div>
      </div>

      {/* Snapshots banner */}
      <div className="mb-6 rounded-xl bg-emerald-500/80 px-6 py-4 text-center text-white">
        <h2 className="inline-flex items-center gap-2 text-base font-bold">
          <Camera className="h-4 w-4" /> Snapshots
        </h2>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <ChipPickerField
          label="Rooms"
          values={rooms.map((rid) => availableRooms.find((r) => String(r.id) === String(rid))?.name || rid)}
          onAdd={() => setPicker("rooms")}
          onRemove={(idx) => setRooms((p) => p.filter((_, i) => i !== idx))}
          chipClass="bg-emerald-500 text-white"
          buttonClass="border-emerald-500 text-emerald-600"
        />
        <ChipPickerField
          label="Children"
          values={children.map((cid) => availableChildren.find((c) => String(c.id) === String(cid))?.name || cid)}
          onAdd={() => setPicker("children")}
          onRemove={(idx) => setChildren((p) => p.filter((_, i) => i !== idx))}
          chipClass="bg-sky-500 text-white"
          buttonClass="border-sky-500 text-sky-600"
        />
      </div>

      {/* Staff */}
      <div className="mb-6">
        <ChipPickerField
          label="Educators"
          values={staff.map(sid => availableStaff.find(s => String(s.staffid) === String(sid))?.name || sid)}
          onAdd={() => setPicker("staff")}
          onRemove={(idx) => setStaff((p) => p.filter((_, i) => i !== idx))}
          chipClass="bg-rose-400 text-white"
          buttonClass="border-rose-500 text-rose-600"
        />
      </div>

      {/* Title / Details */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormBlock label="Snapshot Title">
          <Textarea
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={3}
            maxLength={50}
          />
          <div className="text-xs text-muted-foreground">{title.length} / 50 characters</div>
          <RefineButton />
        </FormBlock>
        <FormBlock label="Snapshot Details">
          <Textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={3}
            maxLength={50}
          />
          <div className="text-xs text-muted-foreground">{details.length} / 50 characters</div>
          <RefineButton />
        </FormBlock>
      </div>

      {/* Media */}
      <div className="mb-6">
        <div className="rounded-xl bg-emerald-500/80 px-5 py-3 text-white">
          <h3 className="text-base font-bold">Media Upload Section</h3>
        </div>
        <div className="rounded-b-xl border border-t-0 border-border bg-card p-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFiles(e.dataTransfer.files);
            }}
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-emerald-500/40 bg-muted/20 px-6 py-10"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />
            <Button
              variant="outline"
              className="border-emerald-500/40 text-emerald-700"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-1.5 h-4 w-4" /> Select up to 10 Images/Videos
            </Button>
            <p className="mt-2 text-xs text-muted-foreground">
              Only images and videos are allowed. Max 10 files.
            </p>
          </div>

          { (existingMedia.length > 0 || media.length > 0) && (
            <div className="mt-6">
              <h4 className="mb-3 text-sm font-semibold text-foreground">
                Images/Videos ({existingMedia.length + media.length}/10)
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {existingMedia.map((m) => (
                  <div key={m.id} className="group relative overflow-hidden rounded-lg border border-border bg-muted/30">
                    <div className="aspect-video w-full">
                      <img 
                        src={`https://mydiaree.com.au/${m.mediaUrl}`} 
                        alt="existing" 
                        className="h-full w-full object-cover" 
                      />
                    </div>
                  </div>
                ))}
                {media.map((m) => (
                  <div
                    key={m.id}
                    className="group relative overflow-hidden rounded-lg border border-border bg-muted/30"
                  >
                    <div className="aspect-video w-full">
                      {m.type === "video" ? (
                        <video
                          src={m.url}
                          className="h-full w-full object-cover"
                          controls
                        />
                      ) : (
                        <img
                          src={m.url}
                          alt={m.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedia(m.id)}
                      className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-rose-500 px-2 py-1 text-[10px] font-bold text-white opacity-90 hover:bg-rose-600"
                    >
                      <X className="h-3 w-3" /> Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => handleSave("draft")} 
            className="bg-slate-700 text-white hover:bg-slate-800"
            disabled={isLoading}
          >
            <FileText className="mr-1.5 h-4 w-4" /> {isLoading ? "Saving..." : "Make Draft"}
          </Button>
          <Button 
            onClick={() => handleSave("published")} 
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading}
          >
            <Save className="mr-1.5 h-4 w-4" /> {isLoading ? "Publishing..." : "Publish Now"}
          </Button>
        </div>
        <Button 
          onClick={() => handleSave("draft")} 
          className="bg-emerald-600 hover:bg-emerald-700"
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Submit"} <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>

      {picker && (
        <PickerModal
          title={
            picker === "rooms" ? "Select Rooms" :
            picker === "children" ? "Select Children" : "Select Educators"
          }
          options={
            picker === "rooms"
              ? availableRooms.map((r) => ({ value: r.id, label: r.name }))
              : picker === "children"
              ? availableChildren.map((c) => ({ value: c.id, label: c.name }))
              : availableStaff.map((s) => ({ value: s.staffid, label: s.name }))
          }
          selected={
            picker === "rooms" ? rooms :
            picker === "children" ? children : staff
          }
          onClose={() => setPicker(null)}
          onSave={(vals) => {
            if (picker === "rooms") setRooms(vals);
            else if (picker === "children") setChildren(vals);
            else setStaff(vals);
            setPicker(null);
          }}
        />
      )}
    </div>
  );
}

function FormBlock({ label, children }) {
  return (
    <div>
      <h4 className="mb-1.5 text-sm font-bold text-emerald-600">{label}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function RefineButton() {
  return (
    <div className="flex justify-end">
      <Button
        size="sm"
        className="bg-sky-500 text-white hover:bg-sky-600"
        onClick={() => toast.info("AI refinement coming soon")}
      >
        <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Refine with Ai
      </Button>
    </div>
  );
}

function ChipPickerField({ label, values, onAdd, onRemove, chipClass, buttonClass }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-emerald-600">{label}</h3>
      <div className="rounded-lg border border-border bg-card p-4">
        <button
          onClick={onAdd}
          className={`mb-3 inline-flex items-center gap-1.5 rounded-md border-2 px-4 py-2 text-sm font-semibold ${buttonClass}`}
        >
          Select {label}
        </button>
        {values.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.map((v, i) => (
              <span
                key={i}
                className={`inline-flex items-center gap-1.5 rounded px-3 py-1 text-xs font-bold uppercase ${chipClass}`}
              >
                {v}
                <button onClick={() => onRemove(i)}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PickerModal({ title, options, selected, onClose, onSave }) {
  const [chosen, setChosen] = useState(new Set(selected));
  const toggle = (v) => {
    setChosen((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v); else next.add(v);
      return next;
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4">
          <div className="space-y-1">
            {options.map((o) => {
              const checked = chosen.has(o.value);
              return (
                <label
                  key={o.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                    checked ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(o.value)}
                    className="accent-emerald-500"
                  />
                  <span className="text-foreground">{o.label}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(Array.from(chosen))} className="bg-emerald-600 hover:bg-emerald-700">
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
