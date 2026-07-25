//frontend-admin/src/services/config.js
export const API_BASE =
  import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export const MEDIA_CDN =
  import.meta.env.VITE_MEDIA_CDN || "http://127.0.0.1:8000/media";

export const FALLBACK_IMAGE = `${MEDIA_CDN}/fallback.png`;