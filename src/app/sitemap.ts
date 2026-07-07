import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.pingup.pro").replace(/\/+$/, "");

const PAGE_SIZE = 100;
const MAX_PAGES = 20;
type ChangeFreq = MetadataRoute.Sitemap[number]["changeFrequency"];

async function fetchAll<T>(path: string): Promise<T[]> {
  const out: T[] = [];
  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const sep = path.includes("?") ? "&" : "?";
      const res = await fetch(`${API_URL}${path}${sep}limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`, {
        next: { revalidate: 3600 },
      });
      if (!res.ok) break;
      const data = (await res.json()) as { items?: T[]; total?: number };
      const items = data.items ?? [];
      out.push(...items);
      if (items.length < PAGE_SIZE || out.length >= (data.total ?? out.length)) break;
    }
  } catch {
  }
  return out;
}

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: ChangeFreq }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/games", priority: 0.9, changeFrequency: "hourly" },
  { path: "/venues", priority: 0.8, changeFrequency: "weekly" },
  { path: "/tournaments", priority: 0.8, changeFrequency: "daily" },
  { path: "/trainings", priority: 0.8, changeFrequency: "daily" },
  { path: "/partners", priority: 0.7, changeFrequency: "hourly" },
  { path: "/players", priority: 0.7, changeFrequency: "daily" },
  { path: "/rating", priority: 0.7, changeFrequency: "daily" },
  { path: "/legal/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/legal/terms", priority: 0.2, changeFrequency: "yearly" },
];

type VenueItem = { slug: string; created_at?: string };
type ProfileItem = { slug: string | null };
type TournamentItem = { slug: string; created_at?: string };
type EventItem = {
  id: number;
  event_type: string;
  status: string;
  is_public: boolean;
  created_at?: string;
};
type PartnerItem = { id: number; created_at?: string };

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const date = (s?: string) => (s ? new Date(s) : now);

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const [venues, profiles, tournaments, events, partners] = await Promise.all([
    fetchAll<VenueItem>("/api/v1/venues"),
    fetchAll<ProfileItem>("/api/v1/profiles"),
    fetchAll<TournamentItem>("/api/v1/tournaments"),
    fetchAll<EventItem>("/api/v1/events"),
    fetchAll<PartnerItem>("/api/v1/partner-requests"),
  ]);

  const venueEntries: MetadataRoute.Sitemap = venues.map((v) => ({
    url: `${SITE_URL}/venues/${v.slug}`,
    lastModified: date(v.created_at),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const playerEntries: MetadataRoute.Sitemap = profiles
    .filter((p) => p.slug)
    .map((p) => ({
      url: `${SITE_URL}/players/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  const tournamentEntries: MetadataRoute.Sitemap = tournaments.map((t) => ({
    url: `${SITE_URL}/tournaments/${t.slug}`,
    lastModified: date(t.created_at),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const publicEvents = events.filter(
    (e) => e.is_public !== false && e.status !== "draft" && e.status !== "cancelled",
  );

  const gameEntries: MetadataRoute.Sitemap = publicEvents
    .filter((e) => e.event_type === "game")
    .map((e) => ({
      url: `${SITE_URL}/games/${e.id}`,
      lastModified: date(e.created_at),
      changeFrequency: "daily",
      priority: 0.5,
    }));

  const trainingEntries: MetadataRoute.Sitemap = publicEvents
    .filter((e) => e.event_type === "group_training" || e.event_type === "personal_sparring")
    .map((e) => ({
      url: `${SITE_URL}/trainings/${e.id}`,
      lastModified: date(e.created_at),
      changeFrequency: "daily",
      priority: 0.5,
    }));

  const partnerEntries: MetadataRoute.Sitemap = partners.map((p) => ({
    url: `${SITE_URL}/partners/${p.id}`,
    lastModified: date(p.created_at),
    changeFrequency: "daily",
    priority: 0.4,
  }));

  return [
    ...staticEntries,
    ...venueEntries,
    ...playerEntries,
    ...tournamentEntries,
    ...gameEntries,
    ...trainingEntries,
    ...partnerEntries,
  ];
}
