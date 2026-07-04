"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

import { WeekScheduleEditor } from "@/components/features/schedule/week-schedule-editor";
import { MapPicker } from "@/components/maps/map-picker";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { IconCamera, IconX } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  useAddVenuePhoto,
  useCreateVenue,
  useDeleteVenuePhoto,
  useUpdateVenue,
} from "@/hooks/useVenues";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { SMOLENSK_CITY_ID } from "@/lib/constants";
import { handleApiError } from "@/lib/errors/handle";
import { fieldErrors } from "@/lib/errors/messages";
import {
  defaultWeek,
  parseWeekSchedule,
  serializeWeekSchedule,
  validateWeekSchedule,
  type WeekSchedule,
} from "@/lib/schedule";
import {
  createVenueSchema,
  parseCoord,
  validateVenuePhotoFile,
  VENUE_PHOTOS_MAX,
  type CreateVenueValues,
} from "@/lib/schemas/venue";
import type { VenueRead } from "@/types/api";

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);

// Валидация выбранных файлов (лимит по количеству + тип/размер) с тостами — общая для create/edit.
function pickValidPhotos(list: FileList, currentCount: number): File[] {
  const valid: File[] = [];
  let count = currentCount;
  for (const file of Array.from(list)) {
    if (count >= VENUE_PHOTOS_MAX) {
      toast.error(`Не больше ${VENUE_PHOTOS_MAX} фото`);
      break;
    }
    const problem = validateVenuePhotoFile(file);
    if (problem) {
      toast.error(`${file.name}: ${problem}`);
      continue;
    }
    valid.push(file);
    count += 1;
  }
  return valid;
}

function PhotoThumb({
  src,
  cover,
  index,
  removeLabel,
  onRemove,
  disabled,
}: {
  src: string;
  cover: boolean;
  index: number;
  removeLabel: string;
  onRemove: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={`Фото ${index + 1}`}
        className="h-20 w-28 rounded border border-border object-cover"
      />
      {cover && (
        <span className="absolute bottom-1 left-1 rounded-pill bg-surface/90 px-1.5 py-0.5 text-[10px] font-bold text-fg-2">
          Обложка
        </span>
      )}
      <button
        type="button"
        aria-label={removeLabel}
        disabled={disabled}
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 rounded-full border border-border bg-surface p-0.5 text-muted shadow-card hover:text-danger disabled:opacity-50"
      >
        <IconX size={13} />
      </button>
    </div>
  );
}

const SERVER_TO_FIELD: Record<string, keyof CreateVenueValues> = {
  name: "name",
  address: "address",
  description: "description",
  lat: "lat",
  lng: "lng",
  tables_count: "tables_count",
  phone: "phone",
  website: "website",
  price_info: "price_info",
};

