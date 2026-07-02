import type {
  EventFilterParams,
  MyEventsParams,
  MyPartnerRequestsParams,
  MyTournamentsParams,
  PartnerRequestFilterParams,
  ProfileFilterParams,
  ReviewFilterParams,
  TournamentFilterParams,
  VenueFilterParams,
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
  venues: (filter?: VenueFilterParams) => ["venues", filter ?? {}] as const,
  venue: (slug: string) => ["venue", slug] as const,
  reviews: (filter?: ReviewFilterParams) => ["reviews", filter ?? {}] as const,
  tournaments: (filter?: TournamentFilterParams) => ["tournaments", filter ?? {}] as const,
  tournament: (slug: string) => ["tournament", slug] as const,
  tournamentParticipants: (id: number, status?: ParticipantStatus) =>
    ["tournament", id, "participants", status ?? "all"] as const,
  myTournaments: (params?: MyTournamentsParams) => ["myTournaments", params ?? {}] as const,
};
