import type { Metadata } from "next";

import { PlayerDetailView } from "@/components/features/player-detail-view";
import { PublicShell } from "@/components/layout/public-shell";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.pingup.pro";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const canonical = `/players/${slug}`;

  try {
    const res = await fetch(`${API_URL}/api/v1/profiles/${slug}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const p = (await res.json()) as {
        display_name: string;
        is_coach: boolean;
        current_rating: number | null;
      };
      const bits = [
        p.is_coach ? "тренер" : null,
        p.current_rating != null ? `рейтинг ${p.current_rating}` : null,
      ].filter(Boolean);
      const description = `${p.display_name} — профиль игрока в настольный теннис на pingup${
        bits.length ? ` · ${bits.join(" · ")}` : ""
      }.`;
      return {
        title: p.display_name,
        description,
        alternates: { canonical },
        openGraph: { title: `${p.display_name} · pingup`, description, url: canonical, type: "profile" },
      };
    }
  } catch {
  }

  return { title: "Профиль игрока", alternates: { canonical } };
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <PublicShell className="max-w-2xl">
      <PlayerDetailView slug={slug} />
    </PublicShell>
  );
}
