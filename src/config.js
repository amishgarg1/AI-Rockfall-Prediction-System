/* Where the Flask service lives.

   These URLs used to be hardcoded as http://127.0.0.1:5000 in four components.
   That address means "this machine" *to the browser running the page* — so on a
   deployed site every visitor's browser would try to reach a Flask service on
   their own laptop, and every request would fail.

   Set VITE_API_URL to the Render URL when building for production. Vite inlines
   the value at build time, so it has to be present in the build environment
   (Vercel's project settings), not just at runtime. */
export const API_BASE = (
  import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000'
).replace(/\/$/, '');

export const apiUrl = (path) => `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
