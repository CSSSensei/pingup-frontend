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
  ReportResolveStatus,
  ReportStatus,
  ReportTargetType,
  ReviewTargetType,
  SkillLevel,
  TournamentStatus,
} from "@/lib/enums";
import type { WeekScheduleMap } from "@/lib/schedule";

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

export interface AccountRead {
  id: number;
  email: string;
  role: UserRole;
  is_superuser: boolean;
  is_active: boolean;
  is_email_verified: boolean;
  marketing_consent: boolean;
  city_id: number;
  last_login_at: string | null;
  created_at: string;
}

export interface ChangeEmailPayload {
  new_email: string;
  password: string;
}

// PATCH /users/me/email — 202, письмо на новый адрес; email меняется только после confirm.
export interface EmailChangeAccepted {
  status: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface DeleteAccountPayload {
  password: string;
}

export interface MarketingConsentPayload {
  marketing_consent: boolean;
}

export interface SessionRead {
  family_id: string;
  user_agent: string | null;
  ip: string | null;
  issued_at: string;
  expires_at: string;
  is_current: boolean;
}

// Контактов не содержит — утечки телефона/telegram нет даже под Bearer.
export interface ProfilePublic {
  user_id: number;
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
  rating_delta_30d: number | null;
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
  deleted_at: string | null;
  participants_count: number;
  is_joined: boolean | null;
  distance_km: number | null;
  participants: EventParticipant[] | null;
  // Заполнен только в детальном ответе (в списках всегда null).
  coach: ProfilePublic | null;
  // Столы, забронированные за событием (только детальный ответ с venue_id).
  tables: EventTableRef[] | null;
  // Зал из БД (только детальный ответ) — для ссылки на карточку зала.
  venue: EventVenueRef | null;
  series_id: number | null;
  is_recurring: boolean;
  recurrence_summary: string | null;
}

export type RecurrenceFreq = "daily" | "weekly" | "monthly";

export interface RecurrenceInput {
  freq: RecurrenceFreq;
  interval: number;
  byweekday?: number[];
  until?: string;
  count?: number;
  table_ids?: number[];
}

export interface EventTableRef {
  id: number;
  label: string;
}

// Зал из БД — заполнен только в детальном ответе события (для ссылки на карточку зала).
export interface EventVenueRef {
  id: number;
  name: string;
  slug: string;
}

export interface EventTablesUpdatePayload {
  table_ids: number[];
}

export interface EventCreatePayload {
  city_id: number;
  event_type: EventType;
  event_format: EventFormat;
  title: string;
  description?: string;
  venue_id?: number;
  location_text?: string;
  coach_id?: number;
  starts_at: string;
  ends_at?: string;
  max_participants?: number;
  min_skill_level?: SkillLevel;
  max_skill_level?: SkillLevel;
  gender_restriction?: Gender;
  price?: string;
  is_public?: boolean;
  recurrence?: RecurrenceInput;
}

// PATCH — exclude_unset на бэке: undefined = не трогать, null = очистить поле.
// event_type/event_format/coach_id после создания не меняются (нет в EventUpdate).
export interface EventUpdatePayload {
  title?: string;
  description?: string | null;
  venue_id?: number | null;
  location_text?: string | null;
  starts_at?: string;
  ends_at?: string | null;
  max_participants?: number | null;
  min_skill_level?: SkillLevel | null;
  max_skill_level?: SkillLevel | null;
  gender_restriction?: Gender | null;
  price?: string | null;
  status?: EventStatus;
  is_public?: boolean;
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
  deleted_at: string | null;
  photos: VenuePhoto[];
  distance_km: number | null;
  // Все не удалённые столы схемы; 0 — интерактивной схемы ещё нет.
  map_tables_count: number;
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

// PATCH — все поля опциональны (VenueUpdate, extra="forbid" на бэке).
export interface VenueUpdatePayload {
  name?: string;
  description?: string | null;
  address?: string;
  lat?: number;
  lng?: number;
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

export interface TableBooking {
  id: number;
  starts_at: string;
  ends_at: string;
  is_mine: boolean;
  event_id: number | null;
  event_title: string | null;
  event_type: EventType | null;
}

export interface HallTable {
  id: number;
  label: string;
  x: number;
  y: number;
  rotation: number;
  is_active: boolean;
  schedule: WeekScheduleMap | null;
  bookings: TableBooking[];
}

export interface HallLayout {
  viewbox_width: number;
  viewbox_height: number;
  date: string;
  tables: HallTable[];
}

export interface HallTableWritePayload {
  id?: number;
  label: string;
  x: number;
  y: number;
  rotation: number;
  is_active: boolean;
  schedule: WeekScheduleMap | null;
}

export interface HallLayoutUpdatePayload {
  tables: HallTableWritePayload[];
}

export interface BookingCreatePayload {
  table_id: number;
  starts_at: string;
  ends_at: string;
}

export interface BookingRead {
  id: number;
  table_id: number;
  venue_id: number;
  table_label: string;
  user_id: number;
  starts_at: string;
  ends_at: string;
  status: "active" | "cancelled";
  created_at: string;
}

// target_id: для venue — id зала, для player/coach — user_id профиля.
export interface ReviewRead {
  id: number;
  author_id: number;
  target_type: ReviewTargetType;
  target_id: number;
  rating: number;
  comment: string | null;
  is_hidden: boolean;
  created_at: string;
  deleted_at: string | null;
  author: ProfilePublic | null;
}

export interface ReviewCreatePayload {
  target_type: ReviewTargetType;
  target_id: number;
  rating: number;
  comment?: string | null;
}

export interface ReviewUpdatePayload {
  rating?: number;
  comment?: string | null;
}

export interface ReviewFilterParams {
  target_type?: ReviewTargetType;
  target_id?: number;
  author_id?: number;
  rating?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface TournamentParticipantRead {
  user_id: number;
  status: ParticipantStatus;
  seed: number | null;
  final_place: number | null;
  registered_at: string;
  profile: ProfilePublic | null;
}

export interface TournamentRead {
  id: number;
  city_id: number;
  venue_id: number | null;
  status: TournamentStatus;
  title: string;
  slug: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  registration_deadline: string | null;
  max_participants: number | null;
  skill_level_min: SkillLevel | null;
  skill_level_max: SkillLevel | null;
  rating_min: number | null;
  rating_max: number | null;
  gender_restriction: Gender | null;
  // entry_fee — Decimal с бэка, приходит строкой ("300.00"), как price событий.
  entry_fee: string | null;
  is_official: boolean;
  organizer_id: number | null;
  external_url: string | null;
  created_at: string;
  deleted_at: string | null;
  participants_count: number;
  is_registered: boolean | null;
  // Зал из БД (только детальный ответ) — для ссылки на карточку зала.
  venue: EventVenueRef | null;
}

export interface TournamentCreatePayload {
  city_id: number;
  title: string;
  description?: string | null;
  venue_id?: number | null;
  starts_at: string;
  ends_at?: string | null;
  registration_deadline?: string | null;
  max_participants?: number | null;
  skill_level_min?: SkillLevel | null;
  skill_level_max?: SkillLevel | null;
  rating_min?: number | null;
  rating_max?: number | null;
  gender_restriction?: Gender | null;
  entry_fee?: string | null;
  external_url?: string | null;
}

// PATCH — exclude_unset на бэке: undefined = не трогать, null = очистить поле.
export interface TournamentUpdatePayload {
  title?: string;
  description?: string | null;
  venue_id?: number | null;
  status?: TournamentStatus;
  starts_at?: string;
  ends_at?: string | null;
  registration_deadline?: string | null;
  max_participants?: number | null;
  skill_level_min?: SkillLevel | null;
  skill_level_max?: SkillLevel | null;
  rating_min?: number | null;
  rating_max?: number | null;
  gender_restriction?: Gender | null;
  entry_fee?: string | null;
  external_url?: string | null;
}

export interface TournamentFilterParams {
  city_id?: number;
  status?: TournamentStatus;
  venue_id?: number;
  date_from?: string;
  date_to?: string;
  skill_level_min?: SkillLevel;
  skill_level_max?: SkillLevel;
  gender?: Gender;
  is_official?: boolean;
  q?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface MyTournamentsParams {
  role?: "organizer" | "participant";
  status?: TournamentStatus;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface TournamentParticipantsFilterParams {
  status?: ParticipantStatus;
  limit?: number;
  offset?: number;
}

// target_id: для user — user.id; venue/event/review/partner_request/tournament — id объекта.
export interface ReportRead {
  id: number;
  reporter_id: number | null;
  target_type: ReportTargetType;
  target_id: number;
  reason: string;
  status: ReportStatus;
  resolution_note: string | null;
  resolved_by: number | null;
  resolved_at: string | null;
  created_at: string;
}

// Снапшот цели (тип полей зависит от target_type) — только в детальном ответе модератору.
export interface ReportDetail extends ReportRead {
  target_snapshot: Record<string, unknown> | null;
}

export interface ReportCreatePayload {
  target_type: ReportTargetType;
  target_id: number;
  reason: string;
}

export interface ReportResolvePayload {
  status: ReportResolveStatus;
  resolution_note?: string | null;
}

export interface ReportQueueFilterParams {
  status?: ReportStatus;
  target_type?: ReportTargetType;
  reporter_id?: number;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface MyReportsFilterParams {
  status?: ReportStatus;
  target_type?: ReportTargetType;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface AdminUserRead {
  id: number;
  email: string;
  role: UserRole;
  is_superuser: boolean;
  is_active: boolean;
  is_email_verified: boolean;
  marketing_consent: boolean;
  city_id: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  profile: ProfileMe | null;
}

export interface AdminUserDetail extends AdminUserRead {
  counters: Record<string, number>;
}

export interface AdminUserFilterParams {
  role?: UserRole;
  is_active?: boolean;
  is_email_verified?: boolean;
  city_id?: number;
  include_deleted?: boolean;
  q?: string;
  limit?: number;
  offset?: number;
}

export interface BanPayload {
  reason?: string | null;
}

export interface SetRolePayload {
  role: UserRole;
}

export interface SetSuperuserPayload {
  is_superuser: boolean;
}

export interface AdminVenueFilterParams {
  city_id?: number;
  is_verified?: boolean;
  include_deleted?: boolean;
  q?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}

export interface AdminEventFilterParams extends EventFilterParams {
  organizer_id?: number;
  include_deleted?: boolean;
}

export interface AdminTournamentFilterParams extends TournamentFilterParams {
  organizer_id?: number;
  include_deleted?: boolean;
}

export interface AdminTournamentCreatePayload extends TournamentCreatePayload {
  is_official?: boolean;
}

export interface AdminTournamentUpdatePayload extends TournamentUpdatePayload {
  is_official?: boolean | null;
}

export interface ParticipantAdminUpdatePayload {
  status?: ParticipantStatus;
  seed?: number | null;
  final_place?: number | null;
}

export interface AdminReviewFilterParams {
  target_type?: ReviewTargetType;
  target_id?: number;
  author_id?: number;
  is_hidden?: boolean;
  include_deleted?: boolean;
  limit?: number;
  offset?: number;
}

export interface AdminReviewUpdatePayload extends ReviewUpdatePayload {
  is_hidden?: boolean | null;
}

export interface RatingSyncLogRead {
  id: number;
  profile_id: number;
  triggered_by: string;
  success: boolean;
  old_rating: number | null;
  new_rating: number | null;
  error_message: string | null;
  http_status: number | null;
  duration_ms: number | null;
  created_at: string;
}

export interface RatingSyncLogFilterParams {
  profile_id?: number;
  success?: boolean;
  triggered_by?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface RatingSyncRunResult {
  status: string;
  detail: string;
  profile_id: number;
}

export interface RunAllResult {
  enqueued: number;
}
