export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export abstract class MailAdapter {
  abstract send(options: SendEmailOptions): Promise<boolean>;
}
