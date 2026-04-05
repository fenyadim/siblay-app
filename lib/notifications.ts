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

export async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId) return

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  })
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
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#2563EB">Новый заказ #${order.id}</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Клиент</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.fullName}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Телефон</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.phone}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Email</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.email}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Материал</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.material}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Цвет</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.color}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Размеры</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.length}×${order.width}×${order.height} мм</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Количество</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.quantity} шт.</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Заполнение</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.infill}%</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Есть 3D-модель</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.hasModel ? "Да" : "Нет (нужно моделирование)"}</td></tr>
        <tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Доставка</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.delivery}${order.address ? ` — ${order.address}` : ""}</td></tr>
        ${order.comment ? `<tr><td style="padding:8px;border-bottom:1px solid #eee"><b>Комментарий</b></td><td style="padding:8px;border-bottom:1px solid #eee">${order.comment}</td></tr>` : ""}
        ${order.estimatedPrice ? `<tr><td style="padding:8px"><b>Ориентировочная цена</b></td><td style="padding:8px;color:#2563EB;font-weight:bold">${order.estimatedPrice} ₽</td></tr>` : ""}
      </table>
    </div>
  `
}
