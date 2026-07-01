"use client";

import { useState } from "react";

import { IconAlert } from "@/components/ui/icons";
import { toast } from "@/components/ui/toast";
import { useMe } from "@/hooks/useMe";
import { authApi } from "@/lib/api/endpoints/auth";
import { apiErrorMessage } from "@/lib/errors/messages";

export function EmailVerifyBanner() {
  const { data: me } = useMe();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!me || me.is_email_verified) return null;

  const resend = async () => {
    setLoading(true);
    try {
      await authApi.resendVerification();
      setSent(true);
      toast.success("Письмо отправлено — проверьте почту");
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-status-pending/25 bg-status-pending/8 px-4 py-2.5 text-[13px] text-fg-2">
      <IconAlert size={16} className="flex-none text-status-pending" />
      <span className="font-semibold">
        Подтвердите email <span className="font-bold">{me.email}</span> — часть действий пока
        ограничена.
      </span>
      {sent ? (
        <span className="text-muted">Письмо отправлено</span>
      ) : (
        <button
          type="button"
          onClick={resend}
          disabled={loading}
          className="font-bold text-primary underline-offset-2 hover:underline disabled:opacity-50"
        >
          Отправить письмо ещё раз
        </button>
      )}
    </div>
  );
}
