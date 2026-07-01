"use client";

import { useState } from "react";

import { Badge, GenderBadge, LevelBadge, RatingBadge, StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { IconAlert } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { EVENT_STATUSES, SKILL_LEVELS } from "@/lib/enums";
import { cn } from "@/lib/utils";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-[22px] shadow-card">
      <h2 className="mb-4 text-[13px] font-extrabold tracking-wider text-muted uppercase">{title}</h2>
      {children}
    </div>
  );
}

const COLORS = [
  { name: "Primary", hex: "#1c5fd0", cls: "bg-primary" },
  { name: "Danger", hex: "#a00010", cls: "bg-danger" },
  { name: "Текст", hex: "#0a0a0a", cls: "bg-fg" },
  { name: "Muted", hex: "#71717a", cls: "bg-muted" },
  { name: "Surface 2", hex: "#f6f6f7", cls: "bg-surface-2" },
  { name: "Border", hex: "#d6d6db", cls: "bg-border-strong" },
];

export default function DesignSystemPage() {
  const [switchOn, setSwitchOn] = useState(true);
  const [checked, setChecked] = useState(false);
  const [stars, setStars] = useState(4);

  return (
    <div className="mx-auto w-full max-w-[1080px] px-4 py-7 sm:px-8">
      <div className="mb-[18px]">
        <h1 className="text-[26px] font-extrabold tracking-[-0.01em]">Дизайн-система</h1>
        <p className="text-sm text-muted">Переиспользуемые компоненты pingUp на дизайн-токенах</p>
      </div>

      <div className="flex flex-col gap-4">
        <Section title="Цвета">
          <div className="mb-[18px] grid grid-cols-[repeat(auto-fill,minmax(118px,1fr))] gap-3">
            {COLORS.map((c) => (
              <div key={c.name}>
                <div className={cn("h-[46px] rounded-lg border border-black/5", c.cls)} />
                <div className="mt-1.5 text-xs font-bold">{c.name}</div>
                <div className="font-mono text-[10.5px] text-muted">{c.hex}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-[18px]">
            <div>
              <div className="mb-[7px] text-[11px] font-bold text-muted">Уровни (--skill-*)</div>
              <div className="flex gap-[7px]">
                {["bg-skill-beginner", "bg-skill-amateur", "bg-skill-intermediate", "bg-skill-advanced", "bg-skill-pro"].map(
                  (c) => (
                    <span key={c} className={cn("size-[30px] rounded-[7px]", c)} />
                  ),
                )}
              </div>
            </div>
            <div>
              <div className="mb-[7px] text-[11px] font-bold text-muted">Статусы (--status-*)</div>
              <div className="flex gap-[7px]">
                {["bg-status-open", "bg-status-progress", "bg-status-pending", "bg-status-cancelled", "bg-status-full"].map(
                  (c) => (
                    <span key={c} className={cn("size-[30px] rounded-[7px]", c)} />
                  ),
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Типографика · Manrope">
          <div className="flex flex-col gap-2.5">
            <div className="text-[34px] leading-[1.1] font-extrabold tracking-[-0.02em]">
              Заголовок H1 — 34/800
            </div>
            <div className="text-[22px] font-extrabold">Заголовок H2 — 22/800</div>
            <div className="text-base font-bold">Подзаголовок — 16/700</div>
            <div className="max-w-[560px] text-[15px] leading-relaxed text-fg-2">
              Основной текст — 15/400. Настольный теннис в Смоленске: партнёры, залы и турниры в одном
              сервисе.
            </div>
            <div className="text-xs font-semibold text-muted">Подпись / caption — 12/600</div>
          </div>
        </Section>

        <Section title="Кнопки">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button onClick={() => toast("Основная кнопка")}>Основная</Button>
            <Button variant="secondary" onClick={() => toast("Вторичная")}>
              Вторичная
            </Button>
            <Button variant="ghost" onClick={() => toast("Ghost")}>
              Ghost
            </Button>
            <Button variant="danger">Удалить</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Загрузка</Button>
          </div>
        </Section>

        <Section title="Поля и контролы">
          <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] items-start gap-[18px]">
            <Field label="Поле ввода">
              <Input placeholder="Введите текст" />
            </Field>
            <Field label="Выпадающий список">
              <Select defaultValue="singles">
                <option value="singles">Одиночка</option>
                <option value="doubles">Пара</option>
                <option value="group">Группа</option>
              </Select>
            </Field>
            <div>
              <div className="mb-2.5 text-[13px] font-bold text-fg-2">Переключатель</div>
              <div className="flex items-center gap-2.5">
                <Switch checked={switchOn} onCheckedChange={setSwitchOn} label="Уведомления" />
                <span className="text-sm font-semibold text-fg-2">Уведомления</span>
              </div>
            </div>
            <div>
              <div className="mb-2.5 text-[13px] font-bold text-fg-2">Чек-бокс</div>
              <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)}>
                Согласен с правилами
              </Checkbox>
            </div>
            <div>
              <div className="mb-2 text-[13px] font-bold text-fg-2">Звёздный рейтинг</div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setStars(n)}
                    className="p-0.5 leading-none"
                    aria-label={`Оценка ${n}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      width="26"
                      height="26"
                      fill={n <= stars ? "#b07a1f" : "none"}
                      stroke="#b07a1f"
                      strokeWidth={1.6}
                      strokeLinejoin="round"
                    >
                      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Бейджи">
          <div className="flex flex-col gap-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="min-w-24 text-xs font-bold text-muted">LevelBadge</span>
              {SKILL_LEVELS.map((l) => (
                <LevelBadge key={l} level={l} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="min-w-24 text-xs font-bold text-muted">StatusBadge</span>
              {EVENT_STATUSES.map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="min-w-24 text-xs font-bold text-muted">Прочие</span>
              <RatingBadge rating={1080} />
              <RatingBadge rating={920} stale />
              <GenderBadge gender="male" />
              <Badge>3 / 8 мест</Badge>
              <Badge tone="soft">2,4 км</Badge>
            </div>
          </div>
        </Section>

        <Section title="Состояния и оверлеи">
          <div className="mb-[18px] flex flex-wrap gap-2.5">
            <Button variant="secondary" onClick={() => toast.success("Уведомление отправлено")}>
              Показать Toast
            </Button>
            <Button variant="secondary" onClick={() => toast.error("Не удалось загрузить")}>
              Toast ошибки
            </Button>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
            <div className="flex flex-col gap-2.5 rounded border border-border p-3.5">
              <Skeleton className="h-3.5 w-[70%]" />
              <Skeleton className="h-[11px] w-[90%]" />
              <Skeleton className="h-[11px] w-1/2" />
              <div className="mt-0.5 text-[11px] font-semibold text-muted">Skeleton</div>
            </div>
            <div className="flex flex-col items-center justify-center gap-1.5 rounded border border-border p-3.5 text-center text-status-cancelled">
              <IconAlert size={22} />
              <div className="text-xs font-bold text-fg-2">Ошибка</div>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
