import { useState, useEffect, useCallback, useRef } from "react";
import { X, Send, Loader2, User } from "lucide-react";
import { observationService } from "@/services/learning/observationService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function ObservationCommentModal({ open, onClose, observationId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  const fetchComments = useCallback(async () => {
    if (!observationId) return;
    setIsLoading(true);
    try {
      const res = await observationService.getComments(observationId);
      if (res.status) {
        setComments(res.comments || []);
      }
    } catch (error) {
      toast.error("Failed to load comments");
    } finally {
      setIsLoading(false);
    }
  }, [observationId]);

  useEffect(() => {
    if (open && observationId) {
      fetchComments();
    }
  }, [open, observationId, fetchComments]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSend = async () => {
    if (!newComment.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await observationService.saveComment(observationId, newComment);
      if (res.status) {
        setNewComment("");
        // Optimistically add or just re-fetch
        fetchComments();
      } else {
        toast.error(res.message || "Failed to send comment");
      }
    } catch (error) {
      toast.error("Error sending comment");
    } finally {
      setIsSending(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-[#1e293b]">Comments</h2>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div 
          ref={scrollRef}
          className="h-[350px] overflow-y-auto bg-gray-50/50 p-6 space-y-4"
        >
          {isLoading && comments.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#0084ff] opacity-40" />
              <p className="text-sm text-gray-400">Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center opacity-40">
              <MessageCircle className="h-12 w-12 mb-2" />
              <p className="text-sm font-medium">No comments yet</p>
            </div>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="flex flex-col items-end">
                <div className="max-w-[85%] rounded-2xl rounded-tr-none bg-[#0084ff] px-4 py-3 text-white shadow-sm">
                  <p className="text-sm leading-relaxed">{c.comments}</p>
                </div>
                <div className="mt-1 flex items-center gap-1.5 px-1">
                  <span className="text-[11px] font-medium text-gray-500">{c.user?.name || "User"}</span>
                  <span className="text-[10px] text-gray-400">•</span>
                  <span className="text-[10px] text-gray-400">
                    {c.created_at ? new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "just now"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-white p-4">
          <div className="flex items-center gap-2 rounded-xl bg-gray-100/80 px-3 py-2 transition-within:bg-gray-100">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="h-10 border-none bg-transparent shadow-none focus-visible:ring-0 text-sm placeholder:text-gray-400"
            />
            <Button
              onClick={handleSend}
              disabled={!newComment.trim() || isSending}
              className="h-10 px-6 bg-[#0084ff] hover:bg-[#0073e6] text-white font-bold rounded-lg transition-all"
            >
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageCircle({ className }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  );
}
