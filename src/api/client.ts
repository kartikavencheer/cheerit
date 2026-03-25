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
  createdAt?: string;
}

export interface Video {
  id: string;
  matchName: string;
  timestamp: string;
  thumbnailUrl: string;
  videoUrl: string;
  status?: 'approved' | 'rejected' | 'pending' | 'played';
  eventId?: string;
}

export interface PlayedScene {
  id: string;
  matchName: string;
  sceneName: string;
  timestamp: string;
  thumbnailUrl: string;
}

type ApiWrapped<T> = { data: T } | T;

type ApiLibraryItem = {
  id?: string | number | null;
  submission_id?: string | number | null;
  submissionId?: string | number | null;
  matchName?: string | null;
  match_name?: string | null;
  event_name?: string | null;
  event_id?: string | null;
  event?: { event_name?: string | null } | null;
  timestamp?: string | null;
  created_at?: string | null;
  approved_at?: string | null;
  rejected_at?: string | null;
  status?: string | null;
  approval_status?: string | null;
  submission_status?: string | null;
  is_played?: boolean | null;
  is_approved?: boolean | null;
  is_rejected?: boolean | null;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
  thumbnail?: string | null;
  thumb_url?: string | null;
  thumbUrl?: string | null;
  videoUrl?: string | null;
  media_url?: string | null;
  mediaUrl?: string | null;
  video_url?: string | null;
  file_url?: string | null;
  fileUrl?: string | null;
  url?: string | null;
  signed_url?: string | null;
  signedUrl?: string | null;
};

