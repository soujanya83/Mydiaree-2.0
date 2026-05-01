// Lightweight API client wrapper. Swap to axios/fetch as needed.
export const USE_MOCKS = true;

const BASE_URL = "/api";

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  const data = await res.json().catch(() => ({}));
  return { data };
}

export const apiClient = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  put: (path, body) => request("PUT", path, body),
  delete: (path) => request("DELETE", path),
};