export function VenueForm({ venue }: { venue?: VenueRead }) {
  const isEdit = !!venue;
  const router = useRouter();
  const create = useCreateVenue();
  const update = useUpdateVenue(venue?.id ?? 0);
  const addPhoto = useAddVenuePhoto();
  const deletePhoto = useDeleteVenuePhoto(venue?.id ?? 0);
  const [photos, setPhotos] = useState<File[]>([]);
  const existingPhotos = venue?.photos ?? [];
  const photosBusy = addPhoto.isPending || deletePhoto.isPending;
  const [schedule, setSchedule] = useState<WeekSchedule>(
    () => parseWeekSchedule(venue?.working_hours ?? null) ?? defaultWeek(),
  );
  const scheduleErrors = validateWeekSchedule(schedule);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateVenueValues>({
    resolver: zodResolver(createVenueSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      name: venue?.name ?? "",
      address: venue?.address ?? "",
      description: venue?.description ?? "",
      lat: venue ? String(venue.lat) : "",
      lng: venue ? String(venue.lng) : "",
      tables_count: venue?.tables_count != null ? String(venue.tables_count) : "",
      phone: venue?.phone ?? "",
      website: venue?.website ?? "",
      price_info: venue?.price_info ?? "",
    },
  });

  const latValue = watch("lat");
  const lngValue = watch("lng");
  const point = useMemo(() => {
    const lat = parseCoord(latValue ?? "");
    const lng = parseCoord(lngValue ?? "");
    return lat != null && lng != null ? { lat, lng } : null;
  }, [latValue, lngValue]);

  const previews = useMemo(() => photos.map((f) => URL.createObjectURL(f)), [photos]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const valid = pickValidPhotos(list, photos.length);
    if (valid.length) setPhotos([...photos, ...valid]);
  }

  async function uploadToVenue(list: FileList | null) {
    if (!list || !venue) return;
    let slot = existingPhotos.length;
    for (const file of pickValidPhotos(list, slot)) {
      try {
        await addPhoto.mutateAsync({ venueId: venue.id, file, sortOrder: slot, isCover: slot === 0 });
        slot += 1;
      } catch {
        toast.error(`Не удалось загрузить ${file.name}`);
      }
    }
  }

  function mapServerErrors(err: unknown): boolean {
    const mapped = Object.entries(fieldErrors(err))
      .map(([field, message]) => [SERVER_TO_FIELD[field], message] as const)
      .filter((e): e is [keyof CreateVenueValues, string] => !!e[0]);
    if (!mapped.length) return false;
    for (const [field, message] of mapped) setError(field, { message });
    setFocus(mapped[0][0]);
    return true;
  }

  const onSubmit: SubmitHandler<CreateVenueValues> = async (values) => {
    if (scheduleErrors.length > 0) return;
    const working_hours = serializeWeekSchedule(schedule);
    const base = {
      name: values.name,
      address: values.address,
      lat: parseCoord(values.lat)!,
      lng: parseCoord(values.lng)!,
      description: clean(values.description) ?? null,
      tables_count: values.tables_count?.trim() ? Number(values.tables_count) : null,
      phone: clean(values.phone) ?? null,
      website: clean(values.website) ?? null,
      working_hours,
      price_info: clean(values.price_info) ?? null,
    };

    try {
      if (isEdit) {
        const saved = await update.mutateAsync(base);
        toast.success("Зал обновлён");
        router.push(`/venues/${saved.slug}`);
        return;
      }

      const created = await create.mutateAsync({ city_id: SMOLENSK_CITY_ID, ...base });
      let failed = 0;
      for (const [i, file] of photos.entries()) {
        try {
          await addPhoto.mutateAsync({ venueId: created.id, file, sortOrder: i, isCover: i === 0 });
        } catch {
          failed += 1;
        }
      }
      if (failed > 0) toast.error(`Не удалось загрузить фото: ${failed} из ${photos.length}`);
      toast.success("Зал добавлен в каталог");
      router.push(`/venues/${created.slug}`);
    } catch (err) {
      if (!mapServerErrors(err)) handleApiError(err);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6"
    >
      <div className="flex flex-col gap-4">
        <Field label="Название" error={errors.name?.message}>
          <Input
            type="text"
            placeholder="Например: СК «Юбилейный»"
            invalid={!!errors.name}
            {...register("name")}
          />
        </Field>

        <Field label="Адрес" error={errors.address?.message}>
          <Input
            type="text"
            placeholder="Улица, дом"
            invalid={!!errors.address}
            {...register("address")}
          />
        </Field>

        <Field
          label="Точка на карте"
          hint="Кликните по карте — координаты подставятся сами."
          error={errors.lat?.message ?? errors.lng?.message}
        >
          <div className="space-y-2.5">
            <MapPicker
              value={point}
              onChange={(lat, lng) => {
                setValue("lat", lat.toFixed(6), { shouldValidate: true, shouldTouch: true });
                setValue("lng", lng.toFixed(6), { shouldValidate: true, shouldTouch: true });
              }}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Широта, напр. 54.7818"
                aria-label="Широта"
                invalid={!!errors.lat}
                {...register("lat")}
              />
              <Input
                type="text"
                inputMode="decimal"
                placeholder="Долгота, напр. 32.0401"
                aria-label="Долгота"
                invalid={!!errors.lng}
                {...register("lng")}
              />
            </div>
          </div>
        </Field>

        <Field label="Описание" error={errors.description?.message}>
          <Textarea
            rows={4}
            maxLength={4000}
            placeholder="Что за площадка, какое покрытие, есть ли инвентарь напрокат."
            invalid={!!errors.description}
            {...register("description")}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Количество столов" error={errors.tables_count?.message}>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              max={500}
              placeholder="напр. 6"
              invalid={!!errors.tables_count}
              {...register("tables_count")}
            />
          </Field>

          <Field label="Телефон" error={errors.phone?.message}>
            <Input
              type="tel"
              placeholder="+7 (4812) 55-21-03"
              invalid={!!errors.phone}
              {...register("phone")}
            />
          </Field>

          <Field label="Сайт" error={errors.website?.message}>
            <Input
              type="text"
              inputMode="url"
              placeholder="club-smolensk.ru"
              invalid={!!errors.website}
              {...register("website")}
            />
          </Field>
        </div>

        <Field
          label="График работы"
          hint="Часы задают доступное время для брони столов."
        >
          <WeekScheduleEditor value={schedule} onChange={setSchedule} errors={scheduleErrors} />
        </Field>

        <Field label="Цены" error={errors.price_info?.message}>
          <Textarea
            rows={2}
            maxLength={2000}
            placeholder="от 300 ₽/час, аренда ракеток — 100 ₽"
            invalid={!!errors.price_info}
            {...register("price_info")}
          />
        </Field>

        <Field
          label="Фото"
          hint={`До ${VENUE_PHOTOS_MAX} фото (JPEG/PNG/WebP, до 8 МБ). Первое — обложка.`}
        >
          <div className="flex flex-wrap items-center gap-2.5">
            {isEdit
              ? existingPhotos.map((photo, i) => (
                  <PhotoThumb
                    key={photo.id}
                    src={mediaUrl(photo.url) ?? ""}
                    cover={photo.is_cover}
                    index={i}
                    removeLabel={`Удалить фото ${i + 1}`}
                    disabled={photosBusy}
                    onRemove={() => deletePhoto.mutate(photo.id)}
                  />
                ))
              : previews.map((url, i) => (
                  <PhotoThumb
                    key={url}
                    src={url}
                    cover={i === 0}
                    index={i}
                    removeLabel={`Убрать фото ${i + 1}`}
                    onRemove={() => setPhotos(photos.filter((_, j) => j !== i))}
                  />
                ))}
            {(isEdit ? existingPhotos.length : photos.length) < VENUE_PHOTOS_MAX && (
              <label
                className={cn(
                  "flex h-20 w-28 cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-border text-muted transition-colors hover:border-border-strong hover:text-fg-2",
                  photosBusy && "pointer-events-none opacity-50",
                )}
              >
                <IconCamera size={20} />
                <span className="text-[11px] font-bold">
                  {isEdit && addPhoto.isPending ? "Загрузка…" : "Добавить"}
                </span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  disabled={photosBusy}
                  className="sr-only"
                  onChange={(e) => {
                    if (isEdit) uploadToVenue(e.target.files);
                    else addFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>
        </Field>

        <Button type="submit" size="lg" loading={isSubmitting} className="mt-1 self-start px-8">
          {isEdit ? "Сохранить" : "Добавить зал"}
        </Button>
      </div>
    </form>
  );
}
