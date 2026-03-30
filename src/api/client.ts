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
  eventName?: string;
  eventShortName?: string;
  venueName?: string;
}

export type EventType = {
  id: number;
  name: string;
  iconUrl?: string;
  count?: number;
};

export type EventTypeWithMatches = {
  type: EventType;
  matches: Match[];
};

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
  end_time?: string | null;
  cheer_submission_start_time?: string | null;
  cheer_submission_end_time?: string | null;
  eventstatus_id?: number | null;
  eventstatus?: { name?: string | null } | null;
  event_image_url?: string | null;
  venue_name?: string | null;
  teams?: { team_id: string; name: string; logo_url: string }[] | null;
}

type ApiEventType = {
  eventtype_id: number;
  name?: string | null;
  category?: string | null;
  is_active?: boolean | null;
  icon_url?: string | null;
  count?: number | null;
};

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  createdAt?: string;
  verified?: boolean;
  countryCode?: string;
  gender?: string;
  emailVerified?: boolean;
  isActive?: boolean;
  isBlocked?: boolean;
  allowNotifications?: boolean;
  postalCode?: string | null;
  cityName?: string | null;
  stateName?: string | null;
  country?: string | null;
  updatedAt?: string;
}

export const normalizeUserProfile = (apiUser: any): UserProfile => {
  const id = String(apiUser?.id ?? apiUser?.user_id ?? apiUser?.userId ?? apiUser?.uuid ?? apiUser?.user_uuid ?? '').trim();
  const name = String(apiUser?.full_name ?? apiUser?.fullName ?? apiUser?.name ?? apiUser?.username ?? 'User').trim() || 'User';
  const phone = String(apiUser?.mobile_number ?? apiUser?.mobileNumber ?? apiUser?.phone ?? apiUser?.phone_number ?? '').trim();
  const emailRaw =
    apiUser?.email ??
    apiUser?.email_address ??
    apiUser?.emailAddress ??
    apiUser?.email_id ??
    apiUser?.emailId ??
    apiUser?.mail ??
    apiUser?.user_email;
  const email = typeof emailRaw === 'string' ? emailRaw.trim() : undefined;
  const genderRaw = apiUser?.gender ?? apiUser?.sex ?? apiUser?.gender_name ?? apiUser?.genderName ?? undefined;
  const gender = typeof genderRaw === 'string' ? genderRaw.trim() : undefined;

  const createdAt =
    String(apiUser?.created_at ?? apiUser?.createdAt ?? apiUser?.created_on ?? apiUser?.createdOn ?? '').trim() || undefined;
  const updatedAt =
    String(apiUser?.updated_at ?? apiUser?.updatedAt ?? apiUser?.updated_on ?? apiUser?.updatedOn ?? '').trim() || undefined;

  const emailVerifiedRaw =
    apiUser?.isEmailVerified ?? apiUser?.email_verified ?? apiUser?.emailVerified ?? apiUser?.is_email_verified ?? undefined;
  const emailVerified = typeof emailVerifiedRaw === 'boolean' ? emailVerifiedRaw : undefined;

  const verifiedRaw =
    apiUser?.is_verified ?? apiUser?.isVerified ?? apiUser?.verified ?? apiUser?.is_active ?? apiUser?.isActive ?? undefined;
  const verified = typeof emailVerified === 'boolean' ? emailVerified : typeof verifiedRaw === 'boolean' ? verifiedRaw : undefined;
  const countryCodeRaw = apiUser?.country_code ?? apiUser?.countryCode ?? apiUser?.dial_code ?? apiUser?.dialCode ?? undefined;
  const countryCode = typeof countryCodeRaw === 'string' ? countryCodeRaw.trim() : undefined;

  const makeAbsoluteUrl = (maybeUrl?: string) => {
    const url = (maybeUrl ?? '').trim();
    if (!url) return undefined;
    if (/^https?:\/\//i.test(url)) return url;
    try {
      const base = new URL(API_URL);
      base.pathname = base.pathname.replace(/\/api\/?$/, '/');
      return new URL(url, base.toString()).toString();
    } catch {
      return url;
    }
  };

  const avatarRaw =
    pluckUrlString(
      apiUser?.profile_image ??
        apiUser?.profileImage ??
        apiUser?.profile_image_url ??
        apiUser?.profileImageUrl ??
        apiUser?.profile_pic ??
        apiUser?.profilePic ??
        apiUser?.avatar ??
        apiUser?.image_url ??
        apiUser?.imageUrl,
      'image'
    ) ?? undefined;
  const avatar = makeAbsoluteUrl(avatarRaw);

  const isActiveRaw = apiUser?.is_active ?? apiUser?.isActive ?? undefined;
  const isActive = typeof isActiveRaw === 'boolean' ? isActiveRaw : undefined;
  const isBlockedRaw = apiUser?.is_blocked ?? apiUser?.isBlocked ?? undefined;
  const isBlocked = typeof isBlockedRaw === 'boolean' ? isBlockedRaw : undefined;
  const allowNotificationsRaw = apiUser?.allow_notifications ?? apiUser?.allowNotifications ?? undefined;
  const allowNotifications = typeof allowNotificationsRaw === 'boolean' ? allowNotificationsRaw : undefined;
  const postalCodeRaw = apiUser?.postal_code ?? apiUser?.postalCode ?? null;
  const postalCode = postalCodeRaw === null || typeof postalCodeRaw === 'undefined' ? postalCodeRaw : String(postalCodeRaw).trim();
  const cityNameRaw = apiUser?.city_name ?? apiUser?.cityName ?? null;
  const cityName = cityNameRaw === null || typeof cityNameRaw === 'undefined' ? cityNameRaw : String(cityNameRaw).trim();
  const stateNameRaw = apiUser?.state_name ?? apiUser?.stateName ?? null;
  const stateName = stateNameRaw === null || typeof stateNameRaw === 'undefined' ? stateNameRaw : String(stateNameRaw).trim();
  const countryRaw = apiUser?.country ?? apiUser?.country_name ?? apiUser?.countryName ?? null;
  const country = countryRaw === null || typeof countryRaw === 'undefined' ? countryRaw : String(countryRaw).trim();

  return {
    id,
    name,
    phone,
    email: email || undefined,
    avatar,
    createdAt,
    verified,
    countryCode,
    gender,
    emailVerified,
    isActive,
    isBlocked,
    allowNotifications,
    postalCode,
    cityName,
    stateName,
    country,
    updatedAt,
  };
};

const extractUserObject = (payload: any): any | undefined => {
  if (!payload || typeof payload !== 'object') return undefined;
  const candidates = [
    (payload as any).user,
    (payload as any).data?.user,
    (payload as any).data?.data?.user,
    (payload as any).value?.user,
    (payload as any).profile,
    (payload as any).data?.profile,
    (payload as any).data,
    (payload as any).data?.data,
    (payload as any).value,
    (payload as any).value?.data,
  ];

  for (const c of candidates) {
    if (c && typeof c === 'object' && !Array.isArray(c)) return c;
  }
  return undefined;
};

export const fetchUserDetails = async (userId?: string): Promise<UserProfile> => {
  const id = String(userId ?? '').trim();
  const endpoints = [
    ...(id ? [`/users/${encodeURIComponent(id)}`, `/user/${encodeURIComponent(id)}`] : []),
    '/users/me',
    '/user/me',
    '/users/profile',
    '/user/profile',
    '/users',
    '/profile',
    '/auth/me',
    '/auth/profile',
  ];

  let lastError: unknown;
  for (const path of endpoints) {
    try {
      const { data } = await apiClient.get<any>(path);
      const apiUser = extractUserObject(data) ?? data;
      const normalized = normalizeUserProfile(apiUser);
      if (normalized.id || normalized.phone || normalized.email || normalized.name) return normalized;
    } catch (err) {
      lastError = err;
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        // try next endpoint for "not found" / "method not allowed"
        if (status === 404 || status === 405) continue;
      }
      throw err;
    }
  }

  throw lastError ?? new Error('Failed to fetch user details');
};

