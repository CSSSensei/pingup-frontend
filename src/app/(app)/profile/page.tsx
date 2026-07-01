import { ComingSoon } from "@/components/common/coming-soon";

export const metadata = { title: "Профиль" };

export default function ProfilePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <ComingSoon
        title="Мой профиль"
        description="Здесь появятся ваши данные, рейтинг и экипировка — раздел в разработке."
      />
    </div>
  );
}
