'use server';

import { siteConfig } from 'config/site';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailTemplateProps {
  senderName: string;
  senderEmail: string;
  message: string;
}

type EmailResponse = {
  success: boolean;
  statusCode: number;
  name?: string;
  message?: string;
};

export async function sendEmail(formData: EmailTemplateProps): Promise<EmailResponse> {
  try {
    if (!formData.senderName || !formData.senderEmail || !formData.message) {
      return {
        success: false,
        statusCode: 422,
        name: 'validation_error',
        message: 'There are missing fields',
      };
    }

    const { error } = await resend.emails.send({
      from: `${siteConfig.name} <${process.env.EMAIL_FROM}>`,
      to: `${process.env.EMAIL_TO}`,
      subject: `${siteConfig.name} - New Message from ${formData.senderName}`,
      replyTo: formData.senderEmail,
      text: `Name: '${formData.senderName}'\nEmail: '${formData.senderEmail}'\n\nMessage:\n${formData.message}`,
    });

    if (error)
      return {
        success: false,
        statusCode: error.statusCode || 500,
        name: error.name,
        message: `${error.statusCode === 422 ? 'Invalid input' : 'System error. Please try again later.'}`,
      };

    return { success: true, statusCode: 200 };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return {
      success: false,
      name: 'system error',
      statusCode: 500,
      message: 'System error. Please try again later.',
    };
  }
}