export interface Video {
  id: string;
  matchName: string;
  timestamp: string;
  thumbnailUrl: string;
  videoUrl: string;
  status?: 'approved' | 'rejected' | 'pending' | 'playing' | 'played';
  mediaType?: 'image' | 'video';
  eventId?: string;
}

export type LibrarySubmissionStatusFilter = 'APPROVED' | 'REJECTED' | 'PLAYING' | 'PLAYED';
export type LibraryMediaTypeFilter = 'IMAGE' | 'VIDEO';

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
  media_type?: string | null;
  mediaType?: string | null;
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

type UrlKind = 'video' | 'image' | 'any';

const isLikelyHttpUrl = (s: string) => /^https?:\/\//i.test(s);
const isLikelyImageUrl = (s: string) => /\.(png|jpe?g|webp|gif|avif)(\?|#|$)/i.test(s) || /thumb|thumbnail|image/i.test(s);
const isLikelyVideoUrl = (s: string) =>
  /\.(mp4|m3u8|webm|mov)(\?|#|$)/i.test(s) || /video|media/i.test(s);

const pluckUrlString = (value: unknown, kind: UrlKind = 'any', depth = 0): string | undefined => {
  if (!value) return undefined;
  if (typeof value === 'string') {
    const s = value.trim();
    if (!s) return undefined;
    if (kind === 'image') return s;
    if (kind === 'video') return s;
    return s;
  }
  if (typeof value !== 'object') return undefined;

  const v = value as any;
  const directCandidates =
    kind === 'video'
      ? [
          v.signed_url,
          v.signedUrl,
          v.media_url,
          v.mediaUrl,
          v.video_url,
          v.videoUrl,
          v.file_url,
          v.fileUrl,
          v.url,
          v.href,
        ]
      : kind === 'image'
        ? [v.thumbnail_url, v.thumbnailUrl, v.thumb_url, v.thumbUrl, v.thumbnail, v.image_url, v.imageUrl, v.url, v.href]
        : [
            v.url,
            v.href,
            v.signed_url,
            v.signedUrl,
            v.media_url,
            v.mediaUrl,
            v.video_url,
            v.videoUrl,
            v.file_url,
            v.fileUrl,
            v.thumbnail_url,
            v.thumbnailUrl,
            v.thumb_url,
            v.thumbUrl,
          ];

  for (const c of directCandidates) {
    if (typeof c === 'string' && c.trim()) return c;
  }

  if (depth >= 2) return undefined;

  const keys = Object.keys(v);
  const nestedKeysFirst =
    kind === 'video'
      ? ['media', 'video', 'file', 'asset', 'playback', 'signed', 'source', 'data']
      : kind === 'image'
        ? ['thumbnail', 'thumb', 'image', 'poster', 'asset', 'data']
        : ['media', 'video', 'file', 'thumbnail', 'thumb', 'image', 'asset', 'data'];

  const tryKeys = [...nestedKeysFirst, ...keys];
  for (const k of tryKeys) {
    const child = v?.[k];
    if (!child) continue;
    if (typeof child === 'string') {
      const s = child.trim();
      if (!s) continue;
      if (kind === 'video') {
        if (isLikelyHttpUrl(s) && !isLikelyImageUrl(s)) return s;
        if (isLikelyVideoUrl(s) && !isLikelyImageUrl(s)) return s;
      } else if (kind === 'image') {
        if (isLikelyHttpUrl(s) || isLikelyImageUrl(s)) return s;
      } else {
        if (isLikelyHttpUrl(s) || isLikelyImageUrl(s) || isLikelyVideoUrl(s)) return s;
      }
    } else if (typeof child === 'object') {
      const nested = pluckUrlString(child, kind, depth + 1);
      if (nested) return nested;
    }
  }

  return undefined;
};

const toVideo = (item: ApiLibraryItem): Video => {
  const id = String(item.submission_id ?? item.submissionId ?? item.id ?? '');
  const matchName = String(item.matchName ?? item.match_name ?? item.event_name ?? item.event?.event_name ?? 'Match');
  const rawTimestamp = String(item.timestamp ?? item.created_at ?? item.approved_at ?? '');
  const parsed = parseCheeritDateTime(rawTimestamp);
  const timestamp = Number.isFinite(parsed.getTime()) ? parsed.toISOString() : new Date().toISOString();
  const rawThumbnailUrl =
    pluckUrlString(item.thumbnailUrl ?? item.thumbnail_url ?? item.thumbnail ?? item.thumb_url ?? item.thumbUrl, 'image') ??
    pluckUrlString(item.media_url ?? item.mediaUrl ?? item.video_url ?? item.videoUrl ?? item.file_url ?? item.fileUrl ?? item.url, 'image') ??
    '';
  const rawVideoUrl =
    pluckUrlString(
      item.videoUrl ??
        item.video_url ??
        item.media_url ??
        item.mediaUrl ??
        item.file_url ??
        item.fileUrl ??
        item.signed_url ??
        item.signedUrl ??
        item.url,
      'video'
    ) ??
    '';

  const thumbnailUrl = toAbsoluteUrl(rawThumbnailUrl);
  const videoUrl = toAbsoluteUrl(rawVideoUrl || rawThumbnailUrl);
  const eventId = item.event_id ?? undefined;

  const mediaTypeRaw = String(item.media_type ?? item.mediaType ?? '').toLowerCase().trim();
  const mediaType: Video['mediaType'] = mediaTypeRaw.includes('image')
    ? 'image'
    : mediaTypeRaw.includes('video')
      ? 'video'
      : rawVideoUrl
        ? 'video'
        : rawThumbnailUrl
          ? 'image'
          : undefined;

  const statusRaw = String(item.approval_status ?? item.status ?? '').toLowerCase().trim();
  const submissionStatusRaw = String(item.submission_status ?? '').toLowerCase().trim();
  const status: Video['status'] =
    item.is_played === true || statusRaw.includes('played') || submissionStatusRaw.includes('played')
      ? 'played'
      : statusRaw.includes('playing') || submissionStatusRaw.includes('playing')
        ? 'playing'
      : item.is_rejected === true || !!item.rejected_at || statusRaw.includes('reject') || submissionStatusRaw.includes('reject')
      ? 'rejected'
      : item.is_approved === true || !!item.approved_at || statusRaw.includes('approve') || submissionStatusRaw.includes('approve')
        ? 'approved'
        : 'pending';

  return { id, matchName, timestamp, thumbnailUrl, videoUrl, status, eventId, mediaType };
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

const toAbsoluteUrl = (maybeUrl?: unknown) => {
  const url = pluckUrlString(maybeUrl) ?? '';
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  try {
    return new URL(url, apiOriginFromApiUrl()).toString();
  } catch {
    return url;
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
  eventName?: string;
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

const EVENT_NAME_CACHE_TTL_MS = 5 * 60_000;
const eventNameCache = new Map<string, { ts: number; name?: string }>();

const getEventNameById = async (eventId: string) => {
  const id = String(eventId || '').trim();
  if (!id) return undefined;

  const cached = eventNameCache.get(id);
  if (cached && Date.now() - cached.ts < EVENT_NAME_CACHE_TTL_MS) return cached.name;

  const store = (name?: string) => {
    const cleaned = String(name ?? '').trim();
    const value = cleaned || undefined;
    eventNameCache.set(id, { ts: Date.now(), name: value });
    return value;
  };

  try {
    const { data } = await apiClient.get<any>('/events', { params: { event_id: id } });
    const events = extractArray(data) as ApiEvent[];
    const ev = events.find((e) => String((e as any)?.event_id ?? '').trim() === id) ?? events[0];
    if (ev) return store(ev.event_name ?? (ev as any)?.name);
  } catch {
    // ignore
  }

  try {
    const { data } = await apiClient.get<any>(`/events/${encodeURIComponent(id)}`);
    const ev = (Array.isArray(data?.data) ? data.data[0] : data?.data ?? data) as ApiEvent | any;
    return store(ev?.event_name ?? ev?.name);
  } catch {
    // ignore
  }

  return store(undefined);
};

type ApiUpcomingCategory = {
  name?: string | null;
  icon_url?: string | null;
  total_events?: number | null;
  events?: ApiEvent[] | null;
};

export const getMosaicScenes = async (eventId: string) => {
  const { data } = await apiClient.get<any>(`/mosaic/scene/${eventId}`);
  const scenes = (Array.isArray(data) ? data : Array.isArray(data?.value) ? data.value : []) as ApiMosaicScene[];
  return scenes;
};

export const getEventSubmissions = async (eventId: string) => {
  const pageSize = 200;
  const maxPages = 50;
  const seen = new Set<string>();
  const allItems: ApiLibraryItem[] = [];

  for (let page = 1; page <= maxPages; page++) {
    const { data } = await apiClient.get<any>('/submissions/cheers', { params: { eventId, page, limit: pageSize } });
    const items = extractArray(data) as ApiLibraryItem[];

    let added = 0;
    for (const it of items) {
      const id = String((it as any)?.submission_id ?? (it as any)?.submissionId ?? (it as any)?.id ?? '');
      if (!id || seen.has(id)) continue;
      seen.add(id);
      allItems.push(it);
      added++;
    }

    const total = extractTotal(data);
    if (typeof total === 'number' && total > 0 && seen.size >= total) break;
    if (items.length < pageSize) break;
    if (added === 0) break;
  }

  return allItems.map(toVideo).filter((v) => v.id);
};

const isUserSubmissionTile = (tile: any, userId: string) => {
  if (!tile) return false;
  if (tile.isUser === true || tile.is_user === true) return true;
  if (tile.isUserSubmission === true || tile.is_user_submission === true) return true;
  if (tile.ownedByUser === true || tile.is_owned_by_user === true) return true;
  const maybeUserId = String(
    tile.userId ??
      tile.user_id ??
      tile.ownerId ??
      tile.owner_id ??
      tile.submission_user_id ??
      tile.submissionUserId ??
      ''
  ).trim();
  if (maybeUserId && maybeUserId === userId) return true;
  return false;
};

export const getPlayedScenesForUserViaUserScenes = async (userId: string) => {
  const { data } = await apiClient.get<any>('/submissions/user-scenes', { params: { userId } });
  const scenes = extractArray(data);

  const results: PlayedSceneGrid[] = [];
  for (const raw of scenes) {
    const sceneId = String(raw?.scene_id ?? raw?.sceneId ?? raw?.id ?? '').trim();
    const eventId = String(raw?.event_id ?? raw?.eventId ?? raw?.event?.event_id ?? raw?.event?.id ?? '').trim();
    if (!sceneId) continue;

    const eventNameFromRow = String(raw?.event_name ?? raw?.eventName ?? raw?.event?.event_name ?? raw?.event?.name ?? '').trim();
    const fetchedEventName = eventNameFromRow || (eventId ? await getEventNameById(eventId) : undefined);

    const submissions = (Array.isArray(raw?.submissions) ? raw.submissions : Array.isArray(raw?.tiles) ? raw.tiles : []) as any[];
    const tiles: SceneTile[] = submissions.map((s, idx) => {
      const submissionData = (s as any)?.submission || s || {};
      const submissionId = String(
        submissionData.submission_id ??
          submissionData.submissionId ??
          submissionData.id ??
          (s as any).submission_id ??
          (s as any).submissionId ??
          (s as any).id ??
          ''
      ).trim();

      const directThumb = pluckUrlString(
        submissionData.thumbnail_url ??
          submissionData.thumbnailUrl ??
          submissionData.thumbnail ??
          submissionData.thumb_url ??
          submissionData.thumbUrl ??
          (s as any)?.thumbnail_url ??
          (s as any)?.thumbnailUrl ??
          (s as any)?.thumbnail ??
          submissionData ??
          s ??
          undefined,
        'image'
      );
      const directVideo = pluckUrlString(
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
          submissionData ??
          s ??
          undefined,
        'video'
      );

      return {
        tileId: String(submissionData.tile_id ?? submissionData.tileId ?? (s as any)?.tile_id ?? (s as any)?.tileId ?? idx),
        submissionId: submissionId || String(idx),
        submissionStatus: (submissionData.submission_status ?? submissionData.submissionStatus ?? submissionData.status ?? (s as any)?.status ?? undefined) as
          | string
          | undefined,
        thumbnailUrl: toAbsoluteUrl(directThumb) || undefined,
        videoUrl: toAbsoluteUrl(directVideo) || undefined,
        isUser: isUserSubmissionTile(submissionData, userId) || isUserSubmissionTile(s, userId),
      } satisfies SceneTile;
    });

    if (!tiles.some((t) => t.isUser)) continue;

    const createdAt = raw?.created_at || raw?.createdAt || raw?.timestamp;
    const createdIso = createdAt ? new Date(createdAt).toISOString() : new Date().toISOString();
    const totalPanels =
      Number(raw?.screen_layout?.total_panels ?? raw?.screenLayout?.totalPanels ?? raw?.total_panels ?? raw?.totalPanels ?? 0) ||
      Math.max(tiles.length, 1);

    results.push({
      sceneId,
      eventId,
      sceneName: String(raw?.name ?? raw?.scene_name ?? raw?.sceneName ?? 'Scene'),
      status: raw?.status ?? undefined,
      createdAt: createdIso,
      totalPanels,
      thumbnailUrl: toAbsoluteUrl(raw?.thumbnail ?? raw?.thumbnail_url ?? raw?.thumbnailUrl ?? ''),
      matchName: (() => {
        const eventName = String(
          raw?.event_name ?? raw?.eventName ?? raw?.event?.event_name ?? raw?.event?.name ?? raw?.matchName ?? ''
        ).trim();
        const shortName = String(raw?.event_short_name ?? raw?.eventShortName ?? raw?.event?.event_short_name ?? '').trim();
        const teams = pickTeamNamesFromRow(raw);
        if (teams) return `${teams.a} vs ${teams.b}`;
        return matchTitleFromNames(eventName, shortName) || eventName;
      })(),
      eventName: fetchedEventName,
      tiles,
    });
  }

  results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return results;
};

export const getPlayedSceneGridsForUser = async (userId: string) => {
  try {
    const viaUserScenes = await getPlayedScenesForUserViaUserScenes(userId);
    if (viaUserScenes.length) return viaUserScenes;
  } catch {
    // Fall back to older multi-endpoint scene + submission reconstruction.
  }

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
        const directThumb = pluckUrlString(
          submissionData.thumbnail_url ??
            submissionData.thumbnailUrl ??
            submissionData.thumbnail ??
            submissionData.thumb_url ??
            submissionData.thumbUrl ??
            (s as any)?.thumbnail_url ??
            (s as any)?.thumbnailUrl ??
            (s as any)?.thumbnail ??
            submissionData ??
            s ??
            undefined,
          'image'
        );
        const directVideo = pluckUrlString(
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
            submissionData ??
            s ??
            undefined,
          'video'
        );

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
        matchName: matchTitleFromNames(entry.matchName ?? '', null) || entry.matchName,
        eventName: await getEventNameById(eventId),
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

export const getVideosPage = async (
  userId: string,
  page: number,
  limit = 10,
  filters?: { status?: LibrarySubmissionStatusFilter; mediaType?: LibraryMediaTypeFilter }
) => {
  const wantStatus = filters?.status?.toLowerCase().trim();

  const applyMediaFilter = (items: Video[]) => {
    return filters?.mediaType === 'IMAGE'
      ? items.filter((v) => (v.mediaType ?? '').toLowerCase() === 'image' && (v.videoUrl || v.thumbnailUrl))
      : filters?.mediaType === 'VIDEO'
        ? items.filter((v) => (v.mediaType ?? '').toLowerCase() === 'video' && v.videoUrl)
        : items.filter((v) => v.videoUrl);
  };

  const applyStatusFilter = (items: Video[]) => {
    if (!wantStatus) return items;
    return items.filter((v) => (v.status ?? '').toLowerCase() === wantStatus);
  };

  const fetchMobileSubmissions = async (pageNo: number, pageSize: number, includeStatusParams: boolean) => {
    const statusParam = filters?.status;
    const mediaTypeParam = filters?.mediaType;

    const params: Record<string, any> = {
      // backend variants
      user_id: userId,
      userId,
      page: pageNo,
      limit: pageSize,
      media_type: mediaTypeParam,
      mediaType: mediaTypeParam,
    };

    if (includeStatusParams && statusParam) {
      // some backends filter by `status`, others by `approval_status` / `submission_status`
      params.status = statusParam;
      params.approval_status = statusParam;
      params.submission_status = statusParam;
    }

    const { data } = await apiClient.get<any>('/submissions/mobile', { params });
    return data;
  };

  // PLAYING/PLAYED often aren't supported by backend status filtering (or the backend paginates before filtering),
  // so do a client-side filtered pagination scan to ensure those tabs actually show data.
  if (filters?.status === 'PLAYING' || filters?.status === 'PLAYED') {
    const offset = Math.max(0, (page - 1) * limit);
    const targetCount = offset + limit;

    const pageItems: Video[] = [];
    let matchedSeen = 0;
    let totalMatched: number | undefined = undefined;

    const baseLimit = Math.max(50, limit * 5);
    const maxPages = 80;

    for (let basePage = 1; basePage <= maxPages; basePage++) {
      let data: any;
      try {
        data = await fetchMobileSubmissions(basePage, baseLimit, false);
      } catch (err) {
        console.error('getVideosPage(/submissions/mobile) failed:', err);
        break;
      }

      const rawItems = extractArray(data) as ApiLibraryItem[];
      const mapped = applyMediaFilter(rawItems.map(toVideo).filter((v) => v.id));
      const matched = applyStatusFilter(mapped);

      for (const v of matched) {
        if (matchedSeen >= offset && pageItems.length < limit) {
          pageItems.push(v);
        }
        matchedSeen++;
      }

      const serverTotal = extractTotal(data);
      const reachedEnd = rawItems.length < baseLimit || (serverTotal != null && basePage * baseLimit >= serverTotal);

      // Stop early if we already know there's a next page of matches.
      if (!reachedEnd && matchedSeen > targetCount) {
        totalMatched = undefined;
        break;
      }

      if (reachedEnd) {
        totalMatched = matchedSeen;
        break;
      }
    }

    return { items: pageItems, total: totalMatched };
  }

  const data = await fetchMobileSubmissions(page, limit, true);
  const items = extractArray(data) as ApiLibraryItem[];
  const total = extractTotal(data);

  const mapped = applyMediaFilter(items.map(toVideo).filter((v) => v.id));
  const filtered = applyStatusFilter(mapped);

  return { items: filtered, total };
};

export const getVideos = async (
  userId: string,
  page: number,
  limit = 10,
  filters?: { status?: LibrarySubmissionStatusFilter; mediaType?: LibraryMediaTypeFilter }
) => {
  const { items } = await getVideosPage(userId, page, limit, filters);
  return items;
};

export const softDeleteSubmission = async (submissionId: string, deletedBy: string) => {
  const body = {
    submission_id: submissionId,
    deleted_by: deletedBy,
  };
  const { data } = await apiClient.patch<any>('/submissions/soft-delete', body);
  return data;
};

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
  const trimmed = input.trim();

  // dd/mm/yyyy hh:mm AM/PM
  const dmy = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (dmy) {
    const [, dd, mm, yyyy, hh, min, meridiem] = dmy;
    let hours = Number(hh);
    const minutes = Number(min);
    const isPm = meridiem.toLowerCase() === 'pm';
    if (hours === 12) hours = 0;
    if (isPm) hours += 12;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), hours, minutes, 0, 0);
  }

  // yyyy-mm-dd hh:mm AM/PM (used by `/events/mobile/upcoming`)
  const ymd = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (ymd) {
    const [, yyyy, mm, dd, hh, min, meridiem] = ymd;
    let hours = Number(hh);
    const minutes = Number(min);
    const isPm = meridiem.toLowerCase() === 'pm';
    if (hours === 12) hours = 0;
    if (isPm) hours += 12;
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd), hours, minutes, 0, 0);
  }

  // Fallback parse (can be invalid depending on browser)
  const parsed = new Date(trimmed);
  return Number.isFinite(parsed.getTime()) ? parsed : new Date(0);
}

const splitTeamsFromName = (eventName?: string | null, shortName?: string | null): { a: string; b: string } => {
  const raw = (eventName ?? '').trim() || (shortName ?? '').trim();
  const parts = raw.split(/\s+vs\s+/i).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return { a: parts[0], b: parts[1] };
  if (raw) return { a: raw, b: 'TBD' };
  return { a: 'TBD', b: 'TBD' };
};

const matchTitleFromNames = (eventName?: string | null, shortName?: string | null) => {
  const teams = splitTeamsFromName(eventName, shortName);
  if (!teams.a || teams.a === 'TBD') return '';
  if (!teams.b || teams.b === 'TBD') return teams.a;
  return `${teams.a} vs ${teams.b}`;
};

const pickTeamNamesFromRow = (row: any): { a: string; b: string } | null => {
  const teams =
    (Array.isArray(row?.teams) ? row.teams : null) ||
    (Array.isArray(row?.event?.teams) ? row.event.teams : null) ||
    (Array.isArray(row?.event?.event_teams) ? row.event.event_teams : null) ||
    (Array.isArray(row?.event_teams) ? row.event_teams : null);

  if (Array.isArray(teams) && teams.length >= 2) {
    const a = String(teams[0]?.name ?? teams[0]?.team_name ?? teams[0]?.teamName ?? '').trim();
    const b = String(teams[1]?.name ?? teams[1]?.team_name ?? teams[1]?.teamName ?? '').trim();
    if (a && b) return { a, b };
  }

  const a = String(row?.teamA?.name ?? row?.teamAName ?? row?.team_a_name ?? row?.team_a ?? '').trim();
  const b = String(row?.teamB?.name ?? row?.teamBName ?? row?.team_b_name ?? row?.team_b ?? '').trim();
  if (a && b) return { a, b };

  return null;
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
  const startTime = Number.isFinite(start.getTime()) ? start.toISOString() : new Date(0).toISOString();

  const teamA = event.teams?.[0];
  const teamB = event.teams?.[1];

  const statusName = (event.eventstatus?.name ?? '').toLowerCase().trim();
  const mappedStatus: Match['status'] =
    statusName === 'live' || event.eventstatus_id === EVENT_STATUS_ID.live
      ? 'live'
      : statusName === 'completed' || event.eventstatus_id === EVENT_STATUS_ID.completed
        ? 'completed'
        : 'upcoming';

  return {
    id: event.event_id,
    teamA: { name: teamA?.name ?? teams.a, logo: teamA?.logo_url || svgDataUriForTeam(teams.a) },
    teamB: { name: teamB?.name ?? teams.b, logo: teamB?.logo_url || svgDataUriForTeam(teams.b) },
    status: mappedStatus,
    startTime,
    eventName: event.event_name ?? undefined,
    eventShortName: event.event_short_name ?? undefined,
    venueName: event.venue_name ?? undefined,
  };
};

export const getSportsEventTypes = async (type?: 'upcoming' | 'completed') => {
  const { data } = await apiClient.get<any>('/eventtype/sports', {
    params: type ? { type } : undefined,
  });
  const items = extractArray(data) as ApiEventType[];
  return items
    .filter((t) => t && t.is_active !== false)
    .map((t) => ({
      id: Number(t.eventtype_id),
      name: String(t.name ?? 'Sport'),
      iconUrl: toAbsoluteUrl(t.icon_url),
      count: typeof t.count === 'number' ? t.count : undefined,
    }))
    .filter((t) => Number.isFinite(t.id) && t.id > 0);
};

const withForcedStatus = (matches: Match[], status: Match['status']) => matches.map((m) => ({ ...m, status }));

const dedupeMatchesById = (matches: Match[]) => {
  const seen = new Set<string>();
  const out: Match[] = [];
  for (const m of matches) {
    const id = String(m?.id ?? '').trim();
    if (!id) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ ...m, id });
  }
  return out;
};

