import { Mail, Phone } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-display font-bold text-foreground">Siblay</span>
            </div>
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              Профессиональные услуги 3D-моделирования и 3D-печати. Точные детали, прототипы и
              серийные изделия под ваш проект.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="#"
                aria-label="Telegram"
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-accent hover:border-(--accent-border) transition-colors"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.932z" />
                </svg>
              </a>
              <a
                href="#"
                aria-label="VK"
                className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-accent hover:border-(--accent-border) transition-colors"
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.587-1.496c.598-.19 1.367 1.26 2.182 1.816.616.422 1.084.33 1.084.33l2.178-.03s1.139-.071.599-1.964c-.044-.148-.313-.786-1.61-2.097-1.36-1.37-1.177-1.149.46-3.522.998-1.332 1.396-2.146 1.271-2.494-.12-.332-.854-.244-.854-.244l-2.451.015s-.182-.025-.316.056c-.132.079-.217.264-.217.264s-.386 1.031-.901 1.907c-1.085 1.847-1.52 1.945-1.698 1.83-.413-.267-.31-1.075-.31-1.648 0-1.793.272-2.54-.529-2.733-.266-.064-.461-.107-1.141-.114-.872-.009-1.609.003-2.028.208-.278.135-.492.437-.361.454.161.021.526.099.72.363.249.341.24 1.107.24 1.107s.143 2.11-.334 2.372c-.327.179-.776-.187-1.739-1.86-.494-.858-.868-1.808-.868-1.808s-.072-.18-.202-.276a.974.974 0 00-.371-.154l-2.328.015s-.35.01-.479.163C4.119 9.411 4.2 9.7 4.2 9.7s1.819 4.259 3.881 6.404c1.889 1.963 4.035 1.835 4.035 1.835l1.669.022z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-muted mb-4">Услуги</h4>
            <ul className="space-y-2.5">
              {['3D-моделирование', '3D-печать FDM', 'Постобработка', 'Серийное производство'].map(
                (s) => (
                  <li key={s}>
                    <Link
                      href="/order"
                      className="text-sm text-muted hover:text-accent transition-colors"
                    >
                      {s}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-xs font-mono uppercase tracking-widest text-muted mb-4">
              Контакты
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted">
                <Phone className="text-accent" size={14} />
                +7 (999) 123-45-67
              </li>
              <li className="flex items-center gap-2 text-sm text-muted">
                <Mail className="text-accent" size={14} />
                info@siblay.ru
              </li>
            </ul>
            <div className="mt-5">
              <Link
                href="/order"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-(--accent-hover) transition-colors"
              >
                Оформить заказ
                <svg
                  width="12"
                  height="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Siblay. Все права защищены.
          </p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy" className="text-muted hover:text-accent transition-colors">
              Политика ПДн
            </Link>
            <Link href="/consent" className="text-muted hover:text-accent transition-colors">
              Согласие ПДн
            </Link>
            <span className="text-muted font-mono">3D-печать · Моделирование · Постобработка</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
