import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ?? "smtp.yandex.ru",
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

interface EmailOptions {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  await transporter.sendMail({
    from: `"Siblay" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  })
}

interface TelegramOptions {
  parseMode?: "HTML" | "MarkdownV2"
  disableWebPagePreview?: boolean
}

export async function sendTelegram(text: string, options: TelegramOptions = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      ...(options.parseMode ? { parse_mode: options.parseMode } : {}),
      ...(options.disableWebPagePreview ? { disable_web_page_preview: true } : {}),
    }),
  })

  if (!response.ok) {
    throw new Error(`Telegram request failed: ${response.status}`)
  }
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
}

function shortOrderId(id: string) {
  return id.slice(0, 8)
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export function orderEmailTemplate(order: {
  id: string
  fullName: string
  phone: string
  email: string
  material: string
  color: string
  quantity: number
  width: number
  height: number
  length: number
  infill: number
  hasModel: boolean
  delivery: string
  address?: string | null
  comment?: string | null
  estimatedPrice?: number | null
}) {
  const fullName = escapeHtml(order.fullName)
  const phone = escapeHtml(order.phone)
  const email = escapeHtml(order.email)
  const material = escapeHtml(order.material)
  const color = escapeHtml(order.color)
  const delivery = escapeHtml(order.delivery)
  const address = order.address ? escapeHtml(order.address) : null
  const comment = order.comment ? escapeHtml(order.comment).replaceAll(/\r?\n/g, "<br/>") : null

  const adminUrl = `${siteUrl()}/admin/orders/${encodeURIComponent(order.id)}`

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px 16px">
      <h2 style="color:#2563EB;margin:0 0 12px">Новый заказ #${escapeHtml(shortOrderId(order.id))}</h2>
      <p style="margin:0 0 16px">
        <a href="${escapeHtml(adminUrl)}"
           style="display:inline-block;padding:10px 18px;background:#2563EB;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">
          Открыть в админке →
        </a>
      </p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Клиент</b></td><td style="padding:8px;border-bottom:1px solid #eee">${fullName}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Телефон</b></td><td style="padding:8px;border-bottom:1px solid #eee">${phone}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Email</b></td><td style="padding:8px;border-bottom:1px solid #eee">${email}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Материал</b></td><td style="padding:8px;border-bottom:1px solid #eee">${material}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Цвет</b></td><td style="padding:8px;border-bottom:1px solid #eee">${color}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Размеры</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.length}×${order.width}×${order.height} мм</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Количество</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.quantity} шт.</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Заполнение</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.infill}%</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Есть 3D-модель</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.hasModel ? "Да" : "Нет (нужно моделирование)"}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Доставка</b></td><td style="padding:8px;border-bottom:1px solid #eee">${delivery}${address ? ` — ${address}` : ""}</td></tr>
        ${comment ? `<tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Комментарий</b></td><td style="padding:8px;border-bottom:1px solid #eee">${comment}</td></tr>` : ""}
        ${order.estimatedPrice ? `<tr><td style="padding:8px"><b>Ориентировочная цена</b></td><td style="padding:8px;color:#2563EB;font-weight:bold">${order.estimatedPrice} ₽</td></tr>` : ""}
      </table>
    </div>
  `
}

interface CustomerOrderEmailInput {
  id: string
  fullName: string
  material: string
  color: string
  quantity: number
  width: number
  height: number
  length: number
  infill: number
  hasModel: boolean
  delivery: string
  address?: string | null
}

const DELIVERY_LABELS: Record<string, string> = {
  pickup: "Самовывоз (г. Иркутск, проезд Юрия Тена)",
  courier: "Курьер по Иркутску",
  sdek: "СДЭК",
  pochta: "Почта России",
}

export function customerOrderEmailTemplate(order: CustomerOrderEmailInput) {
  const fullName = escapeHtml(order.fullName)
  const material = escapeHtml(order.material)
  const color = escapeHtml(order.color)
  const deliveryLabel = escapeHtml(DELIVERY_LABELS[order.delivery] ?? order.delivery)
  const address = order.address ? escapeHtml(order.address) : null
  const short = escapeHtml(shortOrderId(order.id))

  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:24px 16px">
      <div style="background:#fff;border-radius:16px;padding:32px 24px;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
        <div style="font-size:12px;letter-spacing:0.15em;color:#64748b;text-transform:uppercase;margin-bottom:8px">Siblay · 3D-печать</div>
        <h2 style="margin:0 0 16px;font-size:24px;color:#0f172a">Заказ #${short} принят</h2>

        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#334155">
          Здравствуйте, ${fullName}! Спасибо за заказ. Мы рассмотрим детали и свяжемся
          с вами в течение 2 часов в рабочее время, чтобы согласовать стоимость и сроки.
        </p>

        <h3 style="margin:24px 0 12px;font-size:14px;color:#0f172a;text-transform:uppercase;letter-spacing:0.1em">Детали заказа</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#334155">
          <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0">Материал</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">${material}, ${color}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0">Размеры</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">${order.length}×${order.width}×${order.height} мм</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0">Количество</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">${order.quantity} шт.</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0">Заполнение</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">${order.infill}%</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #e2e8f0">3D-модель</td><td style="padding:8px 0;border-bottom:1px solid #e2e8f0;text-align:right">${order.hasModel ? "есть" : "нужно моделирование"}</td></tr>
          <tr><td style="padding:8px 0">Доставка</td><td style="padding:8px 0;text-align:right">${deliveryLabel}${address ? `<br/><span style="color:#64748b">${address}</span>` : ""}</td></tr>
        </table>

        <div style="margin-top:24px;padding:16px;background:#f1f5f9;border-radius:12px">
          <div style="font-size:13px;color:#64748b;margin-bottom:8px">Если хотите ускорить — напишите нам напрямую:</div>
          <div style="font-size:14px;color:#0f172a;line-height:1.8">
            📞 <a href="tel:+79140004653" style="color:#2563EB;text-decoration:none">+7 (914) 000-46-53</a><br/>
            ✈️ <a href="https://t.me/siblay_print" style="color:#2563EB;text-decoration:none">@siblay_print</a> в Telegram<br/>
            ✉️ <a href="mailto:info@siblay.ru" style="color:#2563EB;text-decoration:none">info@siblay.ru</a>
          </div>
        </div>

        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8">
          С уважением, команда Siblay
        </p>
      </div>
    </div>
  `
}

export function adminOrderTelegramText(order: {
  id: string
  fullName: string
  phone: string
  email: string
  material: string
  color: string
  quantity: number
  width: number
  height: number
  length: number
  infill: number
  hasModel: boolean
  delivery: string
  address?: string | null
}) {
  const short = escapeHtml(shortOrderId(order.id))
  const fullName = escapeHtml(order.fullName)
  const phone = escapeHtml(order.phone)
  const email = escapeHtml(order.email)
  const material = escapeHtml(order.material)
  const color = escapeHtml(order.color)
  const delivery = escapeHtml(DELIVERY_LABELS[order.delivery] ?? order.delivery)
  const address = order.address ? escapeHtml(order.address) : null
  const adminUrl = `${siteUrl()}/admin/orders/${encodeURIComponent(order.id)}`

  const modelWarning = order.hasModel ? "" : "\n⚠️ Нет 3D-модели (нужно моделирование)"

  return (
    `<b>🆕 Новый заказ #${short}</b>\n\n` +
    `<b>Клиент</b>\n${fullName}\n📞 ${phone}\n✉️ ${email}\n\n` +
    `<b>Заказ</b>\n${material}, ${color}\n` +
    `${order.length}×${order.width}×${order.height} мм × ${order.quantity} шт.\n` +
    `Infill: ${order.infill}%${modelWarning}\n\n` +
    `<b>Доставка</b>: ${delivery}${address ? ` — ${address}` : ""}\n\n` +
    `👉 <a href="${escapeHtml(adminUrl)}">Открыть в админке</a>`
  )
}
