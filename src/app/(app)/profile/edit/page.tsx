"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";

import { ErrorState } from "@/components/common/states";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Field } from "@/components/ui/field";
import { IconArrowLeft, IconCamera } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { BallSpinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { useMyProfile, useSetTennis67, useUpdateProfile, useUploadAvatar } from "@/hooks/useProfiles";
import { useBlades, useRubbers } from "@/lib/data/equipment";
import {
  GENDERS,
  GENDER_LABELS,
  PLAYING_HANDS,
  PLAYING_HAND_LABELS,
  SKILL_LABELS,
  SKILL_LEVELS,
} from "@/lib/enums";
import { apiErrorMessage, fieldErrors } from "@/lib/errors/messages";
import { mediaUrl } from "@/lib/media";
import { formatRuPhone, validateAvatarFile } from "@/lib/schemas/onboarding";
import { profileEditSchema, type ProfileEditValues } from "@/lib/schemas/profile";
import type { ProfileMe, ProfileUpdate } from "@/types/api";

function toDefaults(p: ProfileMe): ProfileEditValues {
  return {
    display_name: p.display_name,
    bio: p.bio ?? "",
    gender: p.gender ?? "",
    skill_level: p.skill_level ?? "",
    playing_hand: p.playing_hand ?? "",
    birth_date: p.birth_date ?? "",
    blade: p.blade ?? "",
    rubber_forehand: p.rubber_forehand ?? "",
    rubber_backhand: p.rubber_backhand ?? "",
    telegram_username: p.telegram_username ?? "",
    phone: p.phone ? formatRuPhone(p.phone) : "",
    phone_visible: p.phone_visible,
    is_coach: p.is_coach,
    tennis67_url: p.tennis67_url ?? "",
  };
}

export default function ProfileEditPage() {
  const query = useMyProfile();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <Link
        href="/profile"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-fg"
      >
        <IconArrowLeft size={16} />
        К профилю
      </Link>

      {query.isPending ? (
        <div className="flex justify-center py-16">
          <BallSpinner size={30} />
        </div>
      ) : query.isError ? (
        <ErrorState onRetry={() => query.refetch()} />
      ) : (
        <EditForm profile={query.data} />
      )}
    </div>
  );
}

