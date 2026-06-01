import Link from "next/link";

export function RightFooter() {
  return (
    <aside className="flex flex-col h-screen sticky top-0 py-4 w-full max-w-62.5">
      <div className="mt-auto pb-4 flex flex-col gap-4 text-sm text-secondary">
        <div className="flex flex-col gap-3">
          <Link href="/ui-kit" className="hover:text-primary transition-colors">UI-kit</Link>
          <Link href="http://144.31.228.88:3001/status/backend" target="_blank" className="hover:text-primary transition-colors">Статус сервера</Link>
          <Link href="#" className="hover:text-primary transition-colors">Конфиденциальность</Link>
          <Link href="#" className="hover:text-primary transition-colors">Политика Cookies</Link>
        </div>
        <div className="pt-2">
          © 2026 ООО «ТСОСИ»
        </div>
      </div>
    </aside>
  );
}
