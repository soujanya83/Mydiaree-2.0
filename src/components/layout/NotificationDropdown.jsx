import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Megaphone, Check, Loader2, InboxIcon, CheckCheck } from "lucide-react";
import { notificationService } from "@/services/notificationService";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30)
    return date.toLocaleDateString("en-AU", { day: "2-digit", month: "short", year: "numeric" });
  if (diffDay >= 1) return `${diffDay}d ago`;
  if (diffHour >= 1) return `${diffHour}h ago`;
  if (diffMin >= 1) return `${diffMin}m ago`;
  return "Just now";
}

function resolveIcon(iconClass) {
  if (!iconClass) return Bell;
  if (iconClass.includes("bullhorn") || iconClass.includes("megaphone")) return Megaphone;
  return Bell;
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const ref = useRef(null);

  // Fetch on mount for badge count
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await notificationService.getNotifications();
        if (res.success) setNotifications(res.notifications || []);
      } catch {
        // silently ignore — never break the header
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;
  const badge = unreadCount > 99 ? "99+" : String(unreadCount);

  const handleNotificationClick = async (notification) => {
    if (!notification.url) return;

    // Mark as read if unread
    if (!notification.read_at) {
      try {
        await notificationService.markAsRead(notification.id);
        // Update local state to mark as read
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n
          )
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Navigate to the URL
    setOpen(false);
    navigate(notification.url);
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAll(true);
    try {
      await notificationService.markAllAsRead();
      // Update local state to mark all as read
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Failed to mark all as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold leading-none text-white shadow">
            {badge}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Panel header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold text-foreground">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                  {unreadCount} unread
                </span>
              )}
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAll}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted disabled:opacity-50"
                >
                  {isMarkingAll ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <CheckCheck className="h-3 w-3" />
                  )}
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <InboxIcon className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            )}

            {!isLoading &&
              notifications.map((n) => {
                const Icon = resolveIcon(n.icon);
                const isUnread = !n.read_at;
                const hasLink = Boolean(n.url && n.url !== "#");

                return (
                  <div
                    key={n.id}
                    onClick={() => hasLink && handleNotificationClick(n)}
                    className={cn(
                      "flex items-start gap-3 border-b border-border/50 px-4 py-3 transition-colors last:border-0",
                      hasLink ? "cursor-pointer hover:bg-muted/60" : "cursor-default",
                      isUnread ? "bg-primary/5" : "",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        isUnread ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-sm leading-snug",
                            isUnread ? "font-semibold text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {n.title}
                        </p>
                        {hasLink && (
                          <Check className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground/50" />
                        )}
                      </div>
                      {n.objective && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {n.objective}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground/70">
                        {formatRelativeTime(n.created_at)}
                      </p>
                    </div>

                    {isUnread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
