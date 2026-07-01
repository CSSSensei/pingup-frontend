import { ComingSoon } from "@/components/common/coming-soon";

export const metadata = { title: "Настройки" };

export default function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <ComingSoon
        title="Настройки"
        description="Смена email и пароля, активные сессии, удаление аккаунта — скоро."
      />
    </div>
  );
}