const LIVE_CACHE_TTL_MS = 30_000;
let liveMatchesCache: { ts: number; matches: Match[] } | null = null;

export const getLiveMatches = async () => {
  if (liveMatchesCache && Date.now() - liveMatchesCache.ts < LIVE_CACHE_TTL_MS) return liveMatchesCache.matches;

  // Live matches must come only from `/events/mobile/live` (no extra filtering params).
  const { data } = await apiClient.get<any>('/events/mobile/live');
  const events = extractArray(data) as ApiEvent[];

  // Trust the live endpoint to return live matches; avoid dropping items due to
  // inconsistent/empty start/end timestamps across event types.
  const matches = dedupeMatchesById(withForcedStatus(events.map(toMatch).filter((m) => m.id), 'live'));
  liveMatchesCache = { ts: Date.now(), matches };
  return matches;
};

export const getLiveEventTypesWithMatches = async () => {
  // Backwards-compatible wrapper: live matches are fetched via a single endpoint call.
  const matches = await getLiveMatches();
  return matches.length
    ? ([{ type: { id: 0, name: 'Live' }, matches }] satisfies EventTypeWithMatches[])
    : [];
};

// Backwards-compatible: eventtypeId filtering is no longer supported by the live endpoint.
export const getLiveMatchesByEventType = async (_eventtypeId: number) => getLiveMatches();

