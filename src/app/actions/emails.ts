'use server';

import { siteConfig } from 'config/site';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplateProps {
  senderName: string;
  senderEmail: string;
  message: string;
}

export async function sendEmail(formData: EmailTemplateProps) {
  try {
    if (!formData.senderName || !formData.senderEmail || !formData.message) {
      return { success: false, error: 'Missing fields' };
    }

    const { error } = await resend.emails.send({
      from: `${siteConfig.name} <${process.env.EMAIL_FROM}>`,
      to: `${process.env.EMAIL_TO}`,
      subject: `${siteConfig.name} - New Message from ${formData.senderName}`,
      replyTo: formData.senderEmail,
      text: `Name: '${formData.senderName}'\nEmail: '${formData.senderEmail}'\n\nMessage:\n${formData.message}`,
    });

    if (error) return { success: false, error: 'System error. Please try again later.' };

    return { success: true };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return { success: false, error: 'System error. Please try again later.' };
  }
}
