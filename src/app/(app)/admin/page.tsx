import { ComingSoon } from "@/components/common/coming-soon";

export const metadata = { title: "Админ-панель" };

export default function AdminPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6 sm:py-8">
      <ComingSoon
        title="Админ-панель"
        description="Модерация жалоб, залов и пользователей — раздел в разработке."
      />
    </div>
  );
}
