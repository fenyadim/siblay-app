import type { Metadata } from "next"

const consentVersion = process.env.PERSONAL_DATA_CONSENT_VERSION ?? "2026-04-08"

export const metadata: Metadata = {
  title: "Согласие на обработку персональных данных",
  description: "Текст согласия на обработку персональных данных",
}

export default function ConsentPage() {
  const operatorName = process.env.NEXT_PUBLIC_OPERATOR_NAME ?? "Оператор персональных данных"
  const operatorEmail = process.env.NEXT_PUBLIC_OPERATOR_EMAIL ?? "privacy@siblay.ru"

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-black font-display text-foreground mb-4">
          Согласие на обработку персональных данных
        </h1>
        <p className="text-sm text-muted mb-8">Версия согласия: {consentVersion}</p>

        <div className="space-y-4 text-sm leading-7 text-foreground">
          <p>
            Я, как субъект персональных данных, действуя свободно, своей волей и в своем интересе,
            подтверждаю согласие {operatorName} на обработку моих персональных данных,
            предоставленных через формы сайта Siblay.
          </p>
          <p>
            Перечень данных: ФИО, телефон, email, данные о доставке, содержимое комментария и
            файлов, а также иные сведения, переданные мной при оформлении заказа.
          </p>
          <p>
            Цели обработки: прием и исполнение заказа, обратная связь, расчет стоимости, доставка,
            сопровождение и выполнение договорных обязательств.
          </p>
          <p>
            Я согласен(а) на совершение действий с персональными данными, включая сбор, запись,
            систематизацию, накопление, хранение, уточнение, использование, передачу в объеме,
            необходимом для исполнения заказа, блокирование, удаление и уничтожение.
          </p>
          <p>
            Согласие действует до достижения целей обработки либо до отзыва согласия субъектом
            персональных данных, если иное не требуется законодательством РФ.
          </p>
          <p>
            Согласие может быть отозвано путем направления обращения на {operatorEmail}. Отзыв
            согласия не влияет на законность обработки, осуществленной до момента отзыва.
          </p>
        </div>
      </div>
    </div>
  )
}
