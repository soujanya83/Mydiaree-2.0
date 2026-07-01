import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Auto-save hook that debounces save calls and tracks per-field save status.
 *
 * @param {Object} options
 * @param {string|number|null} options.reflectionId  – The reflection ID (must be set before saves fire)
 * @param {(id: string|number, formData: FormData) => Promise<any>} options.saveFn – Async function that persists data
 * @param {number} [options.debounceMs=1500]        – Debounce delay for text fields
 * @param {number} [options.savedDisplayMs=2500]     – How long "Saved" status stays visible
 *
 * @returns {{
 *   fieldStatus: Record<string, 'idle'|'saving'|'saved'|'error'>,
 *   triggerAutoSave: (fieldKey: string, buildFormData: () => FormData) => void,
 *   triggerImmediateSave: (fieldKey: string, buildFormData: () => FormData) => void,
 *   cancelPendingSaves: () => void,
 * }}
 */
export function useAutoSave({
  reflectionId,
  saveFn,
  debounceMs = 1500,
  savedDisplayMs = 2500,
}) {
  const [fieldStatus, setFieldStatus] = useState({});
  const timersRef = useRef({}); // debounce timers keyed by fieldKey
  const savedTimersRef = useRef({}); // "saved" → "idle" timers
  const abortControllersRef = useRef({}); // in-flight request cancellation
  const mountedRef = useRef(true);

  // Keep saveFn and reflectionId fresh without re-creating callbacks
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;
  const idRef = useRef(reflectionId);
  idRef.current = reflectionId;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cleanup all timers
      Object.values(timersRef.current).forEach(clearTimeout);
      Object.values(savedTimersRef.current).forEach(clearTimeout);
      Object.values(abortControllersRef.current).forEach((ac) => ac.abort());
    };
  }, []);

  const setStatus = useCallback((key, status) => {
    if (!mountedRef.current) return;
    setFieldStatus((prev) => ({ ...prev, [key]: status }));
  }, []);

  const executeSave = useCallback(
    async (fieldKey, buildFormData) => {
      const currentId = idRef.current;
      if (!currentId) return;

      // Cancel any existing in-flight request for this field
      if (abortControllersRef.current[fieldKey]) {
        abortControllersRef.current[fieldKey].abort();
      }

      const controller = new AbortController();
      abortControllersRef.current[fieldKey] = controller;

      setStatus(fieldKey, "saving");

      try {
        const formData = buildFormData();
        await saveFnRef.current(currentId, formData);

        if (!mountedRef.current || controller.signal.aborted) return;

        setStatus(fieldKey, "saved");

        // Clear any existing "saved" display timer
        if (savedTimersRef.current[fieldKey]) {
          clearTimeout(savedTimersRef.current[fieldKey]);
        }
        savedTimersRef.current[fieldKey] = setTimeout(() => {
          setStatus(fieldKey, "idle");
        }, savedDisplayMs);
      } catch (error) {
        if (controller.signal.aborted || !mountedRef.current) return;
        console.error(`Auto-save failed for field "${fieldKey}":`, error);
        setStatus(fieldKey, "error");
      } finally {
        if (abortControllersRef.current[fieldKey] === controller) {
          delete abortControllersRef.current[fieldKey];
        }
      }
    },
    [setStatus, savedDisplayMs],
  );

  /**
   * Debounced auto-save — best for text fields.
   * Resets the timer on each call; only fires after `debounceMs` of inactivity.
   */
  const triggerAutoSave = useCallback(
    (fieldKey, buildFormData) => {
      // Clear previous timer for this field
      if (timersRef.current[fieldKey]) {
        clearTimeout(timersRef.current[fieldKey]);
      }
      timersRef.current[fieldKey] = setTimeout(() => {
        delete timersRef.current[fieldKey];
        executeSave(fieldKey, buildFormData);
      }, debounceMs);
    },
    [debounceMs, executeSave],
  );

  /**
   * Immediate auto-save — best for selection changes, media uploads, etc.
   * Cancels any pending debounce and fires right away.
   */
  const triggerImmediateSave = useCallback(
    (fieldKey, buildFormData) => {
      // Cancel any pending debounce
      if (timersRef.current[fieldKey]) {
        clearTimeout(timersRef.current[fieldKey]);
        delete timersRef.current[fieldKey];
      }
      executeSave(fieldKey, buildFormData);
    },
    [executeSave],
  );

  /**
   * Cancel all pending saves (useful when navigating away).
   */
  const cancelPendingSaves = useCallback(() => {
    Object.values(timersRef.current).forEach(clearTimeout);
    timersRef.current = {};
    Object.values(abortControllersRef.current).forEach((ac) => ac.abort());
    abortControllersRef.current = {};
  }, []);

  return {
    fieldStatus,
    triggerAutoSave,
    triggerImmediateSave,
    cancelPendingSaves,
  };
}