const toVideo = (item: ApiLibraryItem): Video => {
  const id = String(item.submission_id ?? item.submissionId ?? item.id ?? '');
  const matchName = String(item.matchName ?? item.match_name ?? item.event_name ?? item.event?.event_name ?? 'Match');
  const rawTimestamp = String(item.timestamp ?? item.created_at ?? item.approved_at ?? '');
  const parsed = parseCheeritDateTime(rawTimestamp);
  const timestamp = Number.isFinite(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
  const thumbnailUrl = String(item.thumbnailUrl ?? item.thumbnail_url ?? item.thumbnail ?? item.thumb_url ?? item.thumbUrl ?? '');
  const videoUrl = String(
    item.videoUrl ??
      item.video_url ??
      item.media_url ??
      item.mediaUrl ??
      item.file_url ??
      item.fileUrl ??
      item.signed_url ??
      item.signedUrl ??
      item.url ??
      ''
  );
  const eventId = item.event_id ?? undefined;

  const statusRaw = String(item.approval_status ?? item.status ?? '').toLowerCase().trim();
  const submissionStatusRaw = String(item.submission_status ?? '').toLowerCase().trim();
  const status: Video['status'] =
    item.is_played === true || statusRaw.includes('played') || submissionStatusRaw.includes('played')
      ? 'played'
      : item.is_rejected === true || !!item.rejected_at || statusRaw.includes('reject') || submissionStatusRaw.includes('reject')
      ? 'rejected'
      : item.is_approved === true || !!item.approved_at || statusRaw.includes('approve') || submissionStatusRaw.includes('approve')
        ? 'approved'
        : 'pending';

  return { id, matchName, timestamp, thumbnailUrl, videoUrl, status, eventId };
};

const apiOriginFromApiUrl = () => {
  try {
    const url = new URL(API_URL);
    url.pathname = url.pathname.replace(/\/api\/?$/, '/');
    return url.toString();
  } catch {
    return 'https://api.cheerit.com/';
  }
};

const toAbsoluteUrl = (maybeUrl?: string | null) => {
  if (!maybeUrl) return '';
  if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl;
  try {
    return new URL(maybeUrl, apiOriginFromApiUrl()).toString();
  } catch {
    return maybeUrl;
  }
};

export type SceneTile = {
  tileId: string;
  submissionId: string;
  submissionStatus?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  isUser?: boolean;
};

export type PlayedSceneGrid = {
  sceneId: string;
  eventId: string;
  sceneName: string;
  status?: string;
  createdAt: string;
  totalPanels: number;
  thumbnailUrl: string;
  matchName?: string;
  tiles: SceneTile[];
};

type ApiMosaicScene = {
  scene_id: string;
  name?: string | null;
  status?: string | null;
  created_at?: string | null;
  thumbnail?: string | null;
  screen_layout?: { total_panels?: number | null } | null;
  submissions?: {
    tile_id: string;
    submission_id: string;
    submission_status?: string | null;
    thumbnail_url?: string | null;
    thumbnail?: string | null;
    media_url?: string | null;
    mediaUrl?: string | null;
    video_url?: string | null;
    videoUrl?: string | null;
    url?: string | null;
  }[] | null;
};

export const getMosaicScenes = async (eventId: string) => {
  const { data } = await apiClient.get<any>(`/mosaic/scene/${eventId}`);
  const scenes = (Array.isArray(data) ? data : Array.isArray(data?.value) ? data.value : []) as ApiMosaicScene[];
  return scenes;
};

export const getEventSubmissions = async (eventId: string) => {
  const { data } = await apiClient.get<any>('/submissions/cheers', { params: { eventId } });
  const items = extractArray(data) as ApiLibraryItem[];
  return items.map(toVideo).filter((v) => v.id);
};

export const getPlayedSceneGridsForUser = async (userId: string) => {
  // Load all user submissions (up to a safe cap) to discover eventIds and map submission -> thumbnails.
  const pageSize = 200;
  const maxPages = 50;
  const allVideos: Video[] = [];
  for (let page = 1; page <= maxPages; page++) {
    const { items } = await getVideosPage(userId, page, pageSize);
    allVideos.push(...items);
    if (items.length < pageSize) break;
  }

  const byEvent = new Map<
    string,
    {
      matchName?: string;
      submissionIds: Set<string>;
      thumbsBySubmission: Map<string, string>;
      statusBySubmission: Map<string, Video['status']>;
    }
  >();

  for (const v of allVideos) {
    if (!v.eventId) continue;
    const entry = byEvent.get(v.eventId) ?? {
      matchName: v.matchName,
      submissionIds: new Set<string>(),
      thumbsBySubmission: new Map<string, string>(),
      statusBySubmission: new Map<string, Video['status']>(),
    };
    if (!entry.matchName && v.matchName) entry.matchName = v.matchName;
    entry.submissionIds.add(v.id);
    if (v.thumbnailUrl) entry.thumbsBySubmission.set(v.id, v.thumbnailUrl);
    entry.statusBySubmission.set(v.id, v.status);
    byEvent.set(v.eventId, entry);
  }

  const results: PlayedSceneGrid[] = [];
  for (const [eventId, entry] of byEvent.entries()) {
    const [scenes, eventSubs] = await Promise.all([getMosaicScenes(eventId), getEventSubmissions(eventId)]);
    const bySubmission = new Map<string, Video>();
    for (const s of eventSubs) {
      bySubmission.set(String(s.id), {
        ...s,
        thumbnailUrl: toAbsoluteUrl(s.thumbnailUrl),
        videoUrl: toAbsoluteUrl(s.videoUrl),
      });
    }
    for (const scene of scenes) {
      const tiles = (scene.submissions ?? []).map((s) => {
        const submissionData = (s as any)?.submission || s || {};
        const submissionId = String(
          submissionData.submission_id ??
          submissionData.submissionId ??
          submissionData.id ??
          (s as any).submission_id ??
          (s as any).submissionId ??
          (s as any).id ??
          ''
        );
        const fromEvent = bySubmission.get(submissionId);
        const directThumb =
          submissionData.thumbnail_url ??
          submissionData.thumbnailUrl ??
          submissionData.thumbnail ??
          submissionData.thumb_url ??
          submissionData.thumbUrl ??
          (s as any)?.thumbnail_url ??
          (s as any)?.thumbnailUrl ??
          (s as any)?.thumbnail ??
          undefined;
        const directVideo =
          submissionData.media_url ??
          submissionData.mediaUrl ??
          submissionData.video_url ??
          submissionData.videoUrl ??
          submissionData.file_url ??
          submissionData.fileUrl ??
          submissionData.signed_url ??
          submissionData.signedUrl ??
          submissionData.url ??
          (s as any)?.media_url ??
          (s as any)?.mediaUrl ??
          (s as any)?.video_url ??
          (s as any)?.videoUrl ??
          (s as any)?.file_url ??
          (s as any)?.fileUrl ??
          (s as any)?.signed_url ??
          (s as any)?.signedUrl ??
          (s as any)?.url ??
          undefined;

        const thumbnailUrl =
          toAbsoluteUrl(directThumb) ||
          fromEvent?.thumbnailUrl ||
          entry.thumbsBySubmission.get(submissionId) ||
          undefined;
        const videoUrl = toAbsoluteUrl(directVideo) || fromEvent?.videoUrl || undefined;
        const isUser = entry.submissionIds.has(submissionId);
        const isUserPlayed =
          isUser &&
          (entry.statusBySubmission.get(submissionId) === 'played' ||
            String(submissionData.submission_status ?? submissionData.submissionStatus ?? submissionData.status ?? (s as any).status ?? '').toLowerCase().includes('played'));
        return {
          tileId: String(submissionData.tile_id ?? submissionData.tileId ?? (s as any).id ?? `${scene.scene_id}:${submissionId}`),
          submissionId,
          submissionStatus: (submissionData.submission_status ?? submissionData.submissionStatus ?? submissionData.status ?? (s as any).status ?? undefined) as
            | string
            | undefined,
          thumbnailUrl: thumbnailUrl || undefined,
          videoUrl: videoUrl || undefined,
          isUser: isUserPlayed,
        } satisfies SceneTile;
      });

      // A scene is "played for the user" when any of their submissions are marked as played / used.
      if (!tiles.some((t) => t.isUser)) continue;

      const createdAt = scene.created_at ? new Date(scene.created_at).toISOString() : new Date().toISOString();
      const totalPanels = Number(scene.screen_layout?.total_panels ?? 0) || Math.max(tiles.length, 1);

      results.push({
        sceneId: scene.scene_id,
        eventId,
        sceneName: String(scene.name ?? 'Scene'),
        status: scene.status ?? undefined,
        createdAt,
        totalPanels,
        thumbnailUrl: toAbsoluteUrl(scene.thumbnail),
        matchName: entry.matchName,
        tiles,
      });
    }
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return results;
};

const extractArray = (payload: any): any[] => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.value)) return payload.data.value;
  if (Array.isArray(payload?.data?.data?.data)) return payload.data.data.data;
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload?.value?.data)) return payload.value.data;
  return [];
};

