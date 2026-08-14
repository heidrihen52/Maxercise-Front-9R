import nodemailer from 'nodemailer';
import { env } from './env';

export const mailer = nodemailer.createTransport({
  host: env.mailtrapHost,
  port: env.mailtrapPort,
  auth: {
    user: env.mailtrapUser,
    pass: env.mailtrapPass,
  },
});

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  await mailer.sendMail({
    from: env.mailFrom,
    to: options.to,
    subject: options.subject,
    html: options.html,
    text: options.text,
  });
}

export async function sendWelcomeEmail(to: string, firstName: string): Promise<void> {
  await sendMail({
    to,
    subject: 'Bienvenido a Adaptive Exercise',
    html: `<p>Hola <strong>${firstName}</strong>,</p><p>Tu cuenta ha sido creada exitosamente.</p>`,
    text: `Hola ${firstName}, tu cuenta ha sido creada exitosamente.`,
  });
}

export async function sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
  const resetUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/reset-password?token=${resetToken}`;

  await sendMail({
    to,
    subject: 'Recuperación de contraseña',
    html: `<p>Usa el siguiente enlace para restablecer tu contraseña:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>El enlace expira en 1 hora.</p>`,
    text: `Restablece tu contraseña: ${resetUrl}`,
  });
}
