import { SKILL_LABELS, type SkillLevel } from "@/lib/enums";

export function skillRangeLabel(min: SkillLevel | null, max: SkillLevel | null): string {
  if (min && max) {
    return min === max ? SKILL_LABELS[min] : `${SKILL_LABELS[min]} – ${SKILL_LABELS[max]}`;
  }
  if (min) return `${SKILL_LABELS[min]} и выше`;
  if (max) return `до ${SKILL_LABELS[max]}`;
  return "Любой";
}

export function ratingRangeLabel(min: number | null, max: number | null): string | null {
  if (min != null && max != null) return `${min}–${max}`;
  if (min != null) return `от ${min}`;
  if (max != null) return `до ${max}`;
  return null;
}

// «4 отклика» с правильным склонением.
export function responsesLabel(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? "отклик"
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)
        ? "отклика"
        : "откликов";
  return `${n} ${word}`;
}
