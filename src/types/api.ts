export interface ApiErrorDetail {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details: ApiErrorDetail[];
    request_id: string | null;
  };
}

export interface City {
  id: number;
  name: string;
  region_code: number;
  slug: string;
  lat: number;
  lng: number;
  timezone: string;
  is_active: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

import type {
  EventFormat,
  EventStatus,
  EventType,
  Gender,
  NotificationType,
  ParticipantStatus,
  PartnerRequestStatus,
  PlayingHand,
  SkillLevel,
} from "@/lib/enums";

export type UserRole = "guest" | "user" | "moderator" | "admin";

export interface AuthSession {
  access_token: string;
  token_type?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  display_name: string;
  city_id: number;
  marketing_consent?: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfileMe {
  id: number;
  slug: string;
  display_name: string;
  bio: string | null;
  gender: Gender | null;
  skill_level: SkillLevel | null;
  birth_year: number | null;
  avatar_url: string | null;
  is_coach: boolean;
  current_rating: number | null;
  rating_is_stale: boolean;
  rating_synced_at: string | null;
  tennis67_url: string | null;
  playing_hand: PlayingHand | null;
  blade: string | null;
  rubber_forehand: string | null;
  rubber_backhand: string | null;
  telegram_username: string | null;
  phone: string | null;
  phone_visible: boolean;
}

export interface ProfileUpdate {
  display_name?: string;
  bio?: string | null;
  gender?: Gender | null;
  skill_level?: SkillLevel | null;
  birth_year?: number | null;
  is_coach?: boolean | null;
  playing_hand?: PlayingHand | null;
  blade?: string | null;
  rubber_forehand?: string | null;
  rubber_backhand?: string | null;
  telegram_username?: string | null;
  phone?: string | null;
  phone_visible?: boolean;
}

export interface MeResponse {
  id: number;
  email: string;
  role: UserRole;
  is_email_verified: boolean;
  is_superuser: boolean;
  marketing_consent: boolean;
  profile: ProfileMe;
}

// Контактов не содержит — утечки телефона/telegram нет даже под Bearer.
export interface ProfilePublic {
  slug: string | null;
  display_name: string;
  gender: Gender | null;
  skill_level: SkillLevel | null;
  avatar_url: string | null;
  bio: string | null;
  is_coach: boolean;
  playing_hand: PlayingHand | null;
  blade: string | null;
  rubber_forehand: string | null;
  rubber_backhand: string | null;
  current_rating: number | null;
  rating_is_stale: boolean;
}

// Публичная деталь профиля: ProfilePublic + контакты (заполняются только под Bearer;
// телефон — лишь при phone_visible). Гостю/в SEO контакты приходят как null.
export interface ProfileDetail extends ProfilePublic {
  telegram_username: string | null;
  phone: string | null;
}

export interface ProfileFilterParams {
  city_id?: number;
  gender?: Gender;
  skill_level?: SkillLevel;
  is_coach?: boolean;
  rating_min?: number;
  rating_max?: number;
  q?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface RatingPoint {
  rating: number;
  source: string;
  recorded_at: string;
}

export interface RatingHistory {
  current_rating: number | null;
  rating_synced_at: string | null;
  rating_is_stale: boolean;
  points: RatingPoint[];
}

export interface RatingSyncAccepted {
  status: string;
  detail: string;
}

export interface EventParticipant {
  user_id: number;
  status: ParticipantStatus;
  is_organizer: boolean;
  joined_at: string;
  profile: ProfilePublic | null;
}

export interface EventRead {
  id: number;
  event_type: EventType;
  event_format: EventFormat;
  status: EventStatus;
  title: string;
  description: string | null;
  city_id: number;
  venue_id: number | null;
  location_text: string | null;
  lat: number | null;
  lng: number | null;
  organizer_id: number;
  coach_id: number | null;
  starts_at: string;
  ends_at: string | null;
  max_participants: number | null;
  min_skill_level: SkillLevel | null;
  max_skill_level: SkillLevel | null;
  gender_restriction: Gender | null;
  price: string | null;
  is_public: boolean;
  created_at: string;
  participants_count: number;
  is_joined: boolean | null;
  distance_km: number | null;
  participants: EventParticipant[] | null;
}

export interface EventFilterParams {
  event_type?: EventType;
  event_format?: EventFormat;
  status?: EventStatus;
  city_id?: number;
  venue_id?: number;
  coach_id?: number;
  date_from?: string;
  date_to?: string;
  skill_level?: SkillLevel;
  gender?: Gender;
  has_slots?: boolean;
  is_public?: boolean;
  q?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export type MyEventsRole = "organizer" | "participant";

export interface MyEventsParams {
  role?: MyEventsRole;
  status?: EventStatus;
  event_type?: EventType;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface NotificationItem {
  id: number;
  type: NotificationType;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse extends Paginated<NotificationItem> {
  unread_count: number;
}

export interface UnreadCountResponse {
  unread_count: number;
}

export interface PartnerRequestRead {
  id: number;
  author_id: number;
  city_id: number;
  status: PartnerRequestStatus;
  title: string;
  description: string | null;
  desired_skill_min: SkillLevel | null;
  desired_skill_max: SkillLevel | null;
  desired_rating_min: number | null;
  desired_rating_max: number | null;
  desired_gender: Gender | null;
  preferred_venue_id: number | null;
  preferred_days: Record<string, unknown> | null;
  event_type: EventType | null;
  expires_at: string | null;
  created_at: string;
  responses_count: number;
  has_responded: boolean | null;
  author: ProfilePublic | null;
}

export interface PartnerResponseRead {
  id: number;
  request_id: number;
  responder_id: number;
  message: string | null;
  status: PartnerRequestStatus;
  created_at: string;
  responder: ProfilePublic | null;
}

export interface PartnerRequestCreatePayload {
  city_id: number;
  title: string;
  description?: string | null;
  desired_skill_min?: SkillLevel | null;
  desired_skill_max?: SkillLevel | null;
  desired_rating_min?: number | null;
  desired_rating_max?: number | null;
  desired_gender?: Gender | null;
  event_type?: EventType | null;
}

export interface PartnerResponseCreatePayload {
  message?: string | null;
}

// close только переводит в один из терминальных статусов (совпадение / без совпадения).
export type PartnerCloseStatus = "matched" | "closed";

export interface PartnerRequestFilterParams {
  city_id?: number;
  status?: PartnerRequestStatus;
  desired_skill_min?: SkillLevel;
  desired_skill_max?: SkillLevel;
  desired_gender?: Gender;
  event_type?: EventType;
  preferred_venue_id?: number;
  rating_min?: number;
  rating_max?: number;
  suitable?: boolean;
  q?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface MyPartnerRequestsParams {
  status?: PartnerRequestStatus;
  q?: string;
  limit?: number;
  offset?: number;
}

export interface VenuePhoto {
  id: number;
  url: string;
  sort_order: number;
  is_cover: boolean;
}

export interface VenueRead {
  id: number;
  city_id: number;
  name: string;
  slug: string;
  description: string | null;
  address: string;
  lat: number;
  lng: number;
  tables_count: number | null;
  phone: string | null;
  website: string | null;
  // Свободный JSONB; фронт-конвенция — {"text": "Пн–Вс 09:00–22:00"}.
  working_hours: Record<string, unknown> | null;
  price_info: string | null;
  is_verified: boolean;
  rating_avg: string;
  reviews_count: number;
  created_at: string;
  photos: VenuePhoto[];
  distance_km: number | null;
}

export interface VenueCreatePayload {
  city_id: number;
  name: string;
  description?: string | null;
  address: string;
  lat: number;
  lng: number;
  tables_count?: number | null;
  phone?: string | null;
  website?: string | null;
  working_hours?: Record<string, unknown> | null;
  price_info?: string | null;
}

export interface VenueFilterParams {
  city_id?: number;
  is_verified?: boolean;
  tables_min?: number;
  lat?: number;
  lng?: number;
  radius_km?: number;
  q?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}
