import type { EventType } from "@/lib/enums";

const SECTION_BY_TYPE: Record<EventType, string> = {
  game: "/games",
  group_training: "/trainings",
  personal_sparring: "/trainings",
};

export function eventHref(event: { id: number; event_type: EventType }): string {
  return `${SECTION_BY_TYPE[event.event_type]}/${event.id}`;
}
