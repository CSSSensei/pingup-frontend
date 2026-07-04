"use client";

import { useState } from "react";

import { WeekScheduleEditor } from "@/components/features/schedule/week-schedule-editor";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import {
  defaultWeek,
  fillWeek,
  toScheduleMap,
  validateWeekSchedule,
  type WeekSchedule,
  type WeekScheduleMap,
} from "@/lib/schedule";

export function TableScheduleModal({
  label,
  schedule,
  onClose,
  onSave,
}: {
  label: string;
  schedule: WeekScheduleMap | null;
  onClose: () => void;
  onSave: (schedule: WeekScheduleMap | null) => void;
}) {
  const [custom, setCustom] = useState(schedule != null);
  const [week, setWeek] = useState<WeekSchedule>(() =>
    schedule ? fillWeek(schedule) : defaultWeek(),
  );
  const errors = validateWeekSchedule(week);

  function save() {
    if (custom && errors.length > 0) return;
    onSave(custom ? toScheduleMap(week) : null);
    onClose();
  }

  return (
    <Modal open onClose={onClose} title={`Часы стола ${label}`} className="max-w-lg">
      <div className="space-y-4">
        <label className="flex cursor-pointer items-start gap-3 rounded border border-border bg-surface-2 p-3.5">
          <Switch checked={custom} onCheckedChange={setCustom} label="Особые часы для этого стола" />
          <span className="min-w-0">
            <span className="block text-sm font-bold text-fg">Особые часы для этого стола</span>
            <span className="block text-[13px] font-medium text-muted">
              Иначе стол доступен в часы работы зала.
            </span>
          </span>
        </label>

        {custom && <WeekScheduleEditor value={week} onChange={setWeek} errors={errors} />}

        <div className="flex gap-2.5 pt-1">
          <Button variant="ghost" fullWidth onClick={onClose}>
            Отмена
          </Button>
          <Button fullWidth disabled={custom && errors.length > 0} onClick={save}>
            Применить
          </Button>
        </div>
      </div>
    </Modal>
  );
}
