import type {
  EventFilterParams,
  MyEventsParams,
  MyPartnerRequestsParams,
  PartnerRequestFilterParams,
  ProfileFilterParams,
} from "@/types/api";
import type { ParticipantStatus } from "@/lib/enums";

export const qk = {
  me: ["me"] as const,
  events: (filter?: EventFilterParams) => ["events", filter ?? {}] as const,
  event: (id: number) => ["event", id] as const,
  eventParticipants: (id: number, status?: ParticipantStatus) =>
    ["event", id, "participants", status ?? "all"] as const,
  myEvents: (params?: MyEventsParams) => ["myEvents", params ?? {}] as const,
  partnerRequests: (filter?: PartnerRequestFilterParams) => ["partnerRequests", filter ?? {}] as const,
  partnerRequest: (id: number) => ["partnerRequest", id] as const,
  partnerResponses: (id: number) => ["partnerRequest", id, "responses"] as const,
  myPartnerRequests: (params?: MyPartnerRequestsParams) => ["myPartnerRequests", params ?? {}] as const,
  notifications: ["notifications"] as const,
  unreadCount: ["notifications", "unread"] as const,
  profiles: (filter?: ProfileFilterParams) => ["profiles", filter ?? {}] as const,
  profile: (slug: string) => ["profile", slug] as const,
  ratingHistory: (slug: string) => ["profile", slug, "rating-history"] as const,
  myProfile: ["myProfile"] as const,
  myRatingHistory: ["myProfile", "rating-history"] as const,
};
