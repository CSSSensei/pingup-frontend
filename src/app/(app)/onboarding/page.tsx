"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { IconAlertCircle, IconCamera, IconChevronLeft } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { BallSpinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { profilesApi } from "@/lib/api/endpoints/profiles";
import {
  GENDERS,
  GENDER_LABELS,
  PLAYING_HANDS,
  PLAYING_HAND_LABELS,
  SKILL_LABELS,
  SKILL_LEVELS,
  type Gender,
  type PlayingHand,
  type SkillLevel,
} from "@/lib/enums";
import { apiErrorMessage, fieldErrors } from "@/lib/errors/messages";
import {
  formatRuPhone,
  validateAvatarFile,
  validateBirthYear,
  validatePhone,
  validateTelegram,
  validateTennis67Url,
} from "@/lib/schemas/onboarding";
import { cn } from "@/lib/utils";
import type { ProfileUpdate } from "@/types/api";

const STEPS = [
  { label: "Шаг 1 из 5", title: "Какой у вас уровень?", sub: "Подберём соперников по силам. Уровень можно изменить в любой момент." },
  { label: "Шаг 2 из 5", title: "Немного о себе", sub: "Фото и пара деталей помогут партнёрам узнать вас на игре." },
  { label: "Шаг 3 из 5", title: "Ваша экипировка", sub: "Необязательно — но интересно тем, кто подбирает спарринг по инвентарю." },
  { label: "Шаг 4 из 5", title: "Как с вами связаться", sub: "Контакты увидят только подтверждённые партнёры по игре." },
  { label: "Шаг 5 из 5", title: "Официальный рейтинг", sub: "Подтянем рейтинг с теннис67.рф и будем держать его актуальным." },
];

type VField = "birthYear" | "telegram" | "phone" | "tennis67";
const STEP_FIELDS: Partial<Record<number, VField[]>> = {
  2: ["birthYear"],
  4: ["telegram", "phone"],
  5: ["tennis67"],
};
const SERVER_TO_FIELD: Record<string, { field: VField; step: number }> = {
  birth_year: { field: "birthYear", step: 2 },
  telegram_username: { field: "telegram", step: 4 },
  phone: { field: "phone", step: 4 },
};
const FIELD_IDS: Record<VField, string> = {
  birthYear: "ob-birthYear",
  telegram: "ob-telegram",
  phone: "ob-phone",
  tennis67: "ob-tennis67",
};

function validateField(name: VField, value: string): string | null {
  switch (name) {
    case "birthYear":
      return validateBirthYear(value);
    case "telegram":
      return validateTelegram(value);
    case "phone":
      return validatePhone(value);
    case "tennis67":
      return validateTennis67Url(value);
  }
}

function RadioChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { value: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
}) {
  const groupRef = useRef<HTMLDivElement>(null);

  function move(delta: number, from: number) {
    const next = (from + delta + options.length) % options.length;
    onChange(options[next].value);
    groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')?.[next]?.focus();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const cur = Math.max(
      0,
      options.findIndex((o) => o.value === value),
    );
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      move(1, cur);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      move(-1, cur);
    }
  }

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="flex flex-wrap gap-2"
    >
      {options.map((o, i) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active || (value === null && i === 0) ? 0 : -1}
            onClick={() => onChange(o.value)}
            className={cn(
              "rounded border-[1.5px] px-[15px] py-[9px] text-[13.5px] font-bold whitespace-nowrap transition-colors",
              active
                ? "border-primary bg-primary-tint text-primary"
                : "border-border bg-surface text-fg-2 hover:bg-surface-2",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function ErrorText({ id, msg }: { id: string; msg?: string }) {
  if (!msg) return null;
  return (
    <span
      id={id}
      role="alert"
      className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-danger motion-safe:animate-[pu-fade_0.15s_ease-out]"
    >
      <IconAlertCircle size={13} className="flex-none" />
      {msg}
    </span>
  );
}

const AFTER_ONBOARDING = "/profile";

export default function OnboardingPage() {
  const router = useRouter();
  const yearErrId = useId();
  const tgErrId = useId();
  const phoneErrId = useId();
  const tnErrId = useId();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [focusField, setFocusField] = useState<VField | null>(null);

  const [level, setLevel] = useState<SkillLevel | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [hand, setHand] = useState<PlayingHand | null>(null);
  const [birthYear, setBirthYear] = useState("");
  const [avatar, setAvatar] = useState<{ file: File; url: string } | null>(null);
  const [blade, setBlade] = useState("");
  const [rubberFh, setRubberFh] = useState("");
  const [rubberBh, setRubberBh] = useState("");
  const [telegram, setTelegram] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneVisible, setPhoneVisible] = useState(true);
  const [tennis67, setTennis67] = useState("");

  const meta = STEPS[step - 1];
  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  // Фокус на конкретное невалидное поле (после смены шага перебивает фокус заголовка).
  useEffect(() => {
    if (!focusField) return;
    document.getElementById(FIELD_IDS[focusField])?.focus();
    setFocusField(null);
  }, [focusField]);

  // Префилл из текущего профиля — иначе «Готово» затрёт сохранённые поля null-ами.
  useEffect(() => {
    let cancelled = false;
    profilesApi
      .me()
      .then((p) => {
        if (cancelled) return;
        setLevel(p.skill_level);
        setGender(p.gender);
        setHand(p.playing_hand);
        setBirthYear(p.birth_year ? String(p.birth_year) : "");
        setBlade(p.blade ?? "");
        setRubberFh(p.rubber_forehand ?? "");
        setRubberBh(p.rubber_backhand ?? "");
        setTelegram(p.telegram_username ?? "");
        setPhone(p.phone ? formatRuPhone(p.phone) : "");
        setPhoneVisible(p.phone_visible);
        setTennis67(p.tennis67_url ?? "");
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setters: Record<VField, (v: string) => void> = {
    birthYear: setBirthYear,
    telegram: setTelegram,
    phone: setPhone,
    tennis67: setTennis67,
  };
  const values: Record<VField, string> = { birthYear, telegram, phone, tennis67 };

  function handleChange(name: VField, value: string) {
    setters[name](value);
    if (touched[name]) setErrors((e) => ({ ...e, [name]: validateField(name, value) ?? "" }));
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const raw = input.value;
    const caret = input.selectionStart ?? raw.length;
    const prevDigits = phone.replace(/\D/g, "");
    const rawDigits = raw.replace(/\D/g, "");
    let digitsLeft = raw.slice(0, caret).replace(/\D/g, "").length;
    let digits = rawDigits;
    // Backspace по разделителю: цифры не изменились, длина упала → удаляем левую цифру.
    if (raw.length < phone.length && rawDigits === prevDigits && digitsLeft > 0) {
      digits = rawDigits.slice(0, digitsLeft - 1) + rawDigits.slice(digitsLeft);
      digitsLeft -= 1;
    }
    const formatted = formatRuPhone(digits);
    setPhone(formatted);
    if (touched.phone) setErrors((er) => ({ ...er, phone: validatePhone(formatted) ?? "" }));
    // Вернуть каретку после digitsLeft-й цифры в отформатированной строке.
    requestAnimationFrame(() => {
      if (document.activeElement !== input) return;
      let pos = 0;
      if (digitsLeft > 0) {
        pos = formatted.length;
        let seen = 0;
        for (let i = 0; i < formatted.length; i++) {
          const ch = formatted.charAt(i);
          if (ch >= "0" && ch <= "9") {
            seen += 1;
            if (seen === digitsLeft) {
              pos = i + 1;
              break;
            }
          }
        }
      }
      input.setSelectionRange(pos, pos);
    });
  }

  function handleBlur(name: VField, value: string) {
    setTouched((t) => ({ ...t, [name]: true }));
    setErrors((e) => ({ ...e, [name]: validateField(name, value) ?? "" }));
  }

  function validateStep(s: number): boolean {
    const fields = STEP_FIELDS[s] ?? [];
    const stepErrors: Record<string, string> = {};
    let ok = true;
    for (const f of fields) {
      const err = validateField(f, values[f]);
      if (err) {
        stepErrors[f] = err;
        ok = false;
      }
    }
    if (!ok) {
      setTouched((t) => ({ ...t, ...Object.fromEntries(fields.map((f) => [f, true])) }));
      setErrors((e) => ({ ...e, ...stepErrors }));
      const firstBad = fields.find((f) => stepErrors[f]);
      if (firstBad) setFocusField(firstBad);
    }
    return ok;
  }

  function handleServerError(err: unknown) {
    const fe = fieldErrors(err);
    const mapped: Record<string, string> = {};
    let jump: number | null = null;
    let jumpField: VField | null = null;
    for (const [srv, msg] of Object.entries(fe)) {
      const m = SERVER_TO_FIELD[srv];
      if (m) {
        mapped[m.field] = msg;
        if (jump === null || m.step < jump) {
          jump = m.step;
          jumpField = m.field;
        }
      }
    }
    if (Object.keys(mapped).length) {
      setErrors((e) => ({ ...e, ...mapped }));
      setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(mapped).map((f) => [f, true])) }));
      if (jump !== null) setStep(jump);
      if (jumpField) setFocusField(jumpField);
    } else {
      toast.error(apiErrorMessage(err));
    }
  }

  function pickAvatar(file: File | undefined) {
    if (!file) return;
    const err = validateAvatarFile(file);
    if (err) {
      setErrors((e) => ({ ...e, avatar: err }));
      return;
    }
    setErrors((e) => ({ ...e, avatar: "" }));
    if (avatar) URL.revokeObjectURL(avatar.url);
    setAvatar({ file, url: URL.createObjectURL(file) });
  }

  async function finish() {
    setSaving(true);
    const patch: ProfileUpdate = {
      skill_level: level,
      gender,
      playing_hand: hand,
      birth_year: birthYear ? Number(birthYear) : null,
      blade: blade.trim() || null,
      rubber_forehand: rubberFh.trim() || null,
      rubber_backhand: rubberBh.trim() || null,
      telegram_username: telegram.trim() || null,
      phone: phone.trim() || null,
      phone_visible: phoneVisible,
    };
    const tennisUrl = tennis67.trim();
    try {
      await profilesApi.update(patch);
    } catch (err) {
      setSaving(false);
      handleServerError(err);
      return;
    }
    // Аватар — best-effort: не блокирует завершение мягкого онбординга.
    if (avatar) {
      try {
        await profilesApi.uploadAvatar(avatar.file);
      } catch (err) {
        toast.error(`Фото не загрузилось: ${apiErrorMessage(err)}. Добавите позже в профиле.`);
      }
    }
    // tennis67 — отклонение сервером показываем под полем, не теряя остальной ввод.
    if (tennisUrl) {
      try {
        await profilesApi.setTennis67(tennisUrl);
      } catch (err) {
        setSaving(false);
        setStep(5);
        setTouched((t) => ({ ...t, tennis67: true }));
        setErrors((e) => ({ ...e, tennis67: apiErrorMessage(err) }));
        return;
      }
    }
    toast.success("Профиль создан — добро пожаловать!");
    router.push(AFTER_ONBOARDING);
  }

  function next() {
    if (!validateStep(step)) return;
    if (step < STEPS.length) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      void finish();
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-2">
        <BallSpinner size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-2 px-[18px] pt-6 pb-12">
      <div className="mx-auto max-w-[560px]">
        <div className="mb-[18px] flex items-center justify-between">
          <Logo className="h-[26px]" />
          <button
            type="button"
            onClick={() => router.push(AFTER_ONBOARDING)}
            className="text-sm font-bold text-muted hover:text-fg-2"
          >
            Пропустить всё
          </button>
        </div>

        <div className="rounded-lg border border-border bg-surface p-[26px] shadow-card">
          <div
            className="mb-2.5 flex gap-1.5"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={step}
            aria-label={`Шаг ${step} из ${STEPS.length}`}
          >
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-1 flex-1 rounded-sm transition-colors",
                  i < step ? "bg-primary" : "bg-border",
                )}
              />
            ))}
          </div>
          <div className="mb-3.5 text-xs font-bold tracking-wide text-primary">{meta.label}</div>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-2xl font-extrabold tracking-[-0.01em] outline-none"
          >
            {meta.title}
          </h1>
          <p className="mt-1.5 mb-6 text-sm leading-relaxed text-muted">{meta.sub}</p>

          {step === 1 && (
            <RadioChipGroup
              label="Уровень игры"
              options={SKILL_LEVELS.map((l) => ({ value: l, label: SKILL_LABELS[l] }))}
              value={level}
              onChange={setLevel}
            />
          )}

          {step === 2 && (
            <>
              <div className="mb-[22px] flex items-center gap-4">
                <div className="flex size-[76px] flex-none items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border-strong bg-surface-2 text-muted">
                  {avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatar.url} alt="" className="size-full object-cover" />
                  ) : (
                    <IconCamera size={26} />
                  )}
                </div>
                <div>
                  <label className="inline-flex h-10 cursor-pointer items-center rounded border border-border bg-surface px-4 text-[13.5px] font-bold text-fg hover:bg-surface-2">
                    Загрузить фото
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => pickAvatar(e.target.files?.[0])}
                    />
                  </label>
                  <div className={cn("mt-1.5 text-xs", errors.avatar ? "font-semibold text-danger" : "text-muted")}>
                    {errors.avatar || "JPG, PNG или WebP"}
                  </div>
                </div>
              </div>
              <div className="mb-5 flex flex-wrap gap-4">
                <div className="min-w-[160px] flex-1">
                  <span className="mb-2.5 block text-[13px] font-bold text-fg-2">Пол</span>
                  <RadioChipGroup
                    label="Пол"
                    options={GENDERS.map((g) => ({ value: g, label: GENDER_LABELS[g] }))}
                    value={gender}
                    onChange={setGender}
                  />
                </div>
                <div className="min-w-[160px] flex-1">
                  <label
                    htmlFor="ob-birthYear"
                    className="mb-2.5 block text-[13px] font-bold text-fg-2"
                  >
                    Год рождения
                  </label>
                  <Input
                    id="ob-birthYear"
                    type="number"
                    inputMode="numeric"
                    min={1920}
                    placeholder="1998"
                    value={birthYear}
                    invalid={!!errors.birthYear}
                    aria-describedby={errors.birthYear ? yearErrId : undefined}
                    onChange={(e) => handleChange("birthYear", e.target.value)}
                    onBlur={(e) => handleBlur("birthYear", e.target.value)}
                  />
                  <ErrorText id={yearErrId} msg={errors.birthYear} />
                </div>
              </div>
              <div>
                <span className="mb-2.5 block text-[13px] font-bold text-fg-2">Ведущая рука</span>
                <RadioChipGroup
                  label="Ведущая рука"
                  options={PLAYING_HANDS.map((h) => ({ value: h, label: PLAYING_HAND_LABELS[h] }))}
                  value={hand}
                  onChange={setHand}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-3">
              <Input
                maxLength={120}
                placeholder="Основа ракетки (напр. Butterfly Viscaria)"
                value={blade}
                onChange={(e) => setBlade(e.target.value)}
              />
              <div className="flex flex-wrap gap-3">
                <Input
                  className="min-w-[150px] flex-1"
                  maxLength={120}
                  placeholder="Накладка форхенд"
                  value={rubberFh}
                  onChange={(e) => setRubberFh(e.target.value)}
                />
                <Input
                  className="min-w-[150px] flex-1"
                  maxLength={120}
                  placeholder="Накладка бекхенд"
                  value={rubberBh}
                  onChange={(e) => setRubberBh(e.target.value)}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <>
              <div className="mb-3.5 flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <div
                    className={cn(
                      "flex h-11 items-center rounded border bg-surface px-3.5",
                      errors.telegram ? "border-danger" : "border-border",
                    )}
                  >
                    <span className="font-bold text-muted">@</span>
                    <input
                      id="ob-telegram"
                      value={telegram}
                      placeholder="telegram"
                      aria-label="Имя пользователя Telegram"
                      aria-invalid={errors.telegram ? true : undefined}
                      aria-describedby={errors.telegram ? tgErrId : undefined}
                      onChange={(e) => handleChange("telegram", e.target.value.replace(/^@+/, ""))}
                      onBlur={(e) => handleBlur("telegram", e.target.value)}
                      className="flex-1 border-0 bg-transparent pl-1 text-base font-medium text-fg outline-none placeholder:text-zinc-400 sm:text-[15px]"
                    />
                  </div>
                  <ErrorText id={tgErrId} msg={errors.telegram} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Input
                    id="ob-phone"
                    type="tel"
                    inputMode="tel"
                    aria-label="Телефон"
                    maxLength={20}
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    invalid={!!errors.phone}
                    aria-describedby={errors.phone ? phoneErrId : undefined}
                    onChange={handlePhoneChange}
                    onBlur={(e) => handleBlur("phone", e.target.value)}
                  />
                  <ErrorText id={phoneErrId} msg={errors.phone} />
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 rounded bg-surface-2 px-3.5 py-3">
                <div>
                  <div className="text-sm font-bold">Показывать телефон в профиле</div>
                  <div className="mt-0.5 text-xs text-muted">
                    Telegram виден всегда, телефон — по желанию
                  </div>
                </div>
                <Switch
                  checked={phoneVisible}
                  onCheckedChange={setPhoneVisible}
                  label="Показывать телефон"
                />
              </div>
            </>
          )}

          {step === 5 && (
            <div>
              <label htmlFor="ob-tennis67" className="block text-[13px] font-bold text-fg-2">
                Ссылка на профиль теннис67.рф
              </label>
              <Input
                id="ob-tennis67"
                className="mt-2.5"
                placeholder="https://теннис67.рф/rating/personal.php?sportsman=…"
                value={tennis67}
                invalid={!!errors.tennis67}
                aria-describedby={errors.tennis67 ? tnErrId : undefined}
                onChange={(e) => handleChange("tennis67", e.target.value)}
                onBlur={(e) => handleBlur("tennis67", e.target.value)}
              />
              <ErrorText id={tnErrId} msg={errors.tennis67} />
            </div>
          )}

          <div className="mt-[26px] flex gap-2.5">
            {step > 1 && (
              <Button
                variant="secondary"
                size="lg"
                aria-label="Назад"
                onClick={() => {
                  setStep(step - 1);
                  window.scrollTo(0, 0);
                }}
                className="w-[52px] flex-none px-0"
              >
                <IconChevronLeft />
              </Button>
            )}
            <Button size="lg" fullWidth loading={saving} onClick={next}>
              {step < STEPS.length ? "Далее" : "Готово"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