export const getUpcomingMatchesByEventType = async (eventtypeId: number) => {
  const { data } = await apiClient.get<any>('/events/mobile/upcoming', { params: { eventtype_id: eventtypeId } });
  const events = extractArray(data) as ApiEvent[];
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const matches = events
    .map(toMatch)
    .filter((m) => {
      if (!m.id) return false;
      const startMs = new Date(m.startTime).getTime();
      return Number.isFinite(startMs) && startMs >= startOfToday.getTime();
    });
  return withForcedStatus(matches, 'upcoming');
};

export const getCompletedMatchesByEventType = async (eventtypeId: number) => {
  const { data } = await apiClient.get<any>('/events/completed', { params: { eventtype_id: eventtypeId } });
  const events = extractArray(data) as ApiEvent[];
  return withForcedStatus(events.map(toMatch).filter((m) => m.id), 'completed');
};

export const getEventList = async (status?: EventStatusFilter) => {
  const eventstatus_id = status ? EVENT_STATUS_ID[status] : undefined;

  if (status === 'upcoming' || status === 'scheduled') {
    const types = await getSportsEventTypes('upcoming');
    const results = await Promise.all(types.map((t) => getUpcomingMatchesByEventType(t.id)));
    return results.flat();
  }
  if (status === 'completed') {
    const types = await getSportsEventTypes('completed');
    const results = await Promise.all(types.map((t) => getCompletedMatchesByEventType(t.id)));
    return results.flat();
  }

  if (status === 'live') {
    return getLiveMatches();
  }

  const endpoint =
    '/events';

  const { data } = await apiClient.get<ApiEventListResponse | ApiEvent[] | any>(endpoint, {
    params: eventstatus_id ? { eventstatus_id } : undefined,
  });

  const events = (extractArray(data) as ApiEvent[]) ?? [];
  const matches = events.map(toMatch);

  return matches;
};
