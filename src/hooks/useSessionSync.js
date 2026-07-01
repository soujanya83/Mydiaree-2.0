import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const CHANNEL_NAME = "mydiaree-auth";

/**
 * useSessionSync — Keeps auth state in sync across browser tabs.
 *
 * Problem it solves:
 *   User A is logged in on Tab 1. User B opens Tab 2, logs out User A,
 *   and logs in as themselves. When User A switches back to Tab 1,
 *   the old session is still alive in Zustand memory even though
 *   localStorage now has User B's token.
 *
 * How it works:
 *   1. BroadcastChannel — on login/logout, the active tab sends a message
 *      to all other same-origin tabs instantly.
 *   2. `storage` event — fires when localStorage is modified from another tab
 *      (fallback for browsers without BroadcastChannel support).
 *   3. `visibilitychange` — when a tab regains focus, it cross-checks its
 *      in-memory sessionId against what's in localStorage. Mismatch = force logout.
 */
export function useSessionSync() {
  const navigate = useNavigate();
  const channelRef = useRef(null);

  useEffect(() => {
    // ── BroadcastChannel listener ──────────────────────────────────
    let channel = null;
    try {
      channel = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = channel;

      channel.onmessage = (event) => {
        const { type } = event.data || {};

        if (type === "LOGOUT") {
          // Another tab logged out — force this tab to log out too
          forceLogoutThisTab();
        }

        if (type === "LOGIN") {
          // Another tab logged in (possibly a different user)
          // Force this tab to re-sync: if this tab was logged in as a
          // different user, it must log out and redirect to login.
          handleRemoteLogin();
        }
      };
    } catch {
      // BroadcastChannel not supported — storage event is the fallback
    }

    // ── `storage` event listener (cross-tab fallback) ─────────────
    const onStorageChange = (e) => {
      if (e.key === "token") {
        if (e.newValue === null) {
          // Token was removed — another tab logged out
          forceLogoutThisTab();
        } else if (e.oldValue !== e.newValue) {
          // Token changed — another tab logged in (possibly different user)
          handleRemoteLogin();
        }
      }

      if (e.key === "sessionId") {
        // Session ID changed in another tab — verify we still match
        const mySessionId = useAuthStore.getState().sessionId;
        if (mySessionId && e.newValue !== mySessionId) {
          forceLogoutThisTab();
        }
      }
    };
    window.addEventListener("storage", onStorageChange);

    // ── Visibility change (when user switches back to a stale tab) ─
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkSessionValidity();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // ── Cleanup ───────────────────────────────────────────────────
    return () => {
      if (channel) {
        channel.close();
        channelRef.current = null;
      }
      window.removeEventListener("storage", onStorageChange);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  /**
   * When this tab regains focus, verify that the in-memory session still
   * matches what's in localStorage. If it doesn't, force logout.
   */
  function checkSessionValidity() {
    const state = useAuthStore.getState();
    const storedSessionId = localStorage.getItem("sessionId");
    const storedToken = localStorage.getItem("token");

    // Case 1: This tab thinks it's logged in, but localStorage is cleared
    if (state.isAuthenticated && !storedToken) {
      forceLogoutThisTab();
      return;
    }

    // Case 2: This tab's sessionId doesn't match localStorage's sessionId
    // → another user logged in from a different tab
    if (state.isAuthenticated && state.sessionId && storedSessionId !== state.sessionId) {
      forceLogoutThisTab();
      return;
    }

    // Case 3: Token in localStorage changed (another user logged in)
    if (state.isAuthenticated && storedToken && storedToken !== state.token) {
      forceLogoutThisTab();
      return;
    }
  }

  /**
   * Another tab logged in — if this tab is authenticated as a different
   * user, we need to force it out.
   */
  function handleRemoteLogin() {
    const state = useAuthStore.getState();
    if (!state.isAuthenticated) return; // not logged in here, nothing to do

    const storedSessionId = localStorage.getItem("sessionId");

    // If this tab's session doesn't match the new one, force logout
    if (state.sessionId !== storedSessionId) {
      forceLogoutThisTab();
    }
  }

  /**
   * Clear this tab's Zustand state (without touching localStorage —
   * the other tab already wrote the correct values there) and redirect
   * to the login page.
   */
  function forceLogoutThisTab() {
    const state = useAuthStore.getState();
    // Only act if this tab still thinks it's authenticated
    if (!state.isAuthenticated) return;

    // Clear Zustand state WITHOUT clearing localStorage
    // (the other tab has already set the correct values)
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      userPermissions: null,
      permissionsLoading: false,
      sessionId: null,
    });

    navigate("/login", { replace: true });
  }
}

/**
 * Broadcast a session event to all other tabs.
 * Called from authStore on login/logout.
 */
export function broadcastSessionEvent(type) {
  try {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type });
    // Close after sending — we don't need to keep this instance alive
    // (the listener instance in the hook stays open)
    channel.close();
  } catch {
    // BroadcastChannel not supported — storage event will handle it
  }
}
