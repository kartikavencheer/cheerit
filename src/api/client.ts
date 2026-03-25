import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.cheerit.com/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cheerit_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types for API responses
export interface Match {
  id: string;
  teamA: { name: string; logo: string };
  teamB: { name: string; logo: string };
  status: 'live' | 'upcoming' | 'completed';
  score?: string;
  startTime: string;
}

type EventStatusFilter = 'upcoming' | 'scheduled' | 'live' | 'completed' | 'cancelled';

interface ApiEventListResponse {
  data: ApiEvent[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface ApiEvent {
  event_id: string;
  event_name?: string | null;
  event_short_name?: string | null;
  start_time?: string | null;
  eventstatus_id?: number | null;
  eventstatus?: { name?: string | null } | null;
  event_image_url?: string | null;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
}

export interface Video {
  id: string;
  matchName: string;
  timestamp: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface PlayedScene {
  id: string;
  matchName: string;
  sceneName: string;
  timestamp: string;
  thumbnailUrl: string;
}

const EVENT_STATUS_ID: Record<EventStatusFilter, number> = {
  upcoming: 1,
  scheduled: 2,
  live: 3,
  completed: 4,
  cancelled: 5,
};

const parseCheeritDateTime = (input?: string | null): Date => {
  if (!input) return new Date(0);
  const match = input.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) return new Date(input);
  const [, dd, mm, yyyy, hh, min, meridiem] = match;
  let hours = Number(hh);
  const minutes = Number(min);
  const isPm = meridiem.toLowerCase() === 'pm';
  if (hours === 12) hours = 0;
  if (isPm) hours += 12;
  return new Date(Number(yyyy), Number(mm) - 1, Number(dd), hours, minutes, 0, 0);
};

const splitTeamsFromName = (eventName?: string | null, shortName?: string | null): { a: string; b: string } => {
  const raw = (eventName ?? '').trim() || (shortName ?? '').trim();
  const parts = raw.split(/\s+vs\s+/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { a: parts[0], b: parts[1] };
  if (raw) return { a: raw, b: 'TBD' };
  return { a: 'TBD', b: 'TBD' };
};

const svgDataUriForTeam = (teamName: string) => {
  const initials = teamName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'T';

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ff6a00" stop-opacity="0.9"/>
          <stop offset="1" stop-color="#7c3aed" stop-opacity="0.9"/>
        </linearGradient>
      </defs>
      <rect width="160" height="160" rx="28" fill="url(#g)"/>
      <text x="80" y="92" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="64" font-weight="800" fill="white">${initials}</text>
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const toMatch = (event: ApiEvent): Match => {
  const teams = splitTeamsFromName(event.event_name, event.event_short_name);
  const start = parseCheeritDateTime(event.start_time);

  const statusName = (event.eventstatus?.name ?? '').toLowerCase().trim();
  const mappedStatus: Match['status'] =
    statusName === 'live' || event.eventstatus_id === EVENT_STATUS_ID.live
      ? 'live'
      : statusName === 'completed' || event.eventstatus_id === EVENT_STATUS_ID.completed
        ? 'completed'
        : 'upcoming';

  return {
    id: event.event_id,
    teamA: { name: teams.a, logo: event.event_image_url || svgDataUriForTeam(teams.a) },
    teamB: { name: teams.b, logo: event.event_image_url || svgDataUriForTeam(teams.b) },
    status: mappedStatus,
    startTime: start.toISOString(),
  };
};

export const getEventList = async (status?: EventStatusFilter) => {
  const eventstatus_id = status ? EVENT_STATUS_ID[status] : undefined;

  const { data } = await apiClient.get<ApiEventListResponse | ApiEvent[]>('/events', {
    params: eventstatus_id ? { eventstatus_id } : undefined,
  });

  const events = Array.isArray(data) ? data : data.data;
  const matches = events.map(toMatch);

  if (status === 'upcoming' || status === 'scheduled') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return matches.filter((match) => {
      const start = new Date(match.startTime);
      return Number.isFinite(start.getTime()) && start.getTime() >= startOfToday.getTime();
    });
  }

  return matches;
};
