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

import type { Gender, PlayingHand, SkillLevel } from "@/lib/enums";

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
