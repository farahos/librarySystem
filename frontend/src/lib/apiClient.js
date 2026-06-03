import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function api(path, options = {}) {
  const method = options.method || "GET";
  const { data } = await apiClient.request({
    url: path.replace(/^\/api\/v1/, ""),
    method,
    data: options.body ? JSON.parse(options.body) : options.data,
    params: options.params,
  });
  return data;
}

const madalLogoSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <defs>
    <linearGradient id="madalBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ff6a00"/>
      <stop offset="0.48" stop-color="#ff4b00"/>
      <stop offset="1" stop-color="#b81200"/>
    </linearGradient>
    <filter id="texture">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="7"/>
      <feColorMatrix type="saturate" values="0"/>
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.16"/>
      </feComponentTransfer>
    </filter>
  </defs>
  <rect width="900" height="900" fill="url(#madalBg)"/>
  <rect width="900" height="900" filter="url(#texture)" opacity="0.8"/>
  <g fill="#fff" transform="translate(95 205)">
    <path d="M54 381c-32-46-18-98 25-127 20-14 48-8 61 14l72 125c12 20 39 26 58 12l42-30-78 128c-27 45-91 47-122 5L54 381Z"/>
    <path d="M255 89c28-50 101-49 128 2l158 302c13 25 47 26 62 3l30-47-68 158c-26 61-111 63-140 3L229 106l-41 31c-15 11-36-5-27-22 19-35 46-67 94-26Z"/>
    <path d="M485 89c28-50 101-49 128 2l158 302c13 25 47 26 62 3l30-47-68 158c-26 61-111 63-140 3L459 106l-41 31c-15 11-36-5-27-22 19-35 46-67 94-26Z"/>
  </g>
</svg>`;

export const madalLogo = "/madal-logo.svg";

const madalFallbackCoverSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1350" viewBox="0 0 900 1350">
  <rect width="900" height="1350" fill="#fff7ed"/>
  <image href="${`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(madalLogoSvg)}`}" x="0" y="0" width="900" height="900" preserveAspectRatio="xMidYMin slice"/>
  <rect x="0" y="900" width="900" height="450" fill="#ffffff"/>
  <text x="450" y="1045" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="92" font-weight="900" fill="#111827">Madal</text>
  <text x="450" y="1122" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" letter-spacing="6" fill="#fb4b00">SHEEKO SOMALI</text>
  <text x="450" y="1215" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#6b7280">No cover uploaded</text>
</svg>`;

export const fallbackCover = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(madalFallbackCoverSvg)}`;

export function storyAuthor(story) {
  return story?.authorId?.displayName || story?.authorId?.username || story?.writerName || "Madal writer";
}

export function authorUsername(authorOrStory) {
  const author = authorOrStory?.authorId || authorOrStory;
  return author?.username || authorOrStory?.username || "";
}

export function authorProfilePath(authorOrStory) {
  const username = authorUsername(authorOrStory);
  return username ? `/user/${username}` : "/Books";
}

export function storyCover(story) {
  return story?.coverUrl || fallbackCover;
}

export function storySummary(story) {
  return story?.description || "A Somali story from the Madal community.";
}

export function hasRole(user, role) {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}

export function formatCount(value = 0) {
  const number = Number(value) || 0;
  if (number >= 1_000_000_000) return `${(number / 1_000_000_000).toFixed(number >= 10_000_000_000 ? 0 : 1).replace(/\.0$/, "")}B`;
  if (number >= 1_000_000) return `${(number / 1_000_000).toFixed(number >= 10_000_000 ? 0 : 1).replace(/\.0$/, "")}M`;
  if (number >= 1_000) return `${(number / 1_000).toFixed(number >= 10_000 ? 0 : 1).replace(/\.0$/, "")}K`;
  return String(number);
}
