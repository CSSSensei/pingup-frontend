import { IconPhone, IconSend } from "@/components/ui/icons";
import { LinkButton } from "@/components/ui/link-button";
import { telegramUrl } from "@/lib/players";

export function ContactLinks({
  telegram,
  phone,
  mode,
  loginNext,
}: {
  telegram: string | null;
  phone: string | null;
  mode: "self" | "authed" | "guest";
  loginNext?: string;
}) {
  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-card sm:p-6">
      <h2 className="mb-3 text-sm font-bold text-fg-2">Контакты</h2>

      {mode === "guest" ? (
        <div className="flex flex-col items-start gap-3">
          <p className="text-sm text-muted">Контакты видны только вошедшим в аккаунт.</p>
          <LinkButton href={`/login?next=${encodeURIComponent(loginNext ?? "/")}`} size="sm">
            Войти, чтобы увидеть контакты
          </LinkButton>
        </div>
      ) : !telegram && !phone ? (
        <p className="text-sm text-muted">
          {mode === "self"
            ? "Вы не указали контакты — добавьте их в профиле, чтобы партнёры могли связаться."
            : "Игрок не указал контакты."}
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {telegram && (
            <ContactRow
              href={telegramUrl(telegram)}
              external
              icon={<IconSend size={17} />}
              label="Telegram"
              value={`@${telegram}`}
            />
          )}
          {phone && (
            <ContactRow
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              icon={<IconPhone size={17} />}
              label="Телефон"
              value={phone}
            />
          )}
        </div>
      )}
    </section>
  );
}

function ContactRow({
  href,
  external,
  icon,
  label,
  value,
}: {
  href: string;
  external?: boolean;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="flex items-center gap-3 rounded-lg bg-surface-2 px-4 py-3 transition-colors hover:bg-surface-3"
    >
      <span className="flex size-9 flex-none items-center justify-center rounded-full bg-primary-tint text-primary">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs text-muted">{label}</span>
        <span className="block truncate text-sm font-bold text-fg">{value}</span>
      </span>
    </a>
  );
}
