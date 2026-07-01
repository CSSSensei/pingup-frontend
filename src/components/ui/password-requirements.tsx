import { IconCheck, IconCircle } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export interface PasswordRule {
  label: string;
  test: (value: string) => boolean;
}

// Синхронно с regex-правилами пароля в lib/schemas/auth.ts.
export const PASSWORD_RULES: PasswordRule[] = [
  { label: "От 8 до 128 символов", test: (v) => v.length >= 8 && v.length <= 128 },
  { label: "Хотя бы одна буква", test: (v) => /\p{L}/u.test(v) },
  { label: "Хотя бы одна цифра", test: (v) => /\d/.test(v) },
];

export function PasswordRequirements({
  id,
  value,
  showErrors = false,
  rules = PASSWORD_RULES,
}: {
  id?: string;
  value: string;
  showErrors?: boolean;
  rules?: PasswordRule[];
}) {
  return (
    <ul id={id} className="flex flex-col gap-1 text-xs">
      {rules.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5 transition-colors",
              ok
                ? "font-medium text-status-confirmed"
                : showErrors
                  ? "text-danger"
                  : "text-muted",
            )}
          >
            {ok ? (
              <IconCheck size={13} className="flex-none" />
            ) : (
              <IconCircle size={13} className="flex-none" />
            )}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
