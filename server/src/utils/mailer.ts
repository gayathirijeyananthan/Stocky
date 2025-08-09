import nodemailer from 'nodemailer'

type MailOptions = {
  to: string
  subject: string
  text?: string
  html?: string
}

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })
  return transporter
}

export async function sendMail(opts: MailOptions): Promise<void> {
  const tx = getTransporter()
  if (!tx) {
    console.warn('SMTP not configured; skipping email send for', opts.subject)
    return
  }
  await tx.sendMail({ from: process.env.SMTP_FROM || 'no-reply@stocky.local', ...opts })
}