const extractTotal = (payload: any): number | undefined => {
  const candidates = [
    payload?.pagination?.total,
    payload?.pagination?.count,
    payload?.total,
    payload?.count,
    payload?.data?.pagination?.total,
    payload?.data?.total,
    payload?.value?.pagination?.total,
    payload?.value?.total,
  ];
  for (const c of candidates) {
    const n = typeof c === 'string' ? Number(c) : typeof c === 'number' ? c : NaN;
    if (Number.isFinite(n) && n >= 0) return n;
  }
  return undefined;
};

export const getVideosPage = async (userId: string, page: number, limit = 10) => {
  const { data } = await apiClient.get<any>('/submissions/mobile', {
    params: { user_id: userId, page, limit },
  });

  const items = extractArray(data) as ApiLibraryItem[];
  const total = extractTotal(data);
  return { items: items.map(toVideo).filter((v) => v.id && v.videoUrl), total };
};

export const getVideos = async (userId: string, page: number, limit = 10) => {
  const { items } = await getVideosPage(userId, page, limit);
  return items;
};

// Back-compat (older API)
export const getUserLibrary = async () => {
  const { data } = await apiClient.get<any>('/user/library');
  const items = extractArray(data) as ApiLibraryItem[];
  return items.map(toVideo).filter((v) => v.id && v.videoUrl);
};

type ApiPlayedSceneItem = {
  id?: string | number | null;
  scene_id?: string | number | null;
  sceneName?: string | null;
  scene_name?: string | null;
  matchName?: string | null;
  match_name?: string | null;
  event_name?: string | null;
  timestamp?: string | null;
  created_at?: string | null;
  thumbnailUrl?: string | null;
  thumbnail_url?: string | null;
};

const toPlayedScene = (item: ApiPlayedSceneItem): PlayedScene => {
  const id = String(item.id ?? item.scene_id ?? '');
  const sceneName = String(item.sceneName ?? item.scene_name ?? 'Scene');
  const matchName = String(item.matchName ?? item.match_name ?? item.event_name ?? 'Match');
  const rawTimestamp = String(item.timestamp ?? item.created_at ?? '');
  const parsed = parseCheeritDateTime(rawTimestamp);
  const timestamp = Number.isFinite(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
  const thumbnailUrl = String(item.thumbnailUrl ?? item.thumbnail_url ?? '');
  return { id, matchName, sceneName, timestamp, thumbnailUrl };
};

export const getPlayedScenesPage = async (page: number, limit = 10) => {
  const { data } = await apiClient.get<any>('/users/played-scenes', { params: { page, limit } });
  const items = extractArray(data) as ApiPlayedSceneItem[];
  const total = extractTotal(data);
  return { items: items.map(toPlayedScene).filter((s) => s.id), total };
};

export const getPlayedScenes = async (page: number, limit = 10) => {
  const { items } = await getPlayedScenesPage(page, limit);
  return items;
};

const EVENT_STATUS_ID: Record<EventStatusFilter, number> = {
  upcoming: 1,
  scheduled: 2,
  live: 3,
  completed: 4,
  cancelled: 5,
};

function parseCheeritDateTime(input?: string | null): Date {
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
}

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
