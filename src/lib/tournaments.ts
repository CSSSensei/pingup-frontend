import type { TournamentRead } from "@/types/api";

function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return forms[1];
  return forms[2];
}

export function participantsLabel(n: number): string {
  return `${n} ${plural(n, ["участник", "участника", "участников"])}`;
}

// «12 из 32» или «12 участников» без потолка.
export function slotsLabel(t: TournamentRead): string {
  if (t.max_participants != null) return `${t.participants_count} из ${t.max_participants}`;
  return participantsLabel(t.participants_count);
}

export function isFull(t: TournamentRead): boolean {
  return t.max_participants != null && t.participants_count >= t.max_participants;
}

export function deadlinePassed(t: TournamentRead): boolean {
  return t.registration_deadline != null && new Date(t.registration_deadline).getTime() < Date.now();
}

// «3 место» / «посев 2» — короткая подпись результата участника.
export function placeLabel(seed: number | null, finalPlace: number | null): string | null {
  if (finalPlace != null) return `${finalPlace} место`;
  if (seed != null) return `посев ${seed}`;
  return null;
}
