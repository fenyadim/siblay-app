import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--surface)] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[var(--accent)] flex items-center justify-center">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="font-display font-bold text-[var(--foreground)]" style={{ fontFamily: "Syne, sans-serif" }}>
                Siblay
              </span>
            </div>
            <p className="text-sm text-[var(--muted)] max-w-xs leading-relaxed">
              Профессиональные услуги 3D-моделирования и 3D-печати. Точные детали,
              прототипы и серийные изделия под ваш проект.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" aria-label="Telegram" className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-colors">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
                </svg>
              </a>
              <a href="#" aria-label="VK" className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] transition-colors">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.19 1.367 1.26 2.182 1.816.616.422 1.084.33 1.084.33l2.178-.03s1.139-.071.599-1.964c-.044-.148-.313-.786-1.61-2.097-1.36-1.37-1.177-1.149.46-3.522.998-1.332 1.396-2.146 1.271-2.494-.12-.332-.854-.244-.854-.244l-2.451.015s-.182-.025-.316.056c-.132.079-.217.264-.217.264s-.386 1.031-.901 1.907c-1.085 1.847-1.52 1.945-1.698 1.83-.413-.267-.31-1.075-.31-1.648 0-1.793.272-2.54-.529-2.733-.266-.064-.461-.107-1.141-.114-.872-.009-1.609.003-2.028.208-.278.135-.492.437-.361.454.161.021.526.099.72.363.249.341.24 1.107.24 1.107s.143 2.11-.334 2.372c-.327.179-.776-.187-1.739-1.86-.494-.858-.868-1.808-.868-1.808s-.072-.18-.202-.276a.974.974 0 00-.371-.154l-2.328.015s-.35.01-.479.163C4.119 9.411 4.2 9.7 4.2 9.7s1.819 4.259 3.881 6.404c1.889 1.963 4.035 1.835 4.035 1.835l1.669.022z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--muted)] mb-4">
              Услуги
            </h4>
            <ul className="space-y-2.5">
              {["3D-моделирование", "3D-печать FDM", "3D-печать SLA", "Постобработка", "Серийное производство"].map((s) => (
                <li key={s}>
                  <Link href="/order" className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-[var(--muted)] mb-4">
              Контакты
            </h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-[var(--muted)]">
                <svg className="mt-0.5 shrink-0 text-[var(--accent)]" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                +7 (999) 123-45-67
              </li>
              <li className="flex items-start gap-2 text-sm text-[var(--muted)]">
                <svg className="mt-0.5 shrink-0 text-[var(--accent)]" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                info@siblay.ru
              </li>
            </ul>
            <div className="mt-5">
              <Link
                href="/order"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
              >
                Оформить заказ
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Siblay. Все права защищены.
          </p>
          <p className="text-xs text-[var(--muted)] font-mono">
            3D-печать · Моделирование · Постобработка
          </p>
        </div>
      </div>
    </footer>
  )
}
