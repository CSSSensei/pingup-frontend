"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { IconAlert } from "@/components/ui/icons";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { authApi } from "@/lib/api/endpoints/auth";
import { apiErrorMessage } from "@/lib/errors/messages";
import { useEmailGateStore } from "@/stores/emailGate";

export function EmailGateModal() {
  const open = useEmailGateStore((s) => s.open);
  const hide = useEmailGateStore((s) => s.hide);
  const [loading, setLoading] = useState(false);

  const resend = async () => {
    setLoading(true);
    try {
      await authApi.resendVerification();
      toast.success("Письмо отправлено — проверьте почту");
      hide();
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={hide} title="Подтвердите email">
      <div className="flex flex-col items-center text-center">
        <span className="mb-3 flex size-12 items-center justify-center rounded-full bg-status-pending/12 text-status-pending">
          <IconAlert size={24} />
        </span>
        <p className="text-sm text-fg-2">
          Чтобы записываться на игры и создавать свои, подтвердите почту — мы отправили ссылку на
          указанный адрес.
        </p>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <Button fullWidth size="lg" loading={loading} onClick={resend}>
          Отправить письмо повторно
        </Button>
        <Button fullWidth size="lg" variant="ghost" onClick={hide}>
          Позже
        </Button>
      </div>
    </Modal>
  );
}
