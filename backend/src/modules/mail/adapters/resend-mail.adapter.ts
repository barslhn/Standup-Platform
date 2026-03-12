import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { MailAdapter, SendEmailOptions } from './mail.adapter';
import { AppConfigService } from '../../../common/config/app-config.service';

@Injectable()
export class ResendMailAdapter extends MailAdapter {
  private readonly logger = new Logger(ResendMailAdapter.name);
  private readonly resend: Resend;

  constructor(private readonly configService: AppConfigService) {
    super();
    this.resend = new Resend(this.configService.resendApiKey);
  }

  async send(options: SendEmailOptions): Promise<boolean> {
    try {
      const { data, error } = await this.resend.emails.send({
        from: options.from || `Standup Platform <${this.configService.mailFrom}>`,
        to: [options.to],
        subject: options.subject,
        html: options.html,
      });

      if (error) {
        this.logger.error(`Resend error: ${JSON.stringify(error)}`);
        return false;
      }

      this.logger.log(`Email sent successfully (ID: ${data?.id})`);
      return true;
    } catch (err: unknown) {
      if (err instanceof Error) {
        this.logger.error(`Failed to send email via Resend: ${err.message}`);
      } else {
        this.logger.error('Failed to send email via Resend: Unknown error');
      }
      return false;
    }
  }
}