function EditForm({ profile }: { profile: ProfileMe }) {
  const router = useRouter();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const setTennis67 = useSetTennis67();
  const rubbers = useRubbers();
  const blades = useBlades();

  const [avatar, setAvatar] = useState<{ file: File; url: string } | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const didReset = useRef(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: toDefaults(profile),
  });

  useEffect(() => {
    if (!didReset.current) {
      reset(toDefaults(profile));
      didReset.current = true;
    }
  }, [profile, reset]);

  function pickAvatar(file: File | undefined) {
    if (!file) return;
    const err = validateAvatarFile(file);
    if (err) {
      setAvatarError(err);
      return;
    }
    setAvatarError("");
    if (avatar) URL.revokeObjectURL(avatar.url);
    setAvatar({ file, url: URL.createObjectURL(file) });
  }

  const onSubmit: SubmitHandler<ProfileEditValues> = async (v) => {
    const patch: ProfileUpdate = {
      display_name: v.display_name.trim(),
      bio: v.bio?.trim() || null,
      // zod уже сузил до валидного enum | ""; "" → null. Каст снимает расширение до string.
      gender: (v.gender || null) as ProfileUpdate["gender"],
      skill_level: (v.skill_level || null) as ProfileUpdate["skill_level"],
      playing_hand: (v.playing_hand || null) as ProfileUpdate["playing_hand"],
      birth_date: v.birth_date?.trim() || null,
      blade: v.blade?.trim() || null,
      rubber_forehand: v.rubber_forehand?.trim() || null,
      rubber_backhand: v.rubber_backhand?.trim() || null,
      telegram_username: v.telegram_username?.trim() || null,
      phone: v.phone?.trim() || null,
      phone_visible: v.phone_visible,
      is_coach: v.is_coach,
    };

    try {
      await updateProfile.mutateAsync(patch);
    } catch (err) {
      const fe = fieldErrors(err);
      if (Object.keys(fe).length) {
        for (const [field, message] of Object.entries(fe)) {
          if (field in patch) setError(field as keyof ProfileEditValues, { message });
        }
      } else {
        toast.error(apiErrorMessage(err));
      }
      return;
    }

    // Аватар — best-effort: не блокирует сохранение остального.
    if (avatar) {
      try {
        await uploadAvatar.mutateAsync(avatar.file);
      } catch (err) {
        toast.error(`Фото не загрузилось: ${apiErrorMessage(err)}`);
      }
    }

    // tennis67 — отдельный эндпоинт; шлём только если ссылка изменилась и непустая.
    const tennis = v.tennis67_url?.trim() ?? "";
    if (tennis && tennis !== (profile.tennis67_url ?? "")) {
      try {
        await setTennis67.mutateAsync(tennis);
      } catch (err) {
        setError("tennis67_url", { message: apiErrorMessage(err) });
        toast.error("Профиль сохранён, но ссылку теннис67 привязать не вышло");
        return;
      }
    }

    toast.success("Профиль сохранён");
    router.push("/profile");
  };

  const currentAvatar = avatar?.url ?? mediaUrl(profile.avatar_url);
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <PageHeader title="Редактирование профиля" />

      {/* Основное */}
      <section className="space-y-4 rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
        <div className="flex items-center gap-4">
          <div className="flex size-[76px] flex-none items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border-strong bg-surface-2 text-muted">
            {currentAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={currentAvatar} alt="" className="size-full object-cover" />
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
            <div className={avatarError ? "mt-1.5 text-xs font-semibold text-danger" : "mt-1.5 text-xs text-muted"}>
              {avatarError || "JPG, PNG или WebP"}
            </div>
          </div>
        </div>

        <Field label="Имя" error={errors.display_name?.message}>
          <Input autoComplete="name" invalid={!!errors.display_name} {...register("display_name")} />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Уровень" error={errors.skill_level?.message}>
            <Select {...register("skill_level")}>
              <option value="">Не указан</option>
              {SKILL_LEVELS.map((s) => (
                <option key={s} value={s}>
                  {SKILL_LABELS[s]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Пол" error={errors.gender?.message}>
            <Select {...register("gender")}>
              <option value="">Не указан</option>
              {GENDERS.map((g) => (
                <option key={g} value={g}>
                  {GENDER_LABELS[g]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Дата рождения" error={errors.birth_date?.message}>
            <Input
              type="date"
              min="1920-01-01"
              max={todayIso}
              invalid={!!errors.birth_date}
              {...register("birth_date")}
            />
          </Field>
          <Field label="Ведущая рука" error={errors.playing_hand?.message}>
            <Select {...register("playing_hand")}>
              <option value="">Не указана</option>
              {PLAYING_HANDS.map((h) => (
                <option key={h} value={h}>
                  {PLAYING_HAND_LABELS[h]}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="О себе" error={errors.bio?.message}>
          <Textarea
            rows={4}
            maxLength={2000}
            placeholder="Пара слов об игре, целях, удобном времени…"
            invalid={!!errors.bio}
            {...register("bio")}
          />
        </Field>

        <Controller
          control={control}
          name="is_coach"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded bg-surface-2 px-3.5 py-3">
              <span>
                <span className="block text-sm font-bold text-fg">Я тренирую</span>
                <span className="mt-0.5 block text-xs text-muted">
                  Отметьте, если проводите тренировки — игроки смогут звать вас как тренера.
                </span>
              </span>
              <Switch checked={field.value} onCheckedChange={field.onChange} label="Я тренирую" />
            </label>
          )}
        />
      </section>

      {/* Экипировка */}
      <section className="space-y-3 rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-sm font-bold text-fg-2">Экипировка</h2>
        <Field label="Основа ракетки" error={errors.blade?.message}>
          <Controller
            control={control}
            name="blade"
            render={({ field }) => (
              <Combobox
                maxLength={120}
                placeholder="напр. Butterfly Viscaria"
                aria-label="Основа ракетки"
                options={blades}
                invalid={!!errors.blade}
                value={field.value ?? ""}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Накладка форхенд" error={errors.rubber_forehand?.message}>
            <Controller
              control={control}
              name="rubber_forehand"
              render={({ field }) => (
                <Combobox
                  maxLength={120}
                  aria-label="Накладка форхенд"
                  options={rubbers}
                  invalid={!!errors.rubber_forehand}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Field>
          <Field label="Накладка бекхенд" error={errors.rubber_backhand?.message}>
            <Controller
              control={control}
              name="rubber_backhand"
              render={({ field }) => (
                <Combobox
                  maxLength={120}
                  aria-label="Накладка бекхенд"
                  options={rubbers}
                  invalid={!!errors.rubber_backhand}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              )}
            />
          </Field>
        </div>
      </section>

      {/* Контакты */}
      <section className="space-y-3 rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-sm font-bold text-fg-2">Контакты</h2>
        <p className="text-xs text-muted">Контакты видят только вошедшие в аккаунт.</p>
        <Field label="Telegram" error={errors.telegram_username?.message} hint="Без @, например ivan_smolensk">
          <Input
            placeholder="username"
            autoCapitalize="none"
            invalid={!!errors.telegram_username}
            {...register("telegram_username")}
          />
        </Field>
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <Field label="Телефон" error={errors.phone?.message}>
              <Input
                type="tel"
                inputMode="tel"
                maxLength={20}
                placeholder="+7 (___) ___-__-__"
                invalid={!!errors.phone}
                value={field.value ?? ""}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(formatRuPhone(e.target.value))}
              />
            </Field>
          )}
        />
        <Controller
          control={control}
          name="phone_visible"
          render={({ field }) => (
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded bg-surface-2 px-3.5 py-3">
              <span>
                <span className="block text-sm font-bold text-fg">Показывать телефон в профиле</span>
                <span className="mt-0.5 block text-xs text-muted">
                  Telegram виден всегда, телефон — по желанию.
                </span>
              </span>
              <Switch checked={field.value} onCheckedChange={field.onChange} label="Показывать телефон" />
            </label>
          )}
        />
      </section>

      {/* Рейтинг теннис67 */}
      <section className="space-y-3 rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
        <h2 className="text-sm font-bold text-fg-2">Рейтинг теннис67</h2>
        <Field
          label="Ссылка на профиль теннис67.рф"
          error={errors.tennis67_url?.message}
          hint="Ссылка на вашу карточку с ?sportsman=… — подтянем и обновим рейтинг автоматически"
        >
          <Input
            placeholder="https://теннис67.рф/rating/personal.php?sportsman=…"
            invalid={!!errors.tennis67_url}
            {...register("tennis67_url")}
          />
        </Field>
      </section>

      <div className="flex gap-2.5">
        <Link href="/profile" className="flex-1 sm:flex-none">
          <Button type="button" variant="secondary" size="lg" fullWidth className="sm:w-auto sm:px-8">
            Отмена
          </Button>
        </Link>
        <Button type="submit" size="lg" loading={isSubmitting} fullWidth className="sm:w-auto sm:px-10">
          Сохранить
        </Button>
      </div>
    </form>
  );
}